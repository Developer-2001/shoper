"use client";

import { FormEvent, ReactNode, useEffect, useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";

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
  stripeEnabled: false,
  stripeAccountId: "",
  helcimEnabled: false,
  helcimToken: "",
  helcimAccountId: "",
};

function Field({
  id,
  label,
  helper,
  children,
}: {
  id: string;
  label: string;
  helper?: string;
  children: ReactNode;
}) {
  return (
    <div className="space-y-2">
      <label htmlFor={id} className="text-sm font-semibold text-slate-700">
        {label}
      </label>
      {children}
      {helper ? <p className="text-xs text-slate-500">{helper}</p> : null}
    </div>
  );
}

export default function ConfigureStorePage() {
  const [form, setForm] = useState(defaultForm);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isPaymentProviderOpen, setIsPaymentProviderOpen] = useState(true);

  function buildPayload(overrides?: Partial<typeof defaultForm>) {
    const merged = {
      ...form,
      ...overrides,
    };

    return {
      companyName: merged.companyName,
      logoText: merged.logoText,
      about: merged.about,
      address: merged.address,
      contactEmail: merged.contactEmail,
      contactPhone: merged.contactPhone,
      socialLinks: {
        instagram: merged.instagram,
        facebook: merged.facebook,
        x: merged.x,
        youtube: merged.youtube,
      },
      theme: {
        layout: merged.themeLayout,
      },
      footerLinks: merged.footerLinks
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean)
        .map((item) => {
          const [label, href] = item.split("|");
          return { label: label || "Link", href: href || "/" };
        }),
      paymentSettings: {
        stripe: {
          enabled: merged.stripeEnabled,
          accountId: merged.stripeAccountId,
        },
        helcim: {
          enabled: merged.helcimEnabled,
          token: merged.helcimToken,
          accountId: merged.helcimAccountId,
        },
      },
    };
  }
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
            .map(
              (item: { label: string; href: string }) =>
                `${item.label}|${item.href}`,
            )
            .join(","),
          stripeEnabled: store.paymentSettings?.stripe?.enabled || false,
          stripeAccountId: store.paymentSettings?.stripe?.accountId || "",
          helcimEnabled: store.paymentSettings?.helcim?.enabled || false,
          helcimToken: store.paymentSettings?.helcim?.token || "",
          helcimAccountId: store.paymentSettings?.helcim?.accountId || "",
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

    const payload = buildPayload();

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

  const inputClass =
    "w-full rounded-xl border border-slate-300 px-4 py-2 text-sm text-slate-900 outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-200";
  const textareaClass =
    "w-full min-h-24 rounded-xl border border-slate-300 px-4 py-2 text-sm text-slate-900 outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-200";

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
          <section className="space-y-3">
            <h3 className="text-base font-bold text-slate-900">
              Store Details
            </h3>
            <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 md:grid-cols-2">
              <Field id="companyName" label="Company Name">
                <input
                  id="companyName"
                  value={form.companyName}
                  onChange={(event) =>
                    setForm((prev) => ({
                      ...prev,
                      companyName: event.target.value,
                    }))
                  }
                  className={inputClass}
                  required
                />
              </Field>
              <Field id="logoText" label="Logo Text">
                <input
                  id="logoText"
                  value={form.logoText}
                  onChange={(event) =>
                    setForm((prev) => ({
                      ...prev,
                      logoText: event.target.value,
                    }))
                  }
                  className={inputClass}
                  required
                />
              </Field>
              <Field id="contactEmail" label="Contact Email">
                <input
                  id="contactEmail"
                  type="email"
                  value={form.contactEmail}
                  onChange={(event) =>
                    setForm((prev) => ({
                      ...prev,
                      contactEmail: event.target.value,
                    }))
                  }
                  className={inputClass}
                  required
                />
              </Field>
              <Field id="contactPhone" label="Contact Phone">
                <input
                  id="contactPhone"
                  value={form.contactPhone}
                  onChange={(event) =>
                    setForm((prev) => ({
                      ...prev,
                      contactPhone: event.target.value,
                    }))
                  }
                  className={inputClass}
                />
              </Field>
              <Field id="about" label="About Store">
                <textarea
                  id="about"
                  value={form.about}
                  onChange={(event) =>
                    setForm((prev) => ({ ...prev, about: event.target.value }))
                  }
                  className={textareaClass}
                />
              </Field>
              <Field id="address" label="Store Address">
                <textarea
                  id="address"
                  value={form.address}
                  onChange={(event) =>
                    setForm((prev) => ({
                      ...prev,
                      address: event.target.value,
                    }))
                  }
                  className={textareaClass}
                />
              </Field>
            </div>
          </section>

          <section className="mt-6 space-y-3 border-t border-slate-100 pt-4">
            <h3 className="text-base font-bold text-slate-900">Social Links</h3>
            <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 md:grid-cols-2">
              <Field id="instagram" label="Instagram URL">
                <input
                  id="instagram"
                  value={form.instagram}
                  onChange={(event) =>
                    setForm((prev) => ({
                      ...prev,
                      instagram: event.target.value,
                    }))
                  }
                  className={inputClass}
                  placeholder="https://instagram.com/your-handle"
                />
              </Field>
              <Field id="facebook" label="Facebook URL">
                <input
                  id="facebook"
                  value={form.facebook}
                  onChange={(event) =>
                    setForm((prev) => ({
                      ...prev,
                      facebook: event.target.value,
                    }))
                  }
                  className={inputClass}
                  placeholder="https://facebook.com/your-page"
                />
              </Field>
              <Field id="x" label="X (Twitter) URL">
                <input
                  id="x"
                  value={form.x}
                  onChange={(event) =>
                    setForm((prev) => ({ ...prev, x: event.target.value }))
                  }
                  className={inputClass}
                  placeholder="https://x.com/your-handle"
                />
              </Field>
              <Field id="youtube" label="YouTube URL">
                <input
                  id="youtube"
                  value={form.youtube}
                  onChange={(event) =>
                    setForm((prev) => ({
                      ...prev,
                      youtube: event.target.value,
                    }))
                  }
                  className={inputClass}
                  placeholder="https://youtube.com/@your-channel"
                />
              </Field>
            </div>
          </section>

          <section className="mt-6">
            <Field
              id="footerLinks"
              label="Footer Links"
              helper="Use format: label|href, label|href"
            >
              <textarea
                id="footerLinks"
                value={form.footerLinks}
                onChange={(event) =>
                  setForm((prev) => ({
                    ...prev,
                    footerLinks: event.target.value,
                  }))
                }
                className={textareaClass}
                placeholder="Home|/, Contact|/contact"
              />
            </Field>
          </section>

          <section className="mt-8 border-t border-slate-100 pt-6">
            <button
              type="button"
              onClick={() => setIsPaymentProviderOpen((previous) => !previous)}
              className="flex w-full items-center justify-between rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-left"
              aria-expanded={isPaymentProviderOpen}
            >
              <span className="text-base font-bold text-slate-900">
                Payment Provider (Canada)
              </span>
              {isPaymentProviderOpen ? (
                <ChevronUp size={18} className="text-slate-700" />
              ) : (
                <ChevronDown size={18} className="text-slate-700" />
              )}
            </button>

            {isPaymentProviderOpen ? (
              <>
                <div className="mt-4 max-w-md">
                <div className="rounded-2xl border border-slate-200 bg-slate-50/50 p-5">
                  <div className="mb-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <h4 className="text-lg font-bold text-slate-800">
                        Stripe Connect
                      </h4>
                      {form.stripeEnabled && form.stripeAccountId ? (
                        <span className="rounded-full bg-green-100 px-2 py-1 text-xs font-bold text-green-700">
                          Connected
                        </span>
                      ) : (
                        <span className="rounded-full bg-slate-200 px-2 py-1 text-xs font-bold text-slate-600">
                          Not Connected
                        </span>
                      )}
                    </div>
                  </div>

                  <p className="mb-6 text-sm text-slate-600">
                    {form.stripeEnabled
                      ? "Your store is connected to Stripe. Customers can now pay you directly."
                      : "Connect your Stripe account to receive direct payments from customers. No technical setup required."}
                  </p>

                  {form.stripeEnabled && form.stripeAccountId ? (
                    <div className="space-y-4">
                      <div className="rounded-xl border border-slate-200 bg-white p-3 font-mono text-sm text-slate-500">
                        ID: {form.stripeAccountId}
                      </div>
                      <button
                        type="button"
                        onClick={async () => {
                          if (
                            !confirm(
                              "Are you sure you want to disconnect Stripe? Customers won't be able to buy from your store.",
                            )
                          )
                            return;
                          setSaving(true);
                          try {
                            const res = await fetch("/api/admin/store", {
                              method: "PUT",
                              headers: { "Content-Type": "application/json" },
                              body: JSON.stringify(
                                buildPayload({
                                  stripeEnabled: false,
                                  stripeAccountId: "",
                                }),
                              ),
                            });
                            if (res.ok) {
                              setForm((previous) => ({
                                ...previous,
                                stripeEnabled: false,
                                stripeAccountId: "",
                              }));
                            }
                          } catch {
                            alert("Failed to disconnect");
                          } finally {
                            setSaving(false);
                          }
                        }}
                        className="text-sm font-semibold text-red-600 underline hover:text-red-700"
                      >
                        Disconnect account
                      </button>
                    </div>
                  ) : (
                    <button
                      type="button"
                      disabled={saving}
                      onClick={async () => {
                        setSaving(true);
                        try {
                          const res = await fetch("/api/admin/stripe/onboard");
                          const data = await res.json();
                          if (data.url) window.location.href = data.url;
                          else
                            alert(data.error || "Failed to start onboarding.");
                        } catch {
                          alert("A network error occurred.");
                        } finally {
                          setSaving(false);
                        }
                      }}
                      className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#635BFF] py-3 font-semibold text-white shadow-sm transition-colors hover:bg-[#5851E0] disabled:opacity-50"
                    >
                      {saving ? <Spinner size={16} /> : null}
                      Connect with Stripe
                    </button>
                  )}
                </div>
              </div>

              <div className="mt-6 max-w-md">
                <div className="rounded-2xl border border-slate-200 bg-slate-50/50 p-5">
                  <div className="mb-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <h4 className="text-lg font-bold text-slate-800">
                        Helcim Payments
                      </h4>
                      {form.helcimEnabled ? (
                        <span className="rounded-full bg-green-100 px-2 py-1 text-xs font-bold text-green-700">
                          Enabled
                        </span>
                      ) : (
                        <span className="rounded-full bg-slate-200 px-2 py-1 text-xs font-bold text-slate-600">
                          Disabled
                        </span>
                      )}
                    </div>
                    <label className="relative inline-flex cursor-pointer items-center">
                      <input
                        type="checkbox"
                        className="peer sr-only"
                        checked={form.helcimEnabled}
                        onChange={(event) =>
                          setForm((prev) => ({
                            ...prev,
                            helcimEnabled: event.target.checked,
                          }))
                        }
                      />
                      <div className="peer h-6 w-11 rounded-full bg-slate-200 after:absolute after:top-[2px] after:left-[2px] after:h-5 after:w-5 after:rounded-full after:border after:border-slate-300 after:bg-white after:transition-all after:content-[''] peer-checked:bg-slate-900 peer-checked:after:translate-x-full peer-checked:after:border-white peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-slate-300"></div>
                    </label>
                  </div>

                  <div className="space-y-4">
                    <Field id="helcimAccountId" label="Helcim Account ID">
                      <input
                        id="helcimAccountId"
                        value={form.helcimAccountId}
                        onChange={(event) =>
                          setForm((prev) => ({
                            ...prev,
                            helcimAccountId: event.target.value,
                          }))
                        }
                        className={inputClass}
                        placeholder="e.g. 123456"
                      />
                    </Field>
                    <Field id="helcimToken" label="API Token">
                      <input
                        id="helcimToken"
                        type="password"
                        value={form.helcimToken}
                        onChange={(event) =>
                          setForm((prev) => ({
                            ...prev,
                            helcimToken: event.target.value,
                          }))
                        }
                        className={inputClass}
                        placeholder="helcim_api_..."
                      />
                    </Field>
                  </div>
                </div>
              </div>
            </>
          ) : null}
          </section>

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
