import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

type AdminState = {
  admin: { id: string; ownerName: string; email: string } | null;
  store: { id: string; businessName: string; slug: string; currency: string } | null;
};

const initialState: AdminState = {
  admin: null,
  store: null,
};

const adminSlice = createSlice({
  name: "admin",
  initialState,
  reducers: {
    setAdminSession(state, action: PayloadAction<AdminState>) {
      state.admin = action.payload.admin;
      state.store = action.payload.store;
    },
    clearAdminSession(state) {
      state.admin = null;
      state.store = null;
    },
  },
});

export const { setAdminSession, clearAdminSession } = adminSlice.actions;
export default adminSlice.reducer;
