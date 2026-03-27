"use client";

import { useEffect, useState } from "react";

import { AdminTopbar } from "@/components/admin/admin-topbar";
import { Skeleton } from "@/components/admin/ui/skeleton";

export default function ProfilePage() {
  const [profile, setProfile] = useState<{
    ownerName: string;
    email: string;
    mobile: string;
    businessName: string;
    slug: string;
  } | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    async function load() {
      setError("");
      try {
        const response = await fetch("/api/auth/me");
        if (!response.ok) {
          setError("Failed to load profile. Please sign in again.");
          return;
        }
        const data = await response.json();

        setProfile({
          ownerName: data.admin.ownerName,
          email: data.admin.email,
          mobile: data.admin.mobile,
          businessName: data.store.businessName,
          slug: data.store.slug,
        });
      } catch (err) {
        console.error(err);
        setError("A network error occurred.");
      }
    }

    load();
  }, []);

  return (
    <div>
      <AdminTopbar title="Profile" subtitle="Your account and store identity." />

      {error ? (
        <div className="rounded-2xl border border-red-200 bg-red-50 p-5 text-red-700">
          <p className="font-semibold">{error}</p>
        </div>
      ) : !profile ? (
        <div className="rounded-2xl border border-slate-200 bg-white p-6 space-y-4">
          <Skeleton className="h-6 w-1/3" />
          <Skeleton className="h-6 w-1/2" />
          <Skeleton className="h-6 w-1/4" />
          <Skeleton className="h-6 w-1/3" />
          <Skeleton className="h-6 w-1/2" />
        </div>
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
