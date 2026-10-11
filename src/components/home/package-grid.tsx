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
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {packages.map(({ pkg, meta }) => (
            <HomePackageCard key={pkg.id} pkg={pkg} meta={meta} onEnquire={setEnquiry} />
          ))}
        </div>
      ) : (
        <StaggerGroup className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {packages.map(({ pkg, meta }) => (
            <StaggerItem key={pkg.id} className="h-full">
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
