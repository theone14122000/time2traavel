"use client";

import Link from "next/link";
import { ArrowRight, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";

const VARIANTS = [
  "default",
  "primary",
  "secondary",
  "dark",
  "outline",
  "soft",
  "danger",
  "ghost",
  "link",
] as const;

const SIZES = ["sm", "md", "lg", "xl"] as const;

const VARIANT_CAPTION: Record<(typeof VARIANTS)[number], string> = {
  default: "bg-tomato (hot CTA)",
  primary: "bg-tomato (alias)",
  secondary: "bg-lemon",
  dark: "bg-ink",
  outline: "bg-paper",
  soft: "bg-butter",
  danger: "bg-danger",
  ghost: "borderless",
  link: "underlined",
};

/** Every button variant Ã— size, plus interaction states. */
export function ButtonsDemo() {
  return (
    <div className="grid gap-6">
      <div className="overflow-x-auto no-scrollbar">
        <table className="w-full min-w-[36rem] border-collapse text-left">
          <caption className="label-brutal mb-3 text-left text-ink-soft">
            Variants Ã— sizes
          </caption>
          <thead>
            <tr>
              <th className="label-brutal border-[3px] border-ink bg-butter px-3 py-2">
                Variant
              </th>
              {SIZES.map((size) => (
                <th
                  key={size}
                  className="label-brutal border-[3px] border-ink bg-butter px-3 py-2"
                >
                  {size}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {VARIANTS.map((variant) => (
              <tr key={variant}>
                <th className="border-[3px] border-ink bg-paper px-3 py-3 align-middle">
                  <span className="block text-xs font-bold uppercase">{variant}</span>
                  <span className="block text-xs font-medium text-ink-soft">
                    {VARIANT_CAPTION[variant]}
                  </span>
                </th>
                {SIZES.map((size) => (
                  <td key={size} className="border-[3px] border-ink bg-paper px-3 py-3">
                    <Button variant={variant} size={size}>
                      Demo
                    </Button>
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <div className="grid gap-2 border-[3px] border-ink bg-butter p-4">
          <span className="label-brutal text-ink-soft">loading</span>
          <div>
            <Button loading>Sending demo</Button>
          </div>
        </div>

        <div className="grid gap-2 border-[3px] border-ink bg-butter p-4">
          <span className="label-brutal text-ink-soft">disabled</span>
          <div className="flex flex-wrap gap-2">
            <Button disabled>Disabled demo</Button>
            <Button variant="secondary" disabled>
              Disabled
            </Button>
          </div>
        </div>

        <div className="grid gap-2 border-[3px] border-ink bg-butter p-4">
          <span className="label-brutal text-ink-soft">with icon</span>
          <div className="flex flex-wrap gap-2">
            <Button>
              <Sparkles aria-hidden="true" className="size-4" />
              Demo action
            </Button>
            <Button variant="secondary" size="lg">
              Continue
              <ArrowRight aria-hidden="true" className="size-4" />
            </Button>
          </div>
        </div>

        <div className="grid gap-2 border-[3px] border-ink bg-butter p-4">
          <span className="label-brutal text-ink-soft">magnetic (desktop hover)</span>
          <div>
            <Button magnetic variant="dark">
              Hover me
            </Button>
          </div>
        </div>

        <div className="grid gap-2 border-[3px] border-ink bg-butter p-4">
          <span className="label-brutal text-ink-soft">asChild (link)</span>
          <div>
            <Button asChild variant="outline">
              <Link href="/">Demo link button</Link>
            </Button>
          </div>
        </div>

        <div className="grid gap-2 border-[3px] border-ink bg-butter p-4">
          <span className="label-brutal text-ink-soft">sizes as links</span>
          <div className="flex flex-wrap items-center gap-2">
            <Button asChild size="sm" variant="soft">
              <Link href="/">sm</Link>
            </Button>
            <Button asChild size="lg" variant="secondary">
              <Link href="/">lg</Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
