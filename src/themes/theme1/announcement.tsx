"use client";

import { X } from "lucide-react";
import { useEffect, useState } from "react";

const Theme1_ANNOUNCEMENT_DISMISS_KEY = "Theme1_home_announcement_dismissed";

export function Theme1Announcement() {
  const [visible, setVisible] = useState(true);
  const [entered, setEntered] = useState(false);
  const text = "Free Shipping On Orders Over $200"; // You can customize the announcement text here

  useEffect(() => {
    try {
      if (
        window.localStorage.getItem(Theme1_ANNOUNCEMENT_DISMISS_KEY) === "1"
      ) {
        setVisible(false);
        return;
      }
    } catch {
      // ignore storage errors
    }

    const timer = window.setTimeout(() => setEntered(true), 10);
    return () => window.clearTimeout(timer);
  }, []);

  function dismiss() {
    setVisible(false);
    try {
      window.localStorage.setItem(Theme1_ANNOUNCEMENT_DISMISS_KEY, "1");
    } catch {
      // ignore storage errors
    }
  }

  if (!visible) return null;

  return (
    <div
      className={`absolute left-1/2 top-full z-50 mt-2 flex w-[min(calc(100%-1rem),56rem)] -translate-x-1/2 items-center justify-center rounded-lg bg-[#1d4ed8] px-3 py-2 pr-10 text-center text-xs font-semibold text-white shadow-lg transition-all duration-500 ease-out sm:px-8 sm:text-sm ${
        entered ? "translate-y-0 opacity-100" : "-translate-y-4 opacity-0"
      }`}
    >
      <span>{text}</span>
      <button
        type="button"
        onClick={dismiss}
        className="absolute right-2 inline-flex h-7 w-7 cursor-pointer items-center justify-center rounded-full bg-white/15 text-white transition hover:bg-white/25 sm:right-4"
        aria-label="Dismiss announcement"
      >
        <X size={14} />
      </button>
    </div>
  );
}




