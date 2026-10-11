"use client";

import { Check, X } from "lucide-react";
import { AsyncButton } from "@/components/admin/async-button";
import { ConfirmDeleteButton } from "@/components/admin/confirm-delete-button";
import {
  deleteReviewAction,
  moderateReviewAction,
} from "@/actions/admin/reviews";

/** Approve / reject / delete controls for one review row. */
export function ReviewRowActions({
  reviewId,
  reviewName,
  status,
}: {
  reviewId: string;
  reviewName: string;
  status: "PENDING" | "APPROVED" | "REJECTED";
}) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      {status !== "APPROVED" ? (
        <AsyncButton
          variant="default"
          size="sm"
          onAction={() =>
            moderateReviewAction({ id: reviewId, status: "APPROVED" })
          }
        >
          <Check aria-hidden="true" className="size-3.5" />
          Approve
        </AsyncButton>
      ) : null}

      {status !== "REJECTED" ? (
        <AsyncButton
          variant="soft"
          size="sm"
          onAction={() =>
            moderateReviewAction({ id: reviewId, status: "REJECTED" })
          }
        >
          <X aria-hidden="true" className="size-3.5" />
          Reject
        </AsyncButton>
      ) : null}

      <ConfirmDeleteButton
        onAction={() => deleteReviewAction(reviewId)}
        confirmTitle={`Delete the review from ${reviewName}?`}
        confirmDescription="Reviews can't be restored after deletion."
      />
    </div>
  );
}
