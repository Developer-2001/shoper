import Link from "next/link";
import { CheckCircle2, Layers2, Palette, ShieldCheck, Sparkles, SwatchBook } from "lucide-react";
import { PlatformNavbar } from "@/components/layout/platform-navbar";
import { Footer } from "@/components/layout/footer";
import { Button } from "@/components/ui/button";

const features = [
  {
    icon: Layers2,
    title: "Multi-tenant architecture",
    description: "Each admin gets a fully isolated store dashboard with dedicated products and orders.",
  },
  {
    icon: Palette,
    title: "Theme customization",
    description: "Control brand colors, hero section, slider images, and homepage messaging.",
  },
  {
    icon: ShieldCheck,
    title: "Admin-first control",
    description: "Secure admin login and role-based dashboard for complete business control.",
  },
  {
    icon: SwatchBook,
    title: "Ready-made sections",
    description: "Launch stores faster with reusable storefront blocks and pricing-ready templates.",
  },
];

const themes = [
  "Luxury Jewellery Theme",
  "Sports Watch Theme",
  "Classic Eyewear Theme",
  "Modern Minimal Theme",
];

export default function HomePage() {
  return (
    <div className="min-h-screen">
      <PlatformNavbar />

      <main>
        <section className="relative overflow-hidden bg-[#dff4f0] px-4 pb-20 pt-16 sm:px-6 lg:px-8">
          <div className="mx-auto w-full max-w-5xl text-center">
            <p className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-white px-3 py-1 text-xs font-semibold text-emerald-700">
              <Sparkles className="size-3.5" />
              Admin-first ecommerce platform
            </p>

            <h1 className="mx-auto mt-5 max-w-4xl text-4xl font-bold tracking-tight text-slate-950 sm:text-6xl">
              Create account, build your store, and launch instantly.
            </h1>
            <p className="mx-auto mt-5 max-w-3xl text-base leading-relaxed text-slate-700 sm:text-lg">
              Your admin creates a store once, gets a unique slug, and customers directly shop on your storefront URL.
            </p>

            <div className="mt-8 flex justify-center gap-3">
              <Link href="/admin/signup">
                <Button className="h-11 px-6">Create Account</Button>
              </Link>
              <Link href="/admin/login">
                <Button variant="ghost" className="h-11 px-6">Log In</Button>
              </Link>
              <Link href="/pricing">
                <Button variant="secondary" className="h-11 px-6">Pricing</Button>
              </Link>
            </div>
          </div>
        </section>

        <section id="features" className="mx-auto w-full max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
          <div className="mb-8">
            <h2 className="text-3xl font-bold text-slate-950 sm:text-4xl">Features</h2>
            <p className="mt-3 max-w-3xl text-slate-600">
              Everything needed for storefront management, cart flow, and checkout order capture.
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            {features.map((feature) => (
              <article key={feature.title} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                <feature.icon className="size-6 text-slate-900" />
                <h3 className="mt-3 text-lg font-semibold text-slate-900">{feature.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-slate-600">{feature.description}</p>
              </article>
            ))}
          </div>
        </section>

        <section id="themes" className="mx-auto w-full max-w-7xl px-4 pb-16 sm:px-6 lg:px-8">
          <div className="rounded-3xl bg-slate-950 px-6 py-10 text-slate-100 sm:px-10">
            <h2 className="text-3xl font-bold sm:text-4xl">Themes</h2>
            <p className="mt-3 max-w-2xl text-sm text-slate-300">
              Start with purpose-built visual directions and customize everything from admin dashboard.
            </p>
            <ul className="mt-6 grid gap-3 md:grid-cols-2">
              {themes.map((theme) => (
                <li key={theme} className="flex items-center gap-2 rounded-xl border border-slate-700 bg-slate-900/60 p-3 text-sm">
                  <CheckCircle2 className="size-4 text-emerald-400" />
                  {theme}
                </li>
              ))}
            </ul>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
