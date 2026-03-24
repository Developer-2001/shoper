import { NextRequest, NextResponse } from "next/server";

import { requireAdmin } from "@/lib/api-auth";
import { bucket } from "@/lib/gcs";
import {
  buildTenantFilePath,
  isImageOrVideo,
  normalizeFolder,
  publicUrlForPath,
} from "@/lib/storage-utils";

export async function GET(req: NextRequest) {
  const auth = await requireAdmin();
  if (auth.error) return auth.error;

  try {
    const folder = req.nextUrl.searchParams.get("folder");
    const normalizedFolder = folder ? `${normalizeFolder(folder)}/` : "";
    const prefix = `${auth.payload.slug}/${normalizedFolder}`;

    const [files] = await bucket.getFiles({ prefix });

    const fileList = files
      .filter((file) => !file.name.endsWith("/"))
      .map((file) => ({
        name: file.name,
        fileName: file.name.split("/").pop() || file.name,
        contentType: file.metadata.contentType || "",
        size: Number(file.metadata.size || 0),
        updated: file.metadata.updated || null,
        url: publicUrlForPath(file.name),
      }));

    return NextResponse.json({ files: fileList });
  } catch {
    return NextResponse.json({ error: "Failed to list files" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const auth = await requireAdmin();
  if (auth.error) return auth.error;

  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    const folder = formData.get("folder")?.toString();

    if (!file) {
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
    }

    if (!isImageOrVideo(file.type)) {
      return NextResponse.json({ error: "Only image and video uploads are allowed" }, { status: 400 });
    }

    const filePath = buildTenantFilePath(auth.payload.slug, folder, file.name);
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
      message: "File uploaded successfully",
      file: {
        name: filePath,
        fileName: filePath.split("/").pop() || filePath,
        contentType: file.type,
        size: file.size,
        url: publicUrlForPath(filePath),
      },
    });
  } catch {
    return NextResponse.json({ error: "Failed to upload file" }, { status: 500 });
  }
}
