"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import { City, Country, State } from "country-state-city";

import { Spinner } from "@/components/admin/ui/loader";
import { Skeleton } from "@/components/admin/ui/skeleton";
import { useAppDispatch, useAppSelector } from "@/hooks/useRedux";
import {
  clearPendingPurchase,
  savePendingPurchase,
  toAnalyticsItem,
  trackStorefrontEvent,
} from "@/lib/storefront-analytics/client";
import { clearSlugCart } from "@/store/slices/cartSlice";
import { formatMoney } from "@/utils/currency";
import { isVideoUrl } from "@/utils/media";
import { HelcimForm } from "@/components/checkout/helcim-form";

import type { StorefrontStore } from "@/themes/types";
import {
  SingleSelectDropdown,
  SingleSelectOption,
} from "@/lib/single-select-dropdown";

const SHIPPING_CHARGE_PER_ITEM = 0;
const CHECKOUT_DISCOUNT_CODES: Record<
  string,
  { code: string; percent: number }
> = {
  deva123: { code: "Deva123", percent: 20 },
  vinayak123: { code: "Vinayak123", percent: 30 },
};

type AddressFormState = {
  country: string;
  countryCode: string;
  firstName: string;
  lastName: string;
  shippingAddress: string;
  city: string;
  state: string;
  stateCode: string;
  postalCode: string;
};

type CheckoutMetaState = {
  cartNote: string;
  discountCode: string;
  discountPercentage: number;
};

function roundPrice(value: number) {
  return Math.round(value * 100) / 100;
}

function toSingleSelectOptions<T extends { name: string }>(
  list: T[],
  getValue: (item: T) => string,
): SingleSelectOption[] {
  return list.map((item) => {
    const value = getValue(item);
    return {
      id: value,
      label: item.name,
      value,
    };
  });
}

function extractRegionCodeFromLocale(locale: string) {
  const value = locale.trim();
  if (!value) return "";

  try {
    if (typeof Intl !== "undefined" && "Locale" in Intl) {
      const intlLocale = new Intl.Locale(value);
      const region = intlLocale.region || "";
      if (region && Country.getCountryByCode(region)) {
        return region.toUpperCase();
      }
    }
  } catch {
    // Fallback handled below for browsers without Intl.Locale support.
  }

  const match = value.match(/[-_]([A-Za-z]{2})(?:$|[-_])/);
  const regionCode = match?.[1]?.toUpperCase() || "";
  if (regionCode && Country.getCountryByCode(regionCode)) {
    return regionCode;
  }

  return "";
}

function detectBrowserCountryCode() {
  if (typeof window === "undefined") return "";

  const localeCandidates = [
    ...(navigator.languages || []),
    navigator.language || "",
    Intl.DateTimeFormat().resolvedOptions().locale || "",
  ].filter(Boolean);

  for (const locale of localeCandidates) {
    const regionCode = extractRegionCodeFromLocale(locale);
    if (regionCode) return regionCode;
  }

  return "";
}

async function detectCountryCodeFromRequest() {
  try {
    const response = await fetch("/api/geo/country", { cache: "no-store" });
    if (!response.ok) return "";

    const data = await response.json();
    const countryCode = String(data?.countryCode || "").trim().toUpperCase();
    if (countryCode && Country.getCountryByCode(countryCode)) {
      return countryCode;
    }
  } catch {
    // Ignore and fall back to other detection methods.
  }

  return "";
}

function getCurrentPosition(options?: PositionOptions) {
  return new Promise<GeolocationPosition>((resolve, reject) => {
    if (!("geolocation" in navigator)) {
      reject(new Error("Geolocation not available"));
      return;
    }

    navigator.geolocation.getCurrentPosition(resolve, reject, options);
  });
}

async function detectCountryCodeFromBrowserLocation() {
  if (typeof window === "undefined") return "";

  try {
    const position = await getCurrentPosition({
      enableHighAccuracy: false,
      timeout: 6000,
      maximumAge: 60_000,
    });
    const latitude = position.coords.latitude;
    const longitude = position.coords.longitude;

    const reverseUrl = new URL(
      "https://api.bigdatacloud.net/data/reverse-geocode-client",
    );
    reverseUrl.searchParams.set("latitude", String(latitude));
    reverseUrl.searchParams.set("longitude", String(longitude));
    reverseUrl.searchParams.set("localityLanguage", "en");

    const response = await fetch(reverseUrl.toString(), { cache: "no-store" });
    if (!response.ok) return "";

    const data = await response.json();
    const countryCode = String(
      data?.countryCode || data?.countryCode2 || "",
    ).trim().toUpperCase();

    if (countryCode && Country.getCountryByCode(countryCode)) {
      return countryCode;
    }
  } catch {
    // Permission denied / timeout / network issue.
  }

  return "";
}

const EMPTY_ADDRESS: AddressFormState = {
  country: "",
  countryCode: "",
  firstName: "",
  lastName: "",
  shippingAddress: "",
  city: "",
  state: "",
  stateCode: "",
  postalCode: "",
};

export function Theme3CheckoutForm({
  slug,
  store,
}: {
  slug: string;
  store: StorefrontStore;
}) {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const items = useAppSelector((state) =>
    state.cart.items.filter((item) => item.slug === slug),
  );

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [email, setEmail] = useState("");
  const [shipping, setShipping] = useState<AddressFormState>(EMPTY_ADDRESS);
  const [billing, setBilling] = useState<AddressFormState>(EMPTY_ADDRESS);
  const [useShippingAsBilling, setUseShippingAsBilling] = useState(true);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [isHelcimActive, setIsHelcimActive] = useState(false);
  const [isHelcimInitializing, setIsHelcimInitializing] = useState(false);
  const [summaryOpen, setSummaryOpen] = useState(false);
  const hasTrackedBeginCheckoutRef = useRef(false);
  const [taxRatePercent, setTaxRatePercent] = useState(0);
  const [taxRateLabel, setTaxRateLabel] = useState("No sales tax");
  const [taxLoading, setTaxLoading] = useState(false);
  const [checkoutMeta, setCheckoutMeta] = useState<CheckoutMetaState>({
    cartNote: "",
    discountCode: "",
    discountPercentage: 0,
  });

  const availableProviders = [
    ...(store.paymentSettings?.stripe?.enabled ? ["stripe"] : []),
    ...(store.paymentSettings?.helcim?.enabled ? ["helcim"] : []),
  ];

  const [provider, setProvider] = useState("none");

  // Reset payment states when provider changes
  useEffect(() => {
    setIsHelcimActive(false);
    setIsHelcimInitializing(false);
    setError("");
  }, [provider]);

  const checkoutMetaKey = `theme3CheckoutMeta:${slug}`;
  const currency = items[0]?.currency || "INR";
  const firstItem = items[0];

  const countries = useMemo(
    () =>
      Country.getAllCountries().sort((a, b) => a.name.localeCompare(b.name)),
    [],
  );

  const shippingStates = useMemo(
    () =>
      shipping.countryCode
        ? State.getStatesOfCountry(shipping.countryCode)
        : [],
    [shipping.countryCode],
  );

  const shippingCities = useMemo(
    () =>
      shipping.countryCode && shipping.stateCode
        ? City.getCitiesOfState(shipping.countryCode, shipping.stateCode)
        : [],
    [shipping.countryCode, shipping.stateCode],
  );

  const billingStates = useMemo(
    () =>
      billing.countryCode ? State.getStatesOfCountry(billing.countryCode) : [],
    [billing.countryCode],
  );

  const billingCities = useMemo(
    () =>
      billing.countryCode && billing.stateCode
        ? City.getCitiesOfState(billing.countryCode, billing.stateCode)
        : [],
    [billing.countryCode, billing.stateCode],
  );

  const countryOptions = useMemo(
    () => toSingleSelectOptions(countries, (country) => country.isoCode),
    [countries],
  );

  const shippingStateOptions = useMemo(
    () =>
      toSingleSelectOptions(shippingStates, (stateItem) => stateItem.isoCode),
    [shippingStates],
  );

  const shippingCityOptions = useMemo(
    () =>
      shippingCities.map((cityItem) => ({
        id: `${cityItem.name}-${cityItem.stateCode}-${cityItem.countryCode}`,
        label: cityItem.name,
        value: cityItem.name,
      })),
    [shippingCities],
  );

  const billingStateOptions = useMemo(
    () =>
      toSingleSelectOptions(billingStates, (stateItem) => stateItem.isoCode),
    [billingStates],
  );

  const billingCityOptions = useMemo(
    () =>
      billingCities.map((cityItem) => ({
        id: `${cityItem.name}-${cityItem.stateCode}-${cityItem.countryCode}`,
        label: cityItem.name,
        value: cityItem.name,
      })),
    [billingCities],
  );

  const itemCount = useMemo(
    () => items.reduce((sum, item) => sum + item.quantity, 0),
    [items],
  );

  const subtotal = useMemo(
    () => items.reduce((sum, item) => sum + item.price * item.quantity, 0),
    [items],
  );

  const matchedDiscount = useMemo(() => {
    const normalized = checkoutMeta.discountCode.trim().toLowerCase();
    return CHECKOUT_DISCOUNT_CODES[normalized] || null;
  }, [checkoutMeta.discountCode]);

  const discountPercentage =
    matchedDiscount?.percent || checkoutMeta.discountPercentage || 0;
  const discountCode = matchedDiscount?.code || "";

  const discountAmount = useMemo(
    () => roundPrice((subtotal * discountPercentage) / 100),
    [subtotal, discountPercentage],
  );

  const shippingCharge = useMemo(
    () => roundPrice(itemCount * SHIPPING_CHARGE_PER_ITEM),
    [itemCount],
  );

  const taxableAmount = Math.max(0, subtotal - discountAmount);

  const taxAmount = useMemo(
    () => roundPrice((taxableAmount * taxRatePercent) / 100),
    [taxableAmount, taxRatePercent],
  );

  const total = useMemo(
    () => roundPrice(taxableAmount + shippingCharge + taxAmount),
    [taxableAmount, shippingCharge, taxAmount],
  );

  const analyticsItems = useMemo(
    () =>
      items.map((item) =>
        toAnalyticsItem({
          productId: item.productId,
          name: item.name,
          price: item.price,
          quantity: item.quantity,
        }),
      ),
    [items],
  );

  useEffect(() => {
    if (!items.length) {
      hasTrackedBeginCheckoutRef.current = false;
      return;
    }

    if (hasTrackedBeginCheckoutRef.current) return;
    hasTrackedBeginCheckoutRef.current = true;

    trackStorefrontEvent({
      event: "begin_checkout",
      slug,
      storeTheme: "theme3",
      ecommerce: {
        currency,
        value: total,
        ...(discountCode ? { coupon: discountCode } : {}),
        items: analyticsItems,
      },
    });
  }, [slug, items.length, currency, total, discountCode, analyticsItems]);

  // const hasShippingAddress = shipping.shippingAddress.trim().length > 0;
  // const shippingDisplayValue = hasShippingAddress
  //   ? formatMoney(shippingCharge, currency)
  //   : "Enter shipping address";

  useEffect(() => {
    const rawMeta = localStorage.getItem(checkoutMetaKey);
    if (!rawMeta) return;

    try {
      const parsedMeta = JSON.parse(rawMeta) as Partial<CheckoutMetaState>;
      setCheckoutMeta({
        cartNote: parsedMeta.cartNote || "",
        discountCode: parsedMeta.discountCode || "",
        discountPercentage:
          typeof parsedMeta.discountPercentage === "number"
            ? parsedMeta.discountPercentage
            : 0,
      });
    } catch {
      localStorage.removeItem(checkoutMetaKey);
    }
  }, [checkoutMetaKey]);

  useEffect(() => {
    let cancelled = false;

    function canAutoFillCountry(address: AddressFormState) {
      return (
        !address.countryCode &&
        !address.country &&
        !address.firstName &&
        !address.lastName &&
        !address.shippingAddress &&
        !address.city &&
        !address.state &&
        !address.postalCode
      );
    }

    async function detectAndApplyCountry() {
      const fromRequest = await detectCountryCodeFromRequest();
      const fromLocation = fromRequest
        ? ""
        : await detectCountryCodeFromBrowserLocation();
      const fromLocale =
        fromRequest || fromLocation ? "" : detectBrowserCountryCode();

      const detectedCountryCode = fromRequest || fromLocation || fromLocale;
      if (!detectedCountryCode || cancelled) return;

      const detectedCountry = Country.getCountryByCode(detectedCountryCode);
      if (!detectedCountry) return;

      setShipping((prev) => {
        if (!canAutoFillCountry(prev)) return prev;
        return {
          ...prev,
          country: detectedCountry.name,
          countryCode: detectedCountryCode,
          state: "",
          stateCode: "",
          city: "",
        };
      });

      setBilling((prev) => {
        if (!canAutoFillCountry(prev)) return prev;
        return {
          ...prev,
          country: detectedCountry.name,
          countryCode: detectedCountryCode,
          state: "",
          stateCode: "",
          city: "",
        };
      });
    }

    void detectAndApplyCountry();

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    const controller = new AbortController();

    async function loadTaxRate() {
      if (!shipping.countryCode) {
        setTaxRatePercent(0);
        setTaxRateLabel("No sales tax");
        setTaxLoading(false);
        return;
      }

      const hasStateSelection = shippingStates.length
        ? Boolean(shipping.stateCode)
        : Boolean(shipping.state.trim());

      if (!hasStateSelection) {
        setTaxRatePercent(0);
        setTaxRateLabel("Select state to estimate tax");
        setTaxLoading(false);
        return;
      }

      setTaxLoading(true);
      try {
        const params = new URLSearchParams({
          country: shipping.country,
          countryCode: shipping.countryCode,
          state: shipping.state,
          stateCode: shipping.stateCode,
        });

        const response = await fetch(
          `/api/store/${slug}/tax-rate?${params.toString()}`,
          {
            signal: controller.signal,
          },
        );

        if (!response.ok) {
          throw new Error("Tax lookup failed");
        }

        const data = await response.json();
        setTaxRatePercent(Number(data?.tax?.ratePercent || 0));
        setTaxRateLabel(String(data?.tax?.label || "Tax estimate unavailable"));
      } catch (taxError) {
        if ((taxError as Error).name === "AbortError") return;
        console.error(taxError);
        setTaxRatePercent(0);
        setTaxRateLabel("Tax estimate unavailable");
      } finally {
        setTaxLoading(false);
      }
    }

    loadTaxRate();

    return () => controller.abort();
  }, [
    slug,
    shipping.country,
    shipping.countryCode,
    shipping.state,
    shipping.stateCode,
    shippingStates.length,
  ]);

  function updateShipping(field: keyof AddressFormState, value: string) {
    setShipping((prev) => ({
      ...prev,
      [field]: value,
    }));
  }

  function updateBilling(field: keyof AddressFormState, value: string) {
    setBilling((prev) => ({
      ...prev,
      [field]: value,
    }));
  }

  function setShippingCountry(countryCode: string) {
    const selectedCountry = Country.getCountryByCode(countryCode);
    setShipping((prev) => ({
      ...prev,
      country: selectedCountry?.name || "",
      countryCode,
      state: "",
      stateCode: "",
      city: "",
    }));
  }

  function setShippingState(stateCode: string) {
    const selectedState = State.getStateByCodeAndCountry(
      stateCode,
      shipping.countryCode,
    );

    setShipping((prev) => ({
      ...prev,
      state: selectedState?.name || "",
      stateCode,
      city: "",
    }));
  }

  function setBillingCountry(countryCode: string) {
    const selectedCountry = Country.getCountryByCode(countryCode);
    setBilling((prev) => ({
      ...prev,
      country: selectedCountry?.name || "",
      countryCode,
      state: "",
      stateCode: "",
      city: "",
    }));
  }

  function setBillingState(stateCode: string) {
    const selectedState = State.getStateByCodeAndCountry(
      stateCode,
      billing.countryCode,
    );

    setBilling((prev) => ({
      ...prev,
      state: selectedState?.name || "",
      stateCode,
      city: "",
    }));
  }

  async function handleStripeCheckout() {
    if (!store.paymentSettings?.stripe?.enabled) {
      setError(
        "This store is currently not set up to receive online payments.",
      );
      return;
    }

    setLoading(true);
    setError("");
    clearPendingPurchase(slug);

    trackStorefrontEvent({
      event: "add_shipping_info",
      slug,
      storeTheme: "theme3",
      ecommerce: {
        currency,
        value: total,
        ...(discountCode ? { coupon: discountCode } : {}),
        items: analyticsItems,
      },
      country: shipping.countryCode || shipping.country || "",
      state: shipping.stateCode || shipping.state || "",
      city: shipping.city || "",
    });

    trackStorefrontEvent({
      event: "add_payment_info",
      slug,
      storeTheme: "theme3",
      payment_type: "stripe_card",
      ecommerce: {
        currency,
        value: total,
        ...(discountCode ? { coupon: discountCode } : {}),
        items: analyticsItems,
      },
    });

    savePendingPurchase({
      slug,
      source: "stripe",
      storeTheme: "theme3",
      paymentType: "stripe_card",
      value: total,
      currency,
      tax: taxAmount,
      shipping: shippingCharge,
      coupon: discountCode || undefined,
      items: analyticsItems,
    });

    try {
      const response = await fetch(`/api/store/${slug}/payment/session`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          shipping,
          useShippingAsBilling,
          billing: useShippingAsBilling ? shipping : billing,
          cartNote: checkoutMeta.cartNote,
          discountCode,
          items: items.map((item) => ({
            productId: item.productId,
            quantity: item.quantity,
          })),
        }),
      });

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        let message = "Failed to initiate payment. Please check your details.";
        if (typeof data.error === "string") {
          message = data.error;
        } else if (data.error?.fieldErrors) {
          const firstKey = Object.keys(data.error.fieldErrors)[0];
          message = `${firstKey}: ${data.error.fieldErrors[firstKey][0]}`;
        }
        clearPendingPurchase(slug);
        setError(message);
        return;
      }

      const { url } = await response.json();
      if (url) {
        window.location.href = url;
      } else {
        clearPendingPurchase(slug);
        setError("Payment session initialization failed.");
      }
    } catch (err) {
      console.error(err);
      clearPendingPurchase(slug);
      setError("A network error occurred while starting your payment.");
    } finally {
      setLoading(false);
    }
  }

  const handleHelcimCheckout = useCallback(async (transactionId: string) => {
    setLoading(true);
    setError("");
    clearPendingPurchase(slug);

    trackStorefrontEvent({
      event: "add_shipping_info",
      slug,
      storeTheme: "theme3",
      ecommerce: {
        currency,
        value: total,
        ...(discountCode ? { coupon: discountCode } : {}),
        items: analyticsItems,
      },
      country: shipping.countryCode || shipping.country || "",
      state: shipping.stateCode || shipping.state || "",
      city: shipping.city || "",
    });

    trackStorefrontEvent({
      event: "add_payment_info",
      slug,
      storeTheme: "theme3",
      payment_type: "helcim",
      ecommerce: {
        currency,
        value: total,
        ...(discountCode ? { coupon: discountCode } : {}),
        items: analyticsItems,
      },
    });

    try {
      const response = await fetch(`/api/store/${slug}/payment/helcim/process`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          transactionId,
          email,
          shipping,
          useShippingAsBilling,
          billing: useShippingAsBilling ? shipping : billing,
          cartNote: checkoutMeta.cartNote,
          discountCode,
          items: items.map((item) => ({
            productId: item.productId,
            quantity: item.quantity,
          })),
        }),
      });

      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        setError(data.error || "Helcim payment failed.");
        return;
      }

      const orderNumber =
        typeof data.orderNumber === "string" ? data.orderNumber : "";

      savePendingPurchase({
        slug,
        source: "helcim",
        storeTheme: "theme3",
        paymentType: "helcim",
        transactionId: orderNumber || transactionId,
        value: total,
        currency,
        tax: taxAmount,
        shipping: shippingCharge,
        coupon: discountCode || undefined,
        items: analyticsItems,
      });

      localStorage.removeItem(checkoutMetaKey);
      dispatch(clearSlugCart({ slug }));
      const query = new URLSearchParams();
      if (orderNumber) {
        query.set("order_number", orderNumber);
      }
      query.set("provider", "helcim");
      const queryString = query.toString();
      window.location.href = `/${slug}/checkout/success${queryString ? `?${queryString}` : ""}`;
    } catch (err) {
      console.error(err);
      setError("A network error occurred while processing Helcim payment.");
    } finally {
      setLoading(false);
    }
  }, [slug, email, shipping, useShippingAsBilling, billing, checkoutMeta.cartNote, discountCode, items, dispatch, checkoutMetaKey, currency, total, analyticsItems, taxAmount, shippingCharge]);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setLoading(true);
    setError("");

    trackStorefrontEvent({
      event: "add_shipping_info",
      slug,
      storeTheme: "theme3",
      ecommerce: {
        currency,
        value: total,
        ...(discountCode ? { coupon: discountCode } : {}),
        items: analyticsItems,
      },
      country: shipping.countryCode || shipping.country || "",
      state: shipping.stateCode || shipping.state || "",
      city: shipping.city || "",
    });

    trackStorefrontEvent({
      event: "add_payment_info",
      slug,
      storeTheme: "theme3",
      payment_type: provider === "none" ? "manual" : provider,
      ecommerce: {
        currency,
        value: total,
        ...(discountCode ? { coupon: discountCode } : {}),
        items: analyticsItems,
      },
    });

    try {
      const response = await fetch(`/api/store/${slug}/orders`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          shipping,
          useShippingAsBilling,
          billing: useShippingAsBilling ? shipping : billing,
          cartNote: checkoutMeta.cartNote,
          discountCode,
          items: items.map((item) => ({
            productId: item.productId,
            quantity: item.quantity,
          })),
        }),
      });

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        let message = "Failed to place order. Please check your details.";
        if (typeof data.error === "string") {
          message = data.error;
        } else if (data.error?.fieldErrors) {
          const firstKey = Object.keys(data.error.fieldErrors)[0];
          message = `${firstKey}: ${data.error.fieldErrors[firstKey][0]}`;
        }
        setError(message);
        return;
      }

      const data = await response.json().catch(() => ({}));
      const order = data?.order as
        | { orderNumber?: string; total?: number; currency?: string }
        | undefined;
      const orderNumber = typeof order?.orderNumber === "string" ? order.orderNumber : "";
      const paidTotal = Number(order?.total || total);
      const paidCurrency = typeof order?.currency === "string" ? order.currency : currency;

      savePendingPurchase({
        slug,
        source: "manual",
        storeTheme: "theme3",
        paymentType: provider === "none" ? "manual" : provider,
        transactionId: orderNumber || undefined,
        value: paidTotal,
        currency: paidCurrency,
        tax: taxAmount,
        shipping: shippingCharge,
        coupon: discountCode || undefined,
        items: analyticsItems,
      });

      dispatch(clearSlugCart({ slug }));
      localStorage.removeItem(checkoutMetaKey);
      const query = new URLSearchParams();
      if (orderNumber) {
        query.set("order_number", orderNumber);
      }
      query.set("provider", provider === "none" ? "manual" : provider);
      const queryString = query.toString();
      router.push(`/${slug}/checkout/success${queryString ? `?${queryString}` : ""}`);
    } catch {
      setError("A network error occurred while placing your order.");
    } finally {
      setLoading(false);
    }
  }

  function handlePayNowClick(event: React.MouseEvent<HTMLButtonElement>) {
    if (store.paymentSettings?.stripe?.enabled) {
      event.preventDefault();
      void handleStripeCheckout();
    }
  }

  if (!items.length && !showSuccessModal) {
    return (
      <p className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-6 text-slate-700">
        Cart is empty. Add products before checkout.
      </p>
    );
  }

  const inputClass =
    "mt-1 h-12 w-full rounded-xl border border-slate-300 bg-slate-50 px-3 text-slate-900 outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-200";

  const summaryDetails = (
    <>
      <div className="mt-4 space-y-4">
        {items.map((item) => (
          <div key={item.productId} className="flex items-center gap-3">
            <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-xl border border-slate-200 bg-slate-100">
              {isVideoUrl(item.image) ? (
                <video
                  src={item.image}
                  className="h-full w-full object-cover"
                  muted
                  playsInline
                  preload="metadata"
                />
              ) : (
                <Image
                  src={item.image}
                  alt={item.name}
                  fill
                  className="object-cover"
                  sizes="64px"
                />
              )}
              <span className="absolute -right-1 -top-1 inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-black px-1 text-[10px] font-bold text-white">
                {item.quantity}
              </span>
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold text-slate-900">
                {item.name}
              </p>
            </div>
            <p className="text-sm font-semibold text-slate-900">
              {formatMoney(item.price * item.quantity, item.currency)}
            </p>
          </div>
        ))}
      </div>

      <div className="mt-6 space-y-3 border-t border-slate-200 pt-4 text-sm text-slate-700">
        <div className="flex items-center justify-between">
          <span>Subtotal ({itemCount} items)</span>
          <span>{formatMoney(subtotal, currency)}</span>
        </div>

        {/* <div className="flex items-center justify-between">
          <span>Shipping</span>
          <span
            className={hasShippingAddress ? "text-slate-700" : "text-slate-500"}
          >
            {shippingDisplayValue}
          </span>
        </div> */}

        {discountCode ? (
          <div className="flex items-center justify-between text-emerald-700">
            <span>Discount ({discountCode})</span>
            <span>-{formatMoney(discountAmount, currency)}</span>
          </div>
        ) : null}

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1">
            <span>Estimated taxes (</span>
            {taxLoading ? (
              <Skeleton className="h-4 w-12 rounded" />
            ) : (
              <span>{taxRatePercent.toFixed(2)}%</span>
            )}
            <span>)</span>
          </div>
          {taxLoading ? (
            <Skeleton className="h-5 w-20 rounded" />
          ) : (
            <span>{formatMoney(taxAmount, currency)}</span>
          )}
        </div>

        <div className="flex items-center gap-1 text-xs text-slate-500">
          {taxLoading ? (
            <Skeleton className="h-4 w-32 rounded" />
          ) : (
            <span>{taxRateLabel}</span>
          )}
        </div>

        <div className="flex items-center justify-between border-t border-slate-200 pt-3">
          <span className="text-xl font-semibold text-slate-900">Total</span>
          <div className="flex items-end gap-2">
            <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-semibold text-slate-500">
              {currency.toUpperCase()}
            </span>
            <span className="text-xl font-bold leading-none text-slate-900">
              {formatMoney(total, currency)}
            </span>
          </div>
        </div>
      </div>

      {checkoutMeta.cartNote ? (
        <p className="mt-3 rounded-lg bg-slate-100 p-3 text-xs text-slate-600">
          Note: {checkoutMeta.cartNote}
        </p>
      ) : null}
      {/* Success Modal */}
      {showSuccessModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8 text-center animate-in fade-in zoom-in duration-300">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-10 h-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="text-3xl font-bold text-slate-900 mb-2">Payment Successful!</h2>
            <p className="text-slate-600 mb-8 text-lg">
              Thank you for your order. We&rsquo;ve received your payment and are processing it now.
            </p>
            <button
              onClick={() => window.location.href = `/${slug}`}
              className="w-full bg-slate-900 text-white font-bold py-4 rounded-xl hover:bg-slate-800 transition-all transform hover:scale-[1.02] active:scale-[0.98] shadow-lg text-lg"
            >
              Continue Shopping
            </button>
          </div>
        </div>
      )}
    </>
  );

  return (
    <form
      onSubmit={handleSubmit}
      className="grid gap-6  xl:grid-cols-[minmax(0,1fr)_630px] xl:gap-5 xl:rounded-2xl xl:border xl:border-slate-200 xl:bg-white"
    >
      <section className="space-y-4 xl:max-w-4xl rounded-2xl border border-slate-200 bg-white p-4 sm:p-5 md:p-7 xl:rounded-none xl:border-r xl:border-slate-200 xl:border-l-0 xl:border-y-0 xl:pr-8">
        <div>
          <h2 className="text-2xl font-semibold text-slate-900">
            Contact Information
          </h2>
          <div className="mt-3">
            <label className="text-sm text-slate-600" htmlFor="checkout-email">
              Email
            </label>
            <input
              id="checkout-email"
              type="email"
              required
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              className={inputClass}
              placeholder="you@example.com"
            />
          </div>
        </div>

        <section className="rounded-2xl border border-slate-200 bg-white p-4 xl:hidden">
          <button
            type="button"
            onClick={() => setSummaryOpen((prev) => !prev)}
            className="flex w-full items-center justify-between gap-3 text-left"
            aria-expanded={summaryOpen}
          >
            {summaryOpen ? (
              <>
                <p className="text-2xl font-semibold leading-none text-slate-900">
                  Order summary
                </p>
                <ChevronUp size={20} className="text-slate-700" />
              </>
            ) : (
              <>
                <div className="flex min-w-0 items-center gap-3">
                  {firstItem ? (
                    <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-xl border border-slate-200 bg-slate-100">
                      {isVideoUrl(firstItem.image) ? (
                        <video
                          src={firstItem.image}
                          className="h-full w-full object-cover"
                          muted
                          playsInline
                          preload="metadata"
                        />
                      ) : (
                        <Image
                          src={firstItem.image}
                          alt={firstItem.name}
                          fill
                          className="object-cover"
                          sizes="56px"
                        />
                      )}
                    </div>
                  ) : null}
                  <div>
                    <p className="text-md font-semibold leading-none text-slate-900">
                      Total
                    </p>
                    <p className="mt-1 text-sm text-slate-500">
                      {itemCount} items
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-semibold text-slate-500">
                    {currency.toUpperCase()}
                  </span>
                  <span className="text-md font-bold leading-none text-slate-900">
                    {formatMoney(total, currency)}
                  </span>
                  <ChevronDown size={16} className="text-slate-700" />
                </div>
              </>
            )}
          </button>

          {summaryOpen ? summaryDetails : null}

          <button
            type="submit"
            onClick={handlePayNowClick}
            disabled={loading || !store.paymentSettings?.stripe?.enabled}
            className="mt-4 flex h-10 w-full items-center justify-center gap-2 rounded-xl bg-[#1663d6] text-md font-semibold text-white transition hover:bg-[#1257bc] disabled:opacity-50"
          >
            {loading ? <Spinner size={16} className="text-white" /> : null}
            {loading
              ? store.paymentSettings?.stripe?.enabled
                ? "Redirecting..."
                : "Processing..."
              : store.paymentSettings?.stripe?.enabled
                ? "Pay now"
                : "Payment not ready"}
          </button>

          {error && !summaryOpen ? (
            <p className="mt-3 rounded-lg bg-red-50 p-3 text-sm font-semibold text-red-600">
              {error}
            </p>
          ) : null}
        </section>

        <div>
          <h2 className="text-2xl font-semibold text-slate-900">
            Shipping Address
          </h2>
          <div className="mt-3 grid gap-3 md:grid-cols-2">
            <div className="md:col-span-2">
              <label
                className="text-sm text-slate-600"
                htmlFor="shipping-country"
              >
                Country
              </label>
              <SingleSelectDropdown
                id="shipping-country"
                value={shipping.countryCode}
                options={countryOptions}
                placeholder="Select country"
                searchPlaceholder="Search country..."
                onChange={setShippingCountry}
              />
            </div>
            <div>
              <label
                className="text-sm text-slate-600"
                htmlFor="shipping-firstName"
              >
                First Name
              </label>
              <input
                id="shipping-firstName"
                required
                value={shipping.firstName}
                onChange={(event) =>
                  updateShipping("firstName", event.target.value)
                }
                className={inputClass}
              />
            </div>
            <div>
              <label
                className="text-sm text-slate-600"
                htmlFor="shipping-lastName"
              >
                Last Name
              </label>
              <input
                id="shipping-lastName"
                required
                value={shipping.lastName}
                onChange={(event) =>
                  updateShipping("lastName", event.target.value)
                }
                className={inputClass}
              />
            </div>
            <div className="md:col-span-2">
              <label
                className="text-sm text-slate-600"
                htmlFor="shipping-address"
              >
                Shipping Address
              </label>
              <input
                id="shipping-address"
                required
                value={shipping.shippingAddress}
                onChange={(event) =>
                  updateShipping("shippingAddress", event.target.value)
                }
                className={inputClass}
              />
            </div>
            <div>
              <label
                className="text-sm text-slate-600"
                htmlFor="shipping-state"
              >
                State / Province
              </label>
              {shippingStates.length ? (
                <SingleSelectDropdown
                  id="shipping-state"
                  value={shipping.stateCode}
                  options={shippingStateOptions}
                  placeholder="Select state"
                  searchPlaceholder="Search state..."
                  onChange={setShippingState}
                  disabled={!shipping.countryCode}
                />
              ) : (
                <input
                  id="shipping-state"
                  required
                  value={shipping.state}
                  onChange={(event) =>
                    updateShipping("state", event.target.value)
                  }
                  className={inputClass}
                />
              )}
            </div>
            <div>
              <label className="text-sm text-slate-600" htmlFor="shipping-city">
                City
              </label>
              {shippingCities.length ? (
                <SingleSelectDropdown
                  id="shipping-city"
                  value={shipping.city}
                  options={shippingCityOptions}
                  placeholder="Select city"
                  searchPlaceholder="Search city..."
                  onChange={(value) => updateShipping("city", value)}
                  disabled={!shipping.stateCode}
                />
              ) : (
                <input
                  id="shipping-city"
                  required
                  value={shipping.city}
                  onChange={(event) =>
                    updateShipping("city", event.target.value)
                  }
                  className={inputClass}
                />
              )}
            </div>
            <div className="md:col-span-2">
              <label
                className="text-sm text-slate-600"
                htmlFor="shipping-postalCode"
              >
                Postal Code
              </label>
              <input
                id="shipping-postalCode"
                required
                value={shipping.postalCode}
                onChange={(event) =>
                  updateShipping("postalCode", event.target.value)
                }
                className={inputClass}
              />
            </div>
          </div>
        </div>

        <div>
          <div className="flex flex-col items-start gap-3 sm:flex-row sm:items-center sm:justify-between">
            <h2 className="text-2xl font-semibold text-slate-900">
              Billing Address
            </h2>
            <label className="inline-flex items-center gap-2 text-sm text-slate-700">
              <input
                type="checkbox"
                checked={useShippingAsBilling}
                onChange={(event) =>
                  setUseShippingAsBilling(event.target.checked)
                }
                className="h-4 w-4 accent-slate-700"
              />
              Use shipping address as billing address
            </label>
          </div>

          {!useShippingAsBilling ? (
            <div className="mt-3 grid gap-3 md:grid-cols-2">
              <div className="md:col-span-2">
                <label
                  className="text-sm text-slate-600"
                  htmlFor="billing-country"
                >
                  Country
                </label>
                <SingleSelectDropdown
                  id="billing-country"
                  value={billing.countryCode}
                  options={countryOptions}
                  placeholder="Select country"
                  searchPlaceholder="Search country..."
                  onChange={setBillingCountry}
                />
              </div>
              <div>
                <label
                  className="text-sm text-slate-600"
                  htmlFor="billing-firstName"
                >
                  First Name
                </label>
                <input
                  id="billing-firstName"
                  required={!useShippingAsBilling}
                  value={billing.firstName}
                  onChange={(event) =>
                    updateBilling("firstName", event.target.value)
                  }
                  className={inputClass}
                />
              </div>
              <div>
                <label
                  className="text-sm text-slate-600"
                  htmlFor="billing-lastName"
                >
                  Last Name
                </label>
                <input
                  id="billing-lastName"
                  required={!useShippingAsBilling}
                  value={billing.lastName}
                  onChange={(event) =>
                    updateBilling("lastName", event.target.value)
                  }
                  className={inputClass}
                />
              </div>
              <div className="md:col-span-2">
                <label
                  className="text-sm text-slate-600"
                  htmlFor="billing-address"
                >
                  Shipping Address
                </label>
                <input
                  id="billing-address"
                  required={!useShippingAsBilling}
                  value={billing.shippingAddress}
                  onChange={(event) =>
                    updateBilling("shippingAddress", event.target.value)
                  }
                  className={inputClass}
                />
              </div>
              <div>
                <label
                  className="text-sm text-slate-600"
                  htmlFor="billing-state"
                >
                  State / Province
                </label>
                {billingStates.length ? (
                  <SingleSelectDropdown
                    id="billing-state"
                    value={billing.stateCode}
                    options={billingStateOptions}
                    placeholder="Select state"
                    searchPlaceholder="Search state..."
                    onChange={setBillingState}
                    disabled={!billing.countryCode}
                  />
                ) : (
                  <input
                    id="billing-state"
                    required={!useShippingAsBilling}
                    value={billing.state}
                    onChange={(event) =>
                      updateBilling("state", event.target.value)
                    }
                    className={inputClass}
                  />
                )}
              </div>
              <div>
                <label
                  className="text-sm text-slate-600"
                  htmlFor="billing-city"
                >
                  City
                </label>
                {billingCities.length ? (
                  <SingleSelectDropdown
                    id="billing-city"
                    value={billing.city}
                    options={billingCityOptions}
                    placeholder="Select city"
                    searchPlaceholder="Search city..."
                    onChange={(value) => updateBilling("city", value)}
                    disabled={!billing.stateCode}
                  />
                ) : (
                  <input
                    id="billing-city"
                    required={!useShippingAsBilling}
                    value={billing.city}
                    onChange={(event) =>
                      updateBilling("city", event.target.value)
                    }
                    className={inputClass}
                  />
                )}
              </div>
              <div className="md:col-span-2">
                <label
                  className="text-sm text-slate-600"
                  htmlFor="billing-postalCode"
                >
                  Postal Code
                </label>
                <input
                  id="billing-postalCode"
                  required={!useShippingAsBilling}
                  value={billing.postalCode}
                  onChange={(event) =>
                    updateBilling("postalCode", event.target.value)
                  }
                  className={inputClass}
                />
              </div>
            </div>
          ) : null}
        </div>

        <div className="mt-8 border-t border-slate-100 pt-6">
          <h2 className="text-2xl font-semibold text-slate-900">Payment</h2>
          <p className="mt-1 text-sm text-slate-500">
            All transactions are secure and encrypted.
          </p>

          <div className="mt-4 space-y-3">
            {store.paymentSettings?.stripe?.enabled && (
              <label
                className={`flex cursor-pointer items-center justify-between rounded-xl border p-4 transition-all ${
                  provider === "stripe"
                    ? "border-slate-900 bg-slate-50 ring-1 ring-slate-900"
                    : "border-slate-200 bg-white hover:border-slate-300"
                }`}
              >
                <div className="flex items-center gap-3">
                  <input
                    type="radio"
                    name="paymentProvider"
                    value="stripe"
                    checked={provider === "stripe"}
                    onChange={() => setProvider("stripe")}
                    className="h-4 w-4 accent-slate-900"
                  />
                  <span className="font-semibold text-slate-900">
                    Credit Card (via Stripe)
                  </span>
                </div>
                <div className="flex gap-1">
                  <div className="h-5 w-8 rounded bg-slate-100"></div>
                  <div className="h-5 w-8 rounded bg-slate-100"></div>
                </div>
              </label>
            )}

            {store.paymentSettings?.helcim?.enabled && (
              <div
                className={`rounded-xl border-2 transition-all ${
                  provider === "helcim"
                    ? "border-slate-900 bg-slate-50 ring-2 ring-slate-900/10"
                    : "border-slate-200 bg-white hover:border-slate-300"
                }`}
              >
                <label className="flex cursor-pointer items-center justify-between p-4">
                  <div className="flex items-center gap-3">
                    <input
                      type="radio"
                      name="paymentProvider"
                      value="helcim"
                      checked={provider === "helcim"}
                      onChange={() => setProvider("helcim")}
                      className="h-4 w-4 accent-slate-900"
                    />
                    <span className="font-semibold text-slate-900">
                      Credit Card (via Helcim)
                    </span>
                  </div>
                </label>

                {provider === "helcim" && (
                  <div className="border-t border-slate-200 p-4">
                    <HelcimForm
                      slug={slug}
                      accountId={store.paymentSettings.helcim.accountId}
                      amount={total}
                      currency={currency}
                      email={email}
                      shipping={shipping}
                      items={items}
                      onSuccess={handleHelcimCheckout}
                      onError={(msg) => {
                        setError(msg);
                        setIsHelcimInitializing(false);
                        setIsHelcimActive(false);
                      }}
                      onReady={() => setIsHelcimInitializing(false)}
                      trigger={isHelcimActive}
                    />
                  </div>
                )}
              </div>
            )}

            {!availableProviders.length && (
              <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
                This store is not configured to accept online payments.
              </div>
            )}
          </div>
        </div>
      </section>

      <aside className="hidden  self-start p-6 xl:block xl:pl-6 2xl:sticky 2xl:top-6">
        <h3 className="text-2xl font-semibold text-slate-900">Order summary</h3>
        {summaryDetails}

        {error ? (
          <p className="mt-3 rounded-lg bg-red-50 p-3 text-sm font-semibold text-red-600">
            {error}
          </p>
        ) : null}

        <button
          type={provider === "stripe" ? "button" : "submit"}
          onClick={(e) => {
            if (provider === "stripe") {
              e.preventDefault();
              handleStripeCheckout();
            } else if (provider === "helcim" && !isHelcimActive) {
              e.preventDefault();
              setIsHelcimActive(true);
              setIsHelcimInitializing(true);
            }
          }}
          disabled={loading || provider === "none"}
          className="mt-4 flex h-12 cursor-pointer w-full items-center justify-center gap-2 rounded-xl bg-[#1663d6] text-md font-semibold text-white transition hover:bg-[#1257bc] disabled:opacity-50"
        >
          {loading || isHelcimInitializing ? <Spinner size={16} className="text-white" /> : null}
          {loading || isHelcimInitializing
            ? "Processing..."
            : provider === "stripe"
            ? "Pay now"
            : provider === "helcim"
            ? isHelcimActive ? (isHelcimInitializing ? "Loading payment..." : "Complete payment above") : "Pay now"
            : "Select payment method"}
        </button>
      </aside>
    </form>
  );
}
