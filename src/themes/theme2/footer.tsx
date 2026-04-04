import Link from "next/link";

type Theme2FooterProps = {
  slug: string;
  companyName: string;
  about: string;
  address: string;
  contactEmail: string;
  contactPhone: string;
  footerLinks: { label: string; href: string }[];
};

export function Theme2Footer({
  slug,
  companyName,
  about,
  address,
  contactEmail,
  contactPhone,
  footerLinks,
}: Theme2FooterProps) {
  const normalizedFooterLinks = footerLinks.map((item) => ({
    ...item,
    href: item.href.replace(/\/products(\?|$)/, "/product$1"),
  }));

  const quickLinks = normalizedFooterLinks.length
    ? normalizedFooterLinks
    : [
        { label: "Home", href: `/${slug}` },
        { label: "Products", href: `/${slug}/product` },
        { label: "Cart", href: `/${slug}/cart` },
      ];

  return (
    <footer className="mt-16 border-t border-amber-100 bg-amber-50 py-10 text-amber-900">
      <div className="mx-auto grid w-full max-w-7xl gap-8 px-6 md:grid-cols-3">
        <section>
          <h3 className="text-xl font-black uppercase tracking-wide">{companyName}</h3>
          <p className="mt-3 text-sm text-amber-800">{about || "Curated products for modern shoppers."}</p>
        </section>

        <section>
          <h4 className="font-bold">Contact</h4>
          <p className="mt-2 text-sm">{address || "Address not set"}</p>
          <p className="mt-1 text-sm">{contactEmail || "Email not set"}</p>
          <p className="mt-1 text-sm">{contactPhone || "Phone not set"}</p>
        </section>

        <section>
          <h4 className="font-bold">Quick links</h4>
          <div className="mt-3 flex flex-wrap gap-2">
            {quickLinks.map((item) => (
              <Link
                key={`${item.label}-${item.href}`}
                href={item.href}
                className="rounded-full border border-amber-200 px-3 py-1 text-sm transition hover:border-amber-400 hover:bg-amber-100"
              >
                {item.label}
              </Link>
            ))}
          </div>
        </section>
      </div>
    </footer>
  );
}

