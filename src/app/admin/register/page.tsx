"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

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
      <form onSubmit={handleSubmit} className="w-full max-w-xl rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
        <h1 className="text-3xl font-black text-slate-900">Create your store dashboard</h1>
        <p className="mt-2 text-slate-600">Register and launch your custom ecommerce store.</p>

        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          {Object.keys(form).map((key) => (
            <input
              key={key}
              required
              value={form[key as keyof typeof form]}
              onChange={(event) =>
                setForm((prev) => ({
                  ...prev,
                  [key]: event.target.value,
                }))
              }
              placeholder={key}
              className="rounded-xl border border-slate-300 px-4 py-2"
            />
          ))}
        </div>

        {error ? <p className="mt-3 text-sm text-red-600">{error}</p> : null}

        <button
          disabled={loading}
          className="mt-6 w-full rounded-xl bg-slate-900 py-3 font-semibold text-white disabled:opacity-50"
        >
          {loading ? "Creating..." : "Create store"}
        </button>

        <p className="mt-4 text-sm text-slate-600">
          Already have an account? <Link href="/admin/login" className="font-semibold text-slate-900">Login</Link>
        </p>
      </form>
    </main>
  );
}
