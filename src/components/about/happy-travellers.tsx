import Link from "next/link";
import Image, { type StaticImageData } from "next/image";
import { HeartHandshake, MessagesSquare, Compass, ShieldCheck, Quote } from "lucide-react";
import { Reveal, StaggerGroup, StaggerItem } from "@/components/shared/reveal";
import { RatingStars } from "@/components/shared/rating-stars";
import { PhotoPlaceholder } from "@/components/about/photo-placeholder";
import { renderHeading } from "@/lib/render-heading";
import { formatDate } from "@/lib/utils";
import type { ApprovedReview } from "@/lib/data/reviews";

/**
 * Real photographs of happy travellers go here (imported images). While the
 * list is empty, honest "photo coming soon" frames are shown instead.
 */
const TRAVELLER_PHOTOS: { src: StaticImageData; alt: string; caption: string }[] = [];

const PLACEHOLDER_CAPTIONS = ["Family holiday", "Himalayan trek", "Honeymoon escape", "Friends' getaway"];

const PROMISES = [
  { Icon: Compass, title: "Plans built around you", text: "Your pace, your budget, your people — never a copy-and-paste itinerary." },
  { Icon: MessagesSquare, title: "One clear point of contact", text: "Real answers from a real person, on the channel you prefer." },
  { Icon: ShieldCheck, title: "Honest advice", text: "We tell you what suits the season and the group, including what to skip." },
  { Icon: HeartHandshake, title: "Care that lasts", text: "Before you leave, while you travel and after you are home." },
] as const;

export function HappyTravellers({ reviews }: { reviews: ApprovedReview[] }) {
  return (
    <div>
      <div className="grid items-center gap-12 lg:grid-cols-12 lg:gap-16">
        <Reveal className="lg:col-span-6">
          <p className="lux-eyebrow">Happy travellers</p>
          <h2 id="happy-heading" className="mt-4 font-display text-h2 text-ink">
            {renderHeading("Happy travellers are [[why]] we do this", "forest")}
          </h2>
          <div className="mt-6 space-y-4 text-lg leading-relaxed text-ink-soft">
            <p>
              Nothing tells us a trip went well like a traveller who comes home already planning the next
              one. It is the feeling we work towards from the very first conversation: clear answers,
              honest advice and someone who picks up when you need help.
            </p>
            <p>
              We care less about slogans and more about what you say when you are back — the summit photo
              you cannot stop sharing, the family that finally switched off on holiday, the friend you
              recommend us to. That is what a happy customer means to Time2Travel.
            </p>
          </div>

          <StaggerGroup className="mt-8 grid gap-4 sm:grid-cols-2">
            {PROMISES.map(({ Icon, title, text }) => (
              <StaggerItem key={title}>
                <div className="flex h-full gap-3.5 rounded-2xl border border-line bg-paper p-4 transition-colors duration-300 hover:border-gold/60">
                  <span className="grid size-10 shrink-0 place-items-center rounded-full bg-forest text-white">
                    <Icon aria-hidden="true" className="size-5" />
                  </span>
                  <div>
                    <h3 className="font-sans text-base font-semibold text-ink">{title}</h3>
                    <p className="mt-1 text-sm leading-relaxed text-ink-soft">{text}</p>
                  </div>
                </div>
              </StaggerItem>
            ))}
          </StaggerGroup>
        </Reveal>

        {/* Photo mosaic: real photographs when supplied, labelled placeholders until then */}
        <Reveal delay={0.15} className="lg:col-span-6">
          <div className="grid grid-cols-2 gap-4">
            {PLACEHOLDER_CAPTIONS.map((caption, index) => {
              const photo = TRAVELLER_PHOTOS[index];
              return (
                <figure
                  key={caption}
                  className={`card-shine group relative overflow-hidden rounded-3xl border border-line shadow-hard-sm ${
                    index % 2 === 0 ? "aspect-[4/5]" : "aspect-[4/5] translate-y-6"
                  }`}
                >
                  {photo ? (
                    <Image
                      src={photo.src}
                      alt={photo.alt}
                      fill
                      sizes="(max-width: 1024px) 45vw, 22vw"
                      className="object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                  ) : (
                    <PhotoPlaceholder label="Traveller photo" />
                  )}
                  <figcaption className="absolute inset-x-3 bottom-3 rounded-full bg-white/90 px-3 py-1.5 text-center text-xs font-semibold uppercase tracking-[0.12em] text-ink backdrop-blur">
                    {photo?.caption ?? caption}
                  </figcaption>
                </figure>
              );
            })}
          </div>
        </Reveal>
      </div>

      {/* Genuine, admin-approved reviews only (never invented) */}
      <div className="mt-20">
        {reviews.length > 0 ? (
          <StaggerGroup className="grid gap-6 md:grid-cols-3">
            {reviews.map((review) => (
              <StaggerItem key={review.id} className="h-full">
                <figure className="card-shine relative flex h-full flex-col rounded-3xl border border-line bg-paper p-6 shadow-hard-sm">
                  <Quote aria-hidden="true" className="size-8 text-gold" />
                  <RatingStars rating={review.rating} className="mt-3" />
                  <blockquote className="mt-4 flex-1 text-[0.9375rem] leading-relaxed text-ink">
                    “{review.comment}”
                  </blockquote>
                  <figcaption className="mt-5 border-t border-line pt-4 text-sm">
                    <span className="font-semibold text-ink">{review.name}</span>
                    {review.context ? <span className="text-ink-soft"> · {review.context}</span> : null}
                    <span className="block text-xs text-ink-soft">{formatDate(review.createdAt)}</span>
                  </figcaption>
                </figure>
              </StaggerItem>
            ))}
          </StaggerGroup>
        ) : (
          <div className="relative overflow-hidden rounded-3xl border border-line bg-ink px-6 py-10 text-center text-white sm:px-12">
            <Quote aria-hidden="true" className="mx-auto size-9 text-gold" />
            <p className="mx-auto mt-4 max-w-2xl font-display text-2xl leading-snug sm:text-3xl">
              Travelled with us? Your story belongs here.
            </p>
            <p className="mx-auto mt-3 max-w-xl text-white/75">
              Reviews appear on this page once they have been shared and approved. We only ever show real
              words from real travellers.
            </p>
            <div className="mt-6 flex flex-wrap justify-center gap-3">
              <Link
                href="/reviews"
                className="inline-flex h-12 items-center rounded-full bg-gold px-7 text-sm font-semibold text-ink transition-all hover:brightness-105"
              >
                Share your experience
              </Link>
              <Link
                href="/plan-my-trip"
                className="inline-flex h-12 items-center rounded-full border border-white/40 px-7 text-sm font-semibold text-white transition-colors hover:border-white hover:bg-white/10"
              >
                Plan your own trip
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
