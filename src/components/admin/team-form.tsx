"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm, FormProvider } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { ArrowLeft, LoaderCircle, Save, Sparkles, User } from "lucide-react";
import {
  teamMemberSchema,
  type TeamMemberInput,
} from "@/schemas/admin";
import { saveTeamMemberAction } from "@/actions/admin/team";
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

const emptyValues: TeamMemberInput = {
  name: "",
  slug: "",
  role: "",
  bio: "",
  image: "",
  imageAlt: "",
  isFounder: false,
  socials: [],
  order: "0",
  published: false,
};

const SOCIAL_KINDS: Array<{ value: "linkedin" | "instagram" | "x" | "email"; label: string }> = [
  { value: "linkedin", label: "LinkedIn" },
  { value: "instagram", label: "Instagram" },
  { value: "x", label: "X" },
  { value: "email", label: "Email" },
];

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

export function TeamMemberForm({
  memberId,
  initial,
}: {
  memberId?: string | null;
  initial?: TeamMemberInput | null;
}) {
  const router = useRouter();
  const form = useForm<TeamMemberInput>({
    resolver: zodResolver(teamMemberSchema),
    defaultValues: initial
      ? { ...emptyValues, ...initial, socials: initial.socials ?? [] }
      : emptyValues,
    mode: "onBlur",
  });

  const { formState, watch, setValue } = form;
  const nameValue = watch("name");
  const roleValue = watch("role");
  const imageValue = asStr(watch("image"));
  const slugEdited = React.useRef(Boolean(initial?.slug));

  React.useEffect(() => {
    if (!slugEdited.current && nameValue) {
      setValue("slug", slugify(nameValue), { shouldValidate: false });
    }
  }, [nameValue, setValue]);

  async function onSubmit(values: TeamMemberInput) {
    const result = await saveTeamMemberAction(memberId ?? null, values);
    if (result.ok) {
      toast.success(result.message);
      router.push("/admin/team");
      router.refresh();
    } else {
      toast.error(result.error);
      if (result.fieldErrors) {
        for (const [field, messages] of Object.entries(result.fieldErrors)) {
          if (messages?.[0]) {
            form.setError(field as keyof TeamMemberInput, { message: messages[0] });
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
                    <Input placeholder="Prachi Bhardwaj" {...field} value={asStr(field.value)} />
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
                        placeholder="prachi-bhardwaj"
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
                  <FormDescription>Used in the URL: /team/&lt;slug&gt;</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="role"
              render={({ field }) => (
                <FormItem>
                  <FormLabel required>Role</FormLabel>
                  <FormControl>
                    <Input placeholder="Founder" {...field} value={asStr(field.value)} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <FormField
            control={form.control}
            name="bio"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Bio</FormLabel>
                <FormControl>
                  <Textarea
                    rows={4}
                    placeholder="Short background for the About page (plain text)."
                    {...field}
                    value={asStr(field.value)}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </Section>

        <Section title="Photo">
          <div className="flex flex-wrap items-end gap-4">
            <FormField
              control={form.control}
              name="image"
              render={({ field }) => (
                <FormItem className="min-w-64 flex-1">
                  <FormLabel>Photo path</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="/team/prachi-bhardwaj.jpg"
                      {...field}
                      value={asStr(field.value)}
                    />
                  </FormControl>
                  <FormDescription>Site path starting with / — no upload widget.</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid gap-1.5">
              <span className="text-xs font-medium text-ink-soft">Preview</span>
              <span
                aria-hidden="true"
                className="relative block size-24 overflow-hidden rounded-full border border-line bg-sand"
              >
                {imageValue.startsWith("/") ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={imageValue} alt="" className="size-full object-cover" />
                ) : (
                  <User aria-hidden="true" className="absolute left-1/2 top-1/2 size-8 -translate-x-1/2 -translate-y-1/2 text-ink-soft" />
                )}
              </span>
            </div>
          </div>

          <FormField
            control={form.control}
            name="imageAlt"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Photo alt text</FormLabel>
                <FormControl>
                  <Input placeholder="Portrait of …" {...field} value={asStr(field.value)} />
                </FormControl>
                <FormDescription>
                  {`Portrait of ${asStr(nameValue).trim() || "Name"}, ${asStr(roleValue).trim() || "Role"}`}
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </Section>

        <Section title="Social links">
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
                  max={4}
                  emptyRow={{ kind: "linkedin", url: "" }}
                  renderRow={(index) => (
                    <>
                      <FormField
                        control={form.control}
                        name={`socials.${index}.kind`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Platform</FormLabel>
                            <Select value={asStr(field.value)} onValueChange={field.onChange}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Pick a platform" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {SOCIAL_KINDS.map((kind) => (
                                  <SelectItem key={kind.value} value={kind.value}>
                                    {kind.label}
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

        <Section title="Publishing">
          <div className="flex flex-wrap items-end gap-6">
            <FormField
              control={form.control}
              name="isFounder"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center gap-3">
                  <FormControl>
                    <Checkbox
                      checked={asChecked(field.value)}
                      onCheckedChange={(checked) => field.onChange(checked === true)}
                    />
                  </FormControl>
                  <div className="grid gap-0.5">
                    <FormLabel className="mb-0">Founder</FormLabel>
                    <FormDescription>Only one founder — saving unsets the others.</FormDescription>
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
                {memberId ? "Save changes" : "Create team member"}
              </>
            )}
          </Button>
          <Button asChild variant="outline" size="lg" type="button">
            <Link href="/admin/team">
              <ArrowLeft aria-hidden="true" className="size-4" />
              Back to list
            </Link>
          </Button>
        </div>
      </form>
    </FormProvider>
  );
}
