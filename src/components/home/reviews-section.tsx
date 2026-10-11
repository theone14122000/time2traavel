import { Quote, UserRound } from "lucide-react";
import { HomeSectionHeading } from "@/components/home/section-heading";
import { EmptyState } from "@/components/shared/empty-state";
import { Marquee } from "@/components/shared/marquee";
import { RatingStars } from "@/components/shared/rating-stars";
import { ReviewForm } from "@/components/forms/review-form";
import { getApprovedReviews, type ApprovedReview } from "@/lib/data/reviews";
import { BrutalCard, BrutalCardBody } from "@/components/ui/brutal-card";
import { Badge, Stamp } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button-variants";
import { cn, formatDate } from "@/lib/utils";

/**
 * Compact review card for the marquee wall. Explicit text sizes /
 * `normal-case` keep the marquee's ticker wrapper styles from leaking in.
 */
function ReviewMiniCard({ review }: { review: ApprovedReview }) {
  return (
    <BrutalCard
      variant="review"
      disableHover
      className="w-[19rem] shrink-0 whitespace-normal normal-case tracking-normal text-left"
    >
      <BrutalCardBody className="space-y-2.5 py-4">
        <div className="flex items-center justify-between gap-2">
          <RatingStars rating={review.rating} size="sm" />
          <Badge variant="mint" size="sm">
            Admin-approved
          </Badge>
        </div>

        <p className="line-clamp-4 text-sm font-medium leading-relaxed">
          &ldquo;{review.comment}&rdquo;
        </p>

        <div className="flex flex-wrap items-center gap-2 border-t-[2px] border-ink pt-2.5">
          <span className="font-display text-xs uppercase">{review.name}</span>
          {review.context ? (
            <Badge variant="soft" size="sm">
              {review.context}
            </Badge>
          ) : null}
          <span className="text-[0.65rem] font-semibold text-ink-soft">
            {formatDate(review.createdAt, { month: "short", year: "numeric" })}
          </span>
        </div>
      </BrutalCardBody>
    </BrutalCard>
  );
}

/** Larger highlight block for the first approved review. */
function FeaturedReview({ review }: { review: ApprovedReview }) {
  return (
    <BrutalCard
      variant="review"
      className="h-full"
      sticker={
        <Stamp rotate={-8} variant="tomato">
          Featured
        </Stamp>
      }
    >
      <BrutalCardBody className="space-y-4 py-6 pr-6 sm:pr-16">
        <span
          aria-hidden="true"
          className="absolute right-4 top-4 flex size-10 items-center justify-center border-[3px] border-ink bg-lemon"
        >
          <Quote className="size-5" />
        </span>

        <RatingStars rating={review.rating} size="lg" />

        <blockquote className="text-lg font-medium leading-relaxed sm:text-xl">
          &ldquo;{review.comment}&rdquo;
        </blockquote>

        <div className="flex flex-wrap items-center gap-3 border-t-[3px] border-ink pt-4">
          <span
            aria-hidden="true"
            className="flex size-10 items-center justify-center border-[3px] border-ink bg-butter"
          >
            <UserRound className="size-5" />
          </span>
          <span className="grid">
            <span className="font-display text-sm uppercase">{review.name}</span>
            <span className="text-xs font-semibold text-ink-soft">
              {formatDate(review.createdAt, { month: "short", year: "numeric" })}
            </span>
          </span>
          {review.context ? (
            <Badge variant="soft" size="md">
              {review.context}
            </Badge>
          ) : null}
          <Badge variant="mint" size="sm" className="ml-auto">
            Admin-approved
          </Badge>
        </div>
      </BrutalCardBody>
    </BrutalCard>
  );
}

/**
 * Reviews band — featured approved review + a two-row marquee wall of
 * approved-review mini-cards, plus a submission form that saves reviews
 * as PENDING for admin approval.
 */
export async function ReviewsSection() {
  const reviews = await getApprovedReviews(12);

  const featured = reviews[0] ?? null;
  const evenRow = reviews.filter((_, index) => index % 2 === 0);
  const oddRow = reviews.filter((_, index) => index % 2 === 1);
  const rowOne = evenRow.length > 0 ? evenRow : reviews;
  const rowTwo = oddRow.length > 0 ? oddRow : reviews;

  return (
    <section
      id="reviews"
      aria-labelledby="reviews-heading"
      className="relative w-full border-y-[3px] border-ink bg-peach"
    >
      <span aria-hidden="true" className="grid-lines absolute inset-0 opacity-70" />
      <div className="relative mx-auto w-full max-w-[90rem] px-4 py-12 sm:px-6 sm:py-16 lg:px-10 lg:py-20 xl:px-14">
        <HomeSectionHeading
          id="reviews-heading"
          eyebrow="Reviews"
          title="Traveller stories"
          description="Only reviews approved by our team are shown here."
        />

        <div className="mt-8 grid gap-6 lg:grid-cols-2 lg:items-start">
          {featured ? (
            <FeaturedReview review={featured} />
          ) : (
            <EmptyState
              eyebrow="Reviews"
              title="Be the first to review"
              description="If you've travelled with us, share your experience — it will appear here after our team approves it."
              tone="peach"
              illustration="luggage"
              action={
                <a
                  href="#write-review"
                  className={cn(buttonVariants({ variant: "secondary", size: "md" }))}
                >
                  Write a review
                </a>
              }
            />
          )}

          <div
            id="write-review"
            className="scroll-mt-24 border-[3px] border-ink bg-paper p-5 shadow-hard sm:p-6"
          >
            <ReviewForm />
          </div>
        </div>

        {reviews.length > 0 ? (
          <div className="mt-10 grid gap-4">
            <Marquee
              items={rowOne.map((review) => (
                <ReviewMiniCard key={review.id} review={review} />
              ))}
              tone="ink"
            />
            <Marquee
              items={rowTwo.map((review) => (
                <ReviewMiniCard key={review.id} review={review} />
              ))}
              tone="lemon"
              reverse
            />
          </div>
        ) : null}
      </div>
    </section>
  );
}
