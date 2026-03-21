import Link from "next/link";
import Logo from "./logo";

export function PlatformNavbar() {
  return (
    <header className="sticky top-0 z-40 border-b border-slate-200/50 bg-transparent backdrop-blur">
      <div className="mx-auto flex w-full max-w-7xl items-center justify-between px-6 py-3">
        <Link href="/" className="flex items-center gap-1 text-lg font-black tracking-tight  text-slate-900">
          <Logo className="w-10 h-10 " bagColor="#000000" markColor="#FFFFFF" />
          <span className="text-2xl italic">Shoper</span>
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
            className="rounded-full border border-slate-300 px-4 py-2 text-sm font-medium text-slate-800"
          >
            Log in
          </Link>
          <Link
            href="/admin/register"
            className="rounded-full bg-slate-900 px-4 py-2 text-sm font-medium text-white"
          >
            Start for free
          </Link>
        </div>
      </div>
    </header>
  );
}
