"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Store } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { http } from "@/lib/http";
import { useAppDispatch } from "@/store/hooks";
import { setSession } from "@/store/slices/authSlice";

export default function AdminLoginPage() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    email: "",
    password: "",
  });

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setLoading(true);

    try {
      const data = await http<{
        admin: {
          _id: string;
          ownerName: string;
          businessEmail: string;
          mobile: string;
          storeId: string;
        };
      }>("/api/auth/admin/login", {
        method: "POST",
        body: form,
      });

      dispatch(
        setSession({
          role: "admin",
          userId: data.admin._id,
          storeId: data.admin.storeId,
          name: data.admin.ownerName,
          email: data.admin.businessEmail,
          mobile: data.admin.mobile,
        }),
      );

      const next =
        typeof window !== "undefined"
          ? new URLSearchParams(window.location.search).get("next")
          : null;

      router.replace(next || "/admin/home");
    } catch (submissionError) {
      setError(submissionError instanceof Error ? submissionError.message : "Login failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-lg">
      <div className="mb-6 text-center">
        <Store className="mx-auto size-6 text-slate-900" />
        <h1 className="mt-2 text-2xl font-bold text-slate-900">Admin Login</h1>
        <p className="text-sm text-slate-600">Login to manage products, orders, and branding.</p>
      </div>

      <form className="space-y-3" onSubmit={handleSubmit}>
        <Input
          type="email"
          placeholder="Business Email"
          value={form.email}
          onChange={(event) => setForm((prev) => ({ ...prev, email: event.target.value }))}
          required
        />
        <Input
          type="password"
          placeholder="Password"
          value={form.password}
          onChange={(event) => setForm((prev) => ({ ...prev, password: event.target.value }))}
          required
        />

        {error ? <p className="text-sm text-rose-600">{error}</p> : null}

        <Button type="submit" className="h-11 w-full" disabled={loading}>
          {loading ? "Logging in..." : "Login"}
        </Button>
      </form>

      <p className="mt-4 text-center text-sm text-slate-600">
        New admin?{" "}
        <Link href="/admin/signup" className="font-semibold text-slate-900">
          Create account
        </Link>
      </p>
    </section>
  );
}
