"use client";

import * as React from "react";
import { useReducedMotion } from "framer-motion";
import { HomePackageCard, type HomePackageMeta } from "@/components/home/package-card";
import { EnquiryDialog } from "@/components/forms/enquiry-dialog";
import { StaggerGroup, StaggerItem } from "@/components/shared/reveal";
import type { PackageCard as PackageData } from "@/lib/data/packages";

/**
 * Home package grid — staggered entrance (reduced-motion aware) with a
 * pre-filled enquiry dialog wired to each card's "Enquire" button.
 */
export function PackageGrid({
  packages,
}: {
  packages: { pkg: PackageData; meta?: HomePackageMeta }[];
}) {
  const [enquiry, setEnquiry] = React.useState<PackageData | null>(null);
  const reduceMotion = useReducedMotion();

  if (packages.length === 0) return null;

  return (
    <>
      {reduceMotion ? (
        <div className="no-scrollbar snap-rail scroll-pl-4 -mx-4 flex gap-4 overflow-x-auto px-4 pb-2 sm:mx-0 sm:grid sm:grid-cols-2 sm:gap-6 sm:overflow-visible sm:px-0 sm:pb-0 lg:grid-cols-3">
          {packages.map(({ pkg, meta }) => (
            <HomePackageCard
              key={pkg.id}
              pkg={pkg}
              meta={meta}
              onEnquire={setEnquiry}
              className="w-[calc(100%_-_2rem)] shrink-0 sm:w-auto"
            />
          ))}
        </div>
      ) : (
        <StaggerGroup className="no-scrollbar snap-rail scroll-pl-4 -mx-4 flex gap-4 overflow-x-auto px-4 pb-2 sm:mx-0 sm:grid sm:grid-cols-2 sm:gap-6 sm:overflow-visible sm:px-0 sm:pb-0 lg:grid-cols-3">
          {packages.map(({ pkg, meta }) => (
            <StaggerItem
              key={pkg.id}
              className="h-full w-[calc(100%_-_2rem)] shrink-0 sm:w-auto"
            >
              <HomePackageCard pkg={pkg} meta={meta} onEnquire={setEnquiry} />
            </StaggerItem>
          ))}
        </StaggerGroup>
      )}

      <EnquiryDialog
        target={enquiry ? { kind: "package", slug: enquiry.slug, name: enquiry.title } : null}
        open={Boolean(enquiry)}
        onOpenChange={(o) => {
          if (!o) setEnquiry(null);
        }}
      />
    </>
  );
}
