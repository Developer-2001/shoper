import { NextRequest, NextResponse } from "next/server";

import { requirePlatformAdmin } from "@/lib/api-auth";
import { bucket } from "@/lib/gcs";
import { connectToDatabase } from "@/lib/mongodb";
import { buildTenantFilePath, publicUrlForPath } from "@/lib/storage-utils";
import { Store } from "@/models/Store";

const PLATFORM_THEME_IMAGE_FOLDER = "themeimages";
const STORE_SLUG_PATTERN = /^[a-z0-9-]+$/;

function parseSlug(raw: string | null | undefined) {
  const slug = (raw || "").trim().toLowerCase();
  if (!slug || !STORE_SLUG_PATTERN.test(slug)) return null;
  return slug;
}

export async function GET(request: NextRequest) {
  const auth = await requirePlatformAdmin();
  if (auth.error) return auth.error;

  await connectToDatabase();

  const slug = parseSlug(request.nextUrl.searchParams.get("slug"));
  if (!slug) {
    return NextResponse.json({ error: "Valid slug is required" }, { status: 400 });
  }

  const store = await Store.findOne({ slug }).select("_id slug").lean();
  if (!store) {
    return NextResponse.json({ error: "Store not found" }, { status: 404 });
  }

  try {
    const prefix = `${slug}/${PLATFORM_THEME_IMAGE_FOLDER}/`;
    const [files] = await bucket.getFiles({ prefix });

    const fileList = files
      .filter((file) => !file.name.endsWith("/"))
      .filter((file) => (file.metadata.contentType || "").startsWith("image/"))
      .map((file) => ({
        name: file.name,
        fileName: file.name.split("/").pop() || file.name,
        contentType: file.metadata.contentType || "",
        size: Number(file.metadata.size || 0),
        updated: file.metadata.updated || null,
        url: publicUrlForPath(file.name),
      }))
      .sort((a, b) => {
        const aTime = a.updated ? new Date(a.updated).getTime() : 0;
        const bTime = b.updated ? new Date(b.updated).getTime() : 0;
        return bTime - aTime;
      });

    return NextResponse.json({ files: fileList });
  } catch {
    return NextResponse.json({ error: "Failed to list images" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const auth = await requirePlatformAdmin();
  if (auth.error) return auth.error;

  await connectToDatabase();

  try {
    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    const slug = parseSlug(formData.get("slug")?.toString());

    if (!slug) {
      return NextResponse.json({ error: "Valid slug is required" }, { status: 400 });
    }

    const store = await Store.findOne({ slug }).select("_id slug").lean();
    if (!store) {
      return NextResponse.json({ error: "Store not found" }, { status: 404 });
    }

    if (!file) {
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
    }

    if (!file.type.startsWith("image/")) {
      return NextResponse.json({ error: "Only image uploads are allowed" }, { status: 400 });
    }

    const filePath = buildTenantFilePath(slug, PLATFORM_THEME_IMAGE_FOLDER, file.name);
    const buffer = Buffer.from(await file.arrayBuffer());
    const gcsFile = bucket.file(filePath);

    await gcsFile.save(buffer, {
      contentType: file.type,
      metadata: {
        cacheControl: "public, max-age=31536000",
      },
      resumable: false,
    });

    return NextResponse.json({
      message: "Image uploaded successfully",
      file: {
        name: filePath,
        fileName: filePath.split("/").pop() || filePath,
        contentType: file.type,
        size: file.size,
        url: publicUrlForPath(filePath),
      },
    });
  } catch {
    return NextResponse.json({ error: "Failed to upload image" }, { status: 500 });
  }
}
