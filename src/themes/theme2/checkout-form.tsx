"use client";

import Image from "next/image";
import { City, Country, State } from "country-state-city";
import { useEffect, useMemo, useState } from "react";

import { Spinner } from "@/components/admin/ui/loader";
import { HelcimForm } from "@/components/checkout/helcim-form";
import { useAppDispatch, useAppSelector } from "@/hooks/useRedux";
import { clearSlugCart } from "@/store/slices/cartSlice";
import {
  Theme2SingleSelectDropdown,
  type Theme2SingleSelectOption,
} from "@/themes/theme2/components/theme2-single-select-dropdown";
import type { StorefrontStore } from "@/themes/types";
import { formatMoney } from "@/utils/currency";
import { isVideoUrl } from "@/utils/media";

type Theme2CheckoutFormProps = { slug: string; store: StorefrontStore };

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

const CHECKOUT_DISCOUNT_CODES: Record<
  string,
  { code: string; percent: number }
> = {
  deva123: { code: "Deva123", percent: 20 },
  vinayak123: { code: "Vinayak123", percent: 30 },
};

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

function getAvailableProviders(store: StorefrontStore) {
  return [
    ...(store.paymentSettings?.stripe?.enabled ? ["stripe"] : []),
    ...(store.paymentSettings?.helcim?.enabled ? ["helcim"] : []),
  ];
}

function roundPrice(value: number) {
  return Math.round(value * 100) / 100;
}

function toSingleSelectOptions<T extends { name: string }>(
  list: T[],
  getValue: (item: T) => string,
): Theme2SingleSelectOption[] {
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
    const countryCode = String(data?.countryCode || "")
      .trim()
      .toUpperCase();
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
    const countryCode = String(data?.countryCode || data?.countryCode2 || "")
      .trim()
      .toUpperCase();

    if (countryCode && Country.getCountryByCode(countryCode)) {
      return countryCode;
    }
  } catch {
    // Permission denied / timeout / network issue.
  }

  return "";
}

function loadCheckoutMeta(checkoutMetaKey: string): CheckoutMetaState {
  if (typeof window === "undefined")
    return { cartNote: "", discountCode: "", discountPercentage: 0 };

  const rawMeta = window.localStorage.getItem(checkoutMetaKey);
  if (!rawMeta)
    return { cartNote: "", discountCode: "", discountPercentage: 0 };

  try {
    const parsedMeta = JSON.parse(rawMeta) as Partial<CheckoutMetaState>;
    return {
      cartNote: parsedMeta.cartNote || "",
      discountCode: parsedMeta.discountCode || "",
      discountPercentage:
        typeof parsedMeta.discountPercentage === "number"
          ? parsedMeta.discountPercentage
          : 0,
    };
  } catch {
    window.localStorage.removeItem(checkoutMetaKey);
    return { cartNote: "", discountCode: "", discountPercentage: 0 };
  }
}

export function Theme2CheckoutForm({ slug, store }: Theme2CheckoutFormProps) {
  const dispatch = useAppDispatch();
  const items = useAppSelector((state) =>
    state.cart.items.filter((item) => item.slug === slug),
  );
  const checkoutMetaKey = `theme2CheckoutMeta:${slug}`;

  const [email, setEmail] = useState("");
  const [shipping, setShipping] = useState<AddressFormState>(EMPTY_ADDRESS);
  const [billing, setBilling] = useState<AddressFormState>(EMPTY_ADDRESS);
  const [useShippingAsBilling, setUseShippingAsBilling] = useState(true);
  const [checkoutMeta] = useState<CheckoutMetaState>(() =>
    loadCheckoutMeta(checkoutMetaKey),
  );
  const [provider, setProvider] = useState(
    () => getAvailableProviders(store)[0] || "none",
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [isHelcimActive, setIsHelcimActive] = useState(false);
  const [isHelcimInitializing, setIsHelcimInitializing] = useState(false);
  const [taxRatePercent, setTaxRatePercent] = useState(0);
  const [taxRateLabel, setTaxRateLabel] = useState("No sales tax");
  const [taxLoading, setTaxLoading] = useState(false);

  const availableProviders = getAvailableProviders(store);
  const activeProvider = availableProviders.includes(provider)
    ? provider
    : availableProviders[0] || "none";

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
  const taxableAmount = Math.max(0, subtotal - discountAmount);
  const taxAmount = useMemo(
    () => roundPrice((taxableAmount * taxRatePercent) / 100),
    [taxableAmount, taxRatePercent],
  );
  const total = useMemo(
    () => roundPrice(taxableAmount + taxAmount),
    [taxableAmount, taxAmount],
  );
  const currency = items[0]?.currency || "INR";

  useEffect(() => {
    setIsHelcimActive(false);
    setIsHelcimInitializing(false);
    setError("");
  }, [activeProvider]);

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
          { signal: controller.signal },
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

    void loadTaxRate();

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
    setShipping((prev) => ({ ...prev, [field]: value }));
  }

  function updateBilling(field: keyof AddressFormState, value: string) {
    setBilling((prev) => ({ ...prev, [field]: value }));
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

  function validateAddress(address: AddressFormState) {
    if (!address.countryCode || !address.country) return "Country is required.";
    if (!address.firstName || !address.lastName)
      return "First name and last name are required.";
    if (!address.shippingAddress) return "Address is required.";
    if (!address.state) return "State/Province is required.";
    if (!address.city) return "City is required.";
    if (!address.postalCode) return "Postal code is required.";
    return "";
  }

  function validateForm() {
    if (!email.trim()) return "Email is required.";

    const shippingError = validateAddress(shipping);
    if (shippingError) return shippingError;

    if (!useShippingAsBilling) {
      const billingError = validateAddress(billing);
      if (billingError) return `Billing: ${billingError}`;
    }

    if (activeProvider === "none") return "Payment provider not configured.";
    return "";
  }

  async function handleStripeCheckout() {
    if (!store.paymentSettings?.stripe?.enabled) {
      setError(
        "This store is currently not set up to receive Stripe payments.",
      );
      return;
    }

    const validationError = validateForm();
    if (validationError) return setError(validationError);

    setLoading(true);
    setError("");

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
        return setError(data.error || "Stripe checkout failed.");
      }

      const { url } = await response.json();
      if (url) {
        window.location.href = url;
      } else {
        setError("Payment session initialization failed.");
      }
    } catch {
      setError("A network error occurred while starting your payment.");
    } finally {
      setLoading(false);
    }
  }

  async function handleHelcimCheckout(transactionId: string) {
    const validationError = validateForm();
    if (validationError) return setError(validationError);

    setLoading(true);
    setError("");

    try {
      const response = await fetch(
        `/api/store/${slug}/payment/helcim/process`,
        {
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
        },
      );

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        return setError(data.error || "Helcim payment failed.");
      }

      dispatch(clearSlugCart({ slug }));
      localStorage.removeItem(checkoutMetaKey);
      window.location.href = `/${slug}`;
    } catch {
      setError("A network error occurred while processing Helcim payment.");
    } finally {
      setLoading(false);
    }
  }

  if (!items.length)
    return (
      <p className="rounded border border-dashed p-8 text-center">
        Cart is empty.
      </p>
    );

  const inputClass =
    "mt-1 h-11 w-full rounded border border-[#ccd3d0] bg-white px-3 text-sm text-[#304340] outline-none transition focus:border-[#8ea39e] focus:ring-2 focus:ring-[#dce4e1]";

  return (
    <div className="[font-family:var(--font-theme2-sans)]">
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_360px]">
        <section className="space-y-6 border border-[#cad1ce] bg-white p-6 md:p-8">
          <div>
            <h2 className="text-2xl [font-family:var(--font-theme2-serif)] text-[#2f403d]">
              Contact
            </h2>
            <label
              className="mt-3 block text-sm text-[#5f726e]"
              htmlFor="checkout-email"
            >
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

          <div>
            <h2 className="text-2xl [font-family:var(--font-theme2-serif)] text-[#2f403d]">
              Shipping Address
            </h2>
            <div className="mt-3 grid gap-3 md:grid-cols-2">
              <div className="md:col-span-2">
                <label
                  className="text-sm text-[#5f726e]"
                  htmlFor="shipping-country"
                >
                  Country
                </label>
                <Theme2SingleSelectDropdown
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
                  className="text-sm text-[#5f726e]"
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
                  className="text-sm text-[#5f726e]"
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
                  className="text-sm text-[#5f726e]"
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
                  className="text-sm text-[#5f726e]"
                  htmlFor="shipping-state"
                >
                  State / Province
                </label>
                {shippingStates.length ? (
                  <Theme2SingleSelectDropdown
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
                <label
                  className="text-sm text-[#5f726e]"
                  htmlFor="shipping-city"
                >
                  City
                </label>
                {shippingCities.length ? (
                  <Theme2SingleSelectDropdown
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
                  className="text-sm text-[#5f726e]"
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
              <h2 className="text-2xl [font-family:var(--font-theme2-serif)] text-[#2f403d]">
                Billing Address
              </h2>
              <label className="inline-flex items-center gap-2 text-sm text-[#445955]">
                <input
                  type="checkbox"
                  checked={useShippingAsBilling}
                  onChange={(event) =>
                    setUseShippingAsBilling(event.target.checked)
                  }
                  className="h-4 w-4 accent-[#395f58]"
                />
                Use shipping address as billing address
              </label>
            </div>

            {!useShippingAsBilling ? (
              <div className="mt-3 grid gap-3 md:grid-cols-2">
                <div className="md:col-span-2">
                  <label
                    className="text-sm text-[#5f726e]"
                    htmlFor="billing-country"
                  >
                    Country
                  </label>
                  <Theme2SingleSelectDropdown
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
                    className="text-sm text-[#5f726e]"
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
                    className="text-sm text-[#5f726e]"
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
                    className="text-sm text-[#5f726e]"
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
                    className="text-sm text-[#5f726e]"
                    htmlFor="billing-state"
                  >
                    State / Province
                  </label>
                  {billingStates.length ? (
                    <Theme2SingleSelectDropdown
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
                    className="text-sm text-[#5f726e]"
                    htmlFor="billing-city"
                  >
                    City
                  </label>
                  {billingCities.length ? (
                    <Theme2SingleSelectDropdown
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
                    className="text-sm text-[#5f726e]"
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

          <div className="border-t border-[#d4dbd8] pt-6">
            <h2 className="text-2xl [font-family:var(--font-theme2-serif)] text-[#2f403d]">
              Payment
            </h2>
            <p className="mt-1 text-sm text-[#5f726e]">
              All transactions are secure and encrypted.
            </p>
            <div className="mt-4 space-y-3">
              {store.paymentSettings?.stripe?.enabled && (
                <label
                  className={`flex cursor-pointer items-center justify-between border p-4 ${activeProvider === "stripe" ? "border-[#8ea39e] bg-[#f4f7f5]" : "border-[#d1d8d5] bg-white"}`}
                >
                  <div className="flex items-center gap-3">
                    <input
                      type="radio"
                      name="paymentProvider"
                      value="stripe"
                      checked={activeProvider === "stripe"}
                      onChange={() => setProvider("stripe")}
                      className="h-4 w-4 accent-[#395f58]"
                    />
                    <span className="font-semibold text-[#2f403d]">
                      Credit Card (via Stripe)
                    </span>
                  </div>
                </label>
              )}

              {store.paymentSettings?.helcim?.enabled && (
                <div
                  className={`border ${activeProvider === "helcim" ? "border-[#8ea39e] bg-[#f4f7f5]" : "border-[#d1d8d5] bg-white"}`}
                >
                  <label className="flex cursor-pointer items-center justify-between p-4">
                    <div className="flex items-center gap-3">
                      <input
                        type="radio"
                        name="paymentProvider"
                        value="helcim"
                        checked={activeProvider === "helcim"}
                        onChange={() => setProvider("helcim")}
                        className="h-4 w-4 accent-[#395f58]"
                      />
                      <span className="font-semibold text-[#2f403d]">
                        Credit Card (via Helcim)
                      </span>
                    </div>
                  </label>
                  {activeProvider === "helcim" ? (
                    <div className="border-t border-[#d1d8d5] p-4">
                      <HelcimForm
                        slug={slug}
                        accountId={store.paymentSettings.helcim.accountId}
                        amount={total}
                        currency={currency}
                        email={email}
                        shipping={shipping}
                        items={items}
                        onSuccess={handleHelcimCheckout}
                        onError={(message) => {
                          setError(message);
                          setIsHelcimInitializing(false);
                          setIsHelcimActive(false);
                        }}
                        onReady={() => setIsHelcimInitializing(false)}
                        trigger={isHelcimActive}
                      />
                    </div>
                  ) : null}
                </div>
              )}

              {!availableProviders.length && (
                <div className="border border-amber-300 bg-amber-50 p-4 text-sm text-amber-800">
                  This store is not configured to accept online payments.
                </div>
              )}
            </div>
          </div>

          {error ? (
            <p className="rounded border border-red-200 bg-red-50 p-3 text-sm text-red-600">
              {error}
            </p>
          ) : null}
        </section>

        <aside className="h-fit border border-[#cad1ce] bg-[#f7f9f7] p-6 text-[#2f403d] lg:sticky lg:top-6">
          <h3 className="text-2xl [font-family:var(--font-theme2-serif)]">
            Order Summary
          </h3>

          <div className="mt-4 space-y-3">
            {items.map((item) => (
              <div key={item.productId} className="flex items-center gap-3">
                <div className="relative h-16 w-16 shrink-0 overflow-hidden border border-[#d2d9d6] bg-[#f8f9f8]">
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
                  <span className="absolute -right-1 -top-1 inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-[#304340] px-1 text-[10px] font-bold text-white">
                    {item.quantity}
                  </span>
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-[#2f403d]">
                    {item.name}
                  </p>
                </div>
                <p className="text-sm font-semibold text-[#2f403d]">
                  {formatMoney(item.price * item.quantity, item.currency)}
                </p>
              </div>
            ))}
          </div>

          <div className="mt-6 space-y-2 border-t border-[#d4dbd8] pt-4 text-sm text-[#445955]">
            <div className="flex items-center justify-between">
              <span>Subtotal ({itemCount} items)</span>
              <span>{formatMoney(subtotal, currency)}</span>
            </div>
            {discountCode ? (
              <div className="flex items-center justify-between text-emerald-700">
                <span>Discount ({discountCode})</span>
                <span>-{formatMoney(discountAmount, currency)}</span>
              </div>
            ) : null}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1">
                <span>Estimated taxes (</span>
                <span>
                  {taxLoading ? "..." : `${taxRatePercent.toFixed(2)}%`}
                </span>
                <span>)</span>
              </div>
              <span>
                {taxLoading
                  ? "Calculating..."
                  : formatMoney(taxAmount, currency)}
              </span>
            </div>
            <div className="text-xs text-[#6f827d]">
              {taxLoading ? "Checking tax rate..." : taxRateLabel}
            </div>
            <div className="flex items-center justify-between border-t border-[#d4dbd8] pt-3">
              <span className="text-base font-semibold text-[#2f403d]">
                Total
              </span>
              <span className="text-xl [font-family:var(--font-theme2-serif)] text-[#2f403d]">
                {formatMoney(total, currency)}
              </span>
            </div>
          </div>

          {checkoutMeta.cartNote ? (
            <p className="mt-3 border-t border-[#d4dbd8] pt-3 text-xs text-[#5f726e]">
              Note: {checkoutMeta.cartNote}
            </p>
          ) : null}

          <button
            type="button"
            onClick={() => {
              if (activeProvider === "stripe") {
                void handleStripeCheckout();
                return;
              }
              if (activeProvider === "helcim" && !isHelcimActive) {
                setIsHelcimActive(true);
                setIsHelcimInitializing(true);
              }
            }}
            disabled={loading || activeProvider === "none"}
            className="mt-5 flex h-12 w-full items-center justify-center gap-2 bg-[#95af8f] text-sm font-semibold uppercase tracking-[0.14em] text-white transition hover:bg-[#809c7c] disabled:opacity-50"
          >
            {loading || isHelcimInitializing ? (
              <Spinner size={16} className="text-white" />
            ) : null}
            {loading || isHelcimInitializing
              ? "Processing..."
              : activeProvider === "stripe"
                ? "Pay now"
                : activeProvider === "helcim"
                  ? isHelcimActive
                    ? isHelcimInitializing
                      ? "Loading payment..."
                      : "Complete payment above"
                    : "Pay now"
                  : "Select payment method"}
          </button>
        </aside>
      </div>
    </div>
  );
}
