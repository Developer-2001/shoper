import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

type CartItem = {
  productId: string;
  name: string;
  image: string;
  price: number;
  currency: string;
  quantity: number;
  slug: string;
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
    setCartItems(state, action: PayloadAction<CartItem[]>) {
      state.items = action.payload;
    },
    addToCart(state, action: PayloadAction<CartItem>) {
      const existing = state.items.find(
        (item) => item.productId === action.payload.productId && item.slug === action.payload.slug
      );

      if (existing) {
        existing.quantity += action.payload.quantity;
      } else {
        state.items.push(action.payload);
      }
    },
    updateCartQty(
      state,
      action: PayloadAction<{ productId: string; slug: string; quantity: number }>
    ) {
      const item = state.items.find(
        (entry) =>
          entry.productId === action.payload.productId && entry.slug === action.payload.slug
      );

      if (item) {
        item.quantity = Math.max(1, action.payload.quantity);
      }
    },
    removeFromCart(state, action: PayloadAction<{ productId: string; slug: string }>) {
      state.items = state.items.filter(
        (item) =>
          !(item.productId === action.payload.productId && item.slug === action.payload.slug)
      );
    },
    clearSlugCart(state, action: PayloadAction<{ slug: string }>) {
      state.items = state.items.filter((item) => item.slug !== action.payload.slug);
    },
  },
});

export const { setCartItems, addToCart, updateCartQty, removeFromCart, clearSlugCart } =
  cartSlice.actions;
export default cartSlice.reducer;
export type { CartItem };
