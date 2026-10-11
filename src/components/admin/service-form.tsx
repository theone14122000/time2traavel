"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm, FormProvider } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { ArrowLeft, LoaderCircle, Save, Sparkles } from "lucide-react";
import { serviceSchema, type ServiceInput } from "@/schemas/admin";
import { saveServiceAction } from "@/actions/admin/services";
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

const emptyValues: ServiceInput = {
  title: "",
  slug: "",
  icon: "",
  color: "",
  shortDescription: "",
  longDescription: "",
  coverImage: "",
  coverImageAlt: "",
  processSteps: "",
  faqs: "",
  linkedPackageSlugs: "",
  seoTitle: "",
  seoDescription: "",
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
      <h2 className="border-b-[3px] border-ink bg-mint px-4 py-3 font-display text-sm uppercase tracking-wide">
        {title}
      </h2>
      <div className="grid gap-4 p-4 sm:p-5">{children}</div>
    </section>
  );
}

export function ServiceForm({
  serviceId,
  initial,
}: {
  serviceId?: string | null;
  initial?: ServiceInput | null;
}) {
  const router = useRouter();
  const form = useForm<ServiceInput>({
    resolver: zodResolver(serviceSchema),
    defaultValues: initial ? { ...emptyValues, ...initial } : emptyValues,
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

  async function onSubmit(values: ServiceInput) {
    const result = await saveServiceAction(serviceId ?? null, values);
    if (result.ok) {
      toast.success(result.message);
      router.push("/admin/services");
      router.refresh();
    } else {
      toast.error(result.error);
      if (result.fieldErrors) {
        for (const [field, messages] of Object.entries(result.fieldErrors)) {
          if (messages?.[0]) {
            form.setError(field as keyof ServiceInput, { message: messages[0] });
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
                    <Input placeholder="Custom itinerary planning" {...field} value={asStr(field.value)} />
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
                        placeholder="custom-itinerary-planning"
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
                    Used in the URL: /services/&lt;slug&gt;
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
                    <Input placeholder="Map" {...field} value={asStr(field.value)} />
                  </FormControl>
                  <FormDescription>Lucide icon name — e.g. Map, Plane.</FormDescription>
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
                    <Input placeholder="lemon" {...field} value={asStr(field.value)} />
                  </FormControl>
                  <FormDescription>Design token name — e.g. lemon, mint, sky.</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <FormField
            control={form.control}
            name="shortDescription"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Short description</FormLabel>
                <FormControl>
                  <Textarea rows={2} placeholder="One or two lines shown on cards." {...field} value={asStr(field.value)} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="longDescription"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Long description</FormLabel>
                <FormControl>
                  <Textarea rows={8} placeholder="Full service write-up (plain text)." {...field} value={asStr(field.value)} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </Section>

        <Section title="Details">
          <FormField
            control={form.control}
            name="processSteps"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Process steps</FormLabel>
                <FormControl>
                  <Textarea
                    rows={5}
                    placeholder={'[{"title": "Step 1", "description": "…"}]'}
                    {...field} value={asStr(field.value)} />
                </FormControl>
                <FormDescription>
                  JSON array of objects — double-quoted keys and strings.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="faqs"
            render={({ field }) => (
              <FormItem>
                <FormLabel>FAQs</FormLabel>
                <FormControl>
                  <Textarea
                    rows={5}
                    placeholder={'[{"question": "…", "answer": "…"}]'}
                    {...field} value={asStr(field.value)} />
                </FormControl>
                <FormDescription>
                  JSON array of objects — double-quoted keys and strings.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="linkedPackageSlugs"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Linked package slugs</FormLabel>
                <FormControl>
                  <Textarea
                    rows={3}
                    placeholder={'["shimla-manali-escape"]'}
                    {...field} value={asStr(field.value)} />
                </FormControl>
                <FormDescription>
                  JSON array of package slug strings.
                </FormDescription>
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
                    <Input placeholder="/uploads/service.jpg or https://…" {...field} value={asStr(field.value)} />
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

        <Section title="SEO">
          <div className="grid gap-4 sm:grid-cols-2">
            <FormField
              control={form.control}
              name="seoTitle"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Meta title</FormLabel>
                  <FormControl>
                    <Input placeholder="Service title" {...field} value={asStr(field.value)} />
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
                {serviceId ? "Save changes" : "Create service"}
              </>
            )}
          </Button>
          <Button asChild variant="outline" size="lg" type="button">
            <Link href="/admin/services">
              <ArrowLeft aria-hidden="true" className="size-4" />
              Back to list
            </Link>
          </Button>
        </div>
      </form>
    </FormProvider>
  );
}
