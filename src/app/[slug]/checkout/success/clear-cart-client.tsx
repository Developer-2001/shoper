"use client";

import { useEffect } from "react";
import { useAppDispatch } from "@/hooks/useRedux";
import { clearSlugCart } from "@/store/slices/cartSlice";

/**
 * A helper component that clears the cart for a specific store slug 
 * once the customer successfully lands on the success page.
 */
export function ClearCartClient({ slug }: { slug: string }) {
  const dispatch = useAppDispatch();

  useEffect(() => {
    dispatch(clearSlugCart({ slug }));
  }, [slug, dispatch]);

  return null;
}
