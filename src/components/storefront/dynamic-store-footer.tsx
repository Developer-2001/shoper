import Link from "next/link";
import { icons } from "lucide-react";
type FooterLink = { label: string; href: string };

type SocialLinks = {
  instagram?: string;
  facebook?: string;
  x?: string;
  youtube?: string;
};

export function DynamicStoreFooter({
  slug,
  companyName,
  about,
  address,
  contactEmail,
  contactPhone,
  socialLinks,
  footerLinks,
}: {
  slug: string;
  companyName: string;
  about: string;
  address: string;
  contactEmail: string;
  contactPhone: string;
  socialLinks: SocialLinks;
  footerLinks: FooterLink[];
}) {
  // const socials = Object.entries(socialLinks).filter((entry) => Boolean(entry[1]));

  const legalLinks = [
    "Terms of Service",
    "Legal",
    "Privacy Policy",
    "Sitemap",
    "Your Privacy Choices",
  ];
  // social media  with label and icons
  const socialLink = [
    {
      label: "Instagram",
      icons: <icons.Instagram className="size-6" />,
      short: "ig",
      link: socialLinks.instagram,
    },
    {
      label: "X",
      icons: <icons.X className="size-6" />,
      short: "x",
      link: socialLinks.x,
    },
    {
      label: "Facebook",
      icons: <icons.Facebook className="size-6" />,
      short: "fb",
      link: socialLinks.facebook,
    },
    {
      label: "YouTube",
      icons: <icons.Youtube className="size-6" />,
      short: "yt",
      link: socialLinks.youtube,
    },
  ];

  return (
    <footer className="border-t border-slate-800 bg-black text-slate-300">
      <div className="mx-auto w-full max-w-7xl px-6 pb-8 pt-10 md:px-10">
        <div className="grid gap-10 md:grid-cols-3">
          <section>
            <h3 className="text-xl font-bold text-white">{companyName}</h3>
            <p className="mt-3 text-sm text-slate-400">
              {about || "Your trusted ecommerce store."}
            </p>
          </section>

          <section>
            <h4 className="font-semibold text-white">Contact</h4>
            <p className="mt-2 text-sm">{address}</p>
            <p className="text-sm mt-1">{contactEmail}</p>
            <p className="text-sm mt-1">{contactPhone}</p>
          </section>

          <section>
            <h4 className="font-semibold text-white">Quick links</h4>
            <div className="mt-3 flex flex-col gap-2 text-sm">
              {footerLinks.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="hover:text-white"
                >
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
                <Link
                  key={item}
                  href="#"
                  className="transition hover:text-white"
                >
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
                className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-slate-600 text-xs font-semibold uppercase text-slate-200 transition hover:border-white ring-1 hover:text-white"
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
