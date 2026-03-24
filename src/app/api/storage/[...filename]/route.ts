import { NextRequest, NextResponse } from "next/server";

import { requireAdmin } from "@/lib/api-auth";
import { bucket } from "@/lib/gcs";
import { isImageOrVideo, isTenantOwnedPath, publicUrlForPath } from "@/lib/storage-utils";

type Params = Promise<{ filename: string[] }>;

function resolvePath(parts: string[] | undefined) {
  if (!parts || !parts.length) return "";
  return parts.join("/");
}

export async function GET(_req: NextRequest, { params }: { params: Params }) {
  const auth = await requireAdmin();
  if (auth.error) return auth.error;

  try {
    const { filename } = await params;
    const filePath = resolvePath(filename);

    if (!filePath || !isTenantOwnedPath(filePath, auth.payload.slug)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const gcsFile = bucket.file(filePath);
    const [exists] = await gcsFile.exists();

    if (!exists) {
      return NextResponse.json({ error: "File not found" }, { status: 404 });
    }

    const [metadata] = await gcsFile.getMetadata();

    return NextResponse.json({
      file: {
        name: filePath,
        fileName: filePath.split("/").pop() || filePath,
        contentType: metadata.contentType || "",
        size: Number(metadata.size || 0),
        updated: metadata.updated || null,
        url: publicUrlForPath(filePath),
      },
    });
  } catch {
    return NextResponse.json({ error: "Failed to fetch file" }, { status: 500 });
  }
}

export async function PUT(req: NextRequest, { params }: { params: Params }) {
  const auth = await requireAdmin();
  if (auth.error) return auth.error;

  try {
    const { filename } = await params;
    const filePath = resolvePath(filename);

    if (!filePath || !isTenantOwnedPath(filePath, auth.payload.slug)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const formData = await req.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
    }

    if (!isImageOrVideo(file.type)) {
      return NextResponse.json({ error: "Only image and video uploads are allowed" }, { status: 400 });
    }

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
      message: "File updated successfully",
      file: {
        name: filePath,
        fileName: filePath.split("/").pop() || filePath,
        contentType: file.type,
        size: file.size,
        url: publicUrlForPath(filePath),
      },
    });
  } catch {
    return NextResponse.json({ error: "Failed to update file" }, { status: 500 });
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: Params }) {
  const auth = await requireAdmin();
  if (auth.error) return auth.error;

  try {
    const { filename } = await params;
    const filePath = resolvePath(filename);

    if (!filePath || !isTenantOwnedPath(filePath, auth.payload.slug)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const gcsFile = bucket.file(filePath);

    const [exists] = await gcsFile.exists();
    if (!exists) {
      return NextResponse.json({ error: "File not found" }, { status: 404 });
    }

    await gcsFile.delete();

    return NextResponse.json({
      message: "File deleted successfully",
      name: filePath,
    });
  } catch {
    return NextResponse.json({ error: "Failed to delete file" }, { status: 500 });
  }
}
