import { configureStore } from "@reduxjs/toolkit";
import { authReducer } from "@/store/slices/authSlice";
import { cartReducer } from "@/store/slices/cartSlice";
import { uiReducer } from "@/store/slices/uiSlice";

export const makeStore = () =>
  configureStore({
    reducer: {
      auth: authReducer,
      cart: cartReducer,
      ui: uiReducer,
    },
    devTools: process.env.NODE_ENV !== "production",
  });

export type AppStore = ReturnType<typeof makeStore>;
export type RootState = ReturnType<AppStore["getState"]>;
export type AppDispatch = AppStore["dispatch"];
