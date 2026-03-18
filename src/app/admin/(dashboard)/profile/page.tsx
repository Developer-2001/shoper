"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { http } from "@/lib/http";

type Profile = {
  _id: string;
  ownerName: string;
  businessEmail: string;
  mobile: string;
  businessName: string;
  currency: string;
};

export default function AdminProfilePage() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [ownerName, setOwnerName] = useState("");
  const [businessEmail, setBusinessEmail] = useState("");
  const [mobile, setMobile] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    async function load() {
      const data = await http<{ profile: Profile }>("/api/admin/profile");
      setProfile(data.profile);
      setOwnerName(data.profile.ownerName);
      setBusinessEmail(data.profile.businessEmail);
      setMobile(data.profile.mobile);
    }

    load();
  }, []);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setMessage("");

    await http<{ profile: Profile }>("/api/admin/profile", {
      method: "PUT",
      body: {
        ownerName,
        businessEmail,
        mobile,
      },
    });

    setMessage("Profile updated successfully.");
    setLoading(false);
  }

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <h2 className="text-lg font-semibold text-slate-900">Admin Profile</h2>
      <p className="mt-1 text-sm text-slate-600">Keep your account details up to date.</p>

      <form className="mt-5 grid gap-3 md:grid-cols-2" onSubmit={handleSubmit}>
        <Input value={ownerName} onChange={(event) => setOwnerName(event.target.value)} placeholder="Owner Name" />
        <Input
          value={businessEmail}
          type="email"
          onChange={(event) => setBusinessEmail(event.target.value)}
          placeholder="Business Email"
        />
        <Input value={mobile} onChange={(event) => setMobile(event.target.value)} placeholder="Mobile" />
        <Input value={profile?.businessName ?? ""} disabled placeholder="Business Name" />
        <Input value={profile?.currency ?? ""} disabled placeholder="Currency" />

        {message ? <p className="text-sm text-emerald-600 md:col-span-2">{message}</p> : null}

        <Button type="submit" className="md:col-span-2" disabled={loading}>
          {loading ? "Updating..." : "Update Profile"}
        </Button>
      </form>
    </section>
  );
}
