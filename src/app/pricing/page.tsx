import Link from "next/link";
import { Check } from "lucide-react";
import { PlatformNavbar } from "@/components/layout/platform-navbar";
import { Footer } from "@/components/layout/footer";
import { Button } from "@/components/ui/button";

const plans = [
  {
    name: "Basic",
    price: "?1,499",
    subtitle: "For solo entrepreneurs",
    highlight: "?20/month for first 3 months",
    features: [
      "10 inventory locations",
      "24/7 chat support",
      "In-person selling by phone or POS",
    ],
  },
  {
    name: "Grow",
    price: "?5,599",
    subtitle: "For small teams",
    highlight: "?20/month for first 3 months",
    popular: true,
    features: [
      "10 inventory locations",
      "5 staff accounts",
      "In-person selling by phone or POS",
    ],
  },
  {
    name: "Advanced",
    price: "?22,680",
    subtitle: "For scaling brands",
    highlight: "?20/month for first 3 months",
    features: [
      "15 staff accounts",
      "Enhanced support",
      "Localized storefronts by market",
    ],
  },
  {
    name: "Plus",
    price: "?1,75,000",
    subtitle: "For enterprise operations",
    highlight: "Available on 1- or 3-year term",
    blue: true,
    features: [
      "200 inventory locations",
      "Unlimited staff accounts",
      "Custom checkout support",
    ],
  },
];

const included = [
  {
    title: "World-class checkout",
    desc: "Optimized checkout flow that helps reduce drop-offs.",
  },
  {
    title: "Multiple sales channels",
    desc: "Sell on social and web from a single admin dashboard.",
  },
  {
    title: "In-depth analytics",
    desc: "Track store performance and identify growth opportunities.",
  },
  {
    title: "Commerce apps",
    desc: "Extend your store quickly with integration-ready modules.",
  },
];

export default function PricingPage() {
  return (
    <div className="min-h-screen bg-[#f5f8fb]">
      <PlatformNavbar />

      <main>
        <section className="bg-[#d5efeb] px-4 py-16 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-4xl text-center">
            <p className="text-sm font-semibold tracking-wide text-slate-700">PLANS & PRICING</p>
            <h1 className="mt-3 text-4xl font-bold text-slate-950 sm:text-6xl">Start for free, then grow with the right plan</h1>
            <p className="mt-4 text-lg text-slate-700">Choose monthly or yearly billing and scale as your business grows.</p>
          </div>
        </section>

        <section className="mx-auto w-full max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {plans.map((plan) => (
              <article key={plan.name} className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                <div className={`px-4 py-2 text-center text-sm font-semibold ${plan.blue ? "bg-blue-600 text-white" : "bg-emerald-400 text-slate-900"}`}>
                  {plan.highlight}
                </div>
                <div className="p-4">
                  <div className="mb-3 flex items-center justify-between">
                    <h2 className="text-3xl font-semibold text-slate-900">{plan.name}</h2>
                    {plan.popular ? <span className="rounded-full bg-emerald-100 px-2 py-1 text-xs font-semibold text-emerald-700">Most Popular</span> : null}
                  </div>
                  <p className="text-sm text-slate-600">{plan.subtitle}</p>
                  <p className="mt-3 text-5xl font-bold text-slate-950">{plan.price}</p>
                  <p className="text-sm text-slate-600">INR/month billed yearly</p>

                  <ul className="mt-5 space-y-2 text-sm text-slate-700">
                    {plan.features.map((feature) => (
                      <li key={feature} className="flex items-start gap-2">
                        <Check className="mt-0.5 size-4 text-slate-900" />
                        {feature}
                      </li>
                    ))}
                  </ul>

                  <Link href="/admin/signup" className="mt-6 block">
                    <Button className="w-full">Try for free</Button>
                  </Link>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section className="mx-auto w-full max-w-7xl px-4 pb-16 sm:px-6 lg:px-8">
          <h2 className="text-center text-4xl font-bold text-slate-950">What every plan gets you</h2>
          <div className="mt-8 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {included.map((item) => (
              <article key={item.title} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                <h3 className="text-lg font-semibold text-slate-900">{item.title}</h3>
                <p className="mt-2 text-sm text-slate-600">{item.desc}</p>
              </article>
            ))}
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
