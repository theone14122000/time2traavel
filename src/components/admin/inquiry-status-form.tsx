"use client";

import { useRouter } from "next/navigation";
import { useForm, FormProvider } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { LoaderCircle, Save } from "lucide-react";
import {
  inquiryUpdateSchema,
  type InquiryUpdateInput,
} from "@/schemas/admin";
import { updateInquiryAction } from "@/actions/admin/inquiries";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Textarea } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { asStr } from "@/components/admin/form-utils";
import { INQUIRY_STATUSES } from "@/lib/constants";
import type { InquiryStatus } from "@prisma/client";

export type InquiryUserOption = {
  id: string;
  name: string;
  email: string;
  role: "ADMIN" | "EDITOR";
};

const NO_ASSIGNEE = "none";

export function InquiryStatusForm({
  inquiry,
  users,
}: {
  inquiry: {
    id: string;
    status: InquiryStatus;
    adminNotes: string | null;
    assigneeId?: string | null;
  };
  users: InquiryUserOption[];
}) {
  const router = useRouter();
  const form = useForm<InquiryUpdateInput>({
    resolver: zodResolver(inquiryUpdateSchema),
    defaultValues: {
      id: inquiry.id,
      status: inquiry.status,
      adminNotes: inquiry.adminNotes ?? "",
      assigneeId: inquiry.assigneeId ?? "",
    },
    mode: "onBlur",
  });

  const { formState } = form;

  async function onSubmit(values: InquiryUpdateInput) {
    const result = await updateInquiryAction(values);
    if (result.ok) {
      toast.success(result.message);
      router.refresh();
    } else {
      toast.error(result.error);
      if (result.fieldErrors) {
        for (const [field, messages] of Object.entries(result.fieldErrors)) {
          if (messages?.[0]) {
            form.setError(field as keyof InquiryUpdateInput, {
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
        className="grid gap-4"
      >
        <FormField
          control={form.control}
          name="status"
          render={({ field }) => (
            <FormItem>
              <FormLabel required>Status</FormLabel>
              <Select value={asStr(field.value)} onValueChange={field.onChange}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Pick a status" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {Object.entries(INQUIRY_STATUSES).map(([value, label]) => (
                    <SelectItem key={value} value={value}>
                      {label}
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
          name="assigneeId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Assignee</FormLabel>
              <Select
                value={asStr(field.value) || NO_ASSIGNEE}
                onValueChange={(value) =>
                  field.onChange(value === NO_ASSIGNEE ? "" : value)
                }
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Pick a staff member" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value={NO_ASSIGNEE}>Unassigned</SelectItem>
                  {users.map((user) => (
                    <SelectItem key={user.id} value={user.id}>
                      {user.name} · {user.email}
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
          name="adminNotes"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Admin notes</FormLabel>
              <FormControl>
                <Textarea
                  rows={5}
                  placeholder="Internal notes — never shown to the visitor."
                  {...field} value={asStr(field.value)} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div>
          <Button type="submit" loading={formState.isSubmitting}>
            {formState.isSubmitting ? (
              <>
                <LoaderCircle aria-hidden="true" className="size-4" />
                Saving
              </>
            ) : (
              <>
                <Save aria-hidden="true" className="size-4" />
                Save enquiry
              </>
            )}
          </Button>
        </div>
      </form>
    </FormProvider>
  );
}
