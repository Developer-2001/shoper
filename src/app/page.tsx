import Image from "next/image";

import { PlatformFooter } from "@/components/platform/platform-footer";
import { PlatformHero } from "@/components/platform/platform-hero";
import { PlatformNavbar } from "@/components/platform/platform-navbar";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-slate-50">
      <PlatformNavbar />
      <PlatformHero />
      <section id="themes" className="mx-auto w-full max-w-7xl px-6 pb-16">
        <div className="rounded-3xl border border-slate-200 bg-white p-8">
          <h2 className="text-3xl font-bold text-slate-900">Themes for every vertical</h2>
          <p className="mt-2 text-slate-600">
            Jewellery, watches, sunglasses, and fashion ready storefronts with configurable branding.
          </p>
          <div className="mt-6 grid gap-4 md:grid-cols-3">
            <Image
              className="h-52 w-full rounded-2xl object-cover"
              src="https://images.unsplash.com/photo-1617038220319-276d3cfab638?q=80&w=1000&auto=format&fit=crop"
              alt="Jewellery theme"
              width={1000}
              height={700}
              sizes="(max-width: 768px) 100vw, 33vw"
            />
            <Image
              className="h-52 w-full rounded-2xl object-cover"
              src="https://images.unsplash.com/photo-1524805444758-089113d48a6d?q=80&w=1000&auto=format&fit=crop"
              alt="Watch theme"
              width={1000}
              height={700}
              sizes="(max-width: 768px) 100vw, 33vw"
            />
            <Image
              className="h-52 w-full rounded-2xl object-cover"
              src="https://images.unsplash.com/photo-1511499767150-a48a237f0083?q=80&w=1000&auto=format&fit=crop"
              alt="Eyewear theme"
              width={1000}
              height={700}
              sizes="(max-width: 768px) 100vw, 33vw"
            />
          </div>
        </div>
      </section>
      <PlatformFooter />
    </div>
  );
}
