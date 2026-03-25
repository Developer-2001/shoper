import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { requireAdmin } from "@/lib/api-auth";
import { Prompt } from "@/models/Prompt";

export async function GET() {
  await connectToDatabase();

  const auth = await requireAdmin();
  if (auth.error) return auth.error;

  // Fetch prompts for the current store, sorted by favorite (primary) and latest (secondary)
  const prompts = await Prompt.find({ storeId: auth.payload.storeId })
    .sort({ favorite: -1, createdAt: -1 })
    .limit(50)
    .lean();

  return NextResponse.json({ prompts });
}

export async function POST(request: Request) {
  await connectToDatabase();

  const auth = await requireAdmin();
  if (auth.error) return auth.error;

  const body = await request.json();
  const { promptText, promptLabel, favorite } = body;

  if (!promptText) {
    return NextResponse.json({ error: "Prompt text is required" }, { status: 400 });
  }

  // Find if exact prompt text already exists for this store
  // If so, update it (bump createdAt/updatedAt and sync favorite/label)
  const existing = await Prompt.findOne({ storeId: auth.payload.storeId, promptText });

  if (existing) {
    existing.promptLabel = promptLabel || existing.promptLabel;
    existing.favorite = favorite !== undefined ? favorite : existing.favorite;
    // Force update timestamp
    existing.updatedAt = new Date();
    await existing.save();
    return NextResponse.json({ prompt: existing });
  }

  const prompt = await Prompt.create({
    storeId: auth.payload.storeId,
    promptText,
    promptLabel: promptLabel || "",
    favorite: !!favorite,
  });

  return NextResponse.json({ prompt }, { status: 201 });
}

// Added PATCH for toggling individual favorites
export async function PATCH(request: Request) {
  await connectToDatabase();

  const auth = await requireAdmin();
  if (auth.error) return auth.error;

  const body = await request.json();
  const { id, favorite } = body;

  if (!id) {
    return NextResponse.json({ error: "Prompt ID is required" }, { status: 400 });
  }

  const prompt = await Prompt.findOneAndUpdate(
    { _id: id, storeId: auth.payload.storeId },
    { favorite },
    { new: true }
  );

  if (!prompt) {
    return NextResponse.json({ error: "Prompt not found" }, { status: 404 });
  }

  return NextResponse.json({ prompt });
}
