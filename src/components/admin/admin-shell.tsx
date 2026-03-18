"use client";

import { useRouter } from "next/navigation";
import { Loader2, LogOut } from "lucide-react";
import { AdminSidebar } from "@/components/admin/admin-sidebar";
import { Button } from "@/components/ui/button";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { clearSession } from "@/store/slices/authSlice";
import { http } from "@/lib/http";
import { useAdminGuard } from "@/hooks/use-admin-guard";

export function AdminShell({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { session } = useAppSelector((state) => state.auth);
  const { isAllowed, isLoading } = useAdminGuard();

  async function handleLogout() {
    await http<{ message: string }>("/api/auth/logout", { method: "POST" });
    dispatch(clearSession());
    router.replace("/admin/login");
  }

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <Loader2 className="size-6 animate-spin text-slate-600" />
      </div>
    );
  }

  if (!isAllowed) {
    return null;
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="mx-auto flex min-h-screen w-full max-w-[1600px] flex-col md:flex-row">
        <AdminSidebar />

        <div className="flex-1">
          <header className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 bg-white px-4 py-3 sm:px-6">
            <div>
              <h1 className="text-base font-semibold text-slate-900 sm:text-lg">
                Welcome back, {session?.name ?? "Admin"}
              </h1>
              <p className="text-xs text-slate-500 sm:text-sm">Manage your products, orders, and storefront theme.</p>
            </div>

            <Button variant="ghost" className="gap-2" onClick={handleLogout}>
              <LogOut className="size-4" />
              Logout
            </Button>
          </header>

          <main className="p-4 sm:p-6">{children}</main>
        </div>
      </div>
    </div>
  );
}
