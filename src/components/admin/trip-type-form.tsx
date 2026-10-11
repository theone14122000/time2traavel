"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm, FormProvider } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { ArrowLeft, LoaderCircle, Save, Sparkles } from "lucide-react";
import { tripTypeSchema, type TripTypeInput } from "@/schemas/admin";
import { saveTripTypeAction } from "@/actions/admin/trip-types";
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

const emptyValues: TripTypeInput = {
  name: "",
  slug: "",
  icon: "",
  color: "",
  description: "",
  coverImage: "",
  coverImageAlt: "",
  published: false,
  order: "0",
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
      <h2 className="border-b-[3px] border-ink bg-sky px-4 py-3 font-display text-sm uppercase tracking-wide">
        {title}
      </h2>
      <div className="grid gap-4 p-4 sm:p-5">{children}</div>
    </section>
  );
}

export function TripTypeForm({
  tripTypeId,
  initial,
}: {
  tripTypeId?: string | null;
  initial?: TripTypeInput | null;
}) {
  const router = useRouter();
  const form = useForm<TripTypeInput>({
    resolver: zodResolver(tripTypeSchema),
    defaultValues: initial ? { ...emptyValues, ...initial } : emptyValues,
    mode: "onBlur",
  });

  const { formState, watch, setValue } = form;
  const nameValue = watch("name");
  const slugEdited = React.useRef(Boolean(initial?.slug));

  React.useEffect(() => {
    if (!slugEdited.current && nameValue) {
      setValue("slug", slugify(nameValue), { shouldValidate: false });
    }
  }, [nameValue, setValue]);

  async function onSubmit(values: TripTypeInput) {
    const result = await saveTripTypeAction(tripTypeId ?? null, values);
    if (result.ok) {
      toast.success(result.message);
      router.push("/admin/trip-types");
      router.refresh();
    } else {
      toast.error(result.error);
      if (result.fieldErrors) {
        for (const [field, messages] of Object.entries(result.fieldErrors)) {
          if (messages?.[0]) {
            form.setError(field as keyof TripTypeInput, { message: messages[0] });
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
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel required>Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Honeymoon" {...field} value={asStr(field.value)} />
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
                        placeholder="honeymoon"
                        {...field}
                        value={asStr(field.value)}
                        onBlur={(event) => {
                          slugEdited.current = true;
                          field.onBlur();
                          if (!event.target.value.trim() && nameValue) {
                            setValue("slug", slugify(nameValue));
                          }
                        }}
                      />
                      <Button
                        type="button"
                        variant="soft"
                        size="icon"
                        title="Generate from name"
                        onClick={() => {
                          slugEdited.current = true;
                          setValue("slug", slugify(watch("name") ?? ""));
                        }}
                      >
                        <Sparkles aria-hidden="true" className="size-4" />
                      </Button>
                    </div>
                  </FormControl>
                  <FormDescription>
                    Used in the URL: /trip-types/&lt;slug&gt;
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="icon"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Icon</FormLabel>
                  <FormControl>
                    <Input placeholder="Heart" {...field} value={asStr(field.value)} />
                  </FormControl>
                  <FormDescription>Lucide icon name — e.g. Heart, Mountain.</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="color"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Color</FormLabel>
                  <FormControl>
                    <Input placeholder="peach" {...field} value={asStr(field.value)} />
                  </FormControl>
                  <FormDescription>Design token name — e.g. peach, lavender, mint.</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Description</FormLabel>
                <FormControl>
                  <Textarea rows={5} placeholder="Short write-up for this trip type (plain text)." {...field} value={asStr(field.value)} />
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
                    <Input placeholder="/uploads/trip-type.jpg or https://…" {...field} value={asStr(field.value)} />
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
          <div className="flex flex-wrap items-end gap-6">
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

            <FormField
              control={form.control}
              name="order"
              render={({ field }) => (
                <FormItem className="w-32">
                  <FormLabel>Order</FormLabel>
                  <FormControl>
                    <Input type="number" inputMode="numeric" {...field} value={asStr(field.value)} />
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
                {tripTypeId ? "Save changes" : "Create trip type"}
              </>
            )}
          </Button>
          <Button asChild variant="outline" size="lg" type="button">
            <Link href="/admin/trip-types">
              <ArrowLeft aria-hidden="true" className="size-4" />
              Back to list
            </Link>
          </Button>
        </div>
      </form>
    </FormProvider>
  );
}
