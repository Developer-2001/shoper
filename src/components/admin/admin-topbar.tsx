"use client";

import { Menu } from "lucide-react";
import { useAdminLayout } from "./admin-layout-context";

export function AdminTopbar({
  title,
  subtitle,
}: {
  title: string;
  subtitle?: string;
}) {
  const { toggleSidebar } = useAdminLayout();

  return (
    <div className="mb-4 flex items-center justify-between border-b border-slate-200 pb-2">
      <div className="flex items-center gap-4">
        <button
          onClick={toggleSidebar}
          className="rounded-lg border border-slate-200 p-2 text-slate-600 hover:bg-slate-50 lg:hidden"
        >
          <Menu size={20} />
        </button>
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900">
            {title}
          </h1>
          {subtitle ? (
            <p className=" text-xs sm:text-md md:text-lg text-slate-600">
              {subtitle}
            </p>
          ) : null}
        </div>
      </div>
    </div>
  );
}
