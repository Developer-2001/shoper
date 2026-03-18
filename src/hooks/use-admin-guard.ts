"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useAppSelector } from "@/store/hooks";
import { useSessionBoot } from "@/hooks/use-session-boot";

export function useAdminGuard() {
  const router = useRouter();
  const pathname = usePathname();
  const { status, session } = useAppSelector((state) => state.auth);

  useSessionBoot();

  useEffect(() => {
    if (status === "loading" || status === "idle") {
      return;
    }

    if (!session || session.role !== "admin") {
      router.replace(`/admin/login?next=${encodeURIComponent(pathname)}`);
    }
  }, [pathname, router, session, status]);

  return {
    isAllowed: status === "authenticated" && session?.role === "admin",
    isLoading: status === "loading" || status === "idle",
  };
}
