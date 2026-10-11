"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm, FormProvider } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { ArrowLeft, LoaderCircle, Save, Sparkles } from "lucide-react";
import { guidePostSchema, type GuidePostInput } from "@/schemas/admin";
import { saveGuidePostAction } from "@/actions/admin/guides";
import { slugify } from "@/lib/utils";
import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input, Textarea } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { asChecked, asStr } from "@/components/admin/form-utils";

const emptyValues: GuidePostInput = {
  title: "",
  slug: "",
  excerpt: "",
  body: "",
  category: "General",
  coverImage: "",
  coverImageAlt: "",
  readingMinutes: "",
  seoTitle: "",
  seoDescription: "",
  published: false,
};

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="border-[3px] border-ink bg-paper shadow-hard">
      <h2 className="border-b-[3px] border-ink bg-lavender px-4 py-3 font-display text-sm uppercase tracking-wide">
        {title}
      </h2>
      <div className="grid gap-4 p-4 sm:p-5">{children}</div>
    </section>
  );
}

export function GuidePostForm({
  guideId,
  initial,
}: {
  guideId?: string | null;
  initial?: GuidePostInput | null;
}) {
  const router = useRouter();
  const form = useForm<GuidePostInput>({
    resolver: zodResolver(guidePostSchema),
    defaultValues: initial
      ? { ...emptyValues, ...initial, readingMinutes: initial.readingMinutes ?? "" }
      : emptyValues,
    mode: "onBlur",
  });

  const { formState, watch, setValue } = form;
  const titleValue = watch("title");
  const slugEdited = React.useRef(Boolean(initial?.slug));

  React.useEffect(() => {
    if (!slugEdited.current && titleValue) {
      setValue("slug", slugify(titleValue), { shouldValidate: false });
    }
  }, [titleValue, setValue]);

  async function onSubmit(values: GuidePostInput) {
    const result = await saveGuidePostAction(guideId ?? null, values);
    if (result.ok) {
      toast.success(result.message);
      router.push("/admin/guides");
      router.refresh();
    } else {
      toast.error(result.error);
      if (result.fieldErrors) {
        for (const [field, messages] of Object.entries(result.fieldErrors)) {
          if (messages?.[0]) {
            form.setError(field as keyof GuidePostInput, { message: messages[0] });
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
        className="grid max-w-4xl gap-5"
      >
        <Section title="Basics">
          <div className="grid gap-4 sm:grid-cols-2">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel required>Title</FormLabel>
                  <FormControl>
                    <Input placeholder="Guide title" {...field} value={asStr(field.value)} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="slug"
              render={({ field }) => (
                <FormItem>
                  <FormLabel required>Slug</FormLabel>
                  <FormControl>
                    <div className="flex gap-2">
                      <Input
                        placeholder="guide-title"
                        {...field}
                        value={asStr(field.value)}
                        onBlur={(event) => {
                          slugEdited.current = true;
                          field.onBlur();
                          if (!event.target.value.trim() && titleValue) {
                            setValue("slug", slugify(titleValue));
                          }
                        }}
                      />
                      <Button
                        type="button"
                        variant="soft"
                        size="icon"
                        title="Generate from title"
                        onClick={() => {
                          slugEdited.current = true;
                          setValue("slug", slugify(watch("title") ?? ""));
                        }}
                      >
                        <Sparkles aria-hidden="true" className="size-4" />
                      </Button>
                    </div>
                  </FormControl>
                  <FormDescription>
                    Used in the URL: /guides/&lt;slug&gt;
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="category"
              render={({ field }) => (
                <FormItem>
                  <FormLabel required>Category</FormLabel>
                  <FormControl>
                    <Input placeholder="General" {...field} value={asStr(field.value)} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="readingMinutes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Reading minutes</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      inputMode="numeric"
                      min={1}
                      max={600}
                      placeholder="Leave empty if unknown"
                      {...field}
                      value={asStr(field.value)}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <FormField
            control={form.control}
            name="excerpt"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Excerpt</FormLabel>
                <FormControl>
                  <Textarea rows={2} placeholder="Short blurb shown on guide cards." {...field} value={asStr(field.value)} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </Section>

        <Section title="Body">
          <FormField
            control={form.control}
            name="body"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Body</FormLabel>
                <FormControl>
                  <Textarea
                    rows={16}
                    placeholder="Full guide text (plain text — one paragraph per blank line)."
                    {...field} value={asStr(field.value)} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </Section>

        <Section title="Media">
          <div className="grid gap-4 sm:grid-cols-2">
            <FormField
              control={form.control}
              name="coverImage"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Cover image URL</FormLabel>
                  <FormControl>
                    <Input placeholder="/uploads/guide.jpg or https://…" {...field} value={asStr(field.value)} />
                  </FormControl>
                  <FormDescription>
                    Upload via Media, then paste the URL here.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="coverImageAlt"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Cover image alt</FormLabel>
                  <FormControl>
                    <Input placeholder="Describe the image" {...field} value={asStr(field.value)} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </Section>

        <Section title="Publishing">
          <FormField
            control={form.control}
            name="published"
            render={({ field }) => (
              <FormItem className="flex flex-row items-center gap-3">
                <FormControl>
                  <Checkbox
                    checked={asChecked(field.value)}
                    onCheckedChange={(checked) => field.onChange(checked === true)}
                  />
                </FormControl>
                <div className="grid gap-0.5">
                  <FormLabel className="mb-0">Published</FormLabel>
                  <FormDescription>
                    Visible on the public site when checked.
                  </FormDescription>
                </div>
              </FormItem>
            )}
          />
        </Section>

        <Section title="SEO">
          <div className="grid gap-4 sm:grid-cols-2">
            <FormField
              control={form.control}
              name="seoTitle"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Meta title</FormLabel>
                  <FormControl>
                    <Input placeholder="Guide title" {...field} value={asStr(field.value)} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="seoDescription"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Meta description</FormLabel>
                  <FormControl>
                    <Textarea rows={2} placeholder="Short search listing copy." {...field} value={asStr(field.value)} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </Section>

        <div className="flex flex-wrap items-center gap-3">
          <Button type="submit" size="lg" loading={formState.isSubmitting}>
            {formState.isSubmitting ? (
              <>
                <LoaderCircle aria-hidden="true" className="size-4" />
                Saving
              </>
            ) : (
              <>
                <Save aria-hidden="true" className="size-4" />
                {guideId ? "Save changes" : "Create guide"}
              </>
            )}
          </Button>
          <Button asChild variant="outline" size="lg" type="button">
            <Link href="/admin/guides">
              <ArrowLeft aria-hidden="true" className="size-4" />
              Back to list
            </Link>
          </Button>
        </div>
      </form>
    </FormProvider>
  );
}
