"use client";

import { useEffect } from "react";
import { useAppDispatch } from "@/store/hooks";
import { clearSession, setAuthLoading, setSession } from "@/store/slices/authSlice";
import { http } from "@/lib/http";
import type { SessionDto } from "@/types";

export function useSessionBoot() {
  const dispatch = useAppDispatch();

  useEffect(() => {
    let mounted = true;

    async function loadSession() {
      dispatch(setAuthLoading());

      try {
        const data = await http<{ session: SessionDto }>("/api/auth/session");
        if (mounted) {
          dispatch(setSession(data.session));
        }
      } catch {
        if (mounted) {
          dispatch(clearSession());
        }
      }
    }

    loadSession();

    return () => {
      mounted = false;
    };
  }, [dispatch]);
}
