import Link from "next/link";
import { icons } from "lucide-react";

type FooterLink = { label: string; href: string };

type SocialLinks = {
  instagram?: string;
  facebook?: string;
  x?: string;
  youtube?: string;
};

type Theme1FooterProps = {
  slug: string;
  companyName: string;
  about: string;
  address: string;
  contactEmail: string;
  contactPhone: string;
  socialLinks: SocialLinks;
  footerLinks: FooterLink[];
};

export function Theme1Footer({
  slug,
  companyName,
  about,
  address,
  contactEmail,
  contactPhone,
  socialLinks,
  footerLinks,
}: Theme1FooterProps) {
  const legalLinks = [
    "Terms of Service",
    "Legal",
    "Privacy Policy",
    "Sitemap",
    "Your Privacy Choices",
  ];

  const socialLink = [
    {
      label: "Instagram",
      icons: <icons.Instagram className="size-6" />,
      link: socialLinks.instagram,
    },
    {
      label: "X",
      icons: <icons.X className="size-6" />,
      link: socialLinks.x,
    },
    {
      label: "Facebook",
      icons: <icons.Facebook className="size-6" />,
      link: socialLinks.facebook,
    },
    {
      label: "YouTube",
      icons: <icons.Youtube className="size-6" />,
      link: socialLinks.youtube,
    },
  ];

  return (
    <footer className="border-t border-slate-800 bg-black text-slate-300">
      <div className="mx-auto w-full max-w-7xl px-6 pb-8 pt-10 md:px-10">
        <div className="grid gap-10 md:grid-cols-3">
          <section>
            <h3 className="text-xl font-bold text-white">{companyName}</h3>
            <p className="mt-3 text-sm text-slate-400">{about || "Your trusted ecommerce store."}</p>
          </section>

          <section>
            <h4 className="font-semibold text-white">Contact</h4>
            <p className="mt-2 text-sm">{address}</p>
            <p className="mt-1 text-sm">{contactEmail}</p>
            <p className="mt-1 text-sm">{contactPhone}</p>
          </section>

          <section>
            <h4 className="font-semibold text-white">Quick links</h4>
            <div className="mt-3 flex flex-col gap-2 text-sm">
              {footerLinks.map((item) => (
                <Link key={item.href} href={item.href} className="hover:text-white">
                  {item.label}
                </Link>
              ))}
            </div>
          </section>
        </div>
      </div>

      <div className="mt-8 border-t border-slate-800 pt-3">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex flex-wrap items-center gap-x-8 gap-y-3 text-lg text-slate-400 sm:text-base">
            <button
              type="button"
              className="inline-flex items-center gap-2 text-slate-200 transition hover:text-white"
            >
              <span>India | English</span>
              <span aria-hidden="true">v</span>
            </button>
            <div className="flex flex-wrap items-center gap-4">
              {legalLinks.map((item) => (
                <Link key={item} href="#" className="transition hover:text-white">
                  {item}
                </Link>
              ))}
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {socialLink.map((item) => (
              <Link
                key={item.label}
                href={item.link || `/${slug}`}
                aria-label={item.label}
                className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-slate-600 text-xs font-semibold uppercase text-slate-200 transition ring-1 hover:border-white hover:text-white"
              >
                {item.icons}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
