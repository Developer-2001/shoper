import Link from "next/link";

import { THEME2_MENU_ITEMS } from "@/themes/theme2/theme2-config";

type Theme2NavigationProps = {
  slug: string;
};

export function Theme2Navigation({ slug }: Theme2NavigationProps) {
  return (
    <div className="border-y border-[#b6bebb]">
      <nav className="mx-auto hidden w-full max-w-6xl items-center justify-between px-4 py-3 lg:flex">
        {THEME2_MENU_ITEMS.map((item) => {
          const href = `/${slug}${item.href}`;

          return (
            <Link
              key={`${item.label}-${item.href}`}
              href={href}
              className="border-r border-[#bfc6c3] pr-6 text-xs uppercase tracking-[0.18em] text-[#304440] last:border-r-0 last:pr-0 hover:text-[#1b302d]"
            >
              {item.label}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
