"use client";

import { FormEvent, useEffect, useState } from "react";

import { AdminTopbar } from "@/components/admin/admin-topbar";

const defaultForm = {
  companyName: "",
  logoText: "",
  about: "",
  address: "",
  contactEmail: "",
  contactPhone: "",
  instagram: "",
  facebook: "",
  x: "",
  youtube: "",
  themeLayout: "theme1",
  primary: "#0f172a",
  accent: "#14b8a6",
  heroImage: "",
  sliderImages: "",
  footerLinks: "",
};

export default function ConfigureStorePage() {
  const [form, setForm] = useState(defaultForm);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    async function load() {
      const response = await fetch("/api/admin/store");
      if (!response.ok) return;
      const data = await response.json();
      const store = data.store;

      setForm({
        companyName: store.businessName || "",
        logoText: store.logoText || "",
        about: store.about || "",
        address: store.address || "",
        contactEmail: store.contactEmail || "",
        contactPhone: store.contactPhone || "",
        instagram: store.socialLinks?.instagram || "",
        facebook: store.socialLinks?.facebook || "",
        x: store.socialLinks?.x || "",
        youtube: store.socialLinks?.youtube || "",
        themeLayout: store.theme?.layout || "theme1",
        primary: store.theme?.primary || "#0f172a",
        accent: store.theme?.accent || "#14b8a6",
        heroImage: store.theme?.heroImage || "",
        sliderImages: store.theme?.sliderImages?.join(",") || "",
        footerLinks: (store.footerLinks || [])
          .map((item: { label: string; href: string }) => `${item.label}|${item.href}`)
          .join(","),
      });
    }

    load();
  }, []);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setSaving(true);

    const payload = {
      companyName: form.companyName,
      logoText: form.logoText,
      about: form.about,
      address: form.address,
      contactEmail: form.contactEmail,
      contactPhone: form.contactPhone,
      socialLinks: {
        instagram: form.instagram,
        facebook: form.facebook,
        x: form.x,
        youtube: form.youtube,
      },
      theme: {
        layout: form.themeLayout,
        primary: form.primary,
        accent: form.accent,
        heroImage: form.heroImage,
        sliderImages: form.sliderImages.split(",").map((item) => item.trim()).filter(Boolean),
      },
      footerLinks: form.footerLinks
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean)
        .map((item) => {
          const [label, href] = item.split("|");
          return { label: label || "Link", href: href || "/" };
        }),
    };

    const response = await fetch("/api/admin/store", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    setSaving(false);

    if (!response.ok) {
      alert("Failed to save store config");
      return;
    }

    alert("Store config saved");
  }

  return (
    <div>
      <AdminTopbar title="Configure Store" subtitle="Control branding, footer, contacts and slider assets." />

      <form onSubmit={handleSubmit} className="rounded-2xl border border-slate-200 bg-white p-5">
        <div className="mb-3 grid gap-3 md:max-w-xs">
          <label className="text-sm font-semibold text-slate-700" htmlFor="themeLayout">
            Theme layout
          </label>
          <select
            id="themeLayout"
            value={form.themeLayout}
            onChange={(event) => setForm((prev) => ({ ...prev, themeLayout: event.target.value }))}
            className="rounded-xl border border-slate-300 px-4 py-2"
          >
            <option value="theme1">Theme 1 (Default)</option>
            <option value="theme2">Theme 2</option>
            <option value="hampers">Hampers</option>
          </select>
        </div>

        <div className="grid gap-3 md:grid-cols-2">
          {Object.keys(form)
            .filter((key) => key !== "themeLayout")
            .map((key) => (
            <input
              key={key}
              value={form[key as keyof typeof form]}
              onChange={(event) => setForm((prev) => ({ ...prev, [key]: event.target.value }))}
              placeholder={key}
              className="rounded-xl border border-slate-300 px-4 py-2"
              required={["companyName", "logoText", "contactEmail", "heroImage"].includes(key)}
            />
            ))}
        </div>
        <button
          disabled={saving}
          className="mt-4 rounded-xl bg-slate-900 px-5 py-2 font-semibold text-white disabled:opacity-50"
        >
          {saving ? "Saving..." : "Save configuration"}
        </button>
      </form>
    </div>
  );
}
