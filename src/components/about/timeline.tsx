import { StaggerGroup, StaggerItem } from "@/components/shared/reveal";

export type TimelineMilestone = {
  year?: string;
  title: string;
  body?: string;
};

/**
 * Reads milestones from admin-managed `PageContent.data`.
 * Returns `null` unless `data` is a non-empty array of usable objects, so the
 * caller can fall back to the plain paragraph rendering.
 *
 * Expected shape: `Array<{ year?: string; title: string; body?: string }>`
 */
export function parseMilestones(data: unknown): TimelineMilestone[] | null {
  if (!Array.isArray(data)) return null;

  const milestones: TimelineMilestone[] = [];

  for (const entry of data) {
    if (typeof entry !== "object" || entry === null) continue;
    const record = entry as Record<string, unknown>;

    const title = typeof record.title === "string" ? record.title.trim() : "";
    if (!title) continue;

    const year =
      typeof record.year === "string"
        ? record.year.trim()
        : typeof record.year === "number" && Number.isFinite(record.year)
          ? String(record.year)
          : "";

    const body = typeof record.body === "string" ? record.body.trim() : "";

    milestones.push({
      title,
      ...(year ? { year } : {}),
      ...(body ? { body } : {}),
    });
  }

  return milestones.length > 0 ? milestones : null;
}

function toParagraphs(body: string | null | undefined): string[] {
  if (!body) return [];
  return body
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);
}

/**
 * Vertical neo-brutalist timeline: thick ink rail, square lemon nodes,
 * alternating sides on desktop and a single stacked column on mobile.
 * Entrance is staggered via the shared reveal primitives.
 */
export function Timeline({ milestones }: { milestones: TimelineMilestone[] }) {
  if (milestones.length === 0) return null;

  return (
    <div className="relative mt-10">
      <span
        aria-hidden="true"
        className="absolute inset-y-0 left-[9px] w-[6px] bg-ink lg:hidden"
      />
      <span
        aria-hidden="true"
        className="absolute inset-y-0 left-1/2 hidden w-[6px] -translate-x-1/2 bg-ink lg:block"
      />

      <StaggerGroup className="relative">
        <ol className="grid gap-8 lg:gap-12">
          {milestones.map((milestone, index) => {
            const isLeft = index % 2 === 0;
            const paragraphs = toParagraphs(milestone.body);

            return (
              <li
                key={`${milestone.year ?? "milestone"}-${milestone.title}-${index}`}
                className="relative pl-10 lg:grid lg:grid-cols-2 lg:gap-12 lg:pl-0"
              >
                <span
                  aria-hidden="true"
                  className="absolute left-0 top-3 size-6 border-[3px] border-ink bg-lemon shadow-hard-xs lg:left-1/2 lg:-translate-x-1/2"
                />

                <StaggerItem
                  className={
                    isLeft
                      ? "lg:col-start-1 lg:w-full lg:max-w-xl lg:justify-self-end"
                      : "lg:col-start-2 lg:w-full lg:max-w-xl"
                  }
                >
                  <article className="border-[3px] border-ink bg-paper p-5 shadow-brutal-md sm:p-6">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="label-brutal border-[2px] border-ink bg-ink px-2 py-1.5 text-cream">
                        {String(index + 1).padStart(2, "0")}
                      </span>
                      {milestone.year ? (
                        <span className="label-brutal border-[2px] border-ink bg-lemon px-2 py-1.5 text-ink">
                          {milestone.year}
                        </span>
                      ) : null}
                    </div>

                    <h3 className="mt-4 font-display text-h4 uppercase leading-tight">
                      {milestone.title}
                    </h3>

                    {paragraphs.length > 0 ? (
                      <div className="brutal-prose mt-3">
                        {paragraphs.map((paragraph, paragraphIndex) => (
                          <p key={`milestone-${index}-paragraph-${paragraphIndex}`}>
                            {paragraph}
                          </p>
                        ))}
                      </div>
                    ) : null}
                  </article>
                </StaggerItem>
              </li>
            );
          })}
        </ol>
      </StaggerGroup>
    </div>
  );
}
