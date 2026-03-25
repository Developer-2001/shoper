import { createSlice, createAsyncThunk, type PayloadAction } from "@reduxjs/toolkit";

export interface AIPrompt {
  _id: string;
  promptText: string;
  promptLabel: string;
  favorite: boolean;
  createdAt: string;
}

interface PromptState {
  prompts: AIPrompt[];
  isLoading: boolean;
  error: string | null;
}

const initialState: PromptState = {
  prompts: [],
  isLoading: false,
  error: null,
};

export const fetchPrompts = createAsyncThunk("prompts/fetchAll", async () => {
  const response = await fetch("/api/admin/prompts");
  if (!response.ok) throw new Error("Failed to fetch prompts");
  const data = await response.json();
  return data.prompts as AIPrompt[];
});

export const savePrompt = createAsyncThunk(
  "prompts/save",
  async (prompt: { promptText: string; promptLabel?: string; favorite?: boolean }) => {
    const response = await fetch("/api/admin/prompts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(prompt),
    });
    if (!response.ok) throw new Error("Failed to save prompt");
    const data = await response.json();
    return data.prompt as AIPrompt;
  }
);

export const toggleFavorite = createAsyncThunk(
  "prompts/toggleFavorite",
  async ({ id, favorite }: { id: string; favorite: boolean }) => {
    const response = await fetch("/api/admin/prompts", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, favorite }),
    });
    if (!response.ok) throw new Error("Failed to toggle favorite");
    const data = await response.json();
    return data.prompt as AIPrompt;
  }
);

const promptSlice = createSlice({
  name: "prompts",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchPrompts.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(fetchPrompts.fulfilled, (state, action: PayloadAction<AIPrompt[]>) => {
        state.isLoading = false;
        state.prompts = action.payload;
      })
      .addCase(fetchPrompts.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message || "Failed to fetch prompts";
      })
      .addCase(savePrompt.fulfilled, (state, action: PayloadAction<AIPrompt>) => {
        // If it existing, update it, otherwise add to top
        const index = state.prompts.findIndex((p) => p._id === action.payload._id);
        if (index !== -1) {
          state.prompts[index] = action.payload;
        } else {
          state.prompts.unshift(action.payload);
        }
        // Resort after addition/update (latest/favorite first)
        state.prompts.sort((a, b) => {
          if (a.favorite && !b.favorite) return -1;
          if (!a.favorite && b.favorite) return 1;
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        });
      })
      .addCase(toggleFavorite.fulfilled, (state, action: PayloadAction<AIPrompt>) => {
        const index = state.prompts.findIndex((p) => p._id === action.payload._id);
        if (index !== -1) {
          state.prompts[index] = action.payload;
          state.prompts.sort((a, b) => {
            if (a.favorite && !b.favorite) return -1;
            if (!a.favorite && b.favorite) return 1;
            return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
          });
        }
      });
  },
});

export default promptSlice.reducer;
