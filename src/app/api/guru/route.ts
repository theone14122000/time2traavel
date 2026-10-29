import { NextResponse } from "next/server";
import { getClientIp, rateLimit } from "@/lib/rate-limit";
import { getBusinessContext } from "@/lib/guru/business-context";
import { buildSystemPrompt } from "@/lib/guru/prompt";
import { completeChat, extractJsonObject } from "@/lib/guru/provider";
import {
  guruActionSchema,
  guruRequestSchema,
  type GuruAction,
  type GuruResponse,
} from "@/lib/guru/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 90;

/** Messages sent to the model (older turns are dropped to cap cost and context). */
const MODEL_HISTORY = 10;

type ErrorCode = "not_configured" | "rate_limited" | "invalid" | "upstream" | "timeout" | "forbidden" | "busy";

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

/** Keep text plain: drop control characters and cap length. HTML is never rendered client-side either. */
function cleanReply(text: string): string {
  // eslint-disable-next-line no-control-regex
  return text.replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, "").trim().slice(0, 4000);
}

function asString(value: unknown): string | null {
  return typeof value === "string" && value.trim() ? value : null;
}

/** Strips reasoning blocks some open models leak into their content. */
function stripThinking(text: string): string {
  return text.replace(/<think>[\s\S]*?<\/think>/gi, "").trim();
}

export async function POST(request: Request) {
  if (!originAllowed(request)) return fail("forbidden", 403);
  if (process.env.GURU_ENABLED === "false") return fail("not_configured", 503);

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

  const result = await completeChat([
    { role: "system", content: buildSystemPrompt(context.text, path) },
    ...messages.slice(-MODEL_HISTORY).map((m) => ({ role: m.role, content: m.content })),
  ]);
  if (!result.ok) {
    if (result.reason === "busy") return fail("busy", 503);
    return result.reason === "timeout" ? fail("timeout", 504) : fail("upstream", 502);
  }

  const raw = stripThinking(result.text);
  const json = extractJsonObject(raw) as Record<string, unknown> | null;

  let reply: string;
  const actions: GuruAction[] = [];
  let followups: string[] = [];

  if (json && asString(json.reply)) {
    reply = cleanReply(asString(json.reply) as string);

    const rawActions = Array.isArray(json.actions) ? json.actions.slice(0, 4) : [];
    for (const item of rawActions) {
      if (!item || typeof item !== "object") continue;
      const input = item as Record<string, unknown>;
      const type = input.type;
      if (type === "prepare_trip_inquiry" || type === "offer_whatsapp") {
        if (actions.some((a) => a.type === "prepare_trip_inquiry" || a.type === "offer_whatsapp")) continue;
        const candidate = guruActionSchema.safeParse({
          ...input,
          // Open models sometimes emit numbers as strings.
          adults: input.adults != null && input.adults !== "" ? Number(input.adults) : undefined,
          children: input.children != null && input.children !== "" ? Number(input.children) : undefined,
        });
        if (candidate.success) actions.push(candidate.data);
      } else if (type === "show_links") {
        const candidate = guruActionSchema.safeParse(input);
        if (candidate.success && candidate.data.type === "show_links") {
          const links = candidate.data.links.filter((l) => context.allowedPaths.has(l.path));
          if (links.length > 0) actions.push({ type: "show_links", links });
        }
      }
    }

    followups = (Array.isArray(json.followups) ? json.followups : [])
      .filter((q): q is string => typeof q === "string")
      .map((q) => q.trim().slice(0, 60))
      .filter(Boolean)
      .slice(0, 3);
  } else {
    // The model ignored the JSON contract: still show its words, never raw JSON-ish fragments.
    const plain = raw.replace(/```[a-z]*\n?|```/gi, "").trim();
    reply = cleanReply(plain.startsWith("{") ? "" : plain);
  }

  if (!reply) {
    console.error("[guru] model returned no usable reply");
    return fail("upstream", 502);
  }

  console.info(`[guru] ok provider=${result.endpoint} actions=${actions.length}`);
  const payload: GuruResponse = { reply, actions, followups };
  return NextResponse.json(payload, { headers: { "Cache-Control": "no-store" } });
}

/** Anything but POST is not part of the API. */
export function GET() {
  return fail("invalid", 405);
}
