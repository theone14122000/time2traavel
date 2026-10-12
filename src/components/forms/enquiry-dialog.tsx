"use client";

import * as React from "react";
import { useForm, FormProvider, type Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Send } from "lucide-react";
import {
  destinationEnquirySchema,
  packageEnquirySchema,
  type DestinationEnquiryInput,
  type PackageEnquiryInput,
} from "@/schemas/forms";
import {
  submitDestinationEnquiryAction,
  submitPackageEnquiryAction,
} from "@/actions/public-forms";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  HoneypotInput,
} from "@/components/ui/form";
import { Input, Textarea } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { scrollFieldIntoViewOnFocus } from "@/components/forms/scroll-on-focus";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";

type SharedFields = {
  name: string;
  email: string;
  phone: string;
  travelDate: string;
  travellers: string;
  message: string;
  website: string;
};

const sharedDefaults: SharedFields = {
  name: "",
  email: "",
  phone: "",
  travelDate: "",
  travellers: "",
  message: "",
  website: "",
};

/** Either enquiry flavour: the target keys are optional and set per dialog. */
type EnquiryValues = SharedFields & {
  packageSlug?: string;
  packageTitle?: string;
  destinationSlug?: string;
  destinationName?: string;
};

/**
 * Pre-filled enquiry dialog for a destination or a package.
 * Rendered from the card "Enquire" buttons.
 */
export function EnquiryDialog({
  target,
  open,
  onOpenChange,
}: {
  target:
    | { kind: "destination"; slug: string; name: string }
    | { kind: "package"; slug: string; name: string }
    | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const isPackage = target?.kind === "package";

  const schema = isPackage ? packageEnquirySchema : destinationEnquirySchema;
  const defaults: EnquiryValues = {
    ...(isPackage
      ? { packageSlug: target?.slug ?? "", packageTitle: target?.name ?? "" }
      : { destinationSlug: target?.slug ?? "", destinationName: target?.name ?? "" }),
    ...sharedDefaults,
  };

  const form = useForm<EnquiryValues>({
    resolver: zodResolver(schema) as Resolver<EnquiryValues>,
    defaultValues: defaults,
    mode: "onBlur",
  });

  React.useEffect(() => {
    if (open && target) {
      form.reset({
        ...(isPackage
          ? { packageSlug: target.slug, packageTitle: target.name }
          : { destinationSlug: target.slug, destinationName: target.name }),
        ...sharedDefaults,
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, target]);

  const { formState } = form;

  async function onSubmit(values: EnquiryValues) {
    const result = isPackage
      ? await submitPackageEnquiryAction(values as PackageEnquiryInput)
      : await submitDestinationEnquiryAction(values as DestinationEnquiryInput);

    if (result.ok) {
      toast.success(result.message);
      form.reset({ ...defaults });
      onOpenChange(false);
    } else {
      toast.error(result.error);
      if (result.fieldErrors) {
        for (const [field, messages] of Object.entries(result.fieldErrors)) {
          if (field in sharedDefaults && messages?.[0]) {
            form.setError(field as keyof SharedFields, { message: messages[0] });
          }
        }
      }
    }
  }

  if (!target) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Enquire — {target.name}</DialogTitle>
          <DialogDescription>
            {isPackage
              ? "Ask us anything about this package, or request custom dates."
              : "Tell us when you'd like to visit and we'll get back to you."}
          </DialogDescription>
          <div className="mt-1">
            <Badge variant={isPackage ? "sky" : "mint"} size="sm">
              {isPackage ? "Package enquiry" : "Destination enquiry"}
            </Badge>
          </div>
        </DialogHeader>

        <FormProvider {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            noValidate
            className="grid gap-4 p-4 sm:p-5"
          >
            <HoneypotInput />

            <input type="hidden" {...form.register(isPackage ? "packageSlug" : "destinationSlug")} />
            <input type="hidden" {...form.register(isPackage ? "packageTitle" : "destinationName")} />

            <div className="grid gap-4 sm:grid-cols-2">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel required>Your name</FormLabel>
                    <FormControl>
                      <Input
                        autoComplete="name"
                        placeholder="Full name"
                        onFocus={scrollFieldIntoViewOnFocus}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel required>Email</FormLabel>
                    <FormControl>
                      <Input
                        type="email"
                        autoComplete="email"
                        placeholder="you@example.com"
                        onFocus={scrollFieldIntoViewOnFocus}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Phone / WhatsApp</FormLabel>
                    <FormControl>
                      <Input
                        type="tel"
                        autoComplete="tel"
                        placeholder="+91 ..."
                        onFocus={scrollFieldIntoViewOnFocus}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="travelDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Travel date</FormLabel>
                    <FormControl>
                      <Input
                        type="date"
                        onFocus={scrollFieldIntoViewOnFocus}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="travellers"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Travellers</FormLabel>
                  <FormControl>
                    <Input
                      inputMode="numeric"
                      placeholder="e.g. 2"
                      onFocus={scrollFieldIntoViewOnFocus}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="message"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Message</FormLabel>
                  <FormControl>
                    <Textarea
                      rows={3}
                      placeholder="Anything we should know?"
                      onFocus={scrollFieldIntoViewOnFocus}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button type="submit" size="lg" loading={formState.isSubmitting} className="w-full">
              {!formState.isSubmitting && <Send aria-hidden="true" className="size-4" />}
              Send enquiry
            </Button>
          </form>
        </FormProvider>
      </DialogContent>
    </Dialog>
  );
}
