import path from "node:path";

import { bucket } from "@/lib/gcs";

const IMAGE_VIDEO_MIME = ["image/", "video/"];

export function isImageOrVideo(mimeType: string) {
  return IMAGE_VIDEO_MIME.some((prefix) => mimeType.startsWith(prefix));
}

export function sanitizeFilename(fileName: string) {
  const ext = path.extname(fileName).toLowerCase();
  const base = path.basename(fileName, ext).toLowerCase().replace(/[^a-z0-9-]+/g, "-").replace(/^-+|-+$/g, "");
  return `${base || "file"}-${Date.now()}${ext || ""}`;
}

export function normalizeFolder(folder: string | null | undefined) {
  const raw = (folder || "general").trim().toLowerCase();
  return raw.replace(/[^a-z0-9/-]+/g, "-").replace(/^\/+|\/+$/g, "") || "general";
}

export function buildTenantFilePath(slug: string, folder: string | null | undefined, originalName: string) {
  const normalizedFolder = normalizeFolder(folder);
  const name = sanitizeFilename(originalName);
  return `${slug}/${normalizedFolder}/${name}`;
}

export function publicUrlForPath(filePath: string) {
  return `https://storage.googleapis.com/${bucket.name}/${filePath}`;
}

export function isTenantOwnedPath(filePath: string, slug: string) {
  return filePath === slug || filePath.startsWith(`${slug}/`);
}

export function extractFilePathFromUrl(url: string) {
  try {
    const parsed = new URL(url);
    if (!parsed.hostname.includes("storage.googleapis.com")) return null;

    const pathname = parsed.pathname.replace(/^\/+/, "");
    const bucketPrefix = `${bucket.name}/`;

    if (!pathname.startsWith(bucketPrefix)) {
      return null;
    }

    return pathname.slice(bucketPrefix.length);
  } catch {
    return null;
  }
}
