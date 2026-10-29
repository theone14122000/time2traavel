"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { useForm, FormProvider } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import {
  ArrowDown,
  ArrowUp,
  ChevronLeft,
  LoaderCircle,
  Pencil,
  Plus,
  Save,
  Upload,
} from "lucide-react";
import {
  galleryItemCreateSchema,
  galleryItemUpdateSchema,
  type GalleryItemCreateInput,
  type GalleryItemUpdateInput,
} from "@/schemas/admin";
import {
  createGalleryItemAction,
  deleteGalleryItemAction,
  moveGalleryItemAction,
  updateGalleryItemAction,
  uploadGalleryItemAction,
} from "@/actions/admin/gallery";
import { GALLERY_CATEGORIES } from "@/lib/constants";
import { formatDate } from "@/lib/utils";
import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogBody,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { AsyncButton } from "@/components/admin/async-button";
import { ConfirmDeleteButton } from "@/components/admin/confirm-delete-button";
import { asStr } from "@/components/admin/form-utils";

export type GalleryItemRow = {
  id: string;
  url: string;
  alt: string;
  category: string;
  caption: string | null;
  destinationId: string | null;
  order: number;
  createdAt: string;
};

export type GalleryDestinationOption = {
  id: string;
  name: string;
  state: string;
};

const NO_DESTINATION = "none";

const createEmptyValues: GalleryItemCreateInput = {
  url: "",
  alt: "",
  category: "General",
  caption: "",
  destinationId: "",
};

function CategoryDatalist({ id }: { id: string }) {
  return (
    <datalist id={id}>
      {GALLERY_CATEGORIES.map((category) => (
        <option key={category} value={category} />
      ))}
    </datalist>
  );
}

export function GalleryForm({
  items,
  destinations,
}: {
  items: GalleryItemRow[];
  destinations: GalleryDestinationOption[];
}) {
  const [editing, setEditing] = React.useState<GalleryItemRow | null>(null);

  return (
    <div className="grid gap-6">
      <div className="grid gap-5 lg:grid-cols-2">
        <GalleryUploadForm destinations={destinations} />
        <GalleryAddForm destinations={destinations} />
      </div>

      {items.length === 0 ? (
        <p className="border border-dashed border-line bg-butter px-4 py-10 text-center text-sm font-bold uppercase">
          No gallery items yet — upload an image or add one by URL.
        </p>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {items.map((item, index) => (
            <figure
              key={item.id}
              className="flex flex-col border border-line bg-paper shadow-hard"
            >
              <div className="relative aspect-[4/3] border-b border-line bg-sand">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={item.url}
                  alt={item.alt}
                  loading="lazy"
                  className="absolute inset-0 size-full object-contain"
                />
              </div>
              <figcaption className="grid gap-2 p-3">
                <div className="flex flex-wrap items-center gap-1.5">
                  <Badge variant="soft" size="sm">
                    {item.category}
                  </Badge>
                  {item.caption ? (
                    <span className="line-clamp-1 text-xs font-semibold text-ink-soft">
                      {item.caption}
                    </span>
                  ) : null}
                </div>
                <p className="line-clamp-2 text-xs text-ink-soft" title={item.alt}>
                  {item.alt}
                </p>
                <span className="text-xs font-semibold text-ink-soft">
                  {formatDate(item.createdAt, {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                  })}
                </span>
                <div className="flex flex-wrap items-center gap-2">
                  <AsyncButton
                    variant="outline"
                    size="icon-sm"
                    aria-label="Move up"
                    title="Move up"
                    disabled={index === 0}
                    onAction={() => moveGalleryItemAction(item.id, "up")}
                  >
                    <ArrowUp aria-hidden="true" className="size-4" />
                  </AsyncButton>
                  <AsyncButton
                    variant="outline"
                    size="icon-sm"
                    aria-label="Move down"
                    title="Move down"
                    disabled={index === items.length - 1}
                    onAction={() => moveGalleryItemAction(item.id, "down")}
                  >
                    <ArrowDown aria-hidden="true" className="size-4" />
                  </AsyncButton>
                  <Button
                    type="button"
                    variant="soft"
                    size="sm"
                    onClick={() => setEditing(item)}
                  >
                    <Pencil aria-hidden="true" className="size-3.5" />
                    Edit
                  </Button>
                  <ConfirmDeleteButton
                    onAction={() => deleteGalleryItemAction(item.id)}
                    confirmTitle="Delete this gallery item?"
                    confirmDescription="The image is removed from the gallery. The uploaded file itself stays in Media."
                  />
                </div>
              </figcaption>
            </figure>
          ))}
        </div>
      )}

      <GalleryItemDialog
        item={editing}
        destinations={destinations}
        onOpenChange={(open) => {
          if (!open) setEditing(null);
        }}
      />
    </div>
  );
}

function GalleryUploadForm({
  destinations,
}: {
  destinations: GalleryDestinationOption[];
}) {
  const router = useRouter();
  const [file, setFile] = React.useState<File | null>(null);
  const [alt, setAlt] = React.useState("");
  const [category, setCategory] = React.useState("General");
  const [caption, setCaption] = React.useState("");
  const [destinationId, setDestinationId] = React.useState("");
  const [pending, startTransition] = React.useTransition();
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!file) {
      toast.error("Choose an image to upload.");
      return;
    }
    const formData = new FormData();
    formData.set("file", file);
    formData.set("alt", alt);
    formData.set("category", category);
    formData.set("caption", caption);
    formData.set("destinationId", destinationId === NO_DESTINATION ? "" : destinationId);

    startTransition(async () => {
      const result = await uploadGalleryItemAction(formData);
      if (result.ok) {
        toast.success(result.message);
        setFile(null);
        setAlt("");
        setCategory("General");
        setCaption("");
        setDestinationId("");
        if (fileInputRef.current) fileInputRef.current.value = "";
        router.refresh();
      } else {
        toast.error(result.error);
      }
    });
  }

  return (
    <form
      onSubmit={onSubmit}
      className="grid gap-4 border border-line bg-paper p-4 shadow-hard sm:p-5"
    >
      <h2 className="font-display text-lg uppercase">Upload image</h2>
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="grid gap-1.5 sm:col-span-2">
          <Label htmlFor="gallery-file">Image file</Label>
          <input
            id="gallery-file"
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp,image/svg+xml"
            onChange={(event) => setFile(event.target.files?.[0] ?? null)}
            className="h-12 w-full border border-line bg-paper px-3 py-2 text-sm font-medium file:mr-3 file:h-full file:border-0 file:border-r file:border-line file:bg-butter file:px-4 file:text-xs file:font-bold file:uppercase"
          />
          <p className="text-xs font-semibold text-ink-soft">
            JPG, PNG, WEBP or SVG — max 4MB. Alt text is required.
          </p>
        </div>
        <div className="grid gap-1.5">
          <Label htmlFor="gallery-alt">Alt text</Label>
          <Input
            id="gallery-alt"
            value={alt}
            onChange={(event) => setAlt(event.target.value)}
            placeholder="Describe the image for screen readers"
          />
        </div>
        <div className="grid gap-1.5">
          <Label htmlFor="gallery-category">Category</Label>
          <Input
            id="gallery-category"
            list="gallery-category-suggestions"
            value={category}
            onChange={(event) => setCategory(event.target.value)}
            placeholder="General"
          />
          <CategoryDatalist id="gallery-category-suggestions" />
        </div>
        <div className="grid gap-1.5">
          <Label htmlFor="gallery-caption">Caption</Label>
          <Input
            id="gallery-caption"
            value={caption}
            onChange={(event) => setCaption(event.target.value)}
            placeholder="Optional caption"
          />
        </div>
        <div className="grid gap-1.5">
          <Label htmlFor="gallery-destination">Destination</Label>
          <Select
            value={destinationId || NO_DESTINATION}
            onValueChange={(value) =>
              setDestinationId(value === NO_DESTINATION ? "" : value)
            }
          >
            <SelectTrigger id="gallery-destination">
              <SelectValue placeholder="Pick a destination" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={NO_DESTINATION}>No destination</SelectItem>
              {destinations.map((destination) => (
                <SelectItem key={destination.id} value={destination.id}>
                  {destination.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
      <div>
        <Button type="submit" loading={pending}>
          {pending ? (
            <>
              <LoaderCircle aria-hidden="true" className="size-4" />
              Uploading
            </>
          ) : (
            <>
              <Upload aria-hidden="true" className="size-4" />
              Upload
            </>
          )}
        </Button>
      </div>
    </form>
  );
}

function GalleryAddForm({
  destinations,
}: {
  destinations: GalleryDestinationOption[];
}) {
  const router = useRouter();
  const form = useForm<GalleryItemCreateInput>({
    resolver: zodResolver(galleryItemCreateSchema),
    defaultValues: createEmptyValues,
    mode: "onBlur",
  });
  const { formState } = form;

  async function onSubmit(values: GalleryItemCreateInput) {
    const result = await createGalleryItemAction(values);
    if (result.ok) {
      toast.success(result.message);
      form.reset(createEmptyValues);
      router.refresh();
    } else {
      toast.error(result.error);
      if (result.fieldErrors) {
        for (const [field, messages] of Object.entries(result.fieldErrors)) {
          if (messages?.[0]) {
            form.setError(field as keyof GalleryItemCreateInput, {
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
        className="grid gap-4 border border-line bg-paper p-4 shadow-hard sm:p-5"
      >
        <h2 className="font-display text-lg uppercase">Add by URL</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <FormField
            control={form.control}
            name="url"
            render={({ field }) => (
              <FormItem className="sm:col-span-2">
                <FormLabel required>Image URL</FormLabel>
                <FormControl>
                  <Input placeholder="/uploads/image.jpg or https://…" {...field} value={asStr(field.value)} />
                </FormControl>
                <FormDescription>
                  Upload via Media (or the panel on the left), then paste the URL.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="alt"
            render={({ field }) => (
              <FormItem>
                <FormLabel required>Alt text</FormLabel>
                <FormControl>
                  <Input placeholder="Describe the image for screen readers" {...field} value={asStr(field.value)} />
                </FormControl>
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
                  <Input
                    list="gallery-add-category-suggestions"
                    placeholder="General"
                    {...field}
                    value={asStr(field.value)}
                  />
                </FormControl>
                <CategoryDatalist id="gallery-add-category-suggestions" />
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="caption"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Caption</FormLabel>
                <FormControl>
                  <Input placeholder="Optional caption" {...field} value={asStr(field.value)} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="destinationId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Destination</FormLabel>
                <Select
                  value={asStr(field.value) || NO_DESTINATION}
                  onValueChange={(value) =>
                    field.onChange(value === NO_DESTINATION ? "" : value)
                  }
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Pick a destination" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value={NO_DESTINATION}>No destination</SelectItem>
                    {destinations.map((destination) => (
                      <SelectItem key={destination.id} value={destination.id}>
                        {destination.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <div>
          <Button type="submit" loading={formState.isSubmitting}>
            {formState.isSubmitting ? (
              <>
                <LoaderCircle aria-hidden="true" className="size-4" />
                Adding
              </>
            ) : (
              <>
                <Plus aria-hidden="true" className="size-4" />
                Add to gallery
              </>
            )}
          </Button>
        </div>
      </form>
    </FormProvider>
  );
}

function GalleryItemDialog({
  item,
  destinations,
  onOpenChange,
}: {
  item: GalleryItemRow | null;
  destinations: GalleryDestinationOption[];
  onOpenChange: (open: boolean) => void;
}) {
  const router = useRouter();
  const form = useForm<GalleryItemUpdateInput>({
    resolver: zodResolver(galleryItemUpdateSchema),
    defaultValues: { ...createEmptyValues, id: "" },
    mode: "onBlur",
  });

  React.useEffect(() => {
    if (item) {
      form.reset({
        id: item.id,
        url: item.url,
        alt: item.alt,
        category: item.category,
        caption: item.caption ?? "",
        destinationId: item.destinationId ?? "",
      });
    }
  }, [item, form]);

  const { formState } = form;

  async function onSubmit(values: GalleryItemUpdateInput) {
    const result = await updateGalleryItemAction(values);
    if (result.ok) {
      toast.success(result.message);
      onOpenChange(false);
      router.refresh();
    } else {
      toast.error(result.error);
      if (result.fieldErrors) {
        for (const [field, messages] of Object.entries(result.fieldErrors)) {
          if (messages?.[0]) {
            form.setError(field as keyof GalleryItemUpdateInput, {
              message: messages[0],
            });
          }
        }
      }
    }
  }

  return (
    <Dialog open={Boolean(item)} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Edit gallery item</DialogTitle>
          <DialogDescription>
            Alt text is required — it is used by screen readers and as the image
            fallback.
          </DialogDescription>
        </DialogHeader>
        <FormProvider {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} noValidate>
            <DialogBody className="grid gap-4">
              <FormField
                control={form.control}
                name="url"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel required>Image URL</FormLabel>
                    <FormControl>
                      <Input placeholder="/uploads/…" {...field} value={asStr(field.value)} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="alt"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel required>Alt text</FormLabel>
                    <FormControl>
                      <Input placeholder="Describe the image for screen readers" {...field} value={asStr(field.value)} />
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
                        <Input
                          list="gallery-edit-category-suggestions"
                          placeholder="General"
                          {...field}
                          value={asStr(field.value)}
                        />
                      </FormControl>
                      <CategoryDatalist id="gallery-edit-category-suggestions" />
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="caption"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Caption</FormLabel>
                      <FormControl>
                        <Input placeholder="Optional caption" {...field} value={asStr(field.value)} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <FormField
                control={form.control}
                name="destinationId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Destination</FormLabel>
                    <Select
                      value={asStr(field.value) || NO_DESTINATION}
                      onValueChange={(value) =>
                        field.onChange(value === NO_DESTINATION ? "" : value)
                      }
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Pick a destination" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value={NO_DESTINATION}>No destination</SelectItem>
                        {destinations.map((destination) => (
                          <SelectItem key={destination.id} value={destination.id}>
                            {destination.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </DialogBody>
            <DialogFooter>
              <DialogClose asChild>
                <Button type="button" variant="outline">
                  <ChevronLeft aria-hidden="true" className="size-4" />
                  Cancel
                </Button>
              </DialogClose>
              <Button type="submit" loading={formState.isSubmitting}>
                {formState.isSubmitting ? (
                  <>
                    <LoaderCircle aria-hidden="true" className="size-4" />
                    Saving
                  </>
                ) : (
                  <>
                    <Save aria-hidden="true" className="size-4" />
                    Save changes
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
