"use client";

import { useEffect } from "react";
import { Provider } from "react-redux";

import { store } from "@/store";

export function AppProviders({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    if (process.env.NODE_ENV !== "production") return;
    if (typeof window === "undefined" || !("serviceWorker" in navigator)) {
      return;
    }

    void navigator.serviceWorker
      .register("/sw-media-cache.js")
      .catch(() => undefined);
  }, []);

  return <Provider store={store}>{children}</Provider>;
}
