import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { CONTENT_KEYS } from "@/lib/constants";
import { safeAdminQuery } from "@/actions/admin/shared";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import {
  ContentEditor,
  type ContentKeyOption,
} from "@/components/admin/content-editor";

export const metadata: Metadata = {
  title: "Page content",
  robots: { index: false, follow: false },
};

const KEY_LABELS: Record<(typeof CONTENT_KEYS)[keyof typeof CONTENT_KEYS], string> = {
  [CONTENT_KEYS.homeHero]: "Home — hero",
  [CONTENT_KEYS.homeWhyChooseUs]: "Home — why choose us",
  [CONTENT_KEYS.homeFinalCta]: "Home — final CTA",
  [CONTENT_KEYS.aboutStory]: "About — story",
  [CONTENT_KEYS.aboutFounder]: "About — founder",
  [CONTENT_KEYS.aboutMission]: "About — mission",
  [CONTENT_KEYS.privacy]: "Legal — privacy",
  [CONTENT_KEYS.terms]: "Legal — terms",
};

function prettyData(value: unknown): string {
  if (value === null || value === undefined) return "";
  try {
    return JSON.stringify(value, null, 2);
  } catch {
    return "";
  }
}

export default async function AdminContentPage({
  searchParams,
}: {
  searchParams: Promise<{ key?: string }>;
}) {
  const sp = await searchParams;
  const keys = Object.values(CONTENT_KEYS);
  const selectedKey =
    sp.key && (keys as string[]).includes(sp.key)
      ? sp.key
      : CONTENT_KEYS.homeHero;

  const row = await safeAdminQuery(
    `admin.content:${selectedKey}`,
    () => prisma.pageContent.findUnique({ where: { key: selectedKey } }),
    null,
  );

  const keyOptions: ContentKeyOption[] = keys.map((key) => ({
    key,
    label: KEY_LABELS[key] ?? key,
  }));

  return (
    <div>
      <AdminPageHeader
        eyebrow="Content"
        title="Page content"
        description="Edit the copy blocks the public pages read. Keys without a saved row simply fall back to the site defaults."
      />
      <ContentEditor
        keys={keyOptions}
        selectedKey={selectedKey}
        initial={{
          title: row?.title ?? null,
          body: row?.body ?? null,
          data: prettyData(row?.data),
        }}
      />
    </div>
  );
}
