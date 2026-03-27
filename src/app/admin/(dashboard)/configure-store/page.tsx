"use client";

import Image from "next/image";
import { FormEvent, useEffect, useMemo, useState } from "react";
import { Plus, Sparkles, X } from "lucide-react";

import { AdminTopbar } from "@/components/admin/admin-topbar";
import { Skeleton } from "@/components/admin/ui/skeleton";
import { Spinner } from "@/components/admin/ui/loader";
import { AIEnhanceModal } from "@/components/admin/ai-enhance-modal";
import {
  encodeStorageObjectPath,
  extractStorageObjectPath,
  isVideoUrl,
} from "@/utils/media";

const MAX_SLIDER_IMAGES = 8;
const MAX_THEME3_COLLECTION_IMAGES = 8;
const HERO_MEDIA_FOLDER = "hero-image";
const SLIDER_MEDIA_FOLDER = "slider-images";
const THEME3_COLLECTION_MEDIA_FOLDER = "theme3-collection-labels";
const THEME3_SLIDER_WIDTH = 1898;
const THEME3_SLIDER_HEIGHT = 742;

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
  theme3AnnouncementText: "Free Shipping On Orders Over $200",
  theme3CollectionLabels: "Rings, Bracelets, Necklaces, Earrings, Pendants, Bangles",
  theme3CollectionLabelImages: [] as string[],
  theme3FeaturedHeading: "Sparkling New Pieces",
  footerLinks: "",
};

export default function ConfigureStorePage() {
  const [form, setForm] = useState(defaultForm);
  const [saving, setSaving] = useState(false);
  const [pendingHeroFile, setPendingHeroFile] = useState<File | null>(null);
  const [pendingSliderFiles, setPendingSliderFiles] = useState<File[]>([]);
  const [pendingSliderReplacementFiles, setPendingSliderReplacementFiles] =
    useState<Record<number, File>>({});
  const [pendingTheme3CollectionFiles, setPendingTheme3CollectionFiles] =
    useState<File[]>([]);
  const [
    pendingTheme3CollectionReplacementFiles,
    setPendingTheme3CollectionReplacementFiles,
  ] = useState<Record<number, File>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isAIEnhanceModalOpen, setIsAIEnhanceModalOpen] = useState(false);
  const [aiEnhanceSource, setAiEnhanceSource] = useState("");
  const [aiEnhanceTarget, setAiEnhanceTarget] = useState<"hero" | "slider">(
    "slider",
  );
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);

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
          primary: store.theme?.primary || "#0f172a",
          accent: store.theme?.accent || "#14b8a6",
          heroImage: store.theme?.heroImage || "",
          sliderImages: (store.theme?.sliderImages || []).slice(
            0,
            MAX_SLIDER_IMAGES,
          ),
          theme3AnnouncementText:
            store.theme?.theme3?.announcementText ||
            "Free Shipping On Orders Over $200",
          theme3CollectionLabels: (
            store.theme?.theme3?.collectionLabels || [
              "Rings",
              "Bracelets",
              "Necklaces",
              "Earrings",
              "Pendants",
              "Bangles",
            ]
          ).join(", "),
          theme3CollectionLabelImages: (
            store.theme?.theme3?.collectionLabelImages || []
          ).slice(0, MAX_THEME3_COLLECTION_IMAGES),
          theme3FeaturedHeading:
            store.theme?.theme3?.featuredHeading || "Sparkling New Pieces",
          footerLinks: (store.footerLinks || [])
            .map(
              (item: { label: string; href: string }) =>
                `${item.label}|${item.href}`,
            )
            .join(","),
        });
      } catch (err) {
        console.error(err);
        setError("A network error occurred while loading store config.");
      } finally {
        setLoading(false);
      }
    }

    load();
  }, []);

  const pendingHeroPreview = useMemo(
    () => (pendingHeroFile ? URL.createObjectURL(pendingHeroFile) : ""),
    [pendingHeroFile],
  );
  const pendingSliderPreviews = useMemo(
    () =>
      pendingSliderFiles.map((file) => ({
        url: URL.createObjectURL(file),
        file,
      })),
    [pendingSliderFiles],
  );
  const pendingSliderReplacementPreviews = useMemo(
    () =>
      Object.entries(pendingSliderReplacementFiles).map(([index, file]) => ({
        index: Number(index),
        url: URL.createObjectURL(file),
        file,
      })),
    [pendingSliderReplacementFiles],
  );
  const pendingTheme3CollectionPreviews = useMemo(
    () =>
      pendingTheme3CollectionFiles.map((file) => ({
        url: URL.createObjectURL(file),
        file,
      })),
    [pendingTheme3CollectionFiles],
  );
  const pendingTheme3CollectionReplacementPreviews = useMemo(
    () =>
      Object.entries(pendingTheme3CollectionReplacementFiles).map(
        ([index, file]) => ({
          index: Number(index),
          url: URL.createObjectURL(file),
          file,
        }),
      ),
    [pendingTheme3CollectionReplacementFiles],
  );

  useEffect(() => {
    return () => {
      if (pendingHeroPreview) URL.revokeObjectURL(pendingHeroPreview);
    };
  }, [pendingHeroPreview]);

  useEffect(() => {
    return () => {
      pendingSliderPreviews.forEach((preview) =>
        URL.revokeObjectURL(preview.url),
      );
    };
  }, [pendingSliderPreviews]);

  useEffect(() => {
    return () => {
      pendingSliderReplacementPreviews.forEach((preview) =>
        URL.revokeObjectURL(preview.url),
      );
    };
  }, [pendingSliderReplacementPreviews]);

  useEffect(() => {
    return () => {
      pendingTheme3CollectionPreviews.forEach((preview) =>
        URL.revokeObjectURL(preview.url),
      );
    };
  }, [pendingTheme3CollectionPreviews]);

  useEffect(() => {
    return () => {
      pendingTheme3CollectionReplacementPreviews.forEach((preview) =>
        URL.revokeObjectURL(preview.url),
      );
    };
  }, [pendingTheme3CollectionReplacementPreviews]);

  async function getImageDimensions(file: File) {
    return new Promise<{ width: number; height: number }>((resolve, reject) => {
      const objectUrl = URL.createObjectURL(file);
      const image = new window.Image();
      image.onload = () => {
        resolve({ width: image.width, height: image.height });
        URL.revokeObjectURL(objectUrl);
      };
      image.onerror = () => {
        URL.revokeObjectURL(objectUrl);
        reject(new Error("Unable to read image dimensions"));
      };
      image.src = objectUrl;
    });
  }

  async function validateSliderFileForTheme(file: File) {
    if (form.themeLayout !== "theme3") return true;

    if (!file.type.startsWith("image/")) {
      alert("Theme 3 only supports image slider media.");
      return false;
    }

    try {
      const { width, height } = await getImageDimensions(file);
      if (width !== THEME3_SLIDER_WIDTH || height !== THEME3_SLIDER_HEIGHT) {
        alert(`Theme 3 slider images must be exactly ${THEME3_SLIDER_WIDTH} x ${THEME3_SLIDER_HEIGHT}.`);
        return false;
      }
      return true;
    } catch {
      alert("Unable to validate image dimensions.");
      return false;
    }
  }

  function validateTheme3CollectionFile(file: File) {
    if (!file.type.startsWith("image/")) {
      alert("Theme 3 collection media supports image files only.");
      return false;
    }
    return true;
  }

  async function uploadNewMedia(file: File, folder: string) {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("folder", folder);

    try {
      const response = await fetch("/api/storage", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const data = await response
          .json()
          .catch(() => ({ error: "Upload failed" }));
        alert(data.error || "Upload failed");
        return null;
      }

      const data = await response.json();
      return data?.file?.url || null;
    } catch (err) {
      console.error(err);
      alert("Network error during upload.");
      return null;
    }
  }

  async function replaceExistingMedia(
    file: File,
    currentUrl: string,
    fallbackFolder: string,
  ) {
    const deleted = await deleteMediaFromStorage(currentUrl);
    if (!deleted) {
      return null;
    }

    return uploadNewMedia(file, fallbackFolder);
  }

  async function deleteMediaFromStorage(url: string) {
    const path = extractStorageObjectPath(url);
    if (!path) return true;

    try {
      const encodedPath = encodeStorageObjectPath(path);
      const response = await fetch(`/api/storage/${encodedPath}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const data = await response
          .json()
          .catch(() => ({ error: "Delete failed" }));
        alert(data.error || "Media deletion failed.");
        return false;
      }

      return true;
    } catch (err) {
      console.error(err);
      alert("Network error during media deletion.");
      return false;
    }
  }

  async function removeHeroImage() {
    if (!form.heroImage) return;

    const deleted = await deleteMediaFromStorage(form.heroImage);
    if (!deleted) return;

    setForm((prev) => ({ ...prev, heroImage: "" }));
  }

  function removePendingSliderMedia(index: number) {
    setPendingSliderFiles((prev) => prev.filter((_, i) => i !== index));
  }

  function removePendingSliderReplacement(index: number) {
    setPendingSliderReplacementFiles((prev) => {
      const next = { ...prev };
      delete next[index];
      return next;
    });
  }

  function removePendingTheme3CollectionMedia(index: number) {
    setPendingTheme3CollectionFiles((prev) => prev.filter((_, i) => i !== index));
  }

  function removePendingTheme3CollectionReplacement(index: number) {
    setPendingTheme3CollectionReplacementFiles((prev) => {
      const next = { ...prev };
      delete next[index];
      return next;
    });
  }

  async function handleAISelectImage(imageUrl: string) {
    if (!imageUrl.startsWith("data:")) {
      setIsAIEnhanceModalOpen(false);
      return;
    }

    const response = await fetch(imageUrl);
    const blob = await response.blob();
    const file = new File([blob], "ai-enhanced-image.png", {
      type: "image/png",
    });

    if (aiEnhanceTarget === "hero") {
      setPendingHeroFile(file);
    } else {
      const validForTheme = await validateSliderFileForTheme(file);
      if (!validForTheme) {
        setIsAIEnhanceModalOpen(false);
        return;
      }

      setPendingSliderFiles((prev) => {
        const remaining =
          MAX_SLIDER_IMAGES - form.sliderImages.length - prev.length;
        if (remaining <= 0) return prev;
        return [...prev, file];
      });
    }

    setIsAIEnhanceModalOpen(false);
  }

  async function replaceSliderMedia(index: number, file: File) {
    const validForTheme = await validateSliderFileForTheme(file);
    if (!validForTheme) return;

    setPendingSliderReplacementFiles((prev) => ({
      ...prev,
      [index]: file,
    }));
  }

  async function replaceTheme3CollectionMedia(index: number, file: File) {
    if (!validateTheme3CollectionFile(file)) return;

    setPendingTheme3CollectionReplacementFiles((prev) => ({
      ...prev,
      [index]: file,
    }));
  }

  async function removeSliderImage(index: number, url: string) {
    const deleted = await deleteMediaFromStorage(url);
    if (!deleted) {
      console.log("Failed to delete media from storage");
      return;
    }

    setForm((prev) => ({
      ...prev,
      sliderImages: prev.sliderImages.filter((image) => image !== url),
    }));

    setPendingSliderReplacementFiles((prev) => {
      const next: Record<number, File> = {};
      for (const [key, file] of Object.entries(prev)) {
        const pendingIndex = Number(key);
        if (pendingIndex === index) continue;
        next[pendingIndex > index ? pendingIndex - 1 : pendingIndex] = file;
      }
      return next;
    });
  }

  async function removeTheme3CollectionImage(index: number, url: string) {
    const deleted = await deleteMediaFromStorage(url);
    if (!deleted) return;

    setForm((prev) => ({
      ...prev,
      theme3CollectionLabelImages: prev.theme3CollectionLabelImages.filter(
        (image) => image !== url,
      ),
    }));

    setPendingTheme3CollectionReplacementFiles((prev) => {
      const next: Record<number, File> = {};
      for (const [key, file] of Object.entries(prev)) {
        const pendingIndex = Number(key);
        if (pendingIndex === index) continue;
        next[pendingIndex > index ? pendingIndex - 1 : pendingIndex] = file;
      }
      return next;
    });
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setSaving(true);

    let heroImage = form.themeLayout === "theme3" ? "" : form.heroImage;
    if (form.themeLayout !== "theme3" && pendingHeroFile) {
      const nextHeroImage = form.heroImage
        ? await replaceExistingMedia(
            pendingHeroFile,
            form.heroImage,
            HERO_MEDIA_FOLDER,
          )
        : await uploadNewMedia(pendingHeroFile, HERO_MEDIA_FOLDER);

      if (!nextHeroImage) {
        setSaving(false);
        return;
      }

      heroImage = nextHeroImage;
    }

    let sliderImages = [...form.sliderImages];

    const sortedReplacementEntries = Object.entries(
      pendingSliderReplacementFiles,
    ).sort((a, b) => Number(a[0]) - Number(b[0]));

    for (const [indexText, file] of sortedReplacementEntries) {
      const index = Number(indexText);
      const currentUrl = sliderImages[index];
      if (!currentUrl) continue;

      const nextUrl = await replaceExistingMedia(
        file,
        currentUrl,
        SLIDER_MEDIA_FOLDER,
      );
      if (!nextUrl) {
        setSaving(false);
        return;
      }

      sliderImages[index] = nextUrl;
    }

    const remainingSliderSlots = MAX_SLIDER_IMAGES - sliderImages.length;
    const sliderFilesToUpload = pendingSliderFiles.slice(0, remainingSliderSlots);
    const newSliderUrls: string[] = [];

    for (const file of sliderFilesToUpload) {
      const url = await uploadNewMedia(file, SLIDER_MEDIA_FOLDER);
      if (!url) {
        setSaving(false);
        return;
      }
      newSliderUrls.push(url);
    }

    sliderImages = [...sliderImages, ...newSliderUrls].slice(
      0,
      MAX_SLIDER_IMAGES,
    );

    let theme3CollectionLabelImages = [...form.theme3CollectionLabelImages];

    if (form.themeLayout === "theme3") {
      const sortedTheme3CollectionReplacementEntries = Object.entries(
        pendingTheme3CollectionReplacementFiles,
      ).sort((a, b) => Number(a[0]) - Number(b[0]));

      for (const [indexText, file] of sortedTheme3CollectionReplacementEntries) {
        const index = Number(indexText);
        const currentUrl = theme3CollectionLabelImages[index];
        if (!currentUrl) continue;

        const nextUrl = await replaceExistingMedia(
          file,
          currentUrl,
          THEME3_COLLECTION_MEDIA_FOLDER,
        );
        if (!nextUrl) {
          setSaving(false);
          return;
        }

        theme3CollectionLabelImages[index] = nextUrl;
      }

      const remainingTheme3CollectionSlots =
        MAX_THEME3_COLLECTION_IMAGES - theme3CollectionLabelImages.length;
      const theme3CollectionFilesToUpload = pendingTheme3CollectionFiles.slice(
        0,
        remainingTheme3CollectionSlots,
      );
      const newTheme3CollectionUrls: string[] = [];

      for (const file of theme3CollectionFilesToUpload) {
        const url = await uploadNewMedia(file, THEME3_COLLECTION_MEDIA_FOLDER);
        if (!url) {
          setSaving(false);
          return;
        }
        newTheme3CollectionUrls.push(url);
      }

      theme3CollectionLabelImages = [
        ...theme3CollectionLabelImages,
        ...newTheme3CollectionUrls,
      ].slice(0, MAX_THEME3_COLLECTION_IMAGES);
    }

    const theme3CollectionLabels = form.theme3CollectionLabels
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean)
      .slice(0, MAX_THEME3_COLLECTION_IMAGES);

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
        heroImage,
        sliderImages,
        theme3: {
          announcementText: form.theme3AnnouncementText || "Free Shipping On Orders Over $200",
          collectionLabels: theme3CollectionLabels,
          collectionLabelImages: theme3CollectionLabelImages,
          featuredHeading: form.theme3FeaturedHeading || "Sparkling New Pieces",
        },
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

      setForm((prev) => ({
        ...prev,
        heroImage,
        sliderImages,
        theme3CollectionLabelImages,
      }));
      setPendingHeroFile(null);
      setPendingSliderFiles([]);
      setPendingSliderReplacementFiles({});
      setPendingTheme3CollectionFiles([]);
      setPendingTheme3CollectionReplacementFiles({});

      alert("Store config saved");
    } catch (err) {
      console.error(err);
      alert("Network error while saving configuration.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div>
      <AdminTopbar
        title="Configure Store"
        subtitle="Control branding, footer, contacts, and uploaded store media."
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
            <Skeleton className="h-64 rounded-2xl md:col-span-2" />
            <Skeleton className="h-96 rounded-2xl md:col-span-2" />
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
            onChange={(event) => {
              if (event.target.value === "theme3") {
                setPendingHeroFile(null);
              }

              setForm((prev) => ({
                ...prev,
                themeLayout: event.target.value,
                heroImage: event.target.value === "theme3" ? "" : prev.heroImage,
              }));
            }}
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
            value={form.primary}
            onChange={(event) =>
              setForm((prev) => ({ ...prev, primary: event.target.value }))
            }
            placeholder="primary color"
            className="rounded-xl border border-slate-300 px-4 py-2"
          />
          <input
            value={form.accent}
            onChange={(event) =>
              setForm((prev) => ({ ...prev, accent: event.target.value }))
            }
            placeholder="accent color"
            className="rounded-xl border border-slate-300 px-4 py-2"
          />

          {form.themeLayout !== "theme3" ? (
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 md:col-span-2">
              <p className="text-sm font-semibold text-slate-800">Hero Media</p>
              <input
                id="hero-pick-input"
                type="file"
                accept="image/*,video/*"
                className="hidden"
                onChange={(event) =>
                  setPendingHeroFile(event.target.files?.[0] || null)
                }
              />

              <div className="mt-3 grid gap-3 sm:grid-cols-3 lg:grid-cols-4">
                {pendingHeroPreview ? (
                  <div className="group relative h-44 overflow-hidden rounded-2xl border border-amber-200 bg-white">
                    {isVideoUrl(pendingHeroPreview) ||
                    pendingHeroFile?.type.startsWith("video/") ? (
                      <video
                        src={pendingHeroPreview}
                        className="h-full w-full object-contain"
                        autoPlay
                        muted
                        loop
                        playsInline
                      />
                    ) : (
                      <Image
                        src={pendingHeroPreview}
                        alt="pending hero"
                        width={240}
                        height={160}
                        className="h-full w-full object-contain"
                      />
                    )}
                    <div className="absolute inset-0 flex items-center justify-center gap-2 bg-black/25 opacity-100 lg:opacity-0 transition lg:group-hover:opacity-100">
                      <button
                        type="button"
                        onClick={() => {
                          setPreviewUrl(pendingHeroPreview);
                          setIsPreviewOpen(true);
                        }}
                        className="rounded-lg border border-slate-900 bg-white/90 px-3 py-1.5 text-xs font-semibold text-slate-900"
                      >
                        View
                      </button>
                      <button
                        type="button"
                        onClick={() => setPendingHeroFile(null)}
                        className="rounded-lg border border-slate-900 bg-white/90 px-3 py-1.5 text-xs font-semibold text-slate-900"
                      >
                        Remove
                      </button>
                      {!pendingHeroFile?.type.startsWith("video/") && (
                        <button
                          type="button"
                          onClick={() => {
                            setAiEnhanceSource(pendingHeroPreview);
                            setAiEnhanceTarget("hero");
                            setIsAIEnhanceModalOpen(true);
                          }}
                          className="flex items-center gap-1.5 rounded-lg border border-indigo-600 bg-indigo-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-indigo-700"
                        >
                          <Sparkles size={12} />
                          AI
                        </button>
                      )}
                    </div>
                    <div className="absolute top-2 left-2 rounded-md bg-amber-500 px-2 py-0.5 text-[10px] font-bold text-white uppercase">
                      Pending
                    </div>
                  </div>
                ) : form.heroImage ? (
                  <div className="group relative h-44 overflow-hidden rounded-2xl border border-slate-300 bg-white">
                    {isVideoUrl(form.heroImage) ? (
                      <video
                        src={form.heroImage}
                        className="h-full w-full object-contain"
                        autoPlay
                        muted
                        loop
                        playsInline
                      />
                    ) : (
                      <Image
                        src={form.heroImage}
                        alt="hero"
                        width={240}
                        height={160}
                        className="h-full w-full object-contain"
                      />
                    )}
                    <div className="absolute inset-0 flex items-center justify-center gap-2 bg-black/25 opacity-100 lg:opacity-0 transition lg:group-hover:opacity-100">
                      <button
                        type="button"
                        onClick={() => {
                          setPreviewUrl(form.heroImage);
                          setIsPreviewOpen(true);
                        }}
                        className="rounded-lg border border-slate-900 bg-white/90 px-3 py-1.5 text-xs font-semibold text-slate-900"
                      >
                        View
                      </button>
                      <label
                        htmlFor="hero-pick-input"
                        className="cursor-pointer rounded-lg border border-slate-900 bg-white/90 px-3 py-1.5 text-xs font-semibold text-slate-900"
                      >
                        Change
                      </label>
                      <button
                        type="button"
                        onClick={removeHeroImage}
                        className="rounded-lg border border-slate-900 bg-white/90 px-3 py-1.5 text-xs font-semibold text-slate-900"
                      >
                        Remove
                      </button>
                      {!isVideoUrl(form.heroImage) && (
                        <button
                          type="button"
                          onClick={() => {
                            setAiEnhanceSource(form.heroImage);
                            setAiEnhanceTarget("hero");
                            setIsAIEnhanceModalOpen(true);
                          }}
                          className="flex items-center gap-1.5 rounded-lg border border-indigo-600 bg-indigo-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-indigo-700"
                        >
                          <Sparkles size={12} />
                          AI
                        </button>
                      )}
                    </div>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() =>
                      document.getElementById("hero-pick-input")?.click()
                    }
                    className="flex h-44 flex-col items-center justify-center rounded-2xl border border-slate-300 bg-white text-slate-700 transition hover:border-slate-400"
                  >
                    <Plus size={26} />
                    <span className="mt-2 text-sm font-medium">Choose Media</span>
                  </button>
                )}
              </div>
            </div>
          ) : (
            <div className="rounded-2xl border border-rose-200 bg-rose-50 p-4 md:col-span-2">
              <p className="text-sm font-semibold text-rose-900">Theme 3 Settings</p>
              <p className="mt-1 text-xs text-rose-700">
                Theme 3 uses slider media only (no hero media).
              </p>
              <div className="mt-3 grid gap-3 md:grid-cols-2">
                <input
                  value={form.theme3AnnouncementText}
                  onChange={(event) =>
                    setForm((prev) => ({ ...prev, theme3AnnouncementText: event.target.value }))
                  }
                  placeholder="Announcement text"
                  className="rounded-xl border border-rose-200 bg-white px-4 py-2"
                />
                <input
                  value={form.theme3FeaturedHeading}
                  onChange={(event) =>
                    setForm((prev) => ({ ...prev, theme3FeaturedHeading: event.target.value }))
                  }
                  placeholder="Featured heading"
                  className="rounded-xl border border-rose-200 bg-white px-4 py-2"
                />
                <textarea
                  value={form.theme3CollectionLabels}
                  onChange={(event) =>
                    setForm((prev) => ({ ...prev, theme3CollectionLabels: event.target.value }))
                  }
                  placeholder="Collection labels (comma separated)"
                  className="min-h-24 rounded-xl border border-rose-200 bg-white px-4 py-2 md:col-span-2"
                />

                <div className="rounded-xl border border-rose-200 bg-rose-50/60 p-3 md:col-span-2">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-semibold text-rose-900">
                      Collection Label Images
                    </p>
                    <span className="text-xs text-rose-700">
                      {form.theme3CollectionLabelImages.length +
                        pendingTheme3CollectionFiles.length}
                      /{MAX_THEME3_COLLECTION_IMAGES}
                    </span>
                  </div>
                  <p className="mt-1 text-xs text-rose-700">
                    Image only. The image order follows the label order above.
                  </p>

                  <input
                    id="theme3-collection-add-input"
                    type="file"
                    accept="image/*"
                    multiple
                    className="hidden"
                    onChange={(event) => {
                      const files = Array.from(event.target.files || []).filter(
                        validateTheme3CollectionFile,
                      );

                      setPendingTheme3CollectionFiles((prev) => {
                        const remaining =
                          MAX_THEME3_COLLECTION_IMAGES -
                          form.theme3CollectionLabelImages.length -
                          prev.length;
                        if (remaining <= 0) return prev;
                        return [...prev, ...files.slice(0, remaining)];
                      });
                    }}
                  />

                  <div className="mt-3 grid gap-3 sm:grid-cols-3 lg:grid-cols-4">
                    {form.theme3CollectionLabelImages.map((url, index) => {
                      const pendingReplacement =
                        pendingTheme3CollectionReplacementPreviews.find(
                          (preview) => preview.index === index,
                        );

                      if (pendingReplacement) {
                        return (
                          <div
                            key={`${url}-${index}`}
                            className="group relative h-36 overflow-hidden rounded-2xl border border-amber-200 bg-white"
                          >
                            <Image
                              src={pendingReplacement.url}
                              alt="pending collection replacement"
                              width={260}
                              height={90}
                              className="h-full w-full object-cover"
                            />
                            <div className="absolute inset-0 flex items-center justify-center gap-2 bg-black/25 opacity-100 transition lg:opacity-0 lg:group-hover:opacity-100">
                              <button
                                type="button"
                                onClick={() => {
                                  setPreviewUrl(pendingReplacement.url);
                                  setIsPreviewOpen(true);
                                }}
                                className="rounded-lg border border-slate-900 bg-white/90 px-3 py-1.5 text-xs font-semibold text-slate-900"
                              >
                                View
                              </button>
                              <label
                                htmlFor={`theme3-collection-change-${index}`}
                                className="cursor-pointer rounded-lg border border-slate-900 bg-white/90 px-3 py-1.5 text-xs font-semibold text-slate-900"
                              >
                                Change
                              </label>
                              <button
                                type="button"
                                onClick={() =>
                                  removePendingTheme3CollectionReplacement(index)
                                }
                                className="rounded-lg border border-slate-900 bg-white/90 px-3 py-1.5 text-xs font-semibold text-slate-900"
                              >
                                Remove
                              </button>
                            </div>
                            <input
                              id={`theme3-collection-change-${index}`}
                              type="file"
                              accept="image/*"
                              className="hidden"
                              onChange={(event) => {
                                const file = event.target.files?.[0];
                                if (file) {
                                  replaceTheme3CollectionMedia(index, file);
                                }
                              }}
                            />
                            <div className="absolute top-2 left-2 rounded-md bg-amber-500 px-2 py-0.5 text-[10px] font-bold text-white uppercase">
                              Pending
                            </div>
                          </div>
                        );
                      }

                      return (
                        <div
                          key={url}
                          className="group relative h-36 overflow-hidden rounded-2xl border border-rose-200 bg-white"
                        >
                          <Image
                            src={url}
                            alt="collection label"
                            width={260}
                            height={90}
                            className="h-full w-full object-cover"
                          />
                          <div className="absolute inset-0 flex items-center justify-center gap-2 bg-black/25 opacity-100 transition lg:opacity-0 lg:group-hover:opacity-100">
                            <button
                              type="button"
                              onClick={() => {
                                setPreviewUrl(url);
                                setIsPreviewOpen(true);
                              }}
                              className="rounded-lg border border-slate-900 bg-white/90 px-3 py-1.5 text-xs font-semibold text-slate-900"
                            >
                              View
                            </button>
                            <label
                              htmlFor={`theme3-collection-change-${index}`}
                              className="cursor-pointer rounded-lg border border-slate-900 bg-white/90 px-3 py-1.5 text-xs font-semibold text-slate-900"
                            >
                              Change
                            </label>
                            <button
                              type="button"
                              onClick={() => removeTheme3CollectionImage(index, url)}
                              className="rounded-lg border border-slate-900 bg-white/90 px-3 py-1.5 text-xs font-semibold text-slate-900"
                            >
                              Remove
                            </button>
                          </div>
                          <input
                            id={`theme3-collection-change-${index}`}
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={(event) => {
                              const file = event.target.files?.[0];
                              if (file) {
                                replaceTheme3CollectionMedia(index, file);
                              }
                            }}
                          />
                        </div>
                      );
                    })}

                    {pendingTheme3CollectionPreviews.map((preview, index) => (
                      <div
                        key={preview.url}
                        className="group relative h-36 overflow-hidden rounded-2xl border border-amber-200 bg-white"
                      >
                        <Image
                          src={preview.url}
                          alt="pending collection image"
                          width={260}
                          height={90}
                          className="h-full w-full object-cover"
                        />
                        <div className="absolute inset-0 flex items-center justify-center gap-2 bg-black/25 opacity-100 transition lg:opacity-0 lg:group-hover:opacity-100">
                          <button
                            type="button"
                            onClick={() => {
                              setPreviewUrl(preview.url);
                              setIsPreviewOpen(true);
                            }}
                            className="rounded-lg border border-slate-900 bg-white/90 px-3 py-1.5 text-xs font-semibold text-slate-900"
                          >
                            View
                          </button>
                          <button
                            type="button"
                            onClick={() =>
                              removePendingTheme3CollectionMedia(index)
                            }
                            className="rounded-lg border border-slate-900 bg-white/90 px-3 py-1.5 text-xs font-semibold text-slate-900"
                          >
                            Remove
                          </button>
                        </div>
                        <div className="absolute top-2 left-2 rounded-md bg-amber-500 px-2 py-0.5 text-[10px] font-bold text-white uppercase">
                          Pending
                        </div>
                      </div>
                    ))}

                    {form.theme3CollectionLabelImages.length +
                      pendingTheme3CollectionFiles.length <
                      MAX_THEME3_COLLECTION_IMAGES && (
                      <button
                        type="button"
                        onClick={() =>
                          document
                            .getElementById("theme3-collection-add-input")
                            ?.click()
                        }
                        className="flex h-36 flex-col items-center justify-center rounded-2xl border border-rose-300 bg-white text-rose-800 transition hover:border-rose-400"
                      >
                        <Plus size={24} />
                        <span className="mt-2 text-sm font-semibold">
                          Choose Media
                        </span>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 md:col-span-2">
            <div className="flex items-center justify-between">
              <p className="text-sm font-semibold text-slate-800">
                Slider Media
              </p>
              <span className="text-xs text-slate-500">
                {form.sliderImages.length + pendingSliderFiles.length}/
                {MAX_SLIDER_IMAGES}
              </span>
            </div>
            {form.themeLayout === "theme3" ? (
              <p className="mt-1 text-xs font-semibold text-rose-700">
                Theme 3 requires image size exactly {THEME3_SLIDER_WIDTH} x {THEME3_SLIDER_HEIGHT}.
              </p>
            ) : null}
            <input
              id="slider-add-input"
              type="file"
              accept="image/*,video/*"
              multiple
              className="hidden"
              onChange={async (event) => {
                const files = Array.from(event.target.files || []);
                const validFiles: File[] = [];
                for (const file of files) {
                  const valid = await validateSliderFileForTheme(file);
                  if (valid) validFiles.push(file);
                }
                setPendingSliderFiles((prev) => {
                  const remaining =
                    MAX_SLIDER_IMAGES - form.sliderImages.length - prev.length;
                  if (remaining <= 0) return prev;
                  return [...prev, ...validFiles.slice(0, remaining)];
                });
              }}
            />

            <div className="mt-3 grid gap-3 sm:grid-cols-3 lg:grid-cols-4">
              {form.sliderImages.map((url, index) => {
                const pendingReplacement = pendingSliderReplacementPreviews.find(
                  (preview) => preview.index === index,
                );

                if (pendingReplacement) {
                  return (
                    <div
                      key={`${url}-${index}`}
                      className="group relative h-44 overflow-hidden rounded-2xl border border-amber-200 bg-white"
                    >
                      {isVideoUrl(pendingReplacement.url) ||
                      pendingReplacement.file.type.startsWith("video/") ? (
                        <video
                          src={pendingReplacement.url}
                          className="h-full w-full object-contain"
                          autoPlay
                          muted
                          loop
                          playsInline
                        />
                      ) : (
                        <Image
                          src={pendingReplacement.url}
                          alt="pending slider replacement"
                          width={240}
                          height={160}
                          className="h-full w-full object-contain"
                        />
                      )}

                      <div className="absolute inset-0 flex items-center justify-center gap-2 bg-black/25 opacity-100 lg:opacity-0 transition lg:group-hover:opacity-100">
                        <button
                          type="button"
                          onClick={() => {
                            setPreviewUrl(pendingReplacement.url);
                            setIsPreviewOpen(true);
                          }}
                          className="rounded-lg border border-slate-900 bg-white/90 px-3 py-1.5 text-xs font-semibold text-slate-900"
                        >
                          View
                        </button>
                        <label
                          htmlFor={`slider-change-${index}`}
                          className="cursor-pointer rounded-lg border border-slate-900 bg-white/90 px-3 py-1.5 text-xs font-semibold text-slate-900"
                        >
                          Change
                        </label>
                        <button
                          type="button"
                          onClick={() => removePendingSliderReplacement(index)}
                          className="rounded-lg border border-slate-900 bg-white/90 px-3 py-1.5 text-xs font-semibold text-slate-900"
                        >
                          Remove
                        </button>
                        {!pendingReplacement.file.type.startsWith("video/") && (
                          <button
                            type="button"
                            onClick={() => {
                              setAiEnhanceSource(pendingReplacement.url);
                              setAiEnhanceTarget("slider");
                              setIsAIEnhanceModalOpen(true);
                            }}
                            className="flex items-center gap-1.5 rounded-lg border border-indigo-600 bg-indigo-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-indigo-700"
                          >
                            <Sparkles size={12} />
                            AI
                          </button>
                        )}
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

                      <div className="absolute top-2 left-2 rounded-md bg-amber-500 px-2 py-0.5 text-[10px] font-bold text-white uppercase">
                        Pending
                      </div>
                    </div>
                  );
                }

                return (
                  <div
                    key={url}
                    className="group relative h-44 overflow-hidden rounded-2xl border border-slate-300 bg-white"
                  >
                    {isVideoUrl(url) ? (
                      <video
                        src={url}
                        className="h-full w-full object-contain"
                        autoPlay
                        muted
                        loop
                        playsInline
                      />
                    ) : (
                      <Image
                        src={url}
                        alt="slider"
                        width={240}
                        height={160}
                        className="h-full w-full object-contain"
                      />
                    )}

                    <div className="absolute inset-0 flex items-center justify-center gap-2 bg-black/25 opacity-100 lg:opacity-0 transition lg:group-hover:opacity-100">
                      <button
                        type="button"
                        onClick={() => {
                          setPreviewUrl(url);
                          setIsPreviewOpen(true);
                        }}
                        className="rounded-lg border border-slate-900 bg-white/90 px-3 py-1.5 text-xs font-semibold text-slate-900"
                      >
                        View
                      </button>
                      <label
                        htmlFor={`slider-change-${index}`}
                        className="cursor-pointer rounded-lg border border-slate-900 bg-white/90 px-3 py-1.5 text-xs font-semibold text-slate-900"
                      >
                        Change
                      </label>
                      <button
                        type="button"
                        onClick={() => removeSliderImage(index, url)}
                        className="rounded-lg border border-slate-900 bg-white/90 px-3 py-1.5 text-xs font-semibold text-slate-900"
                      >
                        Remove
                      </button>
                      {!isVideoUrl(url) && (
                        <button
                          type="button"
                          onClick={() => {
                            setAiEnhanceSource(url);
                            setAiEnhanceTarget("slider");
                            setIsAIEnhanceModalOpen(true);
                          }}
                          className="flex items-center gap-1.5 rounded-lg border border-indigo-600 bg-indigo-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-indigo-700"
                        >
                          <Sparkles size={12} />
                          AI
                        </button>
                      )}
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
                );
              })}

              {pendingSliderPreviews.map((preview, index) => (
                <div
                  key={preview.url}
                  className="group relative h-44 overflow-hidden rounded-2xl border border-amber-200 bg-white"
                >
                  {isVideoUrl(preview.url) ||
                  preview.file.type.startsWith("video/") ? (
                    <video
                      src={preview.url}
                      className="h-full w-full object-contain"
                      autoPlay
                      muted
                      loop
                      playsInline
                    />
                  ) : (
                    <Image
                      src={preview.url}
                      alt="pending slider"
                      width={240}
                      height={160}
                      className="h-full w-full object-contain"
                    />
                  )}
                  <div className="absolute inset-0 flex items-center justify-center gap-2 bg-black/25 opacity-100 lg:opacity-0 transition lg:group-hover:opacity-100">
                    <button
                      type="button"
                      onClick={() => {
                        setPreviewUrl(preview.url);
                        setIsPreviewOpen(true);
                      }}
                      className="rounded-lg border border-slate-900 bg-white/90 px-3 py-1.5 text-xs font-semibold text-slate-900"
                    >
                      View
                    </button>
                    <button
                      type="button"
                      onClick={() => removePendingSliderMedia(index)}
                      className="rounded-lg border border-slate-900 bg-white/90 px-3 py-1.5 text-xs font-semibold text-slate-900"
                    >
                      Remove
                    </button>
                    {!preview.file.type.startsWith("video/") && (
                      <button
                        type="button"
                        onClick={() => {
                          setAiEnhanceSource(preview.url);
                          setAiEnhanceTarget("slider");
                          setIsAIEnhanceModalOpen(true);
                        }}
                        className="flex items-center gap-1.5 rounded-lg border border-indigo-600 bg-indigo-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-indigo-700"
                      >
                        <Sparkles size={12} />
                        AI
                      </button>
                    )}
                  </div>
                  <div className="absolute top-2 left-2 rounded-md bg-amber-500 px-2 py-0.5 text-[10px] font-bold text-white uppercase">
                    Pending
                  </div>
                </div>
              ))}

              {form.sliderImages.length + pendingSliderFiles.length <
                MAX_SLIDER_IMAGES && (
                  <button
                    type="button"
                    onClick={() =>
                      document.getElementById("slider-add-input")?.click()
                    }
                    className="flex h-44 flex-col items-center justify-center rounded-2xl border border-slate-300 bg-white text-slate-700 transition hover:border-slate-400"
                  >
                    <Plus size={26} />
                    <span className="mt-2 text-sm font-medium">
                      Choose Media
                    </span>
                  </button>
                )}
            </div>
          </div>

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
          className="flex items-center justify-center gap-2 rounded-xl bg-slate-900 py-3 font-semibold text-white disabled:opacity-50"
        >
          {saving && <Spinner size={16} className="text-white" />}
          {saving ? "Saving Changes..." : "Save Configuration"}
        </button>
      </form>
    )}

      <AIEnhanceModal
        isOpen={isAIEnhanceModalOpen}
        onClose={() => setIsAIEnhanceModalOpen(false)}
        originalImage={aiEnhanceSource}
        onSelectImage={handleAISelectImage}
      />
      

      {isPreviewOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4"
          onClick={() => setIsPreviewOpen(false)}
        >
          <div
            className="relative max-h-[90vh] max-w-[90vw]"
            onClick={(event) => event.stopPropagation()}
          >
            <button
              className="absolute -top-10 right-0 p-2 text-white hover:text-slate-300 cursor-pointer"
              onClick={() => setIsPreviewOpen(false)}
            >
              <X size={32} />
            </button>
            {previewUrl &&
              (isVideoUrl(previewUrl) ? (
                <video
                  src={previewUrl}
                  muted
                  controls
                  autoPlay
                  className="max-h-[85vh] rounded-lg object-contain"
                />
              ) : (
                  <Image
                    src={previewUrl}
                    alt="Preview"
                    width={800}
                    height={600}
                    className="max-h-[85vh] rounded-lg object-contain"
                  />
              ))}
          </div>
        </div>
      )}
    </div>
  );
}
