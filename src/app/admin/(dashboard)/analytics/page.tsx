"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { ExternalLink } from "lucide-react";

import { AdminTopbar } from "@/components/admin/admin-topbar";
import { Skeleton } from "@/components/admin/ui/skeleton";

export default function AnalyticsPage() {
  const [reportLink, setReportLink] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadStore() {
      setLoading(true);
      setError("");

      try {
        const response = await fetch("/api/admin/store");
        if (!response.ok) {
          setError("Failed to load analytics configuration.");
          return;
        }

        const data = await response.json();
        setReportLink((data.store?.reportLink || "").trim());
      } catch (loadError) {
        console.error(loadError);
        setError("A network error occurred while loading analytics.");
      } finally {
        setLoading(false);
      }
    }

    loadStore();
  }, []);

  const validReportLink = useMemo(() => {
    if (!reportLink) return "";

    try {
      const parsed = new URL(reportLink);
      if (parsed.protocol !== "https:") return "";
      return parsed.toString();
    } catch {
      return "";
    }
  }, [reportLink]);

  return (
    <div>
      <AdminTopbar
        title="Analytics"
        subtitle="Track your store performance with Looker Studio."
      />

      {error ? (
        <div className="rounded-2xl border border-red-200 bg-red-50 p-5 text-red-700">
          <p className="font-semibold">{error}</p>
        </div>
      ) : loading ? (
        <div className="space-y-4">
          <Skeleton className="h-12 rounded-xl" />
          <Skeleton className="h-[560px] rounded-2xl" />
        </div>
      ) : !reportLink ? (
        <div className="rounded-2xl border border-slate-200 bg-white p-6">
          <h2 className="text-lg font-bold text-slate-900">
            No report link configured
          </h2>
          <p className="mt-2 text-sm text-slate-600">
            Add your Looker Studio embed URL in Configure Store to view reports
            here.
          </p>
          <Link
            href="/admin/configure-store"
            className="mt-4 inline-flex rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white"
          >
            Go to Configure Store
          </Link>
        </div>
      ) : !validReportLink ? (
        <div className="rounded-2xl border border-amber-200 bg-amber-50 p-5 text-amber-900">
          <p className="font-semibold">
            Invalid report link configured in Configure Store.
          </p>
          <p className="mt-1 text-sm">
            Please use a valid HTTPS Looker Studio URL.
          </p>
        </div>
      ) : (
        <div className="rounded-2xl border border-slate-200 bg-white p-4">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-sm font-semibold text-slate-700">
              Looker Studio Report
            </h2>
            <a
              href={validReportLink}
              target="_blank"
              rel="noreferrer noopener"
              className="inline-flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50"
            >
              Open in new tab <ExternalLink size={14} />
            </a>
          </div>
          <iframe
            src={validReportLink}
            title="Store analytics report"
            className="h-[75vh] min-h-[520px] w-full rounded-xl border border-slate-200"
            loading="lazy"
            allowFullScreen
          />
        </div>
      )}
    </div>
  );
}
