"use client";

import { CountUp, Magnetic, RevealTitle } from "@/components/shared/motion";
import { Button } from "@/components/ui/button";

/** RevealTitle, CountUp (demo value only) and the Magnetic wrapper. */
export function MotionDemo() {
  return (
    <div className="grid gap-6">
      <div className="grid gap-2 border border-line bg-paper p-4 shadow-hard-xs">
        <span className="label-brutal text-ink-soft">RevealTitle — masked slide-up</span>
        <RevealTitle as="h3" className="font-display text-h3 uppercase">
          Scroll me into view
        </RevealTitle>
        <p className="text-sm font-medium text-ink-soft">
          Falls back to a static heading under <code className="font-bold">prefers-reduced-motion</code>.
        </p>
      </div>

      <div className="grid gap-2 border border-line bg-paper p-4 shadow-hard-xs">
        <span className="label-brutal text-ink-soft">CountUp — component demo only</span>
        <p className="font-display text-h2 text-tomato">
          <CountUp value={120} duration={1.2} suffix="+" />
        </p>
        <p className="text-sm font-medium text-ink-soft">
          <strong className="font-bold">Component demo — real pages use DB values only.</strong>{" "}
          The number above is an arbitrary sample, not a company statistic.
        </p>
      </div>

      <div className="grid gap-2 border border-line bg-paper p-4 shadow-hard-xs">
        <span className="label-brutal text-ink-soft">Magnetic wrapper</span>
        <div className="flex flex-wrap items-center gap-4">
          <Magnetic strength={14}>
            <Button variant="dark">Pointer-reactive</Button>
          </Magnetic>
          <Magnetic strength={10}>
            <Button variant="secondary">Another one</Button>
          </Magnetic>
        </div>
        <p className="text-sm font-medium text-ink-soft">
          Desktop fine pointers only; disabled for touch and reduced motion. The
          Button&apos;s own <code className="font-bold">magnetic</code> prop is shown in
          the Buttons section.
        </p>
      </div>
    </div>
  );
}
