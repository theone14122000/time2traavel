"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Copy, LoaderCircle, Upload } from "lucide-react";
import { deleteMediaAction, uploadMediaAction } from "@/actions/admin/media";
import { formatDate } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ConfirmDeleteButton } from "@/components/admin/confirm-delete-button";

export type MediaRow = {
  id: string;
  url: string;
  alt: string;
  provider: "LOCAL" | "CLOUDINARY";
  createdAt: string;
};

export function MediaManager({ assets }: { assets: MediaRow[] }) {
  const router = useRouter();
  const [file, setFile] = React.useState<File | null>(null);
  const [alt, setAlt] = React.useState("");
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

    startTransition(async () => {
      const result = await uploadMediaAction(formData);
      if (result.ok) {
        toast.success(result.message);
        setFile(null);
        setAlt("");
        if (fileInputRef.current) fileInputRef.current.value = "";
        router.refresh();
      } else {
        toast.error(result.error);
      }
    });
  }

  async function copyUrl(url: string) {
    try {
      await navigator.clipboard.writeText(url);
      toast.success(`Copied ${url}`);
    } catch {
      toast.error("Couldn't copy — select the URL and copy manually.");
    }
  }

  return (
    <div className="grid gap-6">
      <form
        onSubmit={onSubmit}
        className="grid gap-4 border-[3px] border-ink bg-paper p-4 shadow-hard sm:p-5"
      >
        <h2 className="font-display text-lg uppercase">Upload image</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="grid gap-1.5">
            <Label htmlFor="media-file">Image file</Label>
            <input
              id="media-file"
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp,image/svg+xml"
              onChange={(event) => setFile(event.target.files?.[0] ?? null)}
              className="h-12 w-full border-[3px] border-ink bg-paper px-3 py-2 text-sm font-medium file:mr-3 file:h-full file:border-0 file:border-r-[3px] file:border-ink file:bg-butter file:px-4 file:text-xs file:font-bold file:uppercase"
            />
            <p className="text-xs font-semibold text-ink-soft">
              JPG, PNG, WEBP or SVG — max 4MB.
            </p>
          </div>
          <div className="grid gap-1.5">
            <Label htmlFor="media-alt">Alt text</Label>
            <Input
              id="media-alt"
              value={alt}
              onChange={(event) => setAlt(event.target.value)}
              placeholder="Describe the image for screen readers"
            />
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

      {assets.length === 0 ? (
        <p className="border-[3px] border-dashed border-ink bg-butter px-4 py-10 text-center text-sm font-bold uppercase">
          No uploads yet — images you upload appear here.
        </p>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {assets.map((asset) => (
            <figure
              key={asset.id}
              className="flex flex-col border-[3px] border-ink bg-paper shadow-hard"
            >
              <div className="relative aspect-[4/3] border-b-[3px] border-ink bg-sand">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={asset.url}
                  alt={asset.alt}
                  loading="lazy"
                  className="absolute inset-0 size-full object-contain"
                />
              </div>
              <figcaption className="grid gap-2 p-3">
                <p className="truncate text-sm font-bold" title={asset.url}>
                  {asset.url}
                </p>
                <p className="line-clamp-2 text-xs text-ink-soft">{asset.alt}</p>
                <div className="flex items-center justify-between gap-2">
                  <Badge variant="soft" size="sm">
                    {asset.provider}
                  </Badge>
                  <span className="text-[0.65rem] font-semibold text-ink-soft">
                    {formatDate(asset.createdAt, {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })}
                  </span>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Button
                    type="button"
                    variant="soft"
                    size="sm"
                    onClick={() => copyUrl(asset.url)}
                  >
                    <Copy aria-hidden="true" className="size-3.5" />
                    Copy URL
                  </Button>
                  <ConfirmDeleteButton
                    onAction={() => deleteMediaAction(asset.id)}
                    confirmTitle="Delete this image?"
                    confirmDescription={`${asset.url} is removed from disk and from the library.`}
                    label="Delete"
                  />
                </div>
              </figcaption>
            </figure>
          ))}
        </div>
      )}
    </div>
  );
}
