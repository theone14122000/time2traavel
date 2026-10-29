"use client";

import * as React from "react";
import { motion, useReducedMotion } from "framer-motion";
import { Mail } from "lucide-react";
import { Stamp } from "@/components/ui/badge";
import { TeamAvatar } from "@/components/about/team-avatar";
import { EASE, viewportOnce } from "@/lib/motion";
import { cn } from "@/lib/utils";
import type { TeamMemberShape, TeamSocial } from "@/lib/data/team";

const ROLE_TONES = [
  "bg-sky",
  "bg-mint",
  "bg-peach",
  "bg-lavender",
  "bg-blush",
  "bg-butter",
] as const;

const SOCIAL_NAMES: Record<TeamSocial["kind"], string> = {
  linkedin: "LinkedIn",
  instagram: "Instagram",
  x: "X",
  email: "email",
};

function toParagraphs(bio: string | null): string[] {
  if (!bio) return [];
  return bio
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);
}

function portraitAlt(member: TeamMemberShape): string {
  return (
    member.imageAlt?.trim() ||
    `Portrait of ${member.name}, ${member.role}`
  );
}

function avatarSrc(member: TeamMemberShape): string {
  return member.image?.trim() || `/team/${member.slug}.jpg`;
}

function SocialGlyph({ kind }: { kind: TeamSocial["kind"] }) {
  if (kind === "email") {
    return <Mail aria-hidden="true" className="size-4" />;
  }
  const badge = kind === "linkedin" ? "IN" : kind === "instagram" ? "IG" : "X";
  return (
    <span aria-hidden="true" className="font-display text-sm leading-none">
      {badge}
    </span>
  );
}

function SocialLinks({ member }: { member: TeamMemberShape }) {
  if (member.socials.length === 0) return null;

  return (
    <ul className="flex flex-wrap justify-center gap-2">
      {member.socials.map((social) => (
        <li key={`${member.id}-${social.kind}`}>
          <a
            href={social.url}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={
              social.kind === "email"
                ? `${member.name} email address`
                : `${member.name} on ${SOCIAL_NAMES[social.kind]}`
            }
            className="flex size-11 items-center justify-center border border-line bg-paper transition-colors hover:bg-lemon"
          >
            <SocialGlyph kind={social.kind} />
          </a>
        </li>
      ))}
    </ul>
  );
}

function FounderCard({
  founder,
  animate,
}: {
  founder: TeamMemberShape;
  animate: boolean;
}) {
  const paragraphs = toParagraphs(founder.bio);

  return (
    <motion.article
      initial={{ opacity: 0, ...(animate ? { x: -40 } : {}) }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={viewportOnce}
      transition={{ duration: 0.55, ease: EASE }}
      className="relative flex flex-col gap-6 border border-line bg-paper p-5 shadow-brutal-lg sm:p-7 md:flex-row md:items-start md:gap-8"
    >
      <div className="w-[240px] max-w-full shrink-0 md:w-[300px]">
        <TeamAvatar
          src={avatarSrc(founder)}
          alt={portraitAlt(founder)}
          sizes="(max-width: 768px) 240px, 300px"
          className="h-auto w-full"
        />
      </div>

      <div className="min-w-0 flex-1">
        <Stamp variant="tomato" rotate={-6}>
          {founder.role}
        </Stamp>

        <h3 className="mt-4 font-display text-h3 uppercase leading-tight">
          {founder.name}
          <span className="sr-only"> — {founder.role}</span>
        </h3>

        {paragraphs.length > 0 ? (
          <div className="brutal-prose mt-4">
            {paragraphs.map((paragraph, index) => (
              <p key={`${founder.id}-bio-${index}`}>{paragraph}</p>
            ))}
          </div>
        ) : null}

        <div className="mt-5">
          <SocialLinks member={founder} />
        </div>
      </div>
    </motion.article>
  );
}

function MemberCard({
  member,
  index,
  animate,
}: {
  member: TeamMemberShape;
  index: number;
  animate: boolean;
}) {
  const paragraphs = toParagraphs(member.bio);

  return (
    <motion.article
      initial={{ opacity: 0, ...(animate ? { scale: 0.8 } : {}) }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={viewportOnce}
      transition={
        animate
          ? { type: "spring", stiffness: 260, damping: 18, delay: index * 0.08 }
          : { duration: 0.4, ease: EASE }
      }
      className="flex w-full max-w-md flex-col items-center gap-4 border border-line bg-paper p-6 text-center shadow-brutal-md"
    >
      <TeamAvatar
        src={avatarSrc(member)}
        alt={portraitAlt(member)}
        sizes="220px"
        className="w-[160px] sm:w-[200px] lg:w-[220px]"
      />

      <h3 className="font-display text-h4 uppercase leading-tight">
        {member.name}
      </h3>

      <motion.span
        whileHover={animate ? { rotate: [-2, 2, 0], scale: 1.05 } : undefined}
        transition={{ duration: 0.35, ease: EASE }}
        className={cn(
          "label-brutal inline-flex border border-line px-3 py-1.5",
          ROLE_TONES[index % ROLE_TONES.length],
        )}
      >
        {member.role}
      </motion.span>

      {paragraphs.length > 0 ? (
        <div className="brutal-prose text-sm">
          {paragraphs.map((paragraph, paragraphIndex) => (
            <p key={`${member.id}-bio-${paragraphIndex}`}>{paragraph}</p>
          ))}
        </div>
      ) : null}

      <SocialLinks member={member} />
    </motion.article>
  );
}

export function TeamSection({ members }: { members: TeamMemberShape[] }) {
  const reduceMotion = useReducedMotion();
  const animate = !reduceMotion;

  if (members.length === 0) return null;

  const founder = members.find((member) => member.isFounder) ?? null;
  const others = members.filter((member) => !member.isFounder);

  return (
    <div>
      {founder ? <FounderCard founder={founder} animate={animate} /> : null}

      {others.length > 0 ? (
        <div className="mt-8 grid grid-cols-1 justify-items-center gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {others.map((member, index) => (
            <MemberCard key={member.id} member={member} index={index} animate={animate} />
          ))}
        </div>
      ) : null}
    </div>
  );
}
