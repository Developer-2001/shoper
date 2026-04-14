import Link from "next/link";
import { Instagram, Pin } from "lucide-react";

import { THEME2_FOOTER_NOTE } from "@/themes/theme2/theme2-config";

type Theme2FooterProps = {
  slug: string;
  companyName: string;
  about: string;
  address: string;
  contactEmail: string;
  contactPhone: string;
  footerLinks: { label: string; href: string }[];
  socialLinks?: {
    instagram?: string;
    facebook?: string;
    x?: string;
    youtube?: string;
  };
};

export function Theme2Footer({
  slug,
  companyName,
  address,
  contactEmail,
  contactPhone,
  footerLinks,
  socialLinks,
}: Theme2FooterProps) {
  const normalizedFooterLinks = footerLinks.map((item) => ({
    ...item,
    href: item.href.replace(/\/products(\?|$)/, "/product$1"),
  }));

  const quickLinks = normalizedFooterLinks.length
    ? normalizedFooterLinks
    : [
        { label: "Search", href: `/${slug}/product` },
        { label: "About Us", href: `/${slug}` },
        { label: "Shipping Terms", href: `/${slug}/terms` },
      ];

  return (
    <footer className="mt-16 bg-[#f4f4f1] pb-6 text-[#2e3f3c] [font-family:var(--font-theme2-sans)]">
      <div className="mx-auto w-full max-w-6xl px-4">
        <div className="border-y border-[#b6bebb] md:grid md:grid-cols-2">
          <section className="px-4 py-10 text-center md:border-r md:border-[#b6bebb]">
            <h3 className="text-lg uppercase tracking-[0.25em]">Get In Touch</h3>
            <p className="mt-4 text-sm leading-7">
              {contactPhone || "647 957 6962"}
              <br />
              {contactEmail || "info@presentdaygifts.ca"}
            </p>
            {address ? <p className="mt-3 text-xs text-[#4b5d59]">{address}</p> : null}
          </section>

          <section className="px-4 py-10 text-center">
            <h3 className="text-lg uppercase tracking-[0.25em]">Follow Us Out There</h3>
            <div className="mt-5 flex items-center justify-center gap-5">
              <Link
                href={socialLinks?.instagram || `/${slug}`}
                className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-[#b6bebb] transition hover:bg-[#e6ebe8]"
                aria-label="Instagram"
              >
                <Instagram size={18} />
              </Link>
              <Link
                href={socialLinks?.facebook || `/${slug}`}
                className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-[#b6bebb] transition hover:bg-[#e6ebe8]"
                aria-label="Pinterest"
              >
                <Pin size={18} />
              </Link>
            </div>
            <p className="mt-4 text-xs uppercase tracking-[0.18em] text-[#50615d]">{companyName}</p>
          </section>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-6 border-b border-[#b6bebb] px-4 py-6 text-sm text-[#415451]">
          {quickLinks.map((item) => (
            <Link key={`${item.label}-${item.href}`} href={item.href} className="hover:text-[#1c2f2b]">
              {item.label}
            </Link>
          ))}
        </div>
      </div>

      <div className="mt-6 border-y border-[#b6bebb] bg-[#f7f7f5] px-4 py-4 text-center text-sm text-[#324743]">
        {THEME2_FOOTER_NOTE}
      </div>
    </footer>
  );
}
