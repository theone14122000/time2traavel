"use client";

import * as React from "react";
import { MultiStepForm, type MultiStepDefinition } from "@/components/ui/multi-step";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FloatingInput } from "@/components/ui/floating-input";
import { FormLiveRegion } from "@/components/ui/form-status";

const STEPS: MultiStepDefinition[] = [
  { id: "basics", label: "Basics", title: "Step one" },
  { id: "details", label: "Details", title: "Step two" },
  { id: "review", label: "Review", title: "Step three" },
];

/**
 * Three-step shell with fake field slots. Draft autosave only stores the
 * active step index under `design-system-demo` — never real form data.
 */
export function MultiStepDemo() {
  const [current, setCurrent] = React.useState(0);
  const [name, setName] = React.useState("");
  const [reference, setReference] = React.useState("");
  const [done, setDone] = React.useState(false);

  const isLast = current === STEPS.length - 1;

  const next = () => {
    if (isLast) {
      setDone(true);
      return;
    }
    setDone(false);
    setCurrent((step) => Math.min(step + 1, STEPS.length - 1));
  };

  const back = () => {
    setDone(false);
    setCurrent((step) => Math.max(step - 1, 0));
  };

  return (
    <div className="grid gap-4">
      <p className="text-sm font-medium text-ink-soft">
        Demo only: step progress is autosaved under the draft key{" "}
        <code className="font-bold">design-system-demo</code>. Never store real user
        drafts in a gallery page.
      </p>

      <MultiStepForm
        steps={STEPS}
        current={current}
        onStepChange={(nextStep) => {
          setDone(false);
          setCurrent(nextStep);
        }}
        progressLabel={`Step ${current + 1} of ${STEPS.length}`}
        draftKey="design-system-demo"
        contentClassName="min-h-44"
      >
        {current === 0 ? (
          <div className="grid gap-4 border-[3px] border-ink bg-butter p-4">
            <p className="label-brutal text-ink-soft">Step 1 — fake field slots</p>
            <FloatingInput
              label="Demo name"
              value={name}
              onChange={(event) => setName(event.target.value)}
              autoComplete="off"
            />
            <Input
              aria-label="Demo reference"
              placeholder="Another demo field"
              value={reference}
              onChange={(event) => setReference(event.target.value)}
            />
          </div>
        ) : null}

        {current === 1 ? (
          <div className="grid gap-4 border-[3px] border-ink bg-sky p-4">
            <p className="label-brutal text-ink-soft">Step 2 — fake field slots</p>
            <Input aria-label="Demo city" placeholder="Demo city (not a real place list)" />
            <Input aria-label="Demo note" placeholder="Demo note" />
          </div>
        ) : null}

        {current === 2 ? (
          <div className="grid gap-4 border-[3px] border-ink bg-mint p-4">
            <p className="label-brutal text-ink-soft">Step 3 — review slots</p>
            <dl className="grid gap-2 text-sm">
              <div className="flex justify-between gap-3 border-b-2 border-ink/30 pb-1.5">
                <dt className="font-bold">Demo name</dt>
                <dd className="font-medium">{name || "—"}</dd>
              </div>
              <div className="flex justify-between gap-3 border-b-2 border-ink/30 pb-1.5">
                <dt className="font-bold">Demo reference</dt>
                <dd className="font-medium">{reference || "—"}</dd>
              </div>
            </dl>
            {done ? (
              <FormLiveRegion
                message="Demo submit — the multi-step shell finished without sending anything."
                type="success"
              />
            ) : null}
          </div>
        ) : null}
      </MultiStepForm>

      <div className="flex flex-wrap gap-3">
        <Button type="button" variant="outline" onClick={back} disabled={current === 0}>
          Back
        </Button>
        <Button type="button" onClick={next}>
          {isLast ? "Finish (demo)" : "Next"}
        </Button>
      </div>
    </div>
  );
}
