"use client";

import { X } from "lucide-react";
import { useEffect, useState } from "react";

const THEME3_ANNOUNCEMENT_DISMISS_KEY = "theme3_home_announcement_dismissed";



export function Theme3Announcement() {
  const [visible, setVisible] = useState(true);
  const [entered, setEntered] = useState(false);
  const text = "Free Shipping On Orders Over $200"; // You can customize the announcement text here

  useEffect(() => {
    try {
      if (
        window.localStorage.getItem(THEME3_ANNOUNCEMENT_DISMISS_KEY) === "1"
      ) {
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
      window.localStorage.setItem(THEME3_ANNOUNCEMENT_DISMISS_KEY, "1");
    } catch {
      // ignore storage errors
    }
  }

  if (!visible) return null;

  return (
    <div
      className={`absolute left-1/2 top-full z-50 flex w-[min(100%-2rem,56rem)] -translate-x-1/2 items-center justify-center rounded-lg bg-[#cc5639] px-10 py-2 text-center text-sm font-semibold text-white shadow-lg transition-all duration-500 ease-out ${
        entered ? "translate-y-0 opacity-100" : "-translate-y-4 opacity-0"
      }`}
    >
      <span>{text}</span>
      <button
        type="button"
        onClick={dismiss}
        className="absolute right-4 inline-flex h-7 w-7 items-center cursor-pointer justify-center rounded-full bg-white/15 text-white transition hover:bg-white/25"
        aria-label="Dismiss announcement"
      >
        <X size={14} />
      </button>
    </div>
  );
}
