import type { Metadata } from "next";
import Link from "next/link";
import { MessageSquareHeart, Star } from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { SectionWrapper, SectionHeading } from "@/components/shared/section";
import { Container } from "@/components/shared/container";
import { EmptyState } from "@/components/shared/empty-state";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { RatingStars } from "@/components/shared/rating-stars";
import { buttonVariants } from "@/components/ui/button-variants";
import { ReviewForm } from "@/components/forms/review-form";
import { getApprovedReviews } from "@/lib/data/reviews";
import { formatDate, pluralize } from "@/lib/utils";
import { buildMetadata } from "@/lib/seo";

export function generateMetadata(): Metadata {
  return buildMetadata({
    title: "Reviews",
    description:
      "Traveller reviews of Time to Travel — every review shown here was approved by our team. Leave your own after your trip.",
    path: "/reviews",
  });
}

export default async function ReviewsPage() {
  const reviews = await getApprovedReviews(60);
  const average =
    reviews.length > 0
      ? reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length
      : null;

  return (
    <>
      <div className="w-full border-b-[3px] border-ink bg-paper">
        <Container className="py-3">
          <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "Reviews" }]} />
        </Container>
      </div>

      <PageHeader
        eyebrow="Reviews"
        title="What travellers say"
        description="Every review below was submitted through this site and approved by our team. Planning your own trip? Leave a review after you travel."
        tone="lavender"
      >
        {average !== null ? (
          <span className="inline-flex items-center gap-2 border-[3px] border-ink bg-paper px-3 py-2 text-sm font-bold uppercase">
            <Star aria-hidden="true" className="size-4 fill-lemon" />
            {average.toFixed(1)} average · {pluralize(reviews.length, "review")}
          </span>
        ) : null}
        <Link className={buttonVariants({ variant: "dark", size: "lg" })} href="/plan-my-trip">
          <MessageSquareHeart aria-hidden="true" className="size-4" />
          Plan my trip
        </Link>
      </PageHeader>

      <SectionWrapper
        tone="cream"
        bordered
        gridLines
        aria-labelledby="reviews-list-heading"
        containerClassName="py-12 sm:py-16 lg:py-20"
      >
        <SectionHeading
          id="reviews-list-heading"
          eyebrow="Approved reviews"
          title="Straight from travellers"
        />

        <div className="mt-8">
          {reviews.length === 0 ? (
            <EmptyState
              eyebrow="Reviews"
              title="No reviews published yet"
              description="Approved reviews will appear here. Travelling with us? Be the first to leave one."
              tone="lavender"
              illustration="luggage"
              action={
                <a className={buttonVariants({ variant: "default", size: "md" })} href="#leave-review">
                  <Star aria-hidden="true" className="size-4" />
                  Leave a review
                </a>
              }
            />
          ) : (
            <ul className="no-scrollbar snap-rail scroll-pl-4 -mx-4 flex gap-4 overflow-x-auto px-4 pb-2 sm:mx-0 sm:grid sm:grid-cols-2 sm:gap-6 sm:overflow-visible sm:px-0 sm:pb-0 lg:grid-cols-3">
              {reviews.map((review) => (
                <li
                  key={review.id}
                  className="flex h-full w-[calc(100%_-_2rem)] shrink-0 flex-col border-4 border-ink bg-paper p-5 shadow-brutal-md sm:w-auto"
                >
                  <RatingStars rating={review.rating} />
                  <p className="mt-3 whitespace-pre-line text-sm font-medium leading-relaxed">
                    {review.comment}
                  </p>
                  <footer className="mt-auto flex flex-wrap items-center justify-between gap-2 border-t-[2px] border-ink pt-3">
                    <span className="font-display text-sm uppercase">{review.name}</span>
                    <span className="label-brutal text-ink-soft">
                      {review.context || "Trip"}
                    </span>
                  </footer>
                  <p className="mt-1 text-xs font-semibold text-ink-soft">
                    {formatDate(review.createdAt)}
                  </p>
                </li>
              ))}
            </ul>
          )}
        </div>
      </SectionWrapper>

      <SectionWrapper
        tone="butter"
        bordered
        aria-labelledby="leave-review-heading"
        containerClassName="py-12 sm:py-16 lg:py-20"
      >
        <div className="grid gap-8 lg:grid-cols-2 lg:items-start">
          <SectionHeading
            id="leave-review-heading"
            eyebrow="Your turn"
            title="Traveled with us?"
            description="Reviews go through a quick check by our team before they appear publicly. No marketing quotes — just your honest experience."
          />

          <div className="border-4 border-ink bg-paper p-5 shadow-brutal-md sm:p-6">
            <ReviewForm />
          </div>
        </div>
      </SectionWrapper>
    </>
  );
}
