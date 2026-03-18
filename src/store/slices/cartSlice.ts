import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

type CartItem = {
  storeSlug: string;
  productId: string;
  name: string;
  image: string;
  quantity: number;
  price: number;
  currency: string;
};

type CartState = {
  items: CartItem[];
};

const initialState: CartState = {
  items: [],
};

const cartSlice = createSlice({
  name: "cart",
  initialState,
  reducers: {
    addToCart(state, action: PayloadAction<CartItem>) {
      const existing = state.items.find(
        (item) =>
          item.productId === action.payload.productId &&
          item.storeSlug === action.payload.storeSlug,
      );

      if (existing) {
        existing.quantity += action.payload.quantity;
        return;
      }

      state.items.push(action.payload);
    },
    removeFromCart(
      state,
      action: PayloadAction<{ storeSlug: string; productId: string }>,
    ) {
      state.items = state.items.filter(
        (item) =>
          !(
            item.productId === action.payload.productId &&
            item.storeSlug === action.payload.storeSlug
          ),
      );
    },
    updateQuantity(
      state,
      action: PayloadAction<{
        storeSlug: string;
        productId: string;
        quantity: number;
      }>,
    ) {
      const item = state.items.find(
        (cartItem) =>
          cartItem.productId === action.payload.productId &&
          cartItem.storeSlug === action.payload.storeSlug,
      );

      if (!item) return;
      item.quantity = Math.max(1, action.payload.quantity);
    },
    clearStoreCart(state, action: PayloadAction<string>) {
      state.items = state.items.filter((item) => item.storeSlug !== action.payload);
    },
    clearCart(state) {
      state.items = [];
    },
  },
});

export const { addToCart, removeFromCart, updateQuantity, clearStoreCart, clearCart } =
  cartSlice.actions;
export const cartReducer = cartSlice.reducer;
