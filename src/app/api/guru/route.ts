import { NextResponse } from "next/server";
import { getClientIp, rateLimit } from "@/lib/rate-limit";
import { getBusinessContext } from "@/lib/guru/business-context";
import { buildSystemPrompt, GURU_TOOLS } from "@/lib/guru/prompt";
import {
  guruActionSchema,
  guruRequestSchema,
  linksActionSchema,
  type GuruAction,
  type GuruResponse,
} from "@/lib/guru/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** Provider settings — all server-side, all overridable from the environment. */
const API_URL = process.env.GURU_API_URL?.trim() || "https://api.anthropic.com/v1/messages";
const MODEL = process.env.GURU_MODEL?.trim() || "claude-haiku-5-5";
const MAX_TOKENS = Math.min(Math.max(Number(process.env.GURU_MAX_TOKENS) || 900, 200), 2000);
const TIMEOUT_MS = 30_000;
/** Messages sent to the model (older turns are dropped to cap cost and context). */
const MODEL_HISTORY = 10;

type ErrorCode = "not_configured" | "rate_limited" | "invalid" | "upstream" | "timeout" | "forbidden";

function fail(code: ErrorCode, status: number, extra?: Record<string, unknown>) {
  return NextResponse.json({ error: code, ...extra }, { status, headers: { "Cache-Control": "no-store" } });
}

/** Browsers always send Origin on cross-site POSTs; reject anything not from this site. */
function originAllowed(request: Request): boolean {
  const origin = request.headers.get("origin");
  if (!origin) return true; // same-origin navigations / server-side tools
  let originHost: string;
  try {
    originHost = new URL(origin).host;
  } catch {
    return false;
  }
  const allowed = new Set<string>();
  const host = request.headers.get("x-forwarded-host") ?? request.headers.get("host");
  if (host) allowed.add(host);
  try {
    if (process.env.NEXT_PUBLIC_SITE_URL) allowed.add(new URL(process.env.NEXT_PUBLIC_SITE_URL).host);
  } catch {
    // ignore a malformed configured URL
  }
  return allowed.has(originHost);
}

type ProviderBlock =
  | { type: "text"; text: string }
  | { type: "tool_use"; name: string; input: unknown }
  | { type: string };

/** Keep text plain: drop control characters and cap length. HTML is never rendered client-side either. */
function cleanReply(text: string): string {
  // eslint-disable-next-line no-control-regex
  return text.replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, "").trim().slice(0, 4000);
}

export async function POST(request: Request) {
  if (!originAllowed(request)) return fail("forbidden", 403);

  const apiKey = process.env.ANTHROPIC_API_KEY?.trim();
  if (!apiKey) return fail("not_configured", 503);

  const ip = await getClientIp(request.headers);
  const burst = rateLimit({ key: "guru:burst", limit: 8, windowMs: 60_000, ip });
  const sustained = rateLimit({ key: "guru:hour", limit: 60, windowMs: 60 * 60_000, ip });
  if (!burst.success || !sustained.success) {
    return fail("rate_limited", 429, {
      // Only the limiter(s) that actually tripped decide the wait.
      retryAfterSeconds: Math.max(
        ...[burst, sustained].filter((r) => !r.success).map((r) => r.retryAfterSeconds),
      ),
    });
  }

  let body: unknown;
  try {
    const raw = await request.text();
    if (raw.length > 40_000) return fail("invalid", 413);
    body = JSON.parse(raw);
  } catch {
    return fail("invalid", 400);
  }
  const parsed = guruRequestSchema.safeParse(body);
  if (!parsed.success) return fail("invalid", 400);

  const { messages, path } = parsed.data;
  const recentUserText = messages
    .filter((m) => m.role === "user")
    .slice(-3)
    .map((m) => m.content)
    .join(" ");

  let context;
  try {
    context = await getBusinessContext(recentUserText);
  } catch (error) {
    // The assistant still works without business data, but must not pretend to know it.
    console.error("[guru] business context unavailable:", error instanceof Error ? error.message : error);
    context = {
      text: "Verified business data is temporarily unavailable. Do not claim any specific package or listing exists; offer a custom plan or WhatsApp instead.",
      allowedPaths: new Set(["/destinations", "/packages", "/plan-my-trip", "/about-us"]),
      whatsapp: null,
    };
  }

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
  const started = Date.now();

  try {
    const response = await fetch(API_URL, {
      method: "POST",
      signal: controller.signal,
      headers: {
        "content-type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: MODEL,
        max_tokens: MAX_TOKENS,
        system: buildSystemPrompt(context.text, path),
        tools: GURU_TOOLS,
        messages: messages.slice(-MODEL_HISTORY).map((m) => ({ role: m.role, content: m.content })),
      }),
    });

    if (!response.ok) {
      // Status only — never log message content or the key.
      console.error(`[guru] provider returned ${response.status} after ${Date.now() - started}ms`);
      return fail("upstream", 502);
    }

    const data = (await response.json()) as { content?: ProviderBlock[] };
    const blocks = Array.isArray(data.content) ? data.content : [];

    let reply = "";
    const actions: GuruAction[] = [];
    let followups: string[] = [];

    for (const block of blocks) {
      if (block.type === "text" && "text" in block) {
        reply += `${block.text}\n`;
      } else if (block.type === "tool_use" && "name" in block) {
        const input = (block.input ?? {}) as Record<string, unknown>;
        if (block.name === "prepare_trip_inquiry" || block.name === "offer_whatsapp") {
          if (actions.some((a) => a.type === "prepare_trip_inquiry" || a.type === "offer_whatsapp")) continue;
          const candidate = guruActionSchema.safeParse({
            ...input,
            type: block.name,
            // The model may emit nulls/strings for numbers; coerce what is safe.
            adults: input.adults != null ? Number(input.adults) : undefined,
            children: input.children != null ? Number(input.children) : undefined,
          });
          if (candidate.success) actions.push(candidate.data);
        } else if (block.name === "show_links") {
          const candidate = linksActionSchema.safeParse({ ...input, type: "show_links" });
          if (candidate.success) {
            const links = candidate.data.links.filter((l) => context.allowedPaths.has(l.path));
            if (links.length > 0) actions.push({ type: "show_links", links });
          }
        } else if (block.name === "suggest_followups") {
          const questions = Array.isArray(input.questions) ? input.questions : [];
          followups = questions
            .filter((q): q is string => typeof q === "string")
            .map((q) => q.trim().slice(0, 60))
            .filter(Boolean)
            .slice(0, 3);
        }
      }
    }

    reply = cleanReply(reply);
    if (!reply) {
      console.error("[guru] provider returned no text");
      return fail("upstream", 502);
    }

    console.info(`[guru] ok model=${MODEL} ms=${Date.now() - started} actions=${actions.length}`);
    const payload: GuruResponse = { reply, actions, followups };
    return NextResponse.json(payload, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    if (error instanceof Error && error.name === "AbortError") return fail("timeout", 504);
    console.error("[guru] request failed:", error instanceof Error ? error.message : "unknown");
    return fail("upstream", 502);
  } finally {
    clearTimeout(timer);
  }
}

/** Anything but POST is not part of the API. */
export function GET() {
  return fail("invalid", 405);
}
