"use client";

import { useEffect, useRef, useState } from "react";

import { clearSlugCart, setCartItems } from "@/store/slices/cartSlice";
import { useAppDispatch, useAppSelector } from "@/hooks/useRedux";

const CART_STORAGE_KEY = "shoper_cart";
const CART_EXPIRY_DAYS = 7;

export function useCartStorage() {
  const dispatch = useAppDispatch();
  const items = useAppSelector((state) => state.cart.items);
  const [isHydrated, setIsHydrated] = useState(false);
  const hasInitialized = useRef(false);

  useEffect(() => {
    const raw = localStorage.getItem(CART_STORAGE_KEY);
    if (!raw) {
      setIsHydrated(true);
      return;
    }

    try {
      const parsed = JSON.parse(raw) as { expiresAt: number; items: typeof items };
      if (Date.now() > parsed.expiresAt) {
        localStorage.removeItem(CART_STORAGE_KEY);
      } else {
        dispatch(setCartItems(parsed.items));
      }
    } catch {
      localStorage.removeItem(CART_STORAGE_KEY);
    } finally {
      setIsHydrated(true);
    }
  }, [dispatch]);

  useEffect(() => {
    if (!isHydrated) return;

    // Skip the first "save" cycle that happens right after hydration
    // because the Redux 'items' might still be the empty initial state
    if (!hasInitialized.current) {
      hasInitialized.current = true;
      return;
    }

    const expiresAt = Date.now() + CART_EXPIRY_DAYS * 24 * 60 * 60 * 1000;
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify({ expiresAt, items }));
  }, [items, isHydrated]);

  return {
    clearStoreCart(slug: string) {
      dispatch(clearSlugCart({ slug }));
    },
  };
}
