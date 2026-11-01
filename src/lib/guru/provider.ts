import "server-only";

/**
 * Open-model provider client for GURU.
 *
 * Talks to any OpenAI-compatible `/chat/completions` endpoint, so the model is
 * pure configuration:
 *   - Ollama (local / self-hosted):  GURU_API_URL=http://localhost:11434/v1  GURU_MODEL=llama3.1:8b
 *   - Groq, OpenRouter, Together, vLLM, LM Studio, Hugging Face TGI … likewise
 *     (add GURU_API_KEY when the host needs one).
 *
 * Selection order:
 *   1. GURU_API_URL            → exactly that host (Ollama, OpenRouter, vLLM …)
 *   2. GROQ_API_KEY / GURU_API_KEY → Groq (free tier) running open-weight Llama
 *   3. nothing configured      → key-less public endpoints serving GPT-OSS 20B
 * When a key is configured GURU never silently falls back to a third-party
 * free endpoint, so visitor messages only go where you chose to send them.
 */

export type ProviderEndpoint = {
  name: string;
  chatUrl: string;
  model: string;
  apiKey?: string;
  /** Ask the host for a JSON-object response (reliable structured output). */
  jsonMode?: boolean;
  /** Completion budget; reasoning models need more headroom than chat models. */
  maxTokens?: number;
};

export type ChatTurn = { role: "system" | "user" | "assistant"; content: string };

export type ProviderResult =
  | { ok: true; text: string; endpoint: string; model: string }
  | { ok: false; reason: "timeout" | "upstream" | "busy"; detail: string; retryAfterMs?: number };

const DEFAULT_ENDPOINTS: ProviderEndpoint[] = [
  { name: "llm7", chatUrl: "https://api.llm7.io/v1/chat/completions", model: "gpt-oss:20b" },
  { name: "pollinations", chatUrl: "https://text.pollinations.ai/openai", model: "openai-fast" },
];

const GROQ_URL = "https://api.groq.com/openai/v1/chat/completions";
/**
 * Open-weight GPT-OSS 120B: the strongest open model Groq currently serves for
 * chat. Groq retires models over time (llama-3.3-70b-versatile is already gone),
 * so GURU_MODEL can override this — list what your key can use at
 * https://api.groq.com/openai/v1/models. openai/gpt-oss-20b is a lighter option.
 */
const GROQ_DEFAULT_MODEL = "openai/gpt-oss-120b";

function envTokens(fallback: number): number {
  return Math.min(Math.max(Number(process.env.GURU_MAX_TOKENS) || fallback, 300), 4000);
}

export function configuredEndpoints(): ProviderEndpoint[] {
  const base = process.env.GURU_API_URL?.trim();
  const key = (process.env.GROQ_API_KEY ?? process.env.GURU_API_KEY)?.trim() || undefined;

  if (base) {
    const trimmed = base.replace(/\/+$/, "");
    return [
      {
        name: "custom",
        chatUrl: /\/chat\/completions$/.test(trimmed) ? trimmed : `${trimmed}/chat/completions`,
        model: process.env.GURU_MODEL?.trim() || "gpt-oss:20b",
        apiKey: process.env.GURU_API_KEY?.trim() || undefined,
        jsonMode: process.env.GURU_JSON_MODE === "true",
        maxTokens: envTokens(1200),
      },
    ];
  }

  if (key) {
    return [
      {
        name: "groq",
        chatUrl: GROQ_URL,
        model: process.env.GURU_MODEL?.trim() || GROQ_DEFAULT_MODEL,
        apiKey: key,
        jsonMode: true,
        // GPT-OSS reasons briefly before answering (reasoning_effort: low), so
        // leave headroom while staying inside the free per-minute token allowance.
        maxTokens: envTokens(1200),
      },
    ];
  }

  return DEFAULT_ENDPOINTS;
}
/** Reasoning headroom for the key-less GPT-OSS fallbacks. */
const DEFAULT_MAX_TOKENS = 1800;
const ATTEMPT_TIMEOUT_MS = Number(process.env.GURU_TIMEOUT_MS) > 0 ? Number(process.env.GURU_TIMEOUT_MS) : 30_000;

async function attempt(endpoint: ProviderEndpoint, messages: ChatTurn[]): Promise<ProviderResult> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), ATTEMPT_TIMEOUT_MS);
  const started = Date.now();
  try {
    const response = await fetch(endpoint.chatUrl, {
      method: "POST",
      signal: controller.signal,
      headers: {
        "content-type": "application/json",
        ...(endpoint.apiKey ? { authorization: `Bearer ${endpoint.apiKey}` } : null),
      },
      body: JSON.stringify({
        model: endpoint.model,
        messages,
        max_tokens: endpoint.maxTokens ?? envTokens(DEFAULT_MAX_TOKENS),
        temperature: 0.6,
        stream: false,
        ...(endpoint.jsonMode ? { response_format: { type: "json_object" } } : null),
        // Groq-hosted GPT-OSS accepts this; it keeps replies fast and cheap.
        ...(endpoint.name === "groq" && /gpt-oss/i.test(endpoint.model) ? { reasoning_effort: "low" } : null),
      }),
    });
    if (!response.ok) {
      // Rate-limited / out of free capacity: the caller should say "busy", not "broken".
      const busy = [402, 429, 503].includes(response.status);
      const retryAfter = Number(response.headers.get("retry-after"));
      return {
        ok: false,
        reason: busy ? "busy" : "upstream",
        detail: `${endpoint.name} HTTP ${response.status}`,
        retryAfterMs: Number.isFinite(retryAfter) && retryAfter > 0 ? retryAfter * 1000 : undefined,
      };
    }
    const data = (await response.json()) as {
      choices?: { message?: { content?: string | null } }[];
    };
    const text = data.choices?.[0]?.message?.content?.trim();
    if (!text) return { ok: false, reason: "upstream", detail: `${endpoint.name} empty reply` };
    console.info(`[guru] provider=${endpoint.name} model=${endpoint.model} ms=${Date.now() - started}`);
    return { ok: true, text, endpoint: endpoint.name, model: endpoint.model };
  } catch (error) {
    if (error instanceof Error && error.name === "AbortError") {
      return { ok: false, reason: "timeout", detail: `${endpoint.name} timeout` };
    }
    return { ok: false, reason: "upstream", detail: `${endpoint.name} unreachable` };
  } finally {
    clearTimeout(timer);
  }
}

/** Tries each configured endpoint in order until one returns text. Logs status only, never content. */
export async function completeChat(messages: ChatTurn[]): Promise<ProviderResult> {
  let last: ProviderResult = { ok: false, reason: "upstream", detail: "no endpoint configured" };
  let sawBusy = false;
  for (const endpoint of configuredEndpoints()) {
    let result = await attempt(endpoint, messages);
    // One short retry when an endpoint is momentarily rate-limited.
    if (!result.ok && result.reason === "busy") {
      // Honour the host's Retry-After, but never hold the visitor for long.
      const wait = Math.min(result.retryAfterMs ?? 1500, 5000);
      await new Promise((r) => setTimeout(r, wait));
      result = await attempt(endpoint, messages);
    }
    if (result.ok) return result;
    console.error(`[guru] ${result.detail}`);
    if (result.reason === "busy") sawBusy = true;
    last = result;
  }
  return sawBusy ? { ok: false, reason: "busy", detail: last.ok ? "" : last.detail } : last;
}

/** Pulls the first balanced JSON object out of model output (tolerates code fences and prose). */
export function extractJsonObject(text: string): unknown | null {
  const start = text.indexOf("{");
  if (start === -1) return null;
  let depth = 0;
  let inString = false;
  let escaped = false;
  for (let i = start; i < text.length; i++) {
    const ch = text[i]!;
    if (inString) {
      if (escaped) escaped = false;
      else if (ch === "\\") escaped = true;
      else if (ch === '"') inString = false;
      continue;
    }
    if (ch === '"') inString = true;
    else if (ch === "{") depth++;
    else if (ch === "}") {
      depth--;
      if (depth === 0) {
        try {
          return JSON.parse(text.slice(start, i + 1));
        } catch {
          return null;
        }
      }
    }
  }
  return null;
}
