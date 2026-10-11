"use client";

import * as React from "react";
import { Input, Textarea } from "@/components/ui/input";
import {
  FloatingInput,
  FloatingTextarea,
} from "@/components/ui/floating-input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectLabel,
  SelectSeparator,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";

/** Text fields: default, focus, invalid, disabled and success states. */
export function InputsDemo() {
  const focusTarget = React.useRef<HTMLInputElement>(null);
  const [selected, setSelected] = React.useState("demo-one");

  return (
    <div className="grid gap-6">
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="grid gap-2">
          <span className="label-brutal text-ink-soft">Input — default</span>
          <Input aria-label="Default input demo" placeholder="Demo placeholder" />
        </div>

        <div className="grid gap-2">
          <span className="label-brutal text-ink-soft">Input — focus state</span>
          <div className="flex flex-wrap items-center gap-2">
            <Input
              ref={focusTarget}
              aria-label="Focus state input demo"
              placeholder="Click the button"
              className="sm:max-w-56"
            />
            <Button
              type="button"
              size="sm"
              variant="outline"
              onClick={() => focusTarget.current?.focus()}
            >
              Focus field
            </Button>
          </div>
        </div>

        <div className="grid gap-2">
          <span className="label-brutal text-ink-soft">Input — invalid (aria-invalid)</span>
          <Input
            aria-label="Invalid input demo"
            aria-invalid="true"
            defaultValue="Demo value"
          />
          <p className="text-xs font-semibold text-danger">Demo error message.</p>
        </div>

        <div className="grid gap-2">
          <span className="label-brutal text-ink-soft">Input — disabled</span>
          <Input aria-label="Disabled input demo" disabled defaultValue="Disabled demo" />
        </div>

        <div className="grid gap-2">
          <span className="label-brutal text-ink-soft">Input — success (border-success)</span>
          <Input
            aria-label="Success input demo"
            defaultValue="Demo value"
            className="border-success"
          />
        </div>

        <div className="grid gap-2">
          <span className="label-brutal text-ink-soft">Select — demo options</span>
          <Select value={selected} onValueChange={setSelected}>
            <SelectTrigger aria-label="Demo select" className="w-full">
              <SelectValue placeholder="Pick a demo option" />
            </SelectTrigger>
            <SelectContent>
              <SelectLabel>Demo options</SelectLabel>
              <SelectItem value="demo-one">Demo option one</SelectItem>
              <SelectItem value="demo-two">Demo option two</SelectItem>
              <SelectItem value="demo-three">Demo option three</SelectItem>
              <SelectSeparator />
              <SelectItem value="demo-four" disabled>
                Demo option (disabled)
              </SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="grid gap-2">
          <span className="label-brutal text-ink-soft">Textarea — default</span>
          <Textarea aria-label="Default textarea demo" placeholder="Demo placeholder" />
        </div>
        <div className="grid gap-2">
          <span className="label-brutal text-ink-soft">Textarea — invalid</span>
          <Textarea aria-label="Invalid textarea demo" aria-invalid="true" defaultValue="Demo value" />
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="grid gap-2">
          <span className="label-brutal text-ink-soft">FloatingInput — filled (label floated)</span>
          <FloatingInput
            label="Demo label"
            defaultValue="Demo value"
            autoComplete="off"
          />
        </div>
        <div className="grid gap-2">
          <span className="label-brutal text-ink-soft">FloatingInput — error</span>
          <FloatingInput
            label="Demo label"
            error="Demo error message."
            defaultValue=""
          />
        </div>
        <div className="grid gap-2">
          <span className="label-brutal text-ink-soft">FloatingInput — prefix</span>
          <FloatingInput label="Demo phone" prefix="+91" type="tel" defaultValue="" />
        </div>
        <div className="grid gap-2">
          <span className="label-brutal text-ink-soft">FloatingTextarea</span>
          <FloatingTextarea label="Demo notes" rows={4} defaultValue="" />
        </div>
      </div>
    </div>
  );
}
