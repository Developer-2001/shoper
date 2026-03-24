"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function AdminLoginPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    identifier: "",
    password: "",
  });

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setLoading(true);
    setError("");

    const response = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });

    setLoading(false);

    const data = await response.json();

    if (!response.ok) {
      setError(data.error || "Login failed");
      return;
    }

    router.push(data.role === "platform_admin" ? "/admin/platform" : "/admin/home");
  }

  return (
    <main className="grid min-h-screen place-items-center bg-slate-100 p-6">
      <form onSubmit={handleSubmit} className="w-full max-w-md rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
        <h1 className="text-3xl font-black text-slate-900">Admin Login</h1>
        <p className="mt-2 text-slate-600">Login with Email or Mobile and password.</p>

        <div className="mt-6 space-y-4">
          <input
            required
            value={form.identifier}
            onChange={(event) => setForm((prev) => ({ ...prev, identifier: event.target.value }))}
            placeholder="Email or Mobile"
            className="w-full rounded-xl border border-slate-300 px-4 py-2"
          />
          <input
            required
            type="password"
            value={form.password}
            onChange={(event) => setForm((prev) => ({ ...prev, password: event.target.value }))}
            placeholder="Password"
            className="w-full rounded-xl border border-slate-300 px-4 py-2"
          />
        </div>

        {error ? <p className="mt-3 text-sm text-red-600">{error}</p> : null}

        <button
          disabled={loading}
          className="mt-6 w-full rounded-xl bg-slate-900 py-3 font-semibold text-white disabled:opacity-50"
        >
          {loading ? "Signing in..." : "Login"}
        </button>

        <p className="mt-4 text-sm text-slate-600">
          Need a store? <Link href="/admin/register" className="font-semibold text-slate-900">Create account</Link>
        </p>
      </form>
    </main>
  );
}
