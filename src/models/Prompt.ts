import { model, models, Schema, type Types } from "mongoose";

export type PromptDocument = {
  _id: Types.ObjectId;
  storeId: Types.ObjectId;
  promptText: string;
  promptLabel?: string;
  favorite: boolean;
  createdAt: Date;
  updatedAt: Date;
};

const PromptSchema = new Schema<PromptDocument>(
  {
    storeId: { type: Schema.Types.ObjectId, ref: "Store", required: true, index: true },
    promptText: { type: String, required: true },
    promptLabel: { type: String, default: "" },
    favorite: { type: Boolean, default: false },
  },
  { timestamps: true }
);

// Index for quick lookup of unique prompts per store to avoid duplicates if needed
// Or just to speed up sorting by latest
PromptSchema.index({ storeId: 1, createdAt: -1 });

export const Prompt = models.Prompt || model<PromptDocument>("Prompt", PromptSchema);
