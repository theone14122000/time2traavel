import Link from "next/link";
import { ArrowRight, BookOpen, Clock3 } from "lucide-react";
import { HomeSectionHeading } from "@/components/home/section-heading";
import { Badge } from "@/components/ui/badge";
import { BrutalImage } from "@/components/ui/brutal-image";
import { Button } from "@/components/ui/button";
import { getLatestGuides } from "@/lib/data/guides";

/**
 * Travel guides band — three latest published guides. Hides itself when no
 * guide posts are published yet.
 */
export async function GuidesTeaser() {
  const guides = await getLatestGuides(3);

  if (guides.length === 0) return null;

  return (
    <section
      id="travel-guides"
      aria-labelledby="guides-heading"
      className="relative w-full border-y border-line bg-cream"
    >
      <span aria-hidden="true" className="grid-lines absolute inset-0 opacity-60" />

      <div className="relative mx-auto w-full max-w-[90rem] px-4 py-12 sm:px-6 sm:py-16 lg:px-10 lg:py-20 xl:px-14">
        <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <HomeSectionHeading
            id="guides-heading"
            eyebrow="Field notes"
            title="Reading for the [[road]]."
            gradientTone="ocean"
            description="Destination guides, trekking tips and travel inspiration from the Time2Travel team."
          />
          <Button asChild variant="outline" size="md" className="shrink-0">
            <Link href="/travel-guides">
              <BookOpen aria-hidden="true" className="size-4" />
              All guides
            </Link>
          </Button>
        </div>

        <ul className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {guides.map((guide) => (
            <li key={guide.id} className="h-full">
              <article className="group relative flex h-full flex-col border border-line bg-paper shadow-hard transition-transform duration-150 hover:-translate-x-1 hover:-translate-y-1 hover:shadow-hard-lg">
                <div className="relative aspect-[3/2] overflow-hidden border-b border-line bg-butter">
                  <BrutalImage
                    src={guide.coverImage}
                    alt={guide.coverImageAlt?.trim() || guide.title}
                    aspect="free"
                    sizes="(max-width: 640px) 92vw, (max-width: 1024px) 46vw, 30vw"
                    className="h-full w-full border-0"
                  />
                </div>

                <div className="flex flex-1 flex-col gap-3 p-4 sm:p-5">
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge variant="mint" size="sm">
                      {guide.category}
                    </Badge>
                    {guide.readingMinutes ? (
                      <span className="inline-flex items-center gap-1 text-xs font-semibold text-ink-soft">
                        <Clock3 aria-hidden="true" className="size-3.5" />
                        {guide.readingMinutes} min read
                      </span>
                    ) : null}
                  </div>

                  <h3 className="font-display text-h4 uppercase leading-tight">
                    <Link
                      href={`/travel-guides/${guide.slug}`}
                      className="decoration-3 underline-offset-4 group-hover:underline"
                    >
                      {guide.title}
                    </Link>
                  </h3>

                  {guide.excerpt ? (
                    <p className="line-clamp-3 text-sm font-medium leading-relaxed text-ink-soft">
                      {guide.excerpt}
                    </p>
                  ) : null}

                  <div className="mt-auto pt-2">
                    <Link
                      href={`/travel-guides/${guide.slug}`}
                      className="label-brutal tap-44 inline-flex items-center gap-1.5 text-ink underline underline-offset-4"
                    >
                      Read guide
                      <ArrowRight aria-hidden="true" className="size-3.5" />
                    </Link>
                  </div>
                </div>
              </article>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
