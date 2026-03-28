import Link from "next/link";
import { Facebook, Instagram, MoveUp, Music2, Youtube } from "lucide-react";

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
        { label: "Collections", href: `/${slug}/collections` },
        { label: "Cart", href: `/${slug}/cart` },
      ];
  const shopLinks = [
    { label: "Necklaces", href: `/${slug}/collections/necklaces` },
    { label: "Earrings", href: `/${slug}/collections/earrings` },
    { label: "Bracelets & Anklets", href: `/${slug}/collections/bracelets` },
    { label: "Rings", href: `/${slug}/collections/rings` },
  ];

  function scrollToTop() {
    if (typeof window === "undefined") return;
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  return (
    <footer className="mt-20 px-3 pb-3 md:px-4">
      <div className="mx-auto w-full rounded-2xl bg-[#2b0b05] text-[#f6ece8]">
        <div className="grid gap-10 px-4 pb-10 pt-12 md:grid-cols-2 md:px-8 lg:grid-cols-4 lg:px-6">
          <section>
            <h3 className="text-xl font-semibold leading-none tracking-tight">
              About
            </h3>
            <p className="mt-6 text-[17px] leading-10 text-[#f3dfd8]">
              {about ||
                `At ${companyName}, we believe jewellery is more than an accessory.`}
            </p>
          </section>

          <section>
            <h3 className="text-xl font-semibold leading-none tracking-tight">
              Shop
            </h3>
            <ul className="mt-6 space-y-4 text-[17px] text-[#f3dfd8]">
              {shopLinks.map((item) => (
                <li key={item.label}>
                  <Link
                    href={item.href}
                    className="transition hover:text-white"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </section>

          <section>
            <h3 className="text-xl font-semibold leading-none tracking-tight">
              Company
            </h3>
            <ul className="mt-6 space-y-4 text-[17px] text-[#f3dfd8]">
              {companyLinks.slice(0, 4).map((item) => (
                <li key={`${item.label}-${item.href}`}>
                  <Link
                    href={item.href}
                    className="transition hover:text-white"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </section>

          <section>
            <h3 className="text-xl font-semibold leading-none tracking-tight">
              Newsletter
            </h3>
            <p className="mt-6 text-[17px] leading-8 text-[#f3dfd8]">
              Be the first to know about our biggest and best sales.
            </p>
            <form
              className="mt-8 flex flex-col gap-3 sm:flex-row"
              onSubmit={(event) => event.preventDefault()}
            >
              <input
                type="email"
                placeholder="Email Address.."
                className="h-14 w-full border-b border-[#7b4f46] bg-transparent px-4 text-[17px] text-white outline-none placeholder:text-[#cfb1aa]"
              />
              <button
                type="submit"
                className="h-14 rounded-xl bg-[#f2e4de] px-8 text-[18px] font-semibold tracking-wide text-[#3a0900] transition hover:bg-white"
              >
                Subscribe
              </button>
            </form>
          </section>
        </div>

        <div className="mx-4 border-t border-[#5b2a22] md:mx-8 lg:mx-10" />

        <div className="grid items-center gap-6 px-4 pb-12 pt-10 md:grid-cols-3 md:px-8 lg:px-10">
          <div className="flex items-center gap-4">
            <Link
              href={socialLinks?.facebook || `/${slug}`}
              aria-label="Facebook"
              className="rounded-full p-1.5 text-[#f3dfd8] transition hover:text-white"
            >
              <Facebook size={28} />
            </Link>
            <Link
              href={socialLinks?.instagram || `/${slug}`}
              aria-label="Instagram"
              className="rounded-full p-1.5 text-[#f3dfd8] transition hover:text-white"
            >
              <Instagram size={28} />
            </Link>
            <Link
              href={socialLinks?.youtube || `/${slug}`}
              aria-label="Youtube"
              className="rounded-full p-1.5 text-[#f3dfd8] transition hover:text-white"
            >
              <Youtube size={28} />
            </Link>
            <Link
              href={socialLinks?.x || `/${slug}`}
              aria-label="TikTok"
              className="rounded-full p-1.5 text-[#f3dfd8] transition hover:text-white"
            >
              <Music2 size={28} />
            </Link>
          </div>
          <div className="text-center text-7xl tracking-widest text-white font-[Georgia,serif]">
            {companyName}
          </div>
          <div className="flex flex-wrap items-center justify-start gap-3 md:justify-end">
            {["VISA", "MC", "AMEX", "PAYPAL", "DINERS", "DISC"].map((item) => (
              <span
                key={item}
                className="rounded-md bg-white px-3 py-1.5 text-xs font-bold text-[#3a0900]"
              >
                {item}
              </span>
            ))}
          </div>
        </div>

        <div className="mx-auto h-10 w-[80%] rounded-t-[40px] bg-[#e8dad4]" />
      </div>
      <div className="relative mx-auto -mt-0.5 flex w-full flex-col gap-4 rounded-b-2xl bg-[#e8dad4] px-3 pb-6 pt-4 text-[#3f2019] md:flex-row md:items-center md:justify-between md:px-6">
        {/* to top */}
        <button
          type="button"
          onClick={scrollToTop}
          className="group absolute bottom-10 right-3 flex h-14 w-14 cursor-pointer flex-col items-center justify-center rounded-full bg-white text-[#3a0900] transition-all duration-300 ease-out hover:h-44 hover:w-20"
          aria-label="Back to top"
        >
          <MoveUp className="h-5 w-5 shrink-0 transition-transform duration-300 " />
          <span className="pointer-events-none mt-2 max-h-0 overflow-hidden text-xs  tracking-[0.34em] [writing-mode:vertical-rl] [text-orientation:mixed] opacity-0 transition-all duration-200 group-hover:max-h-20 group-hover:opacity-100">
            GO TO TOP
          </span>
        </button>

        <div className="mt-1 flex items-center gap-2 md:mt-0">
          <button
            type="button"
            className="border border-[#7a5a52] bg-transparent px-3 py-1 text-xl"
          >
            INR (₹)
          </button>
          <button
            type="button"
            className="border border-[#7a5a52] bg-transparent px-3 py-1 text-xl"
          >
            English
          </button>
        </div>

        <p className="text-center text-xl md:flex-1">
          © {new Date().getFullYear()}, {slug} - Powered by Shoper
        </p>
      </div>
    </footer>
  );
}
