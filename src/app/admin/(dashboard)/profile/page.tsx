"use client";

import { useEffect, useState } from "react";

import { AdminTopbar } from "@/components/admin/admin-topbar";

export default function ProfilePage() {
  const [profile, setProfile] = useState<{
    ownerName: string;
    email: string;
    mobile: string;
    businessName: string;
    slug: string;
  } | null>(null);

  useEffect(() => {
    async function load() {
      const response = await fetch("/api/auth/me");
      if (!response.ok) return;
      const data = await response.json();

      setProfile({
        ownerName: data.admin.ownerName,
        email: data.admin.email,
        mobile: data.admin.mobile,
        businessName: data.store.businessName,
        slug: data.store.slug,
      });
    }

    load();
  }, []);

  return (
    <div>
      <AdminTopbar title="Profile" subtitle="Your account and store identity." />

      {!profile ? (
        <p className="text-slate-600">Loading profile...</p>
      ) : (
        <div className="rounded-2xl border border-slate-200 bg-white p-6">
          <p>
            <strong>Owner:</strong> {profile.ownerName}
          </p>
          <p>
            <strong>Email:</strong> {profile.email}
          </p>
          <p>
            <strong>Mobile:</strong> {profile.mobile}
          </p>
          <p>
            <strong>Business:</strong> {profile.businessName}
          </p>
          <p>
            <strong>Store URL:</strong> /{profile.slug}
          </p>
        </div>
      )}
    </div>
  );
}
