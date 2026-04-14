"use client";

import { useEffect } from "react";

import {
  clearPendingPurchase,
  hasPurchaseBeenTracked,
  markPurchaseTracked,
  readPendingPurchase,
  trackStorefrontEvent,
} from "@/lib/storefront-analytics/client";

export function CheckoutSuccessAnalytics({
  slug,
  sessionId,
  orderNumber,
  provider,
}: {
  slug: string;
  sessionId?: string;
  orderNumber?: string;
  provider?: string;
}) {
  useEffect(() => {
    const pendingPurchase = readPendingPurchase(slug);
    const transactionId =
      sessionId || orderNumber || pendingPurchase?.transactionId || "";

    if (!transactionId) return;
    if (hasPurchaseBeenTracked(slug, transactionId)) return;

    const currency = pendingPurchase?.currency || "INR";
    const value = Number(pendingPurchase?.value || 0);

    trackStorefrontEvent({
      event: "purchase",
      slug,
      storeTheme: pendingPurchase?.storeTheme,
      payment_type: provider || pendingPurchase?.paymentType || "",
      transaction_id: transactionId,
      ecommerce: {
        transaction_id: transactionId,
        currency,
        value,
        tax: Number(pendingPurchase?.tax || 0),
        shipping: Number(pendingPurchase?.shipping || 0),
        coupon: pendingPurchase?.coupon || undefined,
        items: pendingPurchase?.items || [],
      },
    });

    markPurchaseTracked(slug, transactionId);
    clearPendingPurchase(slug);
  }, [slug, sessionId, orderNumber, provider]);

  return null;
}
