import { NextRequest, NextResponse } from "next/server";
import { requireAnyAdmin } from "@/lib/api-auth";
import { GoogleGenerativeAI } from "@google/generative-ai";

const DESCRIPTION_MODEL = process.env.GEMINI_DESCRIPTION_MODEL?.trim();
if (!DESCRIPTION_MODEL) {
  throw new Error("GEMINI_DESCRIPTION_MODEL environment variable is not set");
}

const apiKey = process.env.GEMINI_API_KEY;
if (!apiKey) {
  throw new Error("GEMINI_API_KEY environment variable is not set");
}
function getErrorMessage(error: unknown) {
  if (error instanceof Error) return error.message;
  if (typeof error === "string") return error;

  try {
    return JSON.stringify(error);
  } catch {
    return "Unknown Gemini error";
  }
}

function buildDescriptionPrompt(name: string) {
  return `Generate a short ecommerce product description between 50 and 60 characters.
Product name: ${name}
Analyze the provided product image.
Return only the final description text with no quotes, labels, or character count.`;
}

export async function POST(req: NextRequest) {
  try {
    const auth = await requireAnyAdmin();
    if (auth.error) return auth.error;

    const { name, image, mimeType } = await req.json();
    if (!name?.trim()) {
      return NextResponse.json(
        { error: "Product name is required" },
        { status: 400 },
      );
    }

    if (!image) {
      return NextResponse.json({ error: "Image is required" }, { status: 400 });
    }

    const resolvedMimeType = mimeType || "image/jpeg";
    if (!resolvedMimeType.startsWith("image/")) {
      return NextResponse.json(
        { error: "Only image files are supported" },
        { status: 400 },
      );
    }

    const base64Data = image.split(",")[1] || image;
    const genAI = new GoogleGenerativeAI(String(apiKey));
    const model = genAI.getGenerativeModel({
      model: String(DESCRIPTION_MODEL),
    });
    const result = await model.generateContent([
      { text: buildDescriptionPrompt(name.trim()) },
      {
        inlineData: {
          data: base64Data,
          mimeType: resolvedMimeType,
        },
      },
    ]);

    const response = await result.response;
    const text = response.text().trim();

    return NextResponse.json({ description: text, model: DESCRIPTION_MODEL });
  } catch (error) {
    const errorMessage = getErrorMessage(error);
    console.error("Gemini description error:", error);

    if (
      errorMessage.includes("404") ||
      errorMessage.toLowerCase().includes("not found")
    ) {
      return NextResponse.json(
        {
          error: "Description model not found",
          details: `Model "${DESCRIPTION_MODEL}" is unavailable for the configured Gemini API key.`,
        },
        { status: 404 },
      );
    }

    return NextResponse.json(
      { error: "Generation failed", details: errorMessage },
      { status: 500 },
    );
  }
}
