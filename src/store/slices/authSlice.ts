import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { SessionDto } from "@/types";

type AuthState = {
  session: SessionDto | null;
  status: "idle" | "loading" | "authenticated" | "unauthenticated";
};

const initialState: AuthState = {
  session: null,
  status: "idle",
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setSession(state, action: PayloadAction<SessionDto>) {
      state.session = action.payload;
      state.status = "authenticated";
    },
    clearSession(state) {
      state.session = null;
      state.status = "unauthenticated";
    },
    setAuthLoading(state) {
      state.status = "loading";
    },
  },
});

export const { setSession, clearSession, setAuthLoading } = authSlice.actions;
export const authReducer = authSlice.reducer;
