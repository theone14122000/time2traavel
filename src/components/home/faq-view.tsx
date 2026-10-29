"use client";

import * as React from "react";
import { CircleHelp, Link2, MessageSquareText, Search, Send, X } from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { EmptyState } from "@/components/shared/empty-state";
import { useTripPlanner } from "@/components/forms/trip-planner-context";
import type { FaqItem } from "@/lib/data/reviews";

/**
 * Category-tabbed FAQ accordion with in-page search and deep-linkable
 * questions (`#faq-id` opens + scrolls to that item; each question has a
 * copy-link button). Categories are plain admin-entered strings, so any
 * number of tabs renders without a fixed taxonomy.
 */
export function FaqView({ faqs }: { faqs: FaqItem[] }) {
  const { openPlanner } = useTripPlanner();

  const [query, setQuery] = React.useState("");
  const [activeTab, setActiveTab] = React.useState<string>(
    faqs[0]?.category?.trim() || "General",
  );
  const [openValues, setOpenValues] = React.useState<string[]>([]);
  const [copiedId, setCopiedId] = React.useState<string | null>(null);
  const searchInputRef = React.useRef<HTMLInputElement>(null);

  const allCategories = React.useMemo(() => {
    const map = new Map<string, FaqItem[]>();
    faqs.forEach((faq) => {
      const key = faq.category?.trim() || "General";
      const list = map.get(key) ?? [];
      list.push(faq);
      map.set(key, list);
    });
    return Array.from(map.entries());
  }, [faqs]);

  const normalized = query.trim().toLowerCase();

  const visibleCategories = React.useMemo(() => {
    if (!normalized) return allCategories;
    return allCategories
      .map(
        ([category, items]) =>
          [
            category,
            items.filter(
              (faq) =>
                faq.question.toLowerCase().includes(normalized) ||
                faq.answer.toLowerCase().includes(normalized),
            ),
          ] as const,
      )
      .filter(([, items]) => items.length > 0);
  }, [allCategories, normalized]);

  const matchCount = visibleCategories.reduce((sum, [, items]) => sum + items.length, 0);

  // Keep the selected tab valid as the visible category set changes.
  React.useEffect(() => {
    if (
      visibleCategories.length > 0 &&
      !visibleCategories.some(([category]) => category === activeTab)
    ) {
      setActiveTab(visibleCategories[0][0]);
    }
  }, [visibleCategories, activeTab]);

  // Deep links: `#<faq-id>` opens that question and scrolls to it.
  React.useEffect(() => {
    function openFromHash() {
      const id = decodeURIComponent(window.location.hash.replace(/^#/, ""));
      if (!id) return;
      const faq = faqs.find((item) => item.id === id);
      if (!faq) return;
      setActiveTab(faq.category?.trim() || "General");
      setOpenValues((prev) => (prev.includes(id) ? prev : [...prev, id]));
      window.setTimeout(() => {
        document.getElementById(id)?.scrollIntoView({ block: "center" });
      }, 150);
    }

    openFromHash();
    window.addEventListener("hashchange", openFromHash);
    return () => window.removeEventListener("hashchange", openFromHash);
  }, [faqs]);

  async function handleCopyLink(id: string) {
    const url = `${window.location.origin}${window.location.pathname}#${id}`;
    try {
      await navigator.clipboard.writeText(url);
      setCopiedId(id);
      window.setTimeout(() => {
        setCopiedId((prev) => (prev === id ? null : prev));
      }, 1800);
    } catch {
      setCopiedId(null);
    }
  }

  function clearSearch() {
    setQuery("");
    searchInputRef.current?.focus();
  }

  if (faqs.length === 0) {
    return (
      <EmptyState
        eyebrow="FAQs"
        title="Questions coming soon"
        description="Our FAQs are being written. If you have a question right now, send it over — we'll reply with an answer."
        tone="lavender"
        illustration="search"
        icon={<CircleHelp className="size-8" aria-hidden="true" />}
        action={
          <Button type="button" size="md" onClick={() => openPlanner()}>
            <MessageSquareText aria-hidden="true" className="size-4" />
            Ask us anything
          </Button>
        }
      />
    );
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_auto] lg:items-start">
      <div className="w-full">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="relative flex-1">
            <label htmlFor="faq-search" className="sr-only">
              Search questions and answers
            </label>
            <Search
              aria-hidden="true"
              className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2"
            />
            <Input
              id="faq-search"
              ref={searchInputRef}
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search questions & answers"
              className="pl-9 pr-11"
              autoComplete="off"
            />
            {query ? (
              <button
                type="button"
                onClick={clearSearch}
                aria-label="Clear FAQ search"
                className="absolute right-1 top-1/2 flex size-11 -translate-y-1/2 items-center justify-center border border-line bg-lemon"
              >
                <X aria-hidden="true" className="size-3.5" />
              </button>
            ) : null}
          </div>

          <p role="status" aria-live="polite" className="label-brutal shrink-0 text-ink-soft">
            {normalized
              ? `${matchCount} ${matchCount === 1 ? "match" : "matches"}`
              : `${faqs.length} questions`}
          </p>
        </div>

        {normalized && matchCount === 0 ? (
          <EmptyState
            eyebrow="Search"
            title={`No questions match "${query.trim()}"`}
            description="Try a different word, or clear the search to browse every question."
            tone="lavender"
            illustration="search"
            action={
              <Button type="button" variant="secondary" onClick={clearSearch}>
                Clear search
              </Button>
            }
          />
        ) : (
          <Tabs value={activeTab} onValueChange={setActiveTab} className="mt-5 w-full">
            <TabsList className="mb-4 w-auto">
              {visibleCategories.map(([category, items]) => (
                <TabsTrigger key={category} value={category}>
                  {category}
                  <span aria-hidden="true" className="ml-1 text-xs opacity-70">
                    {items.length}
                  </span>
                </TabsTrigger>
              ))}
            </TabsList>

            {visibleCategories.map(([category, items]) => (
              <TabsContent key={category} value={category}>
                <Accordion
                  type="multiple"
                  value={openValues}
                  onValueChange={setOpenValues}
                  className="grid gap-4"
                >
                  {items.map((faq) => (
                    <AccordionItem key={faq.id} value={faq.id} id={faq.id}>
                      <div className="flex items-stretch">
                        <AccordionTrigger className="py-3.5">
                          {faq.question}
                        </AccordionTrigger>
                        <div className="flex shrink-0 items-center gap-1.5 pr-3">
                          {copiedId === faq.id ? (
                            <span
                              role="status"
                              aria-live="polite"
                              className="label-brutal hidden text-success sm:inline"
                            >
                              Copied!
                            </span>
                          ) : null}
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon-sm"
                            className="tap-44"
                            onClick={() => handleCopyLink(faq.id)}
                            aria-label={`Copy link to: ${faq.question}`}
                          >
                            <Link2 aria-hidden="true" className="size-4" />
                          </Button>
                        </div>
                      </div>
                      <AccordionContent>{faq.answer}</AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </TabsContent>
            ))}
          </Tabs>
        )}
      </div>

      <aside className="border border-line bg-lemon p-5 shadow-brutal-md lg:w-64">
        <p className="font-display text-h4 uppercase leading-tight">Still have questions?</p>
        <p className="mt-2 text-sm font-medium">
          Tell us your dates and we&apos;ll answer with an actual plan.
        </p>
        <Button
          type="button"
          variant="outline"
          size="md"
          className="mt-4 w-full"
          onClick={() => openPlanner()}
        >
          <Send aria-hidden="true" className="size-4" />
          Ask us
        </Button>
      </aside>
    </div>
  );
}
