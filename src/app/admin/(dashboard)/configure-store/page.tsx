"use client";

import { FormEvent, useEffect, useState } from "react";

import { AdminTopbar } from "@/components/admin/admin-topbar";
import { Skeleton } from "@/components/admin/ui/skeleton";
import { Spinner } from "@/components/admin/ui/loader";

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
  footerLinks: "",
};

export default function ConfigureStorePage() {
  const [form, setForm] = useState(defaultForm);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function load() {
      setLoading(true);
      setError("");
      try {
        const response = await fetch("/api/admin/store");
        if (!response.ok) {
          setError("Failed to load store configuration.");
          return;
        }

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
          footerLinks: (store.footerLinks || [])
            .map((item: { label: string; href: string }) => `${item.label}|${item.href}`)
            .join(","),
        });
      } catch (loadError) {
        console.error(loadError);
        setError("A network error occurred while loading store config.");
      } finally {
        setLoading(false);
      }
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

    try {
      const response = await fetch("/api/admin/store", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        alert("Failed to save store config");
        return;
      }

      alert("Store config saved");
    } catch (saveError) {
      console.error(saveError);
      alert("Network error while saving configuration.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div>
      <AdminTopbar
        title="Configure Store"
        subtitle="Control shared branding, contact, social links and theme layout."
      />

      {error ? (
        <div className="mb-6 rounded-2xl border border-red-200 bg-red-50 p-5 text-red-700">
          <p className="font-semibold">{error}</p>
        </div>
      ) : loading ? (
        <div className="space-y-6">
          <Skeleton className="h-10 w-48 rounded-xl" />
          <div className="grid gap-6 md:grid-cols-2">
            <Skeleton className="h-12 rounded-xl" />
            <Skeleton className="h-12 rounded-xl" />
            <Skeleton className="h-12 rounded-xl" />
            <Skeleton className="h-12 rounded-xl" />
            <Skeleton className="h-12 rounded-xl" />
            <Skeleton className="h-12 rounded-xl" />
            <Skeleton className="h-24 rounded-xl md:col-span-2" />
          </div>
        </div>
      ) : (
        <form
          onSubmit={handleSubmit}
          className="rounded-2xl border border-slate-200 bg-white p-5"
        >
          <div className="mb-4 grid gap-3 md:max-w-xs">
            <label
              className="text-sm font-semibold text-slate-700"
              htmlFor="themeLayout"
            >
              Theme layout
            </label>
            <select
              id="themeLayout"
              value={form.themeLayout}
              onChange={(event) =>
                setForm((prev) => ({ ...prev, themeLayout: event.target.value }))
              }
              className="rounded-xl border border-slate-300 px-4 py-2"
            >
              <option value="theme1">Theme 1 (Default)</option>
              <option value="theme2">Theme 2</option>
              <option value="theme3">Theme 3 (Jewellery)</option>
            </select>
          </div>

          <div className="grid gap-3 md:grid-cols-2">
            <input
              value={form.companyName}
              onChange={(event) =>
                setForm((prev) => ({ ...prev, companyName: event.target.value }))
              }
              placeholder="companyName"
              className="rounded-xl border border-slate-300 px-4 py-2"
              required
            />
            <input
              value={form.logoText}
              onChange={(event) =>
                setForm((prev) => ({ ...prev, logoText: event.target.value }))
              }
              placeholder="logoText"
              className="rounded-xl border border-slate-300 px-4 py-2"
              required
            />
            <input
              value={form.contactEmail}
              onChange={(event) =>
                setForm((prev) => ({ ...prev, contactEmail: event.target.value }))
              }
              placeholder="contactEmail"
              className="rounded-xl border border-slate-300 px-4 py-2"
              required
            />
            <input
              value={form.contactPhone}
              onChange={(event) =>
                setForm((prev) => ({ ...prev, contactPhone: event.target.value }))
              }
              placeholder="contactPhone"
              className="rounded-xl border border-slate-300 px-4 py-2"
            />
            <input
              value={form.about}
              onChange={(event) =>
                setForm((prev) => ({ ...prev, about: event.target.value }))
              }
              placeholder="about"
              className="rounded-xl border border-slate-300 px-4 py-2 md:col-span-2"
            />
            <input
              value={form.address}
              onChange={(event) =>
                setForm((prev) => ({ ...prev, address: event.target.value }))
              }
              placeholder="address"
              className="rounded-xl border border-slate-300 px-4 py-2 md:col-span-2"
            />
            <input
              value={form.instagram}
              onChange={(event) =>
                setForm((prev) => ({ ...prev, instagram: event.target.value }))
              }
              placeholder="instagram"
              className="rounded-xl border border-slate-300 px-4 py-2"
            />
            <input
              value={form.facebook}
              onChange={(event) =>
                setForm((prev) => ({ ...prev, facebook: event.target.value }))
              }
              placeholder="facebook"
              className="rounded-xl border border-slate-300 px-4 py-2"
            />
            <input
              value={form.x}
              onChange={(event) =>
                setForm((prev) => ({ ...prev, x: event.target.value }))
              }
              placeholder="x"
              className="rounded-xl border border-slate-300 px-4 py-2"
            />
            <input
              value={form.youtube}
              onChange={(event) =>
                setForm((prev) => ({ ...prev, youtube: event.target.value }))
              }
              placeholder="youtube"
              className="rounded-xl border border-slate-300 px-4 py-2"
            />
            <textarea
              value={form.footerLinks}
              onChange={(event) =>
                setForm((prev) => ({ ...prev, footerLinks: event.target.value }))
              }
              placeholder="footerLinks (label|href, label|href)"
              className="min-h-24 rounded-xl border border-slate-300 px-4 py-2 md:col-span-2"
            />
          </div>

          <button
            type="submit"
            disabled={saving}
            className="mt-4 flex px-6 items-center justify-center gap-2 rounded-xl bg-slate-900 py-3 font-semibold text-white disabled:opacity-50"
          >
            {saving && <Spinner size={16} className="text-white" />}
            {saving ? "Saving " : "Save"}
          </button>
        </form>
      )}
    </div>
  );
}
