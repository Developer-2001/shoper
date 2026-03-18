import Link from "next/link";

const footerLinks = [
  { label: "Create Account", href: "/admin/signup" },
  { label: "Admin Login", href: "/admin/login" },
  { label: "Pricing", href: "/pricing" },
  { label: "Features", href: "/#features" },
  { label: "Themes", href: "/#themes" },
];

export function Footer() {
  return (
    <footer className="border-t border-slate-200 bg-slate-950 text-slate-200">
      <div className="mx-auto grid w-full max-w-7xl gap-8 px-4 py-12 sm:grid-cols-2 sm:px-6 lg:px-8">
        <div>
          <h3 className="text-xl font-semibold">Shoper SaaS Commerce</h3>
          <p className="mt-3 max-w-md text-sm text-slate-300">
            Admin-only platform to launch custom ecommerce storefronts with clean checkout and order management.
          </p>
        </div>

        <div className="sm:justify-self-end">
          <h4 className="text-sm font-semibold uppercase tracking-wider text-slate-300">Quick Links</h4>
          <ul className="mt-3 space-y-2 text-sm">
            {footerLinks.map((link) => (
              <li key={link.href}>
                <Link href={link.href} className="text-slate-200 hover:text-white">
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>
      <div className="border-t border-slate-800 px-4 py-4 text-center text-xs text-slate-400">
        {new Date().getFullYear()} Shoper. Built for modern commerce teams.
      </div>
    </footer>
  );
}
