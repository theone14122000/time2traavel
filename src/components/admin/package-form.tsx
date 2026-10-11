"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useFieldArray, useForm, FormProvider, type Control } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { ArrowLeft, LoaderCircle, Plus, Save, Sparkles, Trash2 } from "lucide-react";
import { packageSchema, type PackageInput } from "@/schemas/admin";
import { savePackageAction } from "@/actions/admin/packages";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { RepeatableRows } from "@/components/admin/repeatable-rows";
import { asChecked, asStr } from "@/components/admin/form-utils";

export type DestinationOption = { id: string; name: string; state: string };

const emptyValues: PackageInput = {
  title: "",
  slug: "",
  summary: "",
  description: "",
  destinationId: "",
  durationDays: "1",
  durationLabel: "",
  price: "",
  currency: "INR",
  priceNote: "",
  highlights: "",
  inclusions: "",
  exclusions: "",
  image: "",
  imageAlt: "",
  gallery: [],
  itinerary: [],
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
    <section className="border-[3px] border-ink bg-paper shadow-hard">
      <h2 className="border-b-[3px] border-ink bg-mint px-4 py-3 font-display text-sm uppercase tracking-wide">
        {title}
      </h2>
      <div className="grid gap-4 p-4 sm:p-5">{children}</div>
    </section>
  );
}

export function PackageForm({
  packageId,
  initial,
  destinations,
}: {
  packageId?: string | null;
  initial?: PackageInput | null;
  destinations: DestinationOption[];
}) {
  const router = useRouter();
  const form = useForm<PackageInput>({
    resolver: zodResolver(packageSchema),
    defaultValues: initial
      ? {
          ...emptyValues,
          ...initial,
          price: initial.price ?? "",
          gallery: initial.gallery ?? [],
          itinerary: initial.itinerary ?? [],
        }
      : emptyValues,
    mode: "onBlur",
  });

  const { formState, watch, setValue, control } = form;
  const titleValue = watch("title");
  const slugEdited = React.useRef(Boolean(initial?.slug));

  React.useEffect(() => {
    if (!slugEdited.current && titleValue) {
      setValue("slug", slugify(titleValue), { shouldValidate: false });
    }
  }, [titleValue, setValue]);

  async function onSubmit(values: PackageInput) {
    const result = await savePackageAction(packageId ?? null, values);
    if (result.ok) {
      toast.success(result.message);
      router.push("/admin/packages");
      router.refresh();
    } else {
      toast.error(result.error);
      if (result.fieldErrors) {
        for (const [field, messages] of Object.entries(result.fieldErrors)) {
          if (messages?.[0]) {
            form.setError(field as keyof PackageInput, { message: messages[0] });
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
                    <Input placeholder="Shimla Manali Escape" {...field} value={asStr(field.value)} />
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
                        placeholder="shimla-manali-escape"
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
                    Used in the URL: /packages/&lt;slug&gt;
                  </FormDescription>
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
                  <Textarea rows={2} placeholder="Short pitch shown on cards." {...field} value={asStr(field.value)} />
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
                    placeholder="Full package write-up (plain text)."
                    {...field} value={asStr(field.value)} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </Section>

        <Section title="Details & pricing">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <FormField
              control={form.control}
              name="destinationId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Destination</FormLabel>
                  <Select
                    value={asStr(field.value) || "none"}
                    onValueChange={(value) =>
                      field.onChange(value === "none" ? "" : value)
                    }
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Pick a destination" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="none">No destination</SelectItem>
                      {destinations.map((destination) => (
                        <SelectItem key={destination.id} value={destination.id}>
                          {destination.name} · {destination.state}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="durationDays"
              render={({ field }) => (
                <FormItem>
                  <FormLabel required>Duration (days)</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      inputMode="numeric"
                      min={1}
                      max={90}
                      {...field} value={asStr(field.value)} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="durationLabel"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Duration label</FormLabel>
                  <FormControl>
                    <Input placeholder="6 Days / 5 Nights" {...field} value={asStr(field.value)} />
                  </FormControl>
                  <FormDescription>Optional override.</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="price"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Price (per person)</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      inputMode="numeric"
                      min={0}
                      placeholder="Leave empty if on request"
                      {...field}
                      value={asStr(field.value)}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="currency"
              render={({ field }) => (
                <FormItem>
                  <FormLabel required>Currency</FormLabel>
                  <FormControl>
                    <Input placeholder="INR" {...field} value={asStr(field.value)} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="priceNote"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Price note</FormLabel>
                  <FormControl>
                    <Input placeholder="Excludes flights" {...field} value={asStr(field.value)} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="grid gap-4">
            <FormField
              control={form.control}
              name="highlights"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Highlights</FormLabel>
                  <FormControl>
                    <Textarea
                      rows={4}
                      placeholder={"One highlight per line\nKufri day trip\nSunset at Ridge"}
                      {...field} value={asStr(field.value)} />
                  </FormControl>
                  <FormDescription>One item per line.</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="grid gap-4 sm:grid-cols-2">
              <FormField
                control={form.control}
                name="inclusions"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Inclusions</FormLabel>
                    <FormControl>
                      <Textarea
                        rows={5}
                        placeholder={"Hotel stay\nDaily breakfast\nAirport transfers"}
                        {...field} value={asStr(field.value)} />
                    </FormControl>
                    <FormDescription>One item per line.</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="exclusions"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Exclusions</FormLabel>
                    <FormControl>
                      <Textarea
                        rows={5}
                        placeholder={"Airfare\nLunch & dinner\nPersonal expenses"}
                        {...field} value={asStr(field.value)} />
                    </FormControl>
                    <FormDescription>One item per line.</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>
        </Section>

        <Section title="Itinerary">
          <ItineraryEditor control={control} />
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
                    <Input placeholder="/uploads/package.jpg or https://…" {...field} value={asStr(field.value)} />
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
                    <Input placeholder="Shimla Manali Package" {...field} value={asStr(field.value)} />
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
                {packageId ? "Save changes" : "Create package"}
              </>
            )}
          </Button>
          <Button asChild variant="outline" size="lg" type="button">
            <Link href="/admin/packages">
              <ArrowLeft aria-hidden="true" className="size-4" />
              Back to list
            </Link>
          </Button>
        </div>
      </form>
    </FormProvider>
  );
}

function ItineraryEditor({
  control,
}: {
  control: Control<PackageInput>;
}) {
  const { fields, append, remove } = useFieldArray({ control, name: "itinerary" });

  return (
    <div className="grid gap-3">
      {fields.map((field, index) => (
        <div
          key={field.id}
          className="relative grid gap-3 border-[3px] border-ink bg-cream p-3 pr-12 shadow-hard-xs"
        >
          <span className="label-brutal w-fit border-[2px] border-ink bg-lemon px-2 py-1">
            Day {index + 1}
          </span>
          <FormField
            control={control}
            name={`itinerary.${index}.title`}
            render={({ field: dayField }) => (
              <FormItem>
                <FormLabel required>Day title</FormLabel>
                <FormControl>
                  <Input
                    placeholder="Arrive in Shimla"
                    {...dayField}
                    value={asStr(dayField.value)}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={control}
            name={`itinerary.${index}.description`}
            render={({ field: dayField }) => (
              <FormItem>
                <FormLabel required>Description</FormLabel>
                <FormControl>
                  <Textarea
                    rows={3}
                    placeholder="What happens on this day."
                    {...dayField}
                    value={asStr(dayField.value)}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            className="absolute right-2 top-2"
            onClick={() => remove(index)}
            aria-label={`Remove day ${index + 1}`}
          >
            <Trash2 aria-hidden="true" className="size-4" />
          </Button>
        </div>
      ))}

      {fields.length === 0 ? (
        <p className="border-[2px] border-dashed border-ink/50 px-3 py-3 text-sm font-semibold text-ink-soft">
          No days yet — add the first day of the itinerary.
        </p>
      ) : null}

      <div>
        <Button
          type="button"
          variant="soft"
          onClick={() => append({ title: "", description: "" })}
        >
          <Plus aria-hidden="true" className="size-4" />
          Add day
        </Button>
      </div>
    </div>
  );
}
