import Link from "next/link";

type FooterLink = { label: string; href: string };

type SocialLinks = {
  instagram?: string;
  facebook?: string;
  x?: string;
  youtube?: string;
};

export function DynamicStoreFooter({
  companyName,
  about,
  address,
  contactEmail,
  contactPhone,
  socialLinks,
  footerLinks,
}: {
  companyName: string;
  about: string;
  address: string;
  contactEmail: string;
  contactPhone: string;
  socialLinks: SocialLinks;
  footerLinks: FooterLink[];
}) {
  const socials = Object.entries(socialLinks).filter((entry) => Boolean(entry[1]));

  return (
    <footer className="mt-16 bg-slate-950 text-slate-300">
      <div className="mx-auto grid w-full max-w-7xl gap-8 px-6 py-10 md:grid-cols-3">
        <section>
          <h3 className="text-xl font-bold text-white">{companyName}</h3>
          <p className="mt-3 text-sm text-slate-400">{about || "Your trusted ecommerce store."}</p>
        </section>

        <section>
          <h4 className="font-semibold text-white">Contact</h4>
          <p className="mt-2 text-sm">{address}</p>
          <p className="text-sm">{contactEmail}</p>
          <p className="text-sm">{contactPhone}</p>
        </section>

        <section>
          <h4 className="font-semibold text-white">Quick links</h4>
          <div className="mt-3 flex flex-col gap-2 text-sm">
            {footerLinks.map((item) => (
              <Link key={item.href} href={item.href} className="hover:text-white">
                {item.label}
              </Link>
            ))}
            {socials.map(([key, value]) => (
              <a key={key} href={value} target="_blank" rel="noreferrer" className="capitalize hover:text-white">
                {key}
              </a>
            ))}
          </div>
        </section>
      </div>
    </footer>
  );
}
