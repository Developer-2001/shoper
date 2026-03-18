import Link from "next/link";

const links = [
  { label: "Pricing", href: "/pricing" },
  { label: "Admin", href: "/admin/login" },
  { label: "Start Store", href: "/admin/register" },
];

export function PlatformFooter() {
  return (
    <footer className="border-t border-slate-200 bg-slate-950 text-slate-300">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-6 px-6 py-10 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-xl font-bold text-white">Shoper</p>
          <p className="mt-2 text-sm text-slate-400">
            Build and run multi-tenant ecommerce stores with one dashboard.
          </p>
        </div>
        <div className="flex gap-6 text-sm">
          {links.map((link) => (
            <Link key={link.href} href={link.href} className="hover:text-white">
              {link.label}
            </Link>
          ))}
        </div>
      </div>
    </footer>
  );
}
