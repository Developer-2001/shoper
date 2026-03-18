"use client";

import { useEffect } from "react";

import { clearSlugCart, setCartItems } from "@/store/slices/cartSlice";
import { useAppDispatch, useAppSelector } from "@/hooks/useRedux";

const CART_STORAGE_KEY = "shoper_cart";
const CART_EXPIRY_DAYS = 7;

export function useCartStorage() {
  const dispatch = useAppDispatch();
  const items = useAppSelector((state) => state.cart.items);

  useEffect(() => {
    const raw = localStorage.getItem(CART_STORAGE_KEY);
    if (!raw) return;

    try {
      const parsed = JSON.parse(raw) as { expiresAt: number; items: typeof items };
      if (Date.now() > parsed.expiresAt) {
        localStorage.removeItem(CART_STORAGE_KEY);
        return;
      }
      dispatch(setCartItems(parsed.items));
    } catch {
      localStorage.removeItem(CART_STORAGE_KEY);
    }
  }, [dispatch]);

  useEffect(() => {
    const expiresAt = Date.now() + CART_EXPIRY_DAYS * 24 * 60 * 60 * 1000;
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify({ expiresAt, items }));
  }, [items]);

  return {
    clearStoreCart(slug: string) {
      dispatch(clearSlugCart({ slug }));
    },
  };
}
