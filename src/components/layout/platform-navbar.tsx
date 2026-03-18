import Link from "next/link";
import { Store, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";

export function PlatformNavbar() {
  return (
    <header className="sticky top-0 z-40 border-b border-slate-200 bg-[#dff4f0]/95 backdrop-blur">
      <div className="mx-auto flex w-full max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
        <Link href="/" className="flex items-center gap-2 text-slate-900">
          <Store className="size-5" />
          <span className="text-lg font-bold">Shoper</span>
        </Link>

        <nav className="hidden items-center gap-7 text-sm font-medium text-slate-700 md:flex">
          <Link href="/#features" className="hover:text-slate-900">Features</Link>
          <Link href="/#themes" className="hover:text-slate-900">Themes</Link>
          <Link href="/pricing" className="hover:text-slate-900">Pricing</Link>
        </nav>

        <div className="flex items-center gap-2">
          <Link href="/admin/login">
            <Button variant="ghost">Log In</Button>
          </Link>
          <Link href="/admin/signup">
            <Button className="gap-2">
              <Sparkles className="size-4" />
              Create Account
            </Button>
          </Link>
        </div>
      </div>
    </header>
  );
}
