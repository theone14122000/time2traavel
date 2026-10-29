"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { useForm, FormProvider } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Braces, LoaderCircle, Save } from "lucide-react";
import { contentSchema, type ContentInput } from "@/schemas/admin";
import { saveContentAction } from "@/actions/admin/content";
import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input, Textarea } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { asStr } from "@/components/admin/form-utils";

export type ContentKeyOption = { key: string; label: string };

/** Human notes for the keys the public site actually reads. */
const KEY_NOTES: Record<string, string> = {
  "home.hero": 'data shape: {"instruction":"…"} — optional helper text for the trip planner.',
  "home.whyChooseUs":
    'data shape: [{"title":"…","description":"…"}] — one object per feature card.',
  "home.finalCta": "Title + body for the closing call-to-action band.",
  "about.story": "Long-form story copy for the About page.",
  "about.founder": "Founder note copy.",
  "about.mission": "Mission statement copy.",
  "legal.privacy": "Privacy policy body.",
  "legal.terms": "Terms body.",
};

function prettyPrintData(raw: string): string {
  try {
    return JSON.stringify(JSON.parse(raw), null, 2);
  } catch {
    return raw;
  }
}

export function ContentEditor({
  keys,
  selectedKey,
  initial,
}: {
  keys: ContentKeyOption[];
  selectedKey: string;
  initial: { title: string | null; body: string | null; data: string };
}) {
  const router = useRouter();
  const form = useForm<ContentInput>({
    resolver: zodResolver(contentSchema),
    defaultValues: {
      key: selectedKey,
      title: initial.title ?? "",
      body: initial.body ?? "",
      data: initial.data,
    },
    mode: "onBlur",
  });

  const { formState, reset } = form;

  React.useEffect(() => {
    reset({
      key: selectedKey,
      title: initial.title ?? "",
      body: initial.body ?? "",
      data: initial.data,
    });
  }, [selectedKey, initial, reset]);

  function switchKey(key: string) {
    router.push(`/admin/content?key=${encodeURIComponent(key)}`);
  }

  async function onSubmit(values: ContentInput) {
    const result = await saveContentAction(values);
    if (result.ok) {
      toast.success(result.message);
      router.refresh();
    } else {
      toast.error(result.error);
      if (result.fieldErrors) {
        for (const [field, messages] of Object.entries(result.fieldErrors)) {
          if (messages?.[0]) {
            form.setError(field as keyof ContentInput, { message: messages[0] });
          }
        }
      }
    }
  }

  const note = KEY_NOTES[selectedKey];

  return (
    <div className="grid max-w-4xl gap-5">
      <section className="border border-line bg-sky p-4 shadow-hard sm:p-5">
        <div className="grid gap-3 sm:grid-cols-2 sm:items-end">
          <div className="grid gap-1.5">
            <Label htmlFor="content-key-select">Content key</Label>
            <Select value={selectedKey} onValueChange={switchKey}>
              <SelectTrigger id="content-key-select">
                <SelectValue placeholder="Pick a key" />
              </SelectTrigger>
              <SelectContent>
                {keys.map((item) => (
                  <SelectItem key={item.key} value={item.key}>
                    {item.label} — {item.key}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <p className="text-xs font-semibold text-ink-soft">
            Switching keys loads whatever is already stored for that key (or an
            empty editor if nothing is saved yet).
          </p>
        </div>
      </section>

      <FormProvider {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          noValidate
          className="grid gap-5"
        >
          <input type="hidden" {...form.register("key")} />

          <section className="border border-line bg-paper shadow-hard">
            <h2 className="border-b border-line bg-butter px-4 py-3 font-display text-sm uppercase tracking-wide">
              Content — {selectedKey}
            </h2>
            <div className="grid gap-4 p-4 sm:p-5">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Title</FormLabel>
                    <FormControl>
                      <Input placeholder="Optional heading" {...field} value={asStr(field.value)} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="body"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Body</FormLabel>
                    <FormControl>
                      <Textarea
                        rows={10}
                        placeholder="Plain text — leave a blank line between paragraphs."
                        {...field} value={asStr(field.value)} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="data"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Data (JSON)</FormLabel>
                    <FormControl>
                      <Textarea
                        rows={8}
                        className="font-mono text-xs"
                        placeholder="{} or []"
                        {...field}
                        value={asStr(field.value)}
                        onBlur={(event) => {
                          field.onBlur();
                          const next = prettyPrintData(event.target.value);
                          if (next !== event.target.value) {
                            form.setValue("data", next, { shouldValidate: true });
                          }
                        }}
                      />
                    </FormControl>
                    <FormDescription>
                      Optional. Must be valid JSON — it is pretty-printed
                      automatically when you leave the field.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {note ? (
                <p className="flex items-start gap-2 border border-line bg-lavender px-3 py-2 text-xs font-semibold">
                  <Braces aria-hidden="true" className="mt-0.5 size-4 shrink-0" />
                  <span>
                    <strong className="font-display uppercase">About this key:</strong>{" "}
                    {note}
                  </span>
                </p>
              ) : null}
            </div>
          </section>

          <div>
            <Button type="submit" size="lg" loading={formState.isSubmitting}>
              {formState.isSubmitting ? (
                <>
                  <LoaderCircle aria-hidden="true" className="size-4" />
                  Saving
                </>
              ) : (
                <>
                  <Save aria-hidden="true" className="size-4" />
                  Save content
                </>
              )}
            </Button>
          </div>
        </form>
      </FormProvider>
    </div>
  );
}
