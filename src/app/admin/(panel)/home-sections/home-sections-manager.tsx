"use client";

import * as React from "react";
import { useForm, FormProvider } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { ArrowDown, ArrowUp, LoaderCircle, Save } from "lucide-react";
import {
  homeSectionUpdateSchema,
  type HomeSectionUpdateInput,
} from "@/schemas/admin";
import {
  moveHomeSectionAction,
  updateHomeSectionAction,
} from "@/actions/admin/home-sections";
import { HOME_SECTION_KEYS } from "@/lib/constants";
import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Textarea } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { AsyncButton } from "@/components/admin/async-button";
import { asChecked, asStr } from "@/components/admin/form-utils";

export type HomeSectionRow = {
  id: string;
  key: string;
  enabled: boolean;
  order: number;
  config: string;
};

const KEY_LABELS: Record<string, string> = Object.fromEntries(
  HOME_SECTION_KEYS.map((entry) => [entry.key, entry.label]),
);

export function HomeSectionsManager({
  sections,
}: {
  sections: HomeSectionRow[];
}) {
  if (sections.length === 0) {
    return (
      <p className="border border-dashed border-line bg-butter px-4 py-10 text-center text-sm font-bold uppercase">
        No sections found — run the database seed to create the defaults.
      </p>
    );
  }

  return (
    <div className="grid gap-3">
      {sections.map((section, index) => (
        <HomeSectionRowForm
          key={section.id}
          section={section}
          isFirst={index === 0}
          isLast={index === sections.length - 1}
        />
      ))}
    </div>
  );
}

function HomeSectionRowForm({
  section,
  isFirst,
  isLast,
}: {
  section: HomeSectionRow;
  isFirst: boolean;
  isLast: boolean;
}) {
  const router = useRouter();
  const form = useForm<HomeSectionUpdateInput>({
    resolver: zodResolver(homeSectionUpdateSchema),
    defaultValues: {
      id: section.id,
      enabled: section.enabled,
      config: section.config,
    },
    mode: "onBlur",
  });

  const { formState } = form;
  const enabledValue = form.watch("enabled");

  async function onSubmit(values: HomeSectionUpdateInput) {
    const result = await updateHomeSectionAction(values);
    if (result.ok) {
      toast.success(result.message);
      router.refresh();
    } else {
      toast.error(result.error);
      if (result.fieldErrors) {
        for (const [field, messages] of Object.entries(result.fieldErrors)) {
          if (messages?.[0]) {
            form.setError(field as keyof HomeSectionUpdateInput, {
              message: messages[0],
            });
          }
        }
      }
    }
  }

  return (
    <FormProvider {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        noValidate
        className="grid gap-3 border border-line bg-paper p-3 shadow-hard sm:p-4"
      >
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-display text-sm uppercase tracking-wide">
              {KEY_LABELS[section.key] ?? section.key}
            </span>
            <code className="border border-line bg-cream px-1.5 py-0.5 text-xs font-bold">
              {section.key}
            </code>
            <Badge
              variant={enabledValue ? "success" : "outline"}
              size="sm"
            >
              {enabledValue ? "On" : "Off"}
            </Badge>
          </div>
          <div className="flex items-center gap-2">
            <AsyncButton
              variant="outline"
              size="icon-sm"
              aria-label="Move up"
              title="Move up"
              disabled={isFirst}
              onAction={() => moveHomeSectionAction(section.id, "up")}
            >
              <ArrowUp aria-hidden="true" className="size-4" />
            </AsyncButton>
            <AsyncButton
              variant="outline"
              size="icon-sm"
              aria-label="Move down"
              title="Move down"
              disabled={isLast}
              onAction={() => moveHomeSectionAction(section.id, "down")}
            >
              <ArrowDown aria-hidden="true" className="size-4" />
            </AsyncButton>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-[auto_1fr] sm:items-start">
          <FormField
            control={form.control}
            name="enabled"
            render={({ field }) => (
              <FormItem className="flex flex-row items-center gap-3 sm:w-36">
                <FormControl>
                  <Checkbox
                    checked={asChecked(field.value)}
                    onCheckedChange={(checked) => field.onChange(checked === true)}
                  />
                </FormControl>
                <div className="grid gap-0.5">
                  <FormLabel className="mb-0">Enabled</FormLabel>
                  <FormDescription>Hide from the home page.</FormDescription>
                </div>
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="config"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Config JSON</FormLabel>
                <FormControl>
                  <Textarea
                    rows={3}
                    placeholder="Leave empty when this section needs no extra settings."
                    {...field}
                    value={asStr(field.value)}
                  />
                </FormControl>
                <FormDescription>
                  Optional — must be valid JSON when filled in.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div>
          <Button type="submit" size="sm" loading={formState.isSubmitting}>
            {formState.isSubmitting ? (
              <>
                <LoaderCircle aria-hidden="true" className="size-3.5" />
                Saving
              </>
            ) : (
              <>
                <Save aria-hidden="true" className="size-3.5" />
                Save section
              </>
            )}
          </Button>
        </div>
      </form>
    </FormProvider>
  );
}
