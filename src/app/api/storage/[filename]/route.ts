import { NextRequest, NextResponse } from "next/server";
import { bucket } from "@/lib/gcs";

type Params = Promise<{ filename: string }>;

export async function PUT(req: NextRequest, { params }: { params: Params }) {
  try {
    const { filename } = await params;
    const formData = await req.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const gcsFile = bucket.file(filename);

    // Overwrite the file with new content
    await gcsFile.save(buffer, {
      contentType: file.type,
      metadata: {
        cacheControl: "public, max-age=31536000",
      },
    });

    return NextResponse.json({
      message: "File updated successfully",
      name: filename,
      url: `https://storage.googleapis.com/${bucket.name}/${filename}`,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Params }) {
  try {
    const { filename } = await params;
    const gcsFile = bucket.file(filename);

    const [exists] = await gcsFile.exists();
    if (!exists) {
      return NextResponse.json({ error: "File not found" }, { status: 404 });
    }

    await gcsFile.delete();

    return NextResponse.json({
      message: "File deleted successfully",
      name: filename,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
