"use client";

import Image from "next/image";
import { FormEvent, useEffect, useState } from "react";
import { Plus } from "lucide-react";

import { AdminTopbar } from "@/components/admin/admin-topbar";
import { encodeStorageObjectPath, extractStorageObjectPath, isVideoUrl } from "@/utils/media";

const MAX_SLIDER_IMAGES = 10;

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
  sliderImages: [] as string[],
  footerLinks: "",
};

export default function ConfigureStorePage() {
  const [form, setForm] = useState(defaultForm);
  const [saving, setSaving] = useState(false);
  const [pendingHeroFile, setPendingHeroFile] = useState<File | null>(null);
  const [pendingSliderFiles, setPendingSliderFiles] = useState<File[]>([]);
  const [heroUploading, setHeroUploading] = useState(false);
  const [sliderUploading, setSliderUploading] = useState(false);

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
        sliderImages: (store.theme?.sliderImages || []).slice(0, MAX_SLIDER_IMAGES),
        footerLinks: (store.footerLinks || [])
          .map((item: { label: string; href: string }) => `${item.label}|${item.href}`)
          .join(","),
      });
    }

    load();
  }, []);

  async function uploadNewMedia(file: File, folder: string) {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("folder", folder);

    const response = await fetch("/api/storage", {
      method: "POST",
      body: formData,
    });

    if (!response.ok) {
      const data = await response.json().catch(() => ({ error: "Upload failed" }));
      alert(data.error || "Upload failed");
      return null;
    }

    const data = await response.json();
    return data?.file?.url || null;
  }

  async function replaceExistingMedia(file: File, currentUrl: string) {
    const path = extractStorageObjectPath(currentUrl);

    if (!path) {
      return uploadNewMedia(file, "store-theme");
    }

    const formData = new FormData();
    formData.append("file", file);

    const encodedPath = encodeStorageObjectPath(path);
    const response = await fetch(`/api/storage/${encodedPath}`, {
      method: "PUT",
      body: formData,
    });

    if (!response.ok) {
      const data = await response.json().catch(() => ({ error: "Replace failed" }));
      alert(data.error || "Replace failed");
      return null;
    }

    const data = await response.json();
    return data?.file?.url || currentUrl;
  }

  async function deleteMediaFromStorage(url: string) {
    const path = extractStorageObjectPath(url);
    if (!path) return true;

    const encodedPath = encodeStorageObjectPath(path);
    const response = await fetch(`/api/storage/${encodedPath}`, {
      method: "DELETE",
    });

    if (!response.ok) {
      const data = await response.json().catch(() => ({ error: "Delete failed" }));
      alert(data.error || "Delete failed");
      return false;
    }

    return true;
  }

  async function uploadHeroImage(fileOverride?: File) {
    const file = fileOverride || pendingHeroFile;

    if (!file) {
      alert("Choose hero media first.");
      return;
    }

    setHeroUploading(true);

    const url = form.heroImage
      ? await replaceExistingMedia(file, form.heroImage)
      : await uploadNewMedia(file, "store-theme");

    setHeroUploading(false);

    if (!url) return;

    setForm((prev) => ({ ...prev, heroImage: url }));
    setPendingHeroFile(null);
  }

  async function removeHeroImage() {
    if (!form.heroImage) return;

    const deleted = await deleteMediaFromStorage(form.heroImage);
    if (!deleted) return;

    setForm((prev) => ({ ...prev, heroImage: "" }));
  }

  async function uploadSliderImages() {
    if (!pendingSliderFiles.length) {
      alert("Choose slider media first.");
      return;
    }

    const remainingSlots = MAX_SLIDER_IMAGES - form.sliderImages.length;

    if (remainingSlots <= 0) {
      alert(`You can upload maximum ${MAX_SLIDER_IMAGES} slider media.`);
      return;
    }

    const filesToUpload = pendingSliderFiles.slice(0, remainingSlots);

    setSliderUploading(true);
    const urls: string[] = [];

    for (const file of filesToUpload) {
      const url = await uploadNewMedia(file, "store-theme");
      if (!url) {
        setSliderUploading(false);
        return;
      }
      urls.push(url);
    }

    setForm((prev) => ({
      ...prev,
      sliderImages: [...prev.sliderImages, ...urls].slice(0, MAX_SLIDER_IMAGES),
    }));

    setPendingSliderFiles([]);
    setSliderUploading(false);
  }

  async function replaceSliderMedia(index: number, file: File) {
    const currentUrl = form.sliderImages[index];
    if (!currentUrl) return;

    const nextUrl = await replaceExistingMedia(file, currentUrl);
    if (!nextUrl) return;

    setForm((prev) => {
      const items = [...prev.sliderImages];
      items[index] = nextUrl;
      return { ...prev, sliderImages: items };
    });
  }

  async function removeSliderImage(url: string) {
    const deleted = await deleteMediaFromStorage(url);
    if (!deleted) return;

    setForm((prev) => ({ ...prev, sliderImages: prev.sliderImages.filter((image) => image !== url) }));
  }

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
        sliderImages: form.sliderImages,
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
      <AdminTopbar title="Configure Store" subtitle="Control branding, footer, contacts, and uploaded store media." />

      <form onSubmit={handleSubmit} className="rounded-2xl border border-slate-200 bg-white p-5">
        <div className="mb-4 grid gap-3 md:max-w-xs">
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
          </select>
        </div>

        <div className="grid gap-3 md:grid-cols-2">
          <input
            value={form.companyName}
            onChange={(event) => setForm((prev) => ({ ...prev, companyName: event.target.value }))}
            placeholder="companyName"
            className="rounded-xl border border-slate-300 px-4 py-2"
            required
          />
          <input
            value={form.logoText}
            onChange={(event) => setForm((prev) => ({ ...prev, logoText: event.target.value }))}
            placeholder="logoText"
            className="rounded-xl border border-slate-300 px-4 py-2"
            required
          />
          <input
            value={form.contactEmail}
            onChange={(event) => setForm((prev) => ({ ...prev, contactEmail: event.target.value }))}
            placeholder="contactEmail"
            className="rounded-xl border border-slate-300 px-4 py-2"
            required
          />
          <input
            value={form.contactPhone}
            onChange={(event) => setForm((prev) => ({ ...prev, contactPhone: event.target.value }))}
            placeholder="contactPhone"
            className="rounded-xl border border-slate-300 px-4 py-2"
          />
          <input
            value={form.primary}
            onChange={(event) => setForm((prev) => ({ ...prev, primary: event.target.value }))}
            placeholder="primary color"
            className="rounded-xl border border-slate-300 px-4 py-2"
          />
          <input
            value={form.accent}
            onChange={(event) => setForm((prev) => ({ ...prev, accent: event.target.value }))}
            placeholder="accent color"
            className="rounded-xl border border-slate-300 px-4 py-2"
          />

          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 md:col-span-2">
            <p className="text-sm font-semibold text-slate-800">Hero Image (1 media)</p>
            <div className="mt-3 flex flex-wrap items-center gap-2">
              <input
                type="file"
                accept="image/*,video/*"
                onChange={(event) => setPendingHeroFile(event.target.files?.[0] || null)}
                className="max-w-[260px] rounded-xl border border-slate-300 px-3 py-2 text-sm"
              />
              <button
                type="button"
                onClick={() => uploadHeroImage()}
                disabled={!pendingHeroFile || heroUploading}
                className="rounded-xl bg-slate-600 px-4 py-2 text-sm font-semibold text-white disabled:opacity-50"
              >
                {heroUploading ? "Uploading..." : form.heroImage ? "Replace" : "Upload"}
              </button>
            </div>

            {form.heroImage ? (
              <div className="mt-3 group relative w-full max-w-xs overflow-hidden rounded-xl border border-slate-200 bg-white">
                {isVideoUrl(form.heroImage) ? (
                  <video src={form.heroImage} className="h-36 w-full object-cover" controls muted />
                ) : (
                  <Image src={form.heroImage} alt="hero" width={500} height={320} className="h-36 w-full object-cover" />
                )}

                <div className="absolute inset-0 flex items-center justify-center gap-3 bg-black/30 opacity-0 transition group-hover:opacity-100">
                  <label
                    htmlFor="hero-change-input"
                    className="cursor-pointer rounded-xl bg-white/85 px-4 py-2 text-sm font-semibold text-slate-900"
                  >
                    Change
                  </label>
                  <button
                    type="button"
                    onClick={removeHeroImage}
                    className="rounded-xl bg-white/85 px-4 py-2 text-sm font-semibold text-red-700"
                  >
                    Remove
                  </button>
                </div>

                <input
                  id="hero-change-input"
                  type="file"
                  accept="image/*,video/*"
                  className="hidden"
                  onChange={(event) => {
                    const file = event.target.files?.[0];
                    if (file) {
                      setPendingHeroFile(file);
                      uploadHeroImage();
                    }
                  }}
                />
              </div>
            ) : (
              <p className="mt-3 text-sm text-slate-500">No hero media uploaded yet.</p>
            )}
          </div>

          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 md:col-span-2">
            <div className="flex items-center justify-between">
              <p className="text-sm font-semibold text-slate-800">Slider Images (max {MAX_SLIDER_IMAGES})</p>
              <span className="text-xs text-slate-500">{form.sliderImages.length}/{MAX_SLIDER_IMAGES}</span>
            </div>

            <div className="mt-3 flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => document.getElementById("slider-add-input")?.click()}
                className="inline-flex items-center gap-2 rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-700"
              >
                <Plus size={15} />
                Choose Files
              </button>
              <input
                id="slider-add-input"
                type="file"
                accept="image/*,video/*"
                multiple
                className="hidden"
                onChange={(event) => setPendingSliderFiles(Array.from(event.target.files || []))}
              />
              <button
                type="button"
                onClick={uploadSliderImages}
                disabled={!pendingSliderFiles.length || sliderUploading || form.sliderImages.length >= MAX_SLIDER_IMAGES}
                className="rounded-xl bg-slate-600 px-4 py-2 text-sm font-semibold text-white disabled:opacity-50"
              >
                {sliderUploading ? "Uploading..." : "Upload"}
              </button>
            </div>

            {!form.sliderImages.length ? (
              <p className="mt-3 text-sm text-slate-500">No slider media uploaded yet.</p>
            ) : (
              <div className="mt-3 grid gap-3 sm:grid-cols-3 lg:grid-cols-4">
                {form.sliderImages.map((url, index) => (
                  <div key={url} className="group relative overflow-hidden rounded-xl border border-slate-200 bg-white">
                    {isVideoUrl(url) ? (
                      <video src={url} className="h-24 w-full object-cover" controls muted />
                    ) : (
                      <Image src={url} alt="slider" width={220} height={160} className="h-24 w-full object-cover" />
                    )}

                    <div className="absolute inset-0 flex items-center justify-center gap-2 bg-black/30 opacity-0 transition group-hover:opacity-100">
                      <label
                        htmlFor={`slider-change-${index}`}
                        className="cursor-pointer rounded-lg bg-white/85 px-3 py-1.5 text-xs font-semibold text-slate-900"
                      >
                        Change
                      </label>
                      <button
                        type="button"
                        onClick={() => removeSliderImage(url)}
                        className="rounded-lg bg-white/85 px-3 py-1.5 text-xs font-semibold text-red-700"
                      >
                        Remove
                      </button>
                    </div>

                    <input
                      id={`slider-change-${index}`}
                      type="file"
                      accept="image/*,video/*"
                      className="hidden"
                      onChange={(event) => {
                        const file = event.target.files?.[0];
                        if (file) {
                          replaceSliderMedia(index, file);
                        }
                      }}
                    />
                  </div>
                ))}
              </div>
            )}
          </div>

          <input
            value={form.about}
            onChange={(event) => setForm((prev) => ({ ...prev, about: event.target.value }))}
            placeholder="about"
            className="rounded-xl border border-slate-300 px-4 py-2 md:col-span-2"
          />
          <input
            value={form.address}
            onChange={(event) => setForm((prev) => ({ ...prev, address: event.target.value }))}
            placeholder="address"
            className="rounded-xl border border-slate-300 px-4 py-2 md:col-span-2"
          />
          <input
            value={form.instagram}
            onChange={(event) => setForm((prev) => ({ ...prev, instagram: event.target.value }))}
            placeholder="instagram"
            className="rounded-xl border border-slate-300 px-4 py-2"
          />
          <input
            value={form.facebook}
            onChange={(event) => setForm((prev) => ({ ...prev, facebook: event.target.value }))}
            placeholder="facebook"
            className="rounded-xl border border-slate-300 px-4 py-2"
          />
          <input
            value={form.x}
            onChange={(event) => setForm((prev) => ({ ...prev, x: event.target.value }))}
            placeholder="x"
            className="rounded-xl border border-slate-300 px-4 py-2"
          />
          <input
            value={form.youtube}
            onChange={(event) => setForm((prev) => ({ ...prev, youtube: event.target.value }))}
            placeholder="youtube"
            className="rounded-xl border border-slate-300 px-4 py-2"
          />
          <textarea
            value={form.footerLinks}
            onChange={(event) => setForm((prev) => ({ ...prev, footerLinks: event.target.value }))}
            placeholder="footerLinks (label|href, label|href)"
            className="min-h-24 rounded-xl border border-slate-300 px-4 py-2 md:col-span-2"
          />
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



