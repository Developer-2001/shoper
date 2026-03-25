import { configureStore } from "@reduxjs/toolkit";

import adminReducer from "./slices/adminSlice";
import cartReducer from "./slices/cartSlice";
import promptReducer from "./slices/promptSlice";

export const store = configureStore({
  reducer: {
    admin: adminReducer,
    cart: cartReducer,
    prompts: promptReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
