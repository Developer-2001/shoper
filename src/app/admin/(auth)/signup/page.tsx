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

export default function AdminSignupPage() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    businessName: "",
    businessEmail: "",
    mobile: "",
    ownerName: "",
    currency: "INR",
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
      }>("/api/auth/admin/signup", {
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

      router.replace("/admin/home");
    } catch (submissionError) {
      setError(submissionError instanceof Error ? submissionError.message : "Signup failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-lg">
      <div className="mb-6 text-center">
        <Store className="mx-auto size-6 text-slate-900" />
        <h1 className="mt-2 text-2xl font-bold text-slate-900">Create Admin Store</h1>
        <p className="text-sm text-slate-600">Launch your custom ecommerce dashboard in minutes.</p>
      </div>

      <form className="space-y-3" onSubmit={handleSubmit}>
        <Input
          placeholder="Business Name"
          value={form.businessName}
          onChange={(event) => setForm((prev) => ({ ...prev, businessName: event.target.value }))}
          required
        />
        <Input
          type="email"
          placeholder="Business Email"
          value={form.businessEmail}
          onChange={(event) => setForm((prev) => ({ ...prev, businessEmail: event.target.value }))}
          required
        />
        <Input
          placeholder="Mobile"
          value={form.mobile}
          onChange={(event) => setForm((prev) => ({ ...prev, mobile: event.target.value }))}
          required
        />
        <Input
          placeholder="Owner Name"
          value={form.ownerName}
          onChange={(event) => setForm((prev) => ({ ...prev, ownerName: event.target.value }))}
          required
        />

        <select
          className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-900"
          value={form.currency}
          onChange={(event) => setForm((prev) => ({ ...prev, currency: event.target.value }))}
        >
          <option value="INR">INR</option>
          <option value="USD">USD</option>
          <option value="EUR">EUR</option>
          <option value="GBP">GBP</option>
          <option value="AED">AED</option>
        </select>

        <Input
          type="password"
          placeholder="Password"
          value={form.password}
          onChange={(event) => setForm((prev) => ({ ...prev, password: event.target.value }))}
          required
        />

        {error ? <p className="text-sm text-rose-600">{error}</p> : null}

        <Button type="submit" className="h-11 w-full" disabled={loading}>
          {loading ? "Creating account..." : "Create Admin Account"}
        </Button>
      </form>

      <p className="mt-4 text-center text-sm text-slate-600">
        Already have an account?{" "}
        <Link href="/admin/login" className="font-semibold text-slate-900">
          Login
        </Link>
      </p>
    </section>
  );
}
