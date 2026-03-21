import Image from "next/image";
import Link from "next/link";

const sections = [
  { title: "Fast Setup", text: "Launch your branded store in minutes with custom slug and dashboard." },
  { title: "Product Control", text: "Manage product catalog, prices, discounts, images and inventory." },
  { title: "Order Insights", text: "Track orders with customer + shipping details in one place." },
];

export function PlatformHero() {
  return (
    <section className="relative overflow-hidden bg-transparent">
      <div className="mx-auto grid w-full max-w-7xl gap-10 px-6 pb-14 pt-16 lg:grid-cols-2 lg:items-center">
        <div>
          <p className="inline-flex rounded-full bg-teal-100 px-4 py-1 text-sm font-semibold text-teal-900">
            Multi-tenant Ecommerce Platform
          </p>
          <h1 className="mt-6 text-5xl font-black leading-tight tracking-tight text-slate-900 md:text-6xl">
            Create your store dashboard and sell across any product category.
          </h1>
          <p className="mt-5 max-w-xl text-lg text-slate-600">
            Build stores for jewellery, watches, sunglasses and more with custom themes, product management, and order workflows.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link href="/admin/register" className="rounded-full bg-slate-900 px-6 py-3 font-semibold text-white">
              Start for free
            </Link>
            <Link href="/pricing" className="rounded-full border border-slate-300 px-6 py-3 font-semibold text-slate-800">
              View pricing
            </Link>
          </div>
        </div>

        <div className="grid gap-4">
          <Image
            className="h-62.5 w-full rounded-3xl object-cover"
            src="https://images.unsplash.com/photo-1522312346375-d1a52e2b99b3?q=80&w=1200&auto=format&fit=crop"
            alt="Store owner managing online shop"
            width={1200}
            height={700}
            sizes="(max-width: 1024px) 100vw, 50vw"
          />
          <div className="grid gap-4 sm:grid-cols-2">
            <Image
              className="h-45 w-full rounded-3xl object-cover"
              src="https://images.unsplash.com/photo-1441984904996-e0b6ba687e04?q=80&w=900&auto=format&fit=crop"
              alt="Fashion storefront"
              width={900}
              height={600}
              sizes="(max-width: 640px) 100vw, 25vw"
            />
            <Image
              className="h-45 w-full rounded-3xl object-cover"
              src="https://images.unsplash.com/photo-1441986300917-64674bd600d8?q=80&w=900&auto=format&fit=crop"
              alt="Ecommerce shipment"
              width={900}
              height={600}
              sizes="(max-width: 640px) 100vw, 25vw"
            />
          </div>
        </div>
      </div>

      <div id="features" className="mx-auto grid w-full max-w-7xl gap-5 px-6 pb-16 md:grid-cols-3">
        {sections.map((section) => (
          <div key={section.title} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <h3 className="text-lg font-bold text-slate-900">{section.title}</h3>
            <p className="mt-2 text-slate-600">{section.text}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
