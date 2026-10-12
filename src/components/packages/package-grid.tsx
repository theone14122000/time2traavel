"use client";

import * as React from "react";
import { PackageTile } from "@/components/packages/package-tile";
import { StaggerGroup, StaggerItem } from "@/components/shared/reveal";
import { EnquiryDialog } from "@/components/forms/enquiry-dialog";
import type { PackageCard as PackageCardData } from "@/lib/data/packages";

/**
 * Package card grid with staggered entrance and a pre-filled enquiry
 * dialog wired to each tile's "Enquire" button.
 */
export function PackageGrid({ packages }: { packages: PackageCardData[] }) {
  const [enquiry, setEnquiry] = React.useState<PackageCardData | null>(null);

  if (packages.length === 0) return null;

  return (
    <>
      <StaggerGroup className="no-scrollbar snap-rail scroll-pl-4 -mx-4 flex gap-4 overflow-x-auto px-4 pb-2 sm:mx-0 sm:grid sm:grid-cols-2 sm:gap-6 sm:overflow-visible sm:px-0 sm:pb-0 lg:grid-cols-3">
        {packages.map((pkg) => (
          <StaggerItem
            key={pkg.id}
            className="h-full w-[calc(100%_-_2rem)] shrink-0 sm:w-auto"
          >
            <PackageTile pkg={pkg} onEnquire={setEnquiry} />
          </StaggerItem>
        ))}
      </StaggerGroup>

      <EnquiryDialog
        target={
          enquiry ? { kind: "package", slug: enquiry.slug, name: enquiry.title } : null
        }
        open={Boolean(enquiry)}
        onOpenChange={(o) => {
          if (!o) setEnquiry(null);
        }}
      />
    </>
  );
}
