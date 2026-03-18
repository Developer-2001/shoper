"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { http } from "@/lib/http";

type StorePayload = {
  logo?: string;
  address?: string;
  about?: string;
  contactEmail?: string;
  contactMobile?: string;
  socialLinks?: {
    instagram?: string;
    facebook?: string;
    x?: string;
    youtube?: string;
  };
  homeContent?: {
    heroTitle?: string;
    heroSubtitle?: string;
    sliderImages?: string[];
    ctaText?: string;
  };
  theme?: {
    primaryColor?: string;
    secondaryColor?: string;
    accentColor?: string;
  };
};

type StoreConfigForm = {
  logo: string;
  address: string;
  about: string;
  contactEmail: string;
  contactMobile: string;
  instagram: string;
  facebook: string;
  x: string;
  youtube: string;
  heroTitle: string;
  heroSubtitle: string;
  sliderImagesInput: string;
  ctaText: string;
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
};

const initialForm: StoreConfigForm = {
  logo: "",
  address: "",
  about: "",
  contactEmail: "",
  contactMobile: "",
  instagram: "",
  facebook: "",
  x: "",
  youtube: "",
  heroTitle: "",
  heroSubtitle: "",
  sliderImagesInput: "",
  ctaText: "Shop Now",
  primaryColor: "#0f172a",
  secondaryColor: "#f59e0b",
  accentColor: "#0ea5e9",
};

export default function ConfigureStorePage() {
  const [form, setForm] = useState<StoreConfigForm>(initialForm);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadStore() {
      const data = await http<{ store: StorePayload }>("/api/admin/store");
      const store = data.store;

      setForm({
        logo: store.logo || "",
        address: store.address || "",
        about: store.about || "",
        contactEmail: store.contactEmail || "",
        contactMobile: store.contactMobile || "",
        instagram: store.socialLinks?.instagram || "",
        facebook: store.socialLinks?.facebook || "",
        x: store.socialLinks?.x || "",
        youtube: store.socialLinks?.youtube || "",
        heroTitle: store.homeContent?.heroTitle || "",
        heroSubtitle: store.homeContent?.heroSubtitle || "",
        sliderImagesInput: (store.homeContent?.sliderImages || []).join(", "),
        ctaText: store.homeContent?.ctaText || "Shop Now",
        primaryColor: store.theme?.primaryColor || "#0f172a",
        secondaryColor: store.theme?.secondaryColor || "#f59e0b",
        accentColor: store.theme?.accentColor || "#0ea5e9",
      });
    }

    loadStore();
  }, []);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setMessage("");
    setError("");

    try {
      await http("/api/admin/store", {
        method: "PUT",
        body: {
          logo: form.logo,
          address: form.address,
          about: form.about,
          contactEmail: form.contactEmail,
          contactMobile: form.contactMobile,
          socialLinks: {
            instagram: form.instagram,
            facebook: form.facebook,
            x: form.x,
            youtube: form.youtube,
          },
          homeContent: {
            heroTitle: form.heroTitle,
            heroSubtitle: form.heroSubtitle,
            sliderImages: form.sliderImagesInput
              .split(",")
              .map((item) => item.trim())
              .filter(Boolean),
            ctaText: form.ctaText,
          },
          theme: {
            primaryColor: form.primaryColor,
            secondaryColor: form.secondaryColor,
            accentColor: form.accentColor,
          },
        },
      });

      setMessage("Store configuration updated.");
    } catch (submissionError) {
      setError(submissionError instanceof Error ? submissionError.message : "Unable to update store");
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <h2 className="text-lg font-semibold text-slate-900">Configure Store</h2>
      <p className="mt-1 text-sm text-slate-600">Update branding, contact details, social links, and homepage content.</p>

      <form className="mt-5 grid gap-3 md:grid-cols-2" onSubmit={handleSubmit}>
        <Input
          placeholder="Logo URL"
          value={form.logo}
          onChange={(event) => setForm((prev) => ({ ...prev, logo: event.target.value }))}
        />
        <Input
          placeholder="Address"
          value={form.address}
          onChange={(event) => setForm((prev) => ({ ...prev, address: event.target.value }))}
          required
        />

        <Input
          type="email"
          placeholder="Contact Email"
          value={form.contactEmail}
          onChange={(event) => setForm((prev) => ({ ...prev, contactEmail: event.target.value }))}
          required
        />
        <Input
          placeholder="Contact Mobile"
          value={form.contactMobile}
          onChange={(event) => setForm((prev) => ({ ...prev, contactMobile: event.target.value }))}
          required
        />

        <textarea
          className="min-h-24 rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-900 md:col-span-2"
          placeholder="About your store"
          value={form.about}
          onChange={(event) => setForm((prev) => ({ ...prev, about: event.target.value }))}
          required
        />

        <Input
          placeholder="Instagram URL"
          value={form.instagram}
          onChange={(event) => setForm((prev) => ({ ...prev, instagram: event.target.value }))}
        />
        <Input
          placeholder="Facebook URL"
          value={form.facebook}
          onChange={(event) => setForm((prev) => ({ ...prev, facebook: event.target.value }))}
        />
        <Input
          placeholder="X URL"
          value={form.x}
          onChange={(event) => setForm((prev) => ({ ...prev, x: event.target.value }))}
        />
        <Input
          placeholder="YouTube URL"
          value={form.youtube}
          onChange={(event) => setForm((prev) => ({ ...prev, youtube: event.target.value }))}
        />

        <Input
          placeholder="Hero Title"
          value={form.heroTitle}
          onChange={(event) => setForm((prev) => ({ ...prev, heroTitle: event.target.value }))}
          required
        />
        <Input
          placeholder="CTA Text"
          value={form.ctaText}
          onChange={(event) => setForm((prev) => ({ ...prev, ctaText: event.target.value }))}
          required
        />

        <textarea
          className="min-h-20 rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-900 md:col-span-2"
          placeholder="Hero Subtitle"
          value={form.heroSubtitle}
          onChange={(event) => setForm((prev) => ({ ...prev, heroSubtitle: event.target.value }))}
          required
        />

        <Input
          className="md:col-span-2"
          placeholder="Slider Image URLs (comma separated, max 5)"
          value={form.sliderImagesInput}
          onChange={(event) => setForm((prev) => ({ ...prev, sliderImagesInput: event.target.value }))}
        />

        <label className="flex items-center gap-2 text-sm text-slate-700">
          Primary Color
          <input
            type="color"
            value={form.primaryColor}
            onChange={(event) => setForm((prev) => ({ ...prev, primaryColor: event.target.value }))}
          />
        </label>
        <label className="flex items-center gap-2 text-sm text-slate-700">
          Secondary Color
          <input
            type="color"
            value={form.secondaryColor}
            onChange={(event) => setForm((prev) => ({ ...prev, secondaryColor: event.target.value }))}
          />
        </label>
        <label className="flex items-center gap-2 text-sm text-slate-700 md:col-span-2">
          Accent Color
          <input
            type="color"
            value={form.accentColor}
            onChange={(event) => setForm((prev) => ({ ...prev, accentColor: event.target.value }))}
          />
        </label>

        {error ? <p className="text-sm text-rose-600 md:col-span-2">{error}</p> : null}
        {message ? <p className="text-sm text-emerald-600 md:col-span-2">{message}</p> : null}

        <Button type="submit" className="md:col-span-2" disabled={loading}>
          {loading ? "Saving changes..." : "Save Store Configuration"}
        </Button>
      </form>
    </section>
  );
}
