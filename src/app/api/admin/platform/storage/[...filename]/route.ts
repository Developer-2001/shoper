import { NextRequest, NextResponse } from "next/server";

import { requirePlatformAdmin } from "@/lib/api-auth";
import { bucket } from "@/lib/gcs";
import { connectToDatabase } from "@/lib/mongodb";
import { Store } from "@/models/Store";

type Params = Promise<{ filename: string[] }>;

const PLATFORM_THEME_IMAGE_FOLDER = "themeimages";
const STORE_SLUG_PATTERN = /^[a-z0-9-]+$/;

function resolvePath(parts: string[] | undefined) {
  if (!parts || !parts.length) return "";
  return parts.join("/");
}

function parseThemeImagePath(filePath: string) {
  const segments = filePath.split("/").filter(Boolean);
  if (segments.length < 3) return null;

  const [slug, folder] = segments;
  if (!slug || !STORE_SLUG_PATTERN.test(slug)) return null;
  if (folder !== PLATFORM_THEME_IMAGE_FOLDER) return null;

  return { slug };
}

export async function DELETE(_req: NextRequest, { params }: { params: Params }) {
  const auth = await requirePlatformAdmin();
  if (auth.error) return auth.error;

  await connectToDatabase();

  try {
    const { filename } = await params;
    const filePath = resolvePath(filename);
    const parsedPath = parseThemeImagePath(filePath);

    if (!parsedPath) {
      return NextResponse.json({ error: "Invalid platform image path" }, { status: 400 });
    }

    const store = await Store.findOne({ slug: parsedPath.slug }).select("_id slug").lean();
    if (!store) {
      return NextResponse.json({ error: "Store not found" }, { status: 404 });
    }

    const gcsFile = bucket.file(filePath);
    const [exists] = await gcsFile.exists();

    if (!exists) {
      return NextResponse.json({ error: "Image not found" }, { status: 404 });
    }

    await gcsFile.delete();

    return NextResponse.json({
      message: "Image deleted successfully",
      name: filePath,
    });
  } catch {
    return NextResponse.json({ error: "Failed to delete image" }, { status: 500 });
  }
}
