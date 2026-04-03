import Link from "next/link";
import { Facebook, Instagram, MoveUp, Music2, Youtube } from "lucide-react";
import {
  AmexIcon,
  Discover,
  MastercardIcon,
  Music2Icon,
  PaypalIcon,
  VisaIcon,
} from "@/utils/svg";

type Theme3FooterProps = {
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

export function Theme3Footer({
  slug,
  companyName,
  about,
  footerLinks,
  socialLinks,
}: Theme3FooterProps) {
  const companyLinks = footerLinks.length
    ? footerLinks
    : [
        { label: "Home", href: `/${slug}` },
        { label: "Products", href: `/${slug}/products` },
        { label: "Cart", href: `/${slug}/cart` },
      ];

  const shopLinks = [
    { label: "Necklaces", href: `/${slug}/products?categories=necklaces` },
    { label: "Earrings", href: `/${slug}/products?categories=earrings` },
    {
      label: "Bracelets & Anklets",
      href: `/${slug}/products?categories=bracelets-and-anklets`,
    },
    { label: "Rings", href: `/${slug}/products?categories=rings` },
  ];

  const quickLinks = [
    { label: "Privacy Policy", href: `/${slug}/privacy` },
    { label: "Terms and Conditions", href: `/${slug}/terms` },
    { label: "Contact Us", href: `/${slug}/contact` },
  ];

  function scrollToTop() {
    if (typeof window === "undefined") return;
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  return (
    <footer className="mt-12 px-2 pb-2 sm:mt-16 sm:px-3 md:px-4">
      <div className="mx-auto w-full rounded-2xl bg-[#2b0b05] text-[#f6ece8]">
        <div className="grid gap-8 px-4 pb-8 pt-10 md:grid-cols-2 md:px-8 lg:grid-cols-5 lg:gap-6 lg:px-6">
          <section>
            <h3 className="text-xl font-semibold leading-none tracking-tight">About</h3>
            <p className="mt-4 text-sm leading-7 text-[#f3dfd8] sm:text-base">
              {about ||
                `At ${companyName}, we believe jewellery is more than an accessory.`}
            </p>
          </section>

          <section>
            <h3 className="text-xl font-semibold leading-none tracking-tight">Shop</h3>
            <ul className="mt-4 space-y-3 text-sm text-[#f3dfd8] sm:text-base">
              {shopLinks.map((item) => (
                <li key={item.label}>
                  <Link href={item.href} className="transition hover:text-white">
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </section>

          <section>
            <h3 className="text-xl font-semibold leading-none tracking-tight">Quick Links</h3>
            <ul className="mt-4 space-y-3 text-sm text-[#f3dfd8] sm:text-base">
              {quickLinks.map((item) => (
                <li key={item.label}>
                  <Link href={item.href} className="transition hover:text-white">
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </section>

          <section>
            <h3 className="text-xl font-semibold leading-none tracking-tight">Company</h3>
            <ul className="mt-4 space-y-3 text-sm text-[#f3dfd8] sm:text-base">
              {companyLinks.slice(0, 4).map((item) => (
                <li key={`${item.label}-${item.href}`}>
                  <Link href={item.href} className="transition hover:text-white">
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </section>

          <section>
            <h3 className="text-xl font-semibold leading-none tracking-tight">Newsletter</h3>
            <p className="mt-4 text-sm leading-7 text-[#f3dfd8] sm:text-base">
              Be the first to know about our biggest and best sales.
            </p>
            <form
              className="mt-6 flex flex-col gap-3 sm:flex-row"
              onSubmit={(event) => event.preventDefault()}
            >
              <input
                type="email"
                placeholder="Email Address.."
                className="h-10 w-full border-b border-[#7b4f46] bg-transparent px-2 text-sm text-white outline-none placeholder:text-[#cfb1aa] sm:px-4 sm:text-base"
              />
              <button
                type="submit"
                className="h-10 rounded-xl bg-[#f2e4de] px-4 text-sm font-semibold tracking-wide text-[#3a0900] transition hover:bg-white"
              >
                Subscribe
              </button>
            </form>
          </section>
        </div>

        <div className="mx-4 border-t border-[#5b2a22] md:mx-8 lg:mx-10" />

        <div className="grid items-center gap-6 px-4 pb-10 pt-8 sm:grid-cols-3 md:grid-cols-3 md:px-8 lg:px-10">
          <div className="flex items-center justify-center gap-4 md:justify-start">
            <Link
              href={socialLinks?.facebook || `/${slug}`}
              aria-label="Facebook"
              className="rounded-full p-1.5 text-[#f3dfd8] transition hover:text-white"
            >
              <Facebook size={24} />
            </Link>
            <Link
              href={socialLinks?.instagram || `/${slug}`}
              aria-label="Instagram"
              className="rounded-full p-1.5 text-[#f3dfd8] transition hover:text-white"
            >
              <Instagram size={24} />
            </Link>
            <Link
              href={socialLinks?.youtube || `/${slug}`}
              aria-label="Youtube"
              className="rounded-full p-1.5 text-[#f3dfd8] transition hover:text-white"
            >
              <Youtube size={24} />
            </Link>
            <Link
              href={socialLinks?.x || `/${slug}`}
              aria-label="TikTok"
              className="rounded-full p-1.5 text-[#f3dfd8] transition hover:text-white"
            >
              <Music2 size={24} />
            </Link>
          </div>

          <div className="text-center font-[Georgia,serif] text-lg tracking-widest text-white sm:text-xl">
            {companyName}
          </div>

          <div className="flex flex-wrap items-center justify-center gap-2 md:justify-end">
            <VisaIcon />
            <MastercardIcon />
            <AmexIcon />
            <PaypalIcon />
            <Music2Icon />
            <Discover />
          </div>
        </div>

        <div className="mx-auto h-8 w-[85%] rounded-t-4xl bg-[#e8dad4] sm:h-10 sm:w-[80%] sm:rounded-t-[40px]" />
      </div>

      <div className="relative mx-auto -mt-0.5 flex w-full flex-col rounded-b-2xl bg-[#e8dad4] px-3 pb-4 pt-2 text-[#3f2019] md:flex-row md:items-center md:justify-between md:px-6">
        <button
          type="button"
          onClick={scrollToTop}
          className="group relative ml-auto mt-2 flex h-11 w-11 flex-col items-center justify-center rounded-full bg-white text-[#3a0900] transition-all duration-300 ease-out hover:bg-[#fff7f4] md:absolute md:bottom-8 md:right-3 md:h-14 md:w-14 md:hover:h-48 md:hover:w-16"
          aria-label="Back to top"
        >
          <MoveUp className="h-5 w-5 shrink-0 transition-transform duration-300" />
          <span className="pointer-events-none mt-2 hidden max-h-0 overflow-hidden text-xs tracking-[0.34em] [writing-mode:vertical-rl] [text-orientation:mixed] opacity-0 transition-all duration-200 md:block md:group-hover:max-h-20 md:group-hover:opacity-100">
            GO TO TOP
          </span>
        </button>

        <p className="mt-2 text-center text-xs sm:text-sm md:mt-0 md:flex-1">
          (c) {new Date().getFullYear()}, {companyName} - Powered by Shoper
        </p>
      </div>
    </footer>
  );
}
