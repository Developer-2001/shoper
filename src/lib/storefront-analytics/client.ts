"use client";

const PENDING_PURCHASE_PREFIX = "shoper_pending_purchase:";
const TRACKED_PURCHASE_PREFIX = "shoper_tracked_purchase:";
const MAX_PENDING_PURCHASE_AGE_MS = 24 * 60 * 60 * 1000;

export type AnalyticsEcommerceItem = {
  item_id: string;
  item_name: string;
  item_category?: string;
  price: number;
  quantity: number;
};

export type PendingPurchasePayload = {
  slug: string;
  storeTheme?: string;
  transactionId?: string;
  value: number;
  currency: string;
  tax?: number;
  shipping?: number;
  coupon?: string;
  paymentType?: string;
  source: "stripe" | "helcim" | "manual";
  items: AnalyticsEcommerceItem[];
  createdAt?: number;
};

type StorefrontEventParams = {
  event: string;
  slug: string;
  storeTheme?: string;
} & Record<string, unknown>;

declare global {
  interface Window {
    dataLayer: Record<string, unknown>[];
  }
}

export function toAnalyticsItem(input: {
  productId: string;
  name: string;
  category?: string;
  price: number;
  quantity: number;
}): AnalyticsEcommerceItem {
  return {
    item_id: input.productId,
    item_name: input.name,
    item_category: input.category || undefined,
    price: Number(input.price) || 0,
    quantity: Math.max(1, Number(input.quantity) || 1),
  };
}

export function trackStorefrontEvent({
  event,
  slug,
  storeTheme,
  ...rest
}: StorefrontEventParams) {
  if (typeof window === "undefined") return;

  window.dataLayer = window.dataLayer || [];

  const payload: Record<string, unknown> = {
    event,
    store_slug: slug,
    tenant_slug: slug,
    ...rest,
  };

  if (storeTheme) {
    payload.store_theme = storeTheme;
  }

  if ("ecommerce" in rest) {
    window.dataLayer.push({ ecommerce: null });
  }

  window.dataLayer.push(payload);
}

export function savePendingPurchase(payload: PendingPurchasePayload) {
  if (typeof window === "undefined") return;

  try {
    const key = `${PENDING_PURCHASE_PREFIX}${payload.slug}`;
    localStorage.setItem(
      key,
      JSON.stringify({
        ...payload,
        createdAt: payload.createdAt ?? Date.now(),
      }),
    );
  } catch {
    // Ignore localStorage access issues.
  }
}

export function readPendingPurchase(slug: string): PendingPurchasePayload | null {
  if (typeof window === "undefined") return null;

  try {
    const key = `${PENDING_PURCHASE_PREFIX}${slug}`;
    const raw = localStorage.getItem(key);
    if (!raw) return null;

    const parsed = JSON.parse(raw) as PendingPurchasePayload;
    const createdAt = Number(parsed.createdAt || 0);

    if (!createdAt || Date.now() - createdAt > MAX_PENDING_PURCHASE_AGE_MS) {
      localStorage.removeItem(key);
      return null;
    }

    return parsed;
  } catch {
    return null;
  }
}

export function clearPendingPurchase(slug: string) {
  if (typeof window === "undefined") return;

  try {
    localStorage.removeItem(`${PENDING_PURCHASE_PREFIX}${slug}`);
  } catch {
    // Ignore localStorage access issues.
  }
}

export function hasPurchaseBeenTracked(slug: string, transactionId: string) {
  if (typeof window === "undefined") return false;

  try {
    return Boolean(
      localStorage.getItem(`${TRACKED_PURCHASE_PREFIX}${slug}:${transactionId}`),
    );
  } catch {
    return false;
  }
}

export function markPurchaseTracked(slug: string, transactionId: string) {
  if (typeof window === "undefined") return;

  try {
    localStorage.setItem(
      `${TRACKED_PURCHASE_PREFIX}${slug}:${transactionId}`,
      "1",
    );
  } catch {
    // Ignore localStorage access issues.
  }
}
