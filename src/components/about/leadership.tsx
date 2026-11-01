import Image from "next/image";
import { Reveal } from "@/components/shared/reveal";
import { PhotoPlaceholder } from "@/components/about/photo-placeholder";
import ceoPhoto from "@/assets/team/ceo.jpg";
import { cn } from "@/lib/utils";

type Leader = {
  role: string;
  /** Real name when known; placeholders show a muted "Name to be added". */
  name: string | null;
  paragraph: string;
  photo?: typeof ceoPhoto;
  photoAlt?: string;
};

/**
 * The three senior roles, in a single row. Names for the two open slots are
 * deliberately left as placeholders — add the person's name and photo here.
 * Paragraphs describe what each role is responsible for at Time2Travel.
 */
function buildLeaders(ceoName: string | null): Leader[] {
  return [
    {
      role: "Founder & CEO",
      name: ceoName,
      photo: ceoPhoto,
      photoAlt: ceoName ? `Portrait of ${ceoName}, Founder and CEO of Time2Travel` : "Portrait of the Founder and CEO of Time2Travel",
      paragraph:
        "Sets the direction for everything Time2Travel does — which destinations we feature, how we plan, and the standard of care every traveller receives. The goal has stayed the same since day one: trips that are planned honestly, explained clearly and looked after until you are home.",
    },
    {
      role: "Operations Manager",
      name: null,
      paragraph:
        "Keeps every journey running smoothly behind the scenes. From stays and transport to timings and on-ground details, the Operations Manager makes sure the plan you approved is the trip you actually experience — and that surprises, when they come, are handled calmly.",
    },
    {
      role: "Head of Customer Experience",
      name: null,
      paragraph:
        "The voice travellers hear first and last. Listening to what you really want from a trip, shaping the itinerary with you, and checking in once you are back — so every journey is better than the one before it and every traveller feels genuinely looked after.",
    },
  ];
}

export function Leadership({ ceoName }: { ceoName: string | null }) {
  const leaders = buildLeaders(ceoName);

  return (
    <ul className="grid gap-6 md:grid-cols-3 lg:gap-8">
      {leaders.map((leader, index) => (
        <li key={leader.role} className="flex">
          <Reveal delay={index * 0.1} className="flex w-full">
            <article className="card-shine group relative flex w-full flex-col overflow-hidden rounded-3xl border border-line bg-paper shadow-hard-sm transition-shadow duration-300 hover:shadow-hard-lg">
              <div className="relative aspect-[4/5] w-full overflow-hidden bg-ink">
                {leader.photo ? (
                  <Image
                    src={leader.photo}
                    alt={leader.photoAlt ?? ""}
                    fill
                    sizes="(max-width: 768px) 92vw, 30vw"
                    placeholder="blur"
                    unoptimized
                    style={{ objectPosition: "50% 22%" }}
                    className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.05]"
                  />
                ) : (
                  <PhotoPlaceholder label={leader.role} kind="person" />
                )}
                {leader.photo ? (
                  <span aria-hidden="true" className="absolute inset-0 bg-gradient-to-t from-ink/55 via-transparent to-transparent" />
                ) : null}
                <span className="absolute left-4 top-4 rounded-full bg-white/92 px-3.5 py-1.5 text-[0.6875rem] font-semibold uppercase tracking-[0.14em] text-ink shadow-sm backdrop-blur">
                  {leader.role}
                </span>
              </div>

              <div className="flex flex-1 flex-col gap-3 p-6 sm:p-7">
                <header>
                  <h3
                    className={cn(
                      "font-display text-2xl leading-tight",
                      leader.name ? "text-ink" : "italic text-ink-soft",
                    )}
                  >
                    {leader.name ?? "Name to be added"}
                  </h3>
                  <p className="lux-eyebrow mt-2">{leader.role}</p>
                </header>
                <p className="text-[0.9375rem] leading-relaxed text-ink-soft">{leader.paragraph}</p>
              </div>
            </article>
          </Reveal>
        </li>
      ))}
    </ul>
  );
}
