"use client";

import { useRouter } from "next/navigation";
import { useForm, FormProvider } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { LoaderCircle, Save } from "lucide-react";
import { settingsSchema, type SettingsInput } from "@/schemas/admin";
import { saveSettingsAction } from "@/actions/admin/settings";
import {
  formatPhoneDisplay,
  mailtoHref,
  telHref,
  waHref,
} from "@/lib/contact";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { RepeatableRows } from "@/components/admin/repeatable-rows";
import { asStr } from "@/components/admin/form-utils";
import {
  DEFAULT_FONT_THEME,
  FONT_THEMES,
  FONT_THEME_LABELS,
} from "@/lib/font-theme";

const emptyValues: SettingsInput = {
  siteName: "Time to Travel",
  tagline: "",
  fontTheme: DEFAULT_FONT_THEME,
  phone: "",
  whatsapp: "",
  supportPhone: "",
  email: "",
  address: "",
  workingHours: "",
  mapEmbedUrl: "",
  socials: [],
  heroTitle: "",
  heroSubtitle: "",
  metaTitle: "",
  metaDescription: "",
  ogImage: "",
  footerNote: "",
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
      <h2 className="border-b border-line bg-lavender px-4 py-3 font-display text-sm uppercase tracking-wide">
        {title}
      </h2>
      <div className="grid gap-4 p-4 sm:p-5">{children}</div>
    </section>
  );
}

export function SettingsForm({ initial }: { initial: SettingsInput }) {
  const router = useRouter();
  const form = useForm<SettingsInput>({
    resolver: zodResolver(settingsSchema),
    defaultValues: { ...emptyValues, ...initial, socials: initial.socials ?? [] },
    mode: "onBlur",
  });

  const { formState, watch } = form;

  const phoneValue = asStr(watch("phone"));
  const whatsappValue = asStr(watch("whatsapp"));
  const emailValue = asStr(watch("email"));
  const supportPhoneDisplay = formatPhoneDisplay(asStr(watch("supportPhone")));
  const testTelHref = telHref(phoneValue);
  const testWaHref = waHref(whatsappValue);
  const testMailHref = mailtoHref(emailValue);

  async function onSubmit(values: SettingsInput) {
    const result = await saveSettingsAction(values);
    if (result.ok) {
      toast.success(result.message);
      router.refresh();
    } else {
      toast.error(result.error);
      if (result.fieldErrors) {
        for (const [field, messages] of Object.entries(result.fieldErrors)) {
          if (messages?.[0]) {
            form.setError(field as keyof SettingsInput, { message: messages[0] });
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
        <Section title="Identity">
          <div className="grid gap-4 sm:grid-cols-2">
            <FormField
              control={form.control}
              name="siteName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel required>Site name</FormLabel>
                  <FormControl>
                    <Input placeholder="Time to Travel" {...field} value={asStr(field.value)} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="tagline"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tagline</FormLabel>
                  <FormControl>
                    <Input placeholder="Plan less. Travel more." {...field} value={asStr(field.value)} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <FormField
            control={form.control}
            name="address"
            render={({ field }) => (
              <FormItem>
                <FormLabel required>Address</FormLabel>
                <FormControl>
                  <Input placeholder="Kasumpti, Shimla, Himachal Pradesh" {...field} value={asStr(field.value)} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </Section>

        <Section title="Typography">
          <FormField
            control={form.control}
            name="fontTheme"
            render={({ field }) => (
              <FormItem className="max-w-xl">
                <FormLabel>Font theme</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  value={asStr(field.value) || DEFAULT_FONT_THEME}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Choose a pairing" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {FONT_THEMES.map((theme) => (
                      <SelectItem key={theme} value={theme}>
                        {FONT_THEME_LABELS[theme]}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormDescription>
                  Switches the handwriting pairing across the whole site. All
                  three pairings render live under Design system → Type.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </Section>

        <Section title="Contact">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <FormField
              control={form.control}
              name="phone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Phone</FormLabel>
                  <FormControl>
                    <Input type="tel" placeholder="+91 …" {...field} value={asStr(field.value)} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="whatsapp"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>WhatsApp</FormLabel>
                  <FormControl>
                    <Input type="tel" placeholder="91XXXXXXXXXX" {...field} value={asStr(field.value)} />
                  </FormControl>
                  <FormDescription>Digits only, with country code.</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="supportPhone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Support phone</FormLabel>
                  <FormControl>
                    <Input type="tel" placeholder="+91 …" {...field} value={asStr(field.value)} />
                  </FormControl>
                  <FormDescription>
                    {supportPhoneDisplay
                      ? `Preview: ${supportPhoneDisplay}`
                      : "Saved in international format."}
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input type="email" placeholder="hello@example.com" {...field} value={asStr(field.value)} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="workingHours"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Working hours</FormLabel>
                  <FormControl>
                    <Input placeholder="Mon–Sat, 10am–7pm" {...field} value={asStr(field.value)} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <span className="label-brutal border border-line bg-cream px-2 py-1 text-xs">
              Test links
            </span>
            {testTelHref ? (
              <Button asChild variant="outline" size="sm" type="button">
                <a href={testTelHref} target="_blank" rel="noopener noreferrer">
                  Call (tel:)
                </a>
              </Button>
            ) : null}
            {testWaHref ? (
              <Button asChild variant="outline" size="sm" type="button">
                <a href={testWaHref} target="_blank" rel="noopener noreferrer">
                  WhatsApp (wa.me)
                </a>
              </Button>
            ) : null}
            {testMailHref ? (
              <Button asChild variant="outline" size="sm" type="button">
                <a href={testMailHref} target="_blank" rel="noopener noreferrer">
                  Email (mailto:)
                </a>
              </Button>
            ) : null}
          </div>

          <FormField
            control={form.control}
            name="mapEmbedUrl"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Map embed URL</FormLabel>
                <FormControl>
                  <Input
                    placeholder="https://www.google.com/maps?q=…&output=embed"
                    {...field} value={asStr(field.value)} />
                </FormControl>
                <FormDescription>
                  The Google Maps embed src (…&amp;output=embed).
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="socials"
            render={() => (
              <FormItem>
                <FormLabel>Social links</FormLabel>
                <RepeatableRows
                  control={form.control}
                  name="socials"
                  addLabel="Add social link"
                  emptyRow={{ platform: "", url: "" }}
                  renderRow={(index) => (
                    <>
                      <FormField
                        control={form.control}
                        name={`socials.${index}.platform`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Platform</FormLabel>
                            <FormControl>
                              <Input placeholder="Instagram" {...field} value={asStr(field.value)} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name={`socials.${index}.url`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>URL</FormLabel>
                            <FormControl>
                              <Input placeholder="https://…" {...field} value={asStr(field.value)} />
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

        <Section title="Home hero">
          <FormField
            control={form.control}
            name="heroTitle"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Hero title</FormLabel>
                <FormControl>
                  <Input placeholder="Big headline for the home page" {...field} value={asStr(field.value)} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="heroSubtitle"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Hero subtitle</FormLabel>
                <FormControl>
                  <Textarea rows={2} placeholder="Supporting line under the headline." {...field} value={asStr(field.value)} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </Section>

        <Section title="SEO & footer">
          <div className="grid gap-4 sm:grid-cols-2">
            <FormField
              control={form.control}
              name="metaTitle"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Default meta title</FormLabel>
                  <FormControl>
                    <Input placeholder="Time to Travel — Shimla" {...field} value={asStr(field.value)} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="ogImage"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>OG image URL</FormLabel>
                  <FormControl>
                    <Input placeholder="/og-image.svg or https://…" {...field} value={asStr(field.value)} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          <FormField
            control={form.control}
            name="metaDescription"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Default meta description</FormLabel>
                <FormControl>
                  <Textarea rows={2} placeholder="Short search listing copy." {...field} value={asStr(field.value)} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="footerNote"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Footer note</FormLabel>
                <FormControl>
                  <Textarea rows={2} placeholder="Small print shown in the footer." {...field} value={asStr(field.value)} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </Section>

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
                Save settings
              </>
            )}
          </Button>
        </div>
      </form>
    </FormProvider>
  );
}
