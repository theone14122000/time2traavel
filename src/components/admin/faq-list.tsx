"use client";

import * as React from "react";
import { useForm, FormProvider } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { LoaderCircle, Pencil, Plus, Save } from "lucide-react";
import { faqSchema, type FaqInput } from "@/schemas/admin";
import { deleteFaqAction, saveFaqAction } from "@/actions/admin/faqs";
import { formatDate } from "@/lib/utils";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input, Textarea } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogBody,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ConfirmDeleteButton } from "@/components/admin/confirm-delete-button";
import { asChecked, asStr } from "@/components/admin/form-utils";

export type FaqRow = {
  id: string;
  question: string;
  answer: string;
  category: string;
  order: number;
  published: boolean;
  updatedAt: string;
};

const emptyValues: FaqInput = {
  question: "",
  answer: "",
  category: "General",
  order: "0",
  published: true,
};

export function FaqList({ faqs }: { faqs: FaqRow[] }) {
  const [editing, setEditing] = React.useState<FaqRow | null>(null);
  const [open, setOpen] = React.useState(false);

  function openCreate() {
    setEditing(null);
    setOpen(true);
  }

  function openEdit(row: FaqRow) {
    setEditing(row);
    setOpen(true);
  }

  return (
    <div className="grid gap-5">
      <div className="flex justify-end">
        <Button size="lg" onClick={openCreate}>
          <Plus aria-hidden="true" className="size-4" />
          New FAQ
        </Button>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Question</TableHead>
            <TableHead>Category</TableHead>
            <TableHead>Order</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Updated</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {faqs.length === 0 ? (
            <TableRow>
              <TableCell colSpan={6} className="py-10 text-center text-ink-soft">
                No FAQs yet — create the first one.
              </TableCell>
            </TableRow>
          ) : (
            faqs.map((row) => (
              <TableRow key={row.id}>
                <TableCell className="max-w-md">
                  <span className="font-bold">{row.question}</span>
                  <span className="mt-1 block truncate text-xs text-ink-soft">
                    {row.answer}
                  </span>
                </TableCell>
                <TableCell>
                  <Badge variant="soft">{row.category}</Badge>
                </TableCell>
                <TableCell>{row.order}</TableCell>
                <TableCell>
                  <Badge variant={row.published ? "success" : "outline"}>
                    {row.published ? "Live" : "Draft"}
                  </Badge>
                </TableCell>
                <TableCell className="text-xs text-ink-soft">
                  {formatDate(row.updatedAt, {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                  })}
                </TableCell>
                <TableCell>
                  <div className="flex flex-wrap justify-end gap-2">
                    <Button variant="soft" size="sm" onClick={() => openEdit(row)}>
                      <Pencil aria-hidden="true" className="size-3.5" />
                      Edit
                    </Button>
                    <ConfirmDeleteButton
                      onAction={() => deleteFaqAction(row.id)}
                      confirmTitle="Delete this FAQ?"
                      confirmDescription={`“${row.question}” will be removed permanently.`}
                    />
                  </div>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>

      <FaqDialog
        open={open}
        onOpenChange={setOpen}
        editing={editing}
        onSaved={() => setOpen(false)}
      />
    </div>
  );
}

function FaqDialog({
  open,
  onOpenChange,
  editing,
  onSaved,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editing: FaqRow | null;
  onSaved: () => void;
}) {
  const form = useForm<FaqInput>({
    resolver: zodResolver(faqSchema),
    defaultValues: emptyValues,
    mode: "onBlur",
  });

  React.useEffect(() => {
    if (open) {
      form.reset(
        editing
          ? {
              question: editing.question,
              answer: editing.answer,
              category: editing.category,
              order: String(editing.order),
              published: editing.published,
            }
          : emptyValues,
      );
    }
  }, [open, editing, form]);

  const { formState } = form;

  async function onSubmit(values: FaqInput) {
    const result = await saveFaqAction(editing?.id ?? null, values);
    if (result.ok) {
      toast.success(result.message);
      onSaved();
    } else {
      toast.error(result.error);
      if (result.fieldErrors) {
        for (const [field, messages] of Object.entries(result.fieldErrors)) {
          if (messages?.[0]) {
            form.setError(field as keyof FaqInput, { message: messages[0] });
          }
        }
      }
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>{editing ? "Edit FAQ" : "New FAQ"}</DialogTitle>
          <DialogDescription>
            Keep answers short and scannable — they render in an accordion on
            the public site.
          </DialogDescription>
        </DialogHeader>
        <FormProvider {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} noValidate>
            <DialogBody className="grid gap-4">
              <FormField
                control={form.control}
                name="question"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel required>Question</FormLabel>
                    <FormControl>
                      <Input placeholder="Do you customise packages?" {...field} value={asStr(field.value)} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="answer"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel required>Answer</FormLabel>
                    <FormControl>
                      <Textarea rows={5} placeholder="Yes — tell us your dates…" {...field} value={asStr(field.value)} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid gap-4 sm:grid-cols-2">
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
                  name="order"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Order</FormLabel>
                      <FormControl>
                        <Input type="number" inputMode="numeric" {...field} value={asStr(field.value)} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

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
                    <FormLabel className="mb-0">Published</FormLabel>
                  </FormItem>
                )}
              />
            </DialogBody>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
              >
                Cancel
              </Button>
              <Button type="submit" loading={formState.isSubmitting}>
                {formState.isSubmitting ? (
                  <>
                    <LoaderCircle aria-hidden="true" className="size-4" />
                    Saving
                  </>
                ) : (
                  <>
                    <Save aria-hidden="true" className="size-4" />
                    {editing ? "Save changes" : "Create FAQ"}
                  </>
                )}
              </Button>
            </DialogFooter>
          </form>
        </FormProvider>
      </DialogContent>
    </Dialog>
  );
}
