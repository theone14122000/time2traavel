import "server-only";
import { createHash } from "node:crypto";
import { promises as fs } from "node:fs";
import path from "node:path";
import { prisma } from "@/lib/prisma";
import { slugify } from "@/lib/utils";
import { isUniqueViolation } from "@/actions/admin/shared";

const MAX_UPLOAD_BYTES = 4 * 1024 * 1024; // 4 MB
const CLOUDINARY_FOLDER = "time2travel";

/** MIME type → extension. Anything else is rejected. */
const ALLOWED_TYPES: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/svg+xml": "svg",
};

export type StoredUpload =
  | { ok: true; url: string; filename: string; provider: "LOCAL" | "CLOUDINARY" }
  | { ok: false; error: string };

type CloudinaryConfig = { cloudName: string; apiKey: string; apiSecret: string };

/** Cloudinary is used only when all three server-side credentials exist. */
function cloudinaryConfig(): CloudinaryConfig | null {
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME?.trim();
  const apiKey = process.env.CLOUDINARY_API_KEY?.trim();
  const apiSecret = process.env.CLOUDINARY_API_SECRET?.trim();
  return cloudName && apiKey && apiSecret ? { cloudName, apiKey, apiSecret } : null;
}

/** Cloudinary signature: sha1 of the sorted `k=v&…` params followed by the secret. */
function sign(params: Record<string, string | number>, secret: string): string {
  const toSign = Object.keys(params)
    .sort()
    .map((key) => `${key}=${params[key]}`)
    .join("&");
  return createHash("sha1").update(toSign + secret).digest("hex");
}

function uploadsDir() {
  return path.join(process.cwd(), "public", "uploads");
}

async function uploadToCloudinary(
  config: CloudinaryConfig,
  file: File,
  filename: string,
): Promise<{ url: string; publicId: string } | { error: string }> {
  const timestamp = Math.floor(Date.now() / 1000);
  const publicId = filename.replace(/\.[^.]+$/, "");
  const signed = { folder: CLOUDINARY_FOLDER, public_id: publicId, timestamp };

  const body = new FormData();
  body.set("file", file);
  body.set("api_key", config.apiKey);
  body.set("timestamp", String(timestamp));
  body.set("folder", CLOUDINARY_FOLDER);
  body.set("public_id", publicId);
  body.set("signature", sign(signed, config.apiSecret));

  try {
    const response = await fetch(
      `https://api.cloudinary.com/v1_1/${config.cloudName}/image/upload`,
      { method: "POST", body },
    );
    const json = (await response.json().catch(() => null)) as {
      secure_url?: string;
      public_id?: string;
      error?: { message?: string };
    } | null;
    if (!response.ok || !json?.secure_url || !json.public_id) {
      console.error("[uploads] cloudinary rejected upload:", json?.error?.message ?? response.status);
      return { error: "The image host rejected the upload. Please try again." };
    }
    return { url: json.secure_url, publicId: json.public_id };
  } catch (error) {
    console.error("[uploads] cloudinary request failed:", error);
    return { error: "We couldn't reach the image host. Please try again." };
  }
}

/**
 * Validates, stores (Cloudinary when configured, else local /public/uploads)
 * and registers an image as a MediaAsset. Returns the public URL to save on
 * whatever record references the image.
 */
export async function storeUpload(
  file: unknown,
  meta: { alt?: string; region?: string },
): Promise<StoredUpload> {
  if (!(file instanceof File) || file.size === 0) {
    return { ok: false, error: "Choose an image to upload." };
  }
  if (file.size > MAX_UPLOAD_BYTES) {
    return { ok: false, error: "Image is too large — the limit is 4MB." };
  }
  const extension = ALLOWED_TYPES[file.type];
  if (!extension) {
    return { ok: false, error: "Only JPG, PNG, WEBP and SVG images are allowed." };
  }

  const originalBase = slugify(file.name.replace(/\.[^.]+$/, "")) || "image";
  const filename = `${originalBase}-${Date.now()}.${extension}`;
  const alt = meta.alt?.trim() || originalBase.replace(/-/g, " ");
  const region = meta.region?.trim() || "UNASSIGNED";

  let url: string;
  let publicId: string;
  let provider: "LOCAL" | "CLOUDINARY";
  let localPath: string | null = null;

  const cloud = cloudinaryConfig();
  if (cloud) {
    const uploaded = await uploadToCloudinary(cloud, file, filename);
    if ("error" in uploaded) return { ok: false, error: uploaded.error };
    ({ url, publicId } = uploaded);
    provider = "CLOUDINARY";
  } else {
    localPath = path.join(uploadsDir(), filename);
    try {
      await fs.mkdir(uploadsDir(), { recursive: true });
      await fs.writeFile(localPath, Buffer.from(await file.arrayBuffer()));
    } catch (error) {
      console.error("[uploads] file write failed:", error);
      return { ok: false, error: "We couldn't save the file. Please try again." };
    }
    url = `/uploads/${filename}`;
    publicId = filename;
    provider = "LOCAL";
  }

  try {
    await prisma.mediaAsset.create({ data: { url, alt, region, provider, publicId } });
  } catch (error) {
    if (localPath) await fs.unlink(localPath).catch(() => undefined);
    if (provider === "CLOUDINARY" && cloud) await destroyCloudinary(cloud, publicId);
    if (isUniqueViolation(error)) {
      return { ok: false, error: "A file with that name already exists — try again." };
    }
    console.error("[uploads] db write failed:", error);
    return { ok: false, error: "We couldn't register the upload. Please try again." };
  }

  return { ok: true, url, filename, provider };
}

async function destroyCloudinary(config: CloudinaryConfig, publicId: string): Promise<void> {
  const timestamp = Math.floor(Date.now() / 1000);
  const body = new FormData();
  body.set("public_id", publicId);
  body.set("api_key", config.apiKey);
  body.set("timestamp", String(timestamp));
  body.set("signature", sign({ public_id: publicId, timestamp }, config.apiSecret));
  await fetch(`https://api.cloudinary.com/v1_1/${config.cloudName}/image/destroy`, {
    method: "POST",
    body,
  }).catch((error) => console.error("[uploads] cloudinary destroy failed:", error));
}

/** Best-effort removal of the stored file behind a MediaAsset row. */
export async function removeStoredFile(asset: {
  provider: "LOCAL" | "CLOUDINARY";
  url: string;
  publicId: string | null;
}): Promise<void> {
  if (asset.provider === "CLOUDINARY") {
    const cloud = cloudinaryConfig();
    if (cloud && asset.publicId) await destroyCloudinary(cloud, asset.publicId);
    return;
  }
  if (asset.url.startsWith("/uploads/")) {
    await fs.unlink(path.join(uploadsDir(), path.basename(asset.url))).catch(() => undefined);
  }
}
