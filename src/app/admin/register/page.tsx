"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

const currencyOptions = [
  { value: "CAD", label: "Canada (CAD)" },
  { value: "ERN", label: "Eritrea (ERN)" },
  { value: "EUR", label: "European Union (EUR)" },
  { value: "INR", label: "India (INR)" },
  { value: "USD", label: "United States (USD)" },
];

const themeOptions = [
  { value: "theme1", label: "Theme 1 (Default)" },
  { value: "theme2", label: "Theme 2" },
];

export default function AdminRegisterPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    businessName: "",
    businessEmail: "",
    mobile: "",
    ownerName: "",
    currency: "INR",
    slug: "",
    themeLayout: "theme1",
    password: "",
  });

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setLoading(true);
    setError("");

    const response = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });

    setLoading(false);

    if (!response.ok) {
      const data = await response.json();
      setError(data.error || "Registration failed");
      return;
    }

    router.push("/admin/home");
  }

  return (
    <main className="grid min-h-screen place-items-center bg-slate-100 p-6">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-xl rounded-3xl border border-slate-200 bg-white p-8 shadow-sm"
      >
        <h1 className="text-3xl font-black text-slate-900">
          Create your store dashboard
        </h1>
        <p className="mt-2 text-slate-600">
          Register and launch your custom ecommerce store.
        </p>

        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          <input
            required
            value={form.businessName}
            onChange={(event) =>
              setForm((prev) => ({ ...prev, businessName: event.target.value }))
            }
            placeholder="businessName"
            className="rounded-xl border border-slate-300 px-4 py-2"
          />
          <input
            required
            type="email"
            value={form.businessEmail}
            onChange={(event) =>
              setForm((prev) => ({ ...prev, businessEmail: event.target.value }))
            }
            placeholder="businessEmail"
            className="rounded-xl border border-slate-300 px-4 py-2"
          />
          <input
            required
            value={form.mobile}
            onChange={(event) =>
              setForm((prev) => ({ ...prev, mobile: event.target.value }))
            }
            placeholder="mobile"
            className="rounded-xl border border-slate-300 px-4 py-2"
          />
          <input
            required
            value={form.ownerName}
            onChange={(event) =>
              setForm((prev) => ({ ...prev, ownerName: event.target.value }))
            }
            placeholder="ownerName"
            className="rounded-xl border border-slate-300 px-4 py-2"
          />

          <select
            required
            value={form.currency}
            onChange={(event) =>
              setForm((prev) => ({ ...prev, currency: event.target.value }))
            }
            className="rounded-xl border border-slate-300 px-4 py-2"
          >
            {currencyOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>

          <input
            required
            value={form.slug}
            onChange={(event) =>
              setForm((prev) => ({ ...prev, slug: event.target.value }))
            }
            placeholder="slug"
            className="rounded-xl border border-slate-300 px-4 py-2"
          />

          <select
            required
            value={form.themeLayout}
            onChange={(event) =>
              setForm((prev) => ({ ...prev, themeLayout: event.target.value }))
            }
            className="rounded-xl border border-slate-300 px-4 py-2"
          >
            {themeOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>

          <input
            required
            type="password"
            value={form.password}
            onChange={(event) =>
              setForm((prev) => ({ ...prev, password: event.target.value }))
            }
            placeholder="password"
            className="rounded-xl border border-slate-300 px-4 py-2 sm:col-span-2"
          />
        </div>

        {error ? <p className="mt-3 text-sm text-red-600">{error}</p> : null}

        <button
          disabled={loading}
          className="mt-6 w-full rounded-xl bg-slate-900 py-3 font-semibold text-white disabled:opacity-50"
        >
          {loading ? "Creating..." : "Create store"}
        </button>

        <p className="mt-4 text-sm text-slate-600">
          Already have an account?{" "}
          <Link href="/admin/login" className="font-semibold text-slate-900">
            Login
          </Link>
        </p>
      </form>
    </main>
  );
}
