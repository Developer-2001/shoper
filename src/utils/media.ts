const VIDEO_EXTENSIONS = [".mp4", ".webm", ".ogg", ".mov", ".m4v", ".avi", ".mkv"];

export function isVideoUrl(url: string) {
  const cleanUrl = url.toLowerCase().split("?")[0];
  return VIDEO_EXTENSIONS.some((ext) => cleanUrl.endsWith(ext));
}

export function extractStorageObjectPath(url: string) {
  try {
    const parsed = new URL(url);
    if (!parsed.hostname.includes("storage.googleapis.com")) return null;

    const pathname = parsed.pathname.replace(/^\/+/, "");
    const parts = pathname.split("/").filter(Boolean);

    if (parts.length < 2) return null;

    return parts.slice(1).join("/");
  } catch {
    return null;
  }
}

export function encodeStorageObjectPath(path: string) {
  return path
    .split("/")
    .filter(Boolean)
    .map((segment) => encodeURIComponent(segment))
    .join("/");
}
