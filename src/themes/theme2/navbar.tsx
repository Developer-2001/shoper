"use client";

import { Theme2TopAnnouncement } from "@/themes/theme2/components/theme2-top-announcement";
import { Theme2BrandHeader } from "@/themes/theme2/components/theme2-brand-header";
import { Theme2Navigation } from "@/themes/theme2/components/theme2-navigation";
import { theme2Sans, theme2Serif } from "@/themes/theme2/theme2-fonts";

type Theme2NavbarProps = {
  slug: string;
  logoText: string;
};

export function Theme2Navbar({ slug, logoText }: Theme2NavbarProps) {
  return (
    <header
      className={`${theme2Sans.variable} ${theme2Serif.variable} border-b border-[#b6bebb] bg-[#f4f4f1] text-[#233532] [font-family:var(--font-theme2-sans)]`}
    >
      <Theme2TopAnnouncement />
      <Theme2BrandHeader slug={slug} logoText={logoText || "PRESENT DAY"} />
      <Theme2Navigation slug={slug} />
    </header>
  );
}
