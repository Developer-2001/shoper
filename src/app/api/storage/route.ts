import { NextRequest, NextResponse } from "next/server";
import { bucket } from "@/lib/gcs";

export async function GET() {
  try {
    const [files] = await bucket.getFiles();
    const fileList = files.map((file) => ({
      name: file.name,
      metadata: file.metadata,
      publicUrl: `https://storage.googleapis.com/${bucket.name}/${file.name}`,
    }));
    return NextResponse.json({ files: fileList });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const gcsFile = bucket.file(file.name);

    await gcsFile.save(buffer, {
      contentType: file.type,
      metadata: {
        cacheControl: "public, max-age=31536000",
      },
    });

    const publicUrl = `https://storage.googleapis.com/${bucket.name}/${file.name}`;

    return NextResponse.json({
      message: "File uploaded successfully",
      name: file.name,
      url: publicUrl,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
