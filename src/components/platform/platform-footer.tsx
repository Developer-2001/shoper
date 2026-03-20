import Link from "next/link";
import Logo from "./logo";
import { icons } from "lucide-react";

const footerColumns = [
  {
    title: "Shoper",
    links: ["What is Shopify?", "Shopify Editions", "Investors", "Sustainability"],
  },
  {
    title: "Ecosystem",
    links: ["Developer Docs", "Theme Store", "App Store", "Partners", "Affiliates"],
  },
  {
    title: "Resources",
    links: ["Blog", "Compare Shopify", "Guides", "Courses", "Free Tools", "Changelog"],
  },
  {
    title: "Support",
    links: ["Shopify Help Center", "Community Forum", "Hire a Partner", "Service Status"],
  },
];

const legalLinks = ["Terms of Service", "Legal", "Privacy Policy", "Sitemap", "Your Privacy Choices"];
// social media  with label and icons
const socialLinks = [
  { label: "Facebook", icons:<icons.Facebook className="size-6" />, short: "fb" },
  { label: "X", icons:<icons.X className="size-6" />, short: "x" },
  { label: "YouTube", icons:<icons.Youtube className="size-6" />, short: "yt" },
  { label: "Instagram", icons:<icons.Instagram className="size-6" />, short: "ig" },
  { label: "LinkedIn", icons:<icons.Linkedin className="size-6" />, short: "in" },
];

export function PlatformFooter() {
  return (
    <footer className="border-t border-slate-800 bg-black text-slate-300">
      <div className="mx-auto w-full max-w-7xl px-6 pb-8 pt-10 md:px-10">
        <div className="grid gap-10 md:grid-cols-[220px_1fr]">
          <div>
            <Link href="/" className="inline-flex items-center">
              <Logo className="w-15 h-15 " bagColor="#FFFFFF" markColor="#000000" />
            </Link>
          </div>

          <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
            {footerColumns.map((column) => (
              <div key={column.title}>
                <h3 className="mb-5 text-3xl font-semibold text-white sm:text-2xl">{column.title}</h3>
                <ul className="space-y-3">
                  {column.links.map((item) => (
                    <li key={item}>
                      <Link href="#" className="text-lg text-slate-400 transition hover:text-white sm:text-base">
                        {item}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-8 border-t border-slate-800 pt-3">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex flex-wrap items-center gap-x-8 gap-y-3 text-lg text-slate-400 sm:text-base">
              <button type="button" className="inline-flex items-center gap-2 text-slate-200 transition hover:text-white">
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
              {socialLinks.map((item) => (
                <Link
                  key={item.label}
                  href="#"
                  aria-label={item.label}
                  className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-slate-600 text-xs font-semibold uppercase text-slate-200 transition hover:border-white ring-1 hover:text-white"
                >
                  {item.icons}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
