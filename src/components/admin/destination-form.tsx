"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm, FormProvider } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { ArrowLeft, LoaderCircle, Save, Sparkles } from "lucide-react";
import {
  destinationSchema,
  type DestinationInput,
} from "@/schemas/admin";
import { saveDestinationAction } from "@/actions/admin/destinations";
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
import { RepeatableRows } from "@/components/admin/repeatable-rows";
import { asChecked, asStr } from "@/components/admin/form-utils";

const emptyValues: DestinationInput = {
  name: "",
  slug: "",
  state: "",
  region: "",
  summary: "",
  description: "",
  bestTimeToVisit: "",
  image: "",
  imageAlt: "",
  gallery: [],
  featured: false,
  published: false,
  order: "0",
  seoTitle: "",
  seoDescription: "",
};

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="border border-line bg-paper shadow-hard">
      <h2 className="border-b border-line bg-sky px-4 py-3 font-display text-sm uppercase tracking-wide">
        {title}
      </h2>
      <div className="grid gap-4 p-4 sm:p-5">{children}</div>
    </section>
  );
}

export function DestinationForm({
  destinationId,
  initial,
}: {
  destinationId?: string | null;
  initial?: DestinationInput | null;
}) {
  const router = useRouter();
  const form = useForm<DestinationInput>({
    resolver: zodResolver(destinationSchema),
    defaultValues: initial
      ? { ...emptyValues, ...initial, gallery: initial.gallery ?? [] }
      : emptyValues,
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

  async function onSubmit(values: DestinationInput) {
    const result = await saveDestinationAction(destinationId ?? null, values);
    if (result.ok) {
      toast.success(result.message);
      router.push("/admin/destinations");
      router.refresh();
    } else {
      toast.error(result.error);
      if (result.fieldErrors) {
        for (const [field, messages] of Object.entries(result.fieldErrors)) {
          if (messages?.[0]) {
            form.setError(field as keyof DestinationInput, { message: messages[0] });
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
                    <Input placeholder="Shimla" {...field} value={asStr(field.value)} />
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
                        placeholder="shimla"
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
                    Used in the URL: /destinations/&lt;slug&gt;
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="state"
              render={({ field }) => (
                <FormItem>
                  <FormLabel required>State</FormLabel>
                  <FormControl>
                    <Input placeholder="Himachal Pradesh" {...field} value={asStr(field.value)} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="region"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Region filter</FormLabel>
                  <FormControl>
                    <Input placeholder="North India" {...field} value={asStr(field.value)} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <FormField
            control={form.control}
            name="summary"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Summary</FormLabel>
                <FormControl>
                  <Textarea
                    rows={2}
                    placeholder="One or two lines shown on cards."
                    {...field} value={asStr(field.value)} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Description</FormLabel>
                <FormControl>
                  <Textarea
                    rows={8}
                    placeholder="Full destination write-up (plain text, one paragraph per blank line)."
                    {...field} value={asStr(field.value)} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="bestTimeToVisit"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Best time to visit</FormLabel>
                <FormControl>
                  <Textarea
                    rows={3}
                    placeholder="e.g. March–June for pleasant weather; December–February for snow."
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
              name="image"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Cover image URL</FormLabel>
                  <FormControl>
                    <Input placeholder="/uploads/shimla.jpg or https://…" {...field} value={asStr(field.value)} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="imageAlt"
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

          <FormField
            control={form.control}
            name="gallery"
            render={() => (
              <FormItem>
                <FormLabel>Gallery</FormLabel>
                <RepeatableRows
                  control={form.control}
                  name="gallery"
                  addLabel="Add gallery image"
                  emptyRow={{ url: "", alt: "" }}
                  renderRow={(index) => (
                    <>
                      <FormField
                        control={form.control}
                        name={`gallery.${index}.url`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Image URL</FormLabel>
                            <FormControl>
                              <Input placeholder="/uploads/…" {...field} value={asStr(field.value)} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name={`gallery.${index}.alt`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Alt</FormLabel>
                            <FormControl>
                              <Input placeholder="Describe the image" {...field} value={asStr(field.value)} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </>
                  )}
                />
                <FormMessage />
              </FormItem>
            )}
          />
        </Section>

        <Section title="Publishing">
          <div className="flex flex-wrap items-end gap-6">
            <FormField
              control={form.control}
              name="featured"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center gap-3">
                  <FormControl>
                    <Checkbox
                      checked={asChecked(field.value)}
                      onCheckedChange={(checked) => field.onChange(checked === true)}
                    />
                  </FormControl>
                  <div className="grid gap-0.5">
                    <FormLabel className="mb-0">Featured</FormLabel>
                    <FormDescription>
                      Shows in the featured strip on the home page.
                    </FormDescription>
                  </div>
                </FormItem>
              )}
            />

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

        <Section title="SEO">
          <div className="grid gap-4 sm:grid-cols-2">
            <FormField
              control={form.control}
              name="seoTitle"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Meta title</FormLabel>
                  <FormControl>
                    <Input placeholder="Shimla Travel Guide" {...field} value={asStr(field.value)} />
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
                {destinationId ? "Save changes" : "Create destination"}
              </>
            )}
          </Button>
          <Button asChild variant="outline" size="lg" type="button">
            <Link href="/admin/destinations">
              <ArrowLeft aria-hidden="true" className="size-4" />
              Back to list
            </Link>
          </Button>
        </div>
      </form>
    </FormProvider>
  );
}
