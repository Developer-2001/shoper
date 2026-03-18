import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

type UiState = {
  isSidebarOpen: boolean;
  isLoadingOverlayVisible: boolean;
};

const initialState: UiState = {
  isSidebarOpen: true,
  isLoadingOverlayVisible: false,
};

const uiSlice = createSlice({
  name: "ui",
  initialState,
  reducers: {
    setSidebarOpen(state, action: PayloadAction<boolean>) {
      state.isSidebarOpen = action.payload;
    },
    setLoadingOverlay(state, action: PayloadAction<boolean>) {
      state.isLoadingOverlayVisible = action.payload;
    },
  },
});

export const { setSidebarOpen, setLoadingOverlay } = uiSlice.actions;
export const uiReducer = uiSlice.reducer;
