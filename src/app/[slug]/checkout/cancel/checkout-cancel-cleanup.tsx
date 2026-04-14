"use client";

import { useEffect } from "react";

import {
  clearPendingPurchase,
  trackStorefrontEvent,
} from "@/lib/storefront-analytics/client";

export function CheckoutCancelCleanup({ slug }: { slug: string }) {
  useEffect(() => {
    clearPendingPurchase(slug);
    trackStorefrontEvent({
      event: "checkout_cancel",
      slug,
    });
  }, [slug]);

  return null;
}
