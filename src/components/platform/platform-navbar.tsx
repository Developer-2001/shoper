import Link from "next/link";

export function PlatformNavbar() {
  return (
    <header className="sticky top-0 z-40 border-b border-slate-200/60 bg-white/90 backdrop-blur">
      <div className="mx-auto flex w-full max-w-7xl items-center justify-between px-6 py-4">
        <Link href="/" className="text-2xl font-black tracking-tight text-slate-900">
          Shoper
        </Link>

        <nav className="hidden items-center gap-7 text-sm font-medium text-slate-700 md:flex">
          <Link href="/pricing" className="hover:text-slate-900">
            Pricing
          </Link>
          <a href="#themes" className="hover:text-slate-900">
            Themes
          </a>
          <a href="#features" className="hover:text-slate-900">
            Features
          </a>
        </nav>

        <div className="flex items-center gap-3">
          <Link
            href="/admin/login"
            className="rounded-full border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-800"
          >
            Admin Login
          </Link>
          <Link
            href="/admin/register"
            className="rounded-full bg-slate-900 px-4 py-2 text-sm font-semibold text-white"
          >
            Get Started
          </Link>
        </div>
      </div>
    </header>
  );
}
