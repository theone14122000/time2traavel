"use client";

import * as React from "react";
import Link from "next/link";
import { ArrowUp, Compass, ExternalLink, Loader2, MessageCircle, RotateCcw, X } from "lucide-react";
import { GuruIcon } from "@/components/guru/guru-icon";
import { GuruMarkdown } from "@/components/guru/guru-markdown";
import { waHref } from "@/lib/contact";
import { cn } from "@/lib/utils";
import {
  GURU_LIMITS,
  type GuruAction,
  type GuruResponse,
  type TripInquiryAction,
} from "@/lib/guru/types";
import type { TripPlannerInitial } from "@/components/forms/trip-planner";

export const OPEN_PLANNER_EVENT = "tt:open-planner";

type ChatMessage = {
  id: string;
  role: "user" | "assistant";
  content: string;
  actions?: GuruAction[];
  followups?: string[];
  /** Local welcome message — never sent to the model. */
  local?: boolean;
};

type Failure = { kind: "not_configured" | "rate_limited" | "network" | "upstream"; retryAfter?: number };

const STARTERS = [
  "Plan a trip to Himachal Pradesh",
  "Best treks in India for beginners",
  "Help me plan an international holiday",
  "Create a custom travel package",
  "Suggest a weekend trip",
  "Destinations suitable for families",
];

const WELCOME: ChatMessage = {
  id: "welcome",
  role: "assistant",
  local: true,
  content:
    "Hey, I'm **GURU**, your Time2Travel travel companion.\n\nWhether you're dreaming of Himalayan treks, exploring India or an international getaway, I can help you compare destinations and shape a trip that suits you.\n\nWhere would you like to go?",
};

const STORAGE_KEY = "tt:guru-chat";

function uid() {
  return Math.random().toString(36).slice(2, 10);
}

/** Maps a model action to the planner's prefill shape. */
function toPlannerInitial(action: TripInquiryAction): TripPlannerInitial {
  return {
    destination: action.destination,
    tripType: action.tripType,
    departureCity: action.departureCity,
    travelDate: action.startDate,
    endDate: action.endDate,
    adults: action.adults != null ? String(action.adults) : undefined,
    children: action.children != null ? String(action.children) : undefined,
    childAges: action.childAges,
    budgetRange: action.budgetRange,
    stayType: action.stayType,
    interests: action.interests?.join(","),
    specialRequests: action.notes,
  };
}

function ActionCard({
  action,
  whatsapp,
  onOpenPlanner,
  onNavigate,
}: {
  action: GuruAction;
  whatsapp?: string | null;
  onOpenPlanner: (initial: TripPlannerInitial) => void;
  onNavigate: () => void;
}) {
  if (action.type === "prepare_trip_inquiry") {
    const rows: [string, string | undefined][] = [
      ["Destination", action.destination],
      ["From", action.departureCity],
      ["Dates", [action.startDate, action.endDate].filter(Boolean).join(" → ") || undefined],
      [
        "Travellers",
        action.adults != null
          ? `${action.adults} adult${action.adults === 1 ? "" : "s"}${action.children ? `, ${action.children} child${action.children === 1 ? "" : "ren"}` : ""}`
          : undefined,
      ],
      ["Budget", action.budgetRange],
      ["Stay", action.stayType],
    ];
    return (
      <div className="mt-3 rounded-xl border border-line bg-cream p-3.5">
        <p className="lux-eyebrow">Trip summary</p>
        <dl className="mt-2 grid grid-cols-[auto_1fr] gap-x-3 gap-y-1 text-sm">
          {rows
            .filter(([, v]) => v)
            .map(([k, v]) => (
              <React.Fragment key={k}>
                <dt className="text-ink-soft">{k}</dt>
                <dd className="font-medium">{v}</dd>
              </React.Fragment>
            ))}
        </dl>
        <button
          type="button"
          onClick={() => onOpenPlanner(toPlannerInitial(action))}
          className="mt-3 inline-flex h-10 w-full items-center justify-center gap-2 rounded-full bg-forest text-sm font-semibold text-white transition-colors hover:bg-[var(--tt-forest-hover)]"
        >
          <Compass aria-hidden="true" className="size-4" />
          Review &amp; send in trip planner
        </button>
        <p className="mt-2 text-xs text-ink-soft">Nothing is sent until you review and submit the form.</p>
      </div>
    );
  }

  if (action.type === "offer_whatsapp") {
    const href = waHref(whatsapp, `Hi Time2Travel! ${action.summary}`);
    if (!href) return null;
    return (
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className="mt-3 inline-flex h-10 items-center justify-center gap-2 rounded-full border border-line-strong bg-paper px-4 text-sm font-semibold transition-colors hover:border-ink"
      >
        <MessageCircle aria-hidden="true" className="size-4 text-[#128c7e]" />
        Continue on WhatsApp
        <ExternalLink aria-hidden="true" className="size-3.5 text-ink-soft" />
      </a>
    );
  }

  return (
    <div className="mt-3 flex flex-wrap gap-2">
      {action.links.map((link) => (
        <Link
          key={link.path}
          href={link.path}
          onClick={onNavigate}
          className="inline-flex min-h-9 items-center rounded-full border border-line-strong bg-paper px-3.5 text-sm font-medium transition-colors hover:border-ink"
        >
          {link.label}
        </Link>
      ))}
    </div>
  );
}

export function GuruPanel({
  open,
  whatsapp,
  path,
  onClose,
  restoreFocusTo,
}: {
  open: boolean;
  whatsapp?: string | null;
  path: string;
  onClose: () => void;
  restoreFocusTo: React.RefObject<HTMLElement | null>;
}) {
  const [messages, setMessages] = React.useState<ChatMessage[]>(() => {
    try {
      const saved = window.sessionStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved) as ChatMessage[];
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {
      // Storage unavailable or corrupt — start fresh.
    }
    return [WELCOME];
  });
  const [input, setInput] = React.useState("");
  const [loading, setLoading] = React.useState(false);
  const [failure, setFailure] = React.useState<Failure | null>(null);
  const [viewportHeight, setViewportHeight] = React.useState<number | null>(null);

  // Synchronous mirror of `messages` so an async send always sees the latest history.
  const latestMessages = React.useRef(messages);
  const scrollRef = React.useRef<HTMLDivElement>(null);
  const inputRef = React.useRef<HTMLTextAreaElement>(null);
  const abortRef = React.useRef<AbortController | null>(null);
  const inFlight = React.useRef(false);
  const coarsePointer = React.useRef(false);

  React.useEffect(() => {
    coarsePointer.current = window.matchMedia("(pointer: coarse)").matches;
    return () => abortRef.current?.abort();
  }, []);

  // Move focus into the chat whenever it opens.
  React.useEffect(() => {
    if (open) inputRef.current?.focus({ preventScroll: true });
  }, [open]);

  // Keep the sheet inside the visible viewport when the mobile keyboard opens.
  React.useEffect(() => {
    const vv = window.visualViewport;
    if (!vv) return;
    const sync = () => setViewportHeight(Math.round(vv.height));
    sync();
    vv.addEventListener("resize", sync);
    return () => vv.removeEventListener("resize", sync);
  }, []);

  // Conversation lives for this tab only (sessionStorage), never on the server.
  React.useEffect(() => {
    try {
      window.sessionStorage.setItem(STORAGE_KEY, JSON.stringify(messages.slice(-30)));
    } catch {
      // ignore quota / privacy-mode errors
    }
  }, [messages]);

  React.useEffect(() => {
    const el = scrollRef.current;
    if (el) el.scrollTo({ top: el.scrollHeight, behavior: "smooth" });
  }, [messages, loading, failure]);

  const close = React.useCallback(() => {
    onClose();
    window.setTimeout(() => restoreFocusTo.current?.focus(), 0);
  }, [onClose, restoreFocusTo]);

  const send = React.useCallback(
    async (text: string, opts?: { retry?: boolean }) => {
      const content = text.trim().slice(0, GURU_LIMITS.messageChars);
      if (!content || inFlight.current) return;
      inFlight.current = true;
      setFailure(null);

      // A retry re-sends the existing last user message instead of duplicating it.
      const history: ChatMessage[] = opts?.retry
        ? latestMessages.current
        : [...latestMessages.current, { id: uid(), role: "user", content }];
      latestMessages.current = history;
      setMessages(history);
      if (!opts?.retry) setInput("");
      setLoading(true);

      const controller = new AbortController();
      abortRef.current = controller;
      try {
        const payload = {
          path,
          messages: history
            .filter((m) => !m.local)
            .slice(-GURU_LIMITS.historyMessages)
            .map((m) => ({ role: m.role, content: m.content })),
        };
        const response = await fetch("/api/guru", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify(payload),
          signal: controller.signal,
        });
        if (!response.ok) {
          const body = (await response.json().catch(() => ({}))) as { error?: string; retryAfterSeconds?: number };
          if (body.error === "not_configured") setFailure({ kind: "not_configured" });
          else if (body.error === "rate_limited") setFailure({ kind: "rate_limited", retryAfter: body.retryAfterSeconds });
          else setFailure({ kind: "upstream" });
          return;
        }
        const data = (await response.json()) as GuruResponse;
        const next: ChatMessage[] = [
          ...latestMessages.current,
          { id: uid(), role: "assistant", content: data.reply, actions: data.actions, followups: data.followups },
        ];
        latestMessages.current = next;
        setMessages(next);
      } catch (error) {
        if (error instanceof DOMException && error.name === "AbortError") return;
        setFailure({ kind: "network" });
      } finally {
        inFlight.current = false;
        setLoading(false);
      }
    },
    [path],
  );

  const submit = () => void send(input);

  const onKeyDown = (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === "Enter" && !event.shiftKey && !coarsePointer.current && !event.nativeEvent.isComposing) {
      event.preventDefault();
      submit();
    }
  };

  const openPlanner = (initial: TripPlannerInitial) => {
    window.dispatchEvent(new CustomEvent(OPEN_PLANNER_EVENT, { detail: initial }));
    // On small screens the planner dialog needs the whole viewport.
    if (window.matchMedia("(max-width: 639px)").matches) onClose();
  };

  const lastAssistant = [...messages].reverse().find((m) => m.role === "assistant");
  const showStarters = messages.length === 1 && messages[0]?.local;
  const nearLimit = input.length > GURU_LIMITS.messageChars * 0.85;
  const waFallback = waHref(whatsapp, "Hi Time2Travel! I'd like help planning a trip.");

  return (
    <div
      role="dialog"
      aria-label="GURU, your AI travel assistant"
      data-guru-panel
      onKeyDown={(e) => {
        if (e.key === "Escape") {
          e.stopPropagation();
          close();
        }
      }}
      style={viewportHeight ? { height: `min(${viewportHeight}px, var(--guru-h))` } : undefined}
      className={cn(
        "guru-panel fixed z-[65] flex flex-col overflow-hidden bg-paper text-ink shadow-hard-xl",
        // Mobile: full-screen sheet. Desktop: floating card above the launcher.
        "inset-x-0 bottom-0 top-auto h-dvh max-sm:[--guru-h:100dvh] sm:inset-x-auto sm:right-4 sm:h-[min(38rem,calc(100dvh-7.5rem))] sm:w-[26rem] sm:rounded-3xl sm:border sm:border-line sm:[--guru-h:38rem]",
        "sm:bottom-[calc(88px+env(safe-area-inset-bottom))] lg:bottom-[calc(92px+env(safe-area-inset-bottom))]",
      )}
    >
      {/* Header */}
      <header className="relative flex items-center gap-3 bg-ink px-4 py-3.5 pt-[calc(0.875rem+env(safe-area-inset-top))] text-white sm:pt-3.5">
        <GuruIcon className="size-10 shrink-0" />
        <div className="min-w-0 flex-1">
          <p className="font-display text-lg leading-none">GURU</p>
          <p className="mt-1 flex items-center gap-1.5 text-xs text-white/75">
            <span aria-hidden="true" className="size-1.5 rounded-full bg-[#4ade80]" />
            AI Travel Companion
          </p>
        </div>
        <button
          type="button"
          onClick={close}
          aria-label="Close GURU chat"
          className="grid size-10 place-items-center rounded-full text-white/85 transition-colors hover:bg-white/10 hover:text-white"
        >
          <X aria-hidden="true" className="size-5" />
        </button>
      </header>

      {/* Conversation */}
      <div
        ref={scrollRef}
        role="log"
        aria-live="polite"
        aria-relevant="additions"
        aria-label="Conversation with GURU"
        className="min-h-0 flex-1 space-y-5 overflow-y-auto overscroll-contain bg-cream px-4 py-5"
      >
        {messages.map((message) =>
          message.role === "user" ? (
            <div key={message.id} className="flex justify-end">
              <p className="max-w-[85%] whitespace-pre-wrap break-words rounded-2xl rounded-br-md bg-forest px-4 py-2.5 text-[0.9375rem] leading-relaxed text-white">
                {message.content}
              </p>
            </div>
          ) : (
            <div key={message.id} className="flex gap-2.5">
              <GuruIcon className="mt-0.5 size-7 shrink-0" />
              <div className="min-w-0 max-w-[88%] break-words rounded-2xl rounded-tl-md border border-line bg-paper px-4 py-3">
                <GuruMarkdown text={message.content} onNavigate={close} />
                {message.actions?.map((action, index) => (
                  <ActionCard
                    key={index}
                    action={action}
                    whatsapp={whatsapp}
                    onOpenPlanner={openPlanner}
                    onNavigate={close}
                  />
                ))}
              </div>
            </div>
          ),
        )}

        {showStarters ? (
          <div className="flex flex-wrap gap-2 pl-9">
            {STARTERS.map((starter) => (
              <button
                key={starter}
                type="button"
                onClick={() => void send(starter)}
                disabled={loading}
                className="min-h-9 rounded-full border border-line-strong bg-paper px-3.5 text-left text-sm font-medium transition-colors hover:border-ink hover:bg-sand disabled:opacity-50"
              >
                {starter}
              </button>
            ))}
          </div>
        ) : null}

        {!loading && !failure && lastAssistant && !lastAssistant.local && lastAssistant.followups?.length ? (
          <div className="flex flex-wrap gap-2 pl-9">
            {lastAssistant.followups.map((q) => (
              <button
                key={q}
                type="button"
                onClick={() => void send(q)}
                className="min-h-9 rounded-full border border-line-strong bg-paper px-3.5 text-sm font-medium transition-colors hover:border-ink hover:bg-sand"
              >
                {q}
              </button>
            ))}
          </div>
        ) : null}

        {loading ? (
          <div className="flex gap-2.5" role="status" aria-label="GURU is typing">
            <GuruIcon className="mt-0.5 size-7 shrink-0" />
            <div className="flex items-center gap-1.5 rounded-2xl rounded-tl-md border border-line bg-paper px-4 py-3.5">
              <span className="guru-dot" />
              <span className="guru-dot [animation-delay:150ms]" />
              <span className="guru-dot [animation-delay:300ms]" />
            </div>
          </div>
        ) : null}

        {failure ? (
          <div role="alert" className="rounded-2xl border border-line-strong bg-paper p-4 text-sm">
            <p className="font-semibold">
              {failure.kind === "not_configured"
                ? "GURU isn't switched on yet."
                : failure.kind === "rate_limited"
                  ? "You're sending messages quickly."
                  : "GURU couldn't answer just now."}
            </p>
            <p className="mt-1 text-ink-soft">
              {failure.kind === "not_configured"
                ? "The AI service hasn't been configured on this site. You can still reach the Time2Travel team directly."
                : failure.kind === "rate_limited"
                  ? `Please wait${failure.retryAfter ? ` about ${failure.retryAfter} seconds` : " a moment"} and try again.`
                  : failure.kind === "network"
                    ? "Check your connection and try again."
                    : "The AI service is unavailable. Please try again, or reach the team directly."}
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              {failure.kind !== "not_configured" ? (
                <button
                  type="button"
                  onClick={() => {
                    const lastUser = [...latestMessages.current].reverse().find((m) => m.role === "user");
                    if (lastUser) void send(lastUser.content, { retry: true });
                  }}
                  className="inline-flex h-9 items-center gap-1.5 rounded-full bg-forest px-4 text-sm font-semibold text-white"
                >
                  <RotateCcw aria-hidden="true" className="size-3.5" />
                  Try again
                </button>
              ) : null}
              {waFallback ? (
                <a
                  href={waFallback}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex h-9 items-center gap-1.5 rounded-full border border-line-strong px-4 text-sm font-semibold"
                >
                  <MessageCircle aria-hidden="true" className="size-3.5" />
                  WhatsApp the team
                </a>
              ) : null}
            </div>
          </div>
        ) : null}
      </div>

      {/* Composer */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          submit();
        }}
        className="border-t border-line bg-paper px-3 pb-[calc(0.75rem+env(safe-area-inset-bottom))] pt-3"
      >
        <label htmlFor="guru-input" className="sr-only">
          Message GURU
        </label>
        <div className="flex items-end gap-2">
          <textarea
            id="guru-input"
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value.slice(0, GURU_LIMITS.messageChars))}
            onKeyDown={onKeyDown}
            rows={1}
            maxLength={GURU_LIMITS.messageChars}
            placeholder="Ask about a destination, trek or trip…"
            disabled={loading}
            className="max-h-32 min-h-11 flex-1 resize-none rounded-2xl border border-line-strong bg-cream px-3.5 py-2.5 text-base leading-snug placeholder:text-ink-soft focus:border-ink focus:outline-none disabled:opacity-60 sm:text-[0.9375rem]"
            style={{ fieldSizing: "content" } as React.CSSProperties}
          />
          <button
            type="submit"
            disabled={loading || !input.trim()}
            aria-label="Send message"
            className="grid size-11 shrink-0 place-items-center rounded-full bg-forest text-white transition-colors hover:bg-[var(--tt-forest-hover)] disabled:opacity-40"
          >
            {loading ? <Loader2 aria-hidden="true" className="size-5 animate-spin" /> : <ArrowUp aria-hidden="true" className="size-5" />}
          </button>
        </div>
        <p className="mt-2 flex items-center justify-between gap-3 text-[0.6875rem] leading-snug text-ink-soft">
          <span>AI can make mistakes. Confirm prices &amp; availability with the team. Don&apos;t share passwords or payment details.</span>
          {nearLimit ? <span className="shrink-0 tabular-nums">{input.length}/{GURU_LIMITS.messageChars}</span> : null}
        </p>
      </form>
    </div>
  );
}
