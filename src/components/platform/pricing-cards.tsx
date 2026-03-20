import { BarChart3, Check, ClipboardCheck, LayoutDashboard, Plus, Share2, Trophy } from "lucide-react";
import Link from "next/link";

type Plan = {
  name: string;
  tagline: string;
  price: string;
  topLine: string;
  cta: string;
  highlighted?: boolean;
  features: string[];
};

type Feature = {
  title: string;
  description: string;
  linkLabel?: string;
};

const plans: Plan[] = [
  {
    name: "Basic",
    tagline: "For solo entrepreneurs",
    price: "1,499",
    topLine: "₹20/month for first 3 months",
    cta: "Try for free",
    highlighted: true,
    features: ["2% 3rd-party payment providers", "10 inventory locations", "24/7 chat support"],
  },
  {
    name: "Grow",
    tagline: "For small teams",
    price: "5,599",
    topLine: "₹20/month for first 3 months",
    cta: "Try for free",
    features: ["1% 3rd-party payment providers", "24/7 chat support", "5 staff accounts"],
  },
  {
    name: "Advanced",
    tagline: "For global reach",
    price: "22,680",
    topLine: "₹20/month for first 3 months",
    cta: "Try for free",
    features: ["0.6% 3rd-party payment providers", "Local storefronts by market", "15 staff accounts"],
  },
  {
    name: "Plus",
    tagline: "For complex businesses",
    price: "1,75,000",
    topLine: "Available on a 1- or 3-year term",
    cta: "Get started",
    features: ["Best rates for high-volume merchants", "Unlimited staff accounts", "Fully customizable checkout"],
  },
];

const planFeatures: Feature[] = [
  {
    title: "World's best checkout",
    description: "Shopify checkout converts 15% better on average than other commerce platforms.",
  },
  {
    title: "In-person selling",
    description: "Sell in person and keep inventory in sync with online sales-all with ",
    linkLabel: "Shoper POS",
  },
  {
    title: "Multiple sales channels",
    description: "Promote and sell products on Instagram, TikTok, Google, and other channels.",
  },
  {
    title: "In-depth analytics",
    description: "Access reports to track store performance and identify optimisation opportunities.",
  },
  {
    title: "Commerce apps",
    description: "Use apps for everything from product sourcing to customizing your store.",
  },
];

const featureIcons = [Trophy, ClipboardCheck, Share2, BarChart3, LayoutDashboard];

export function PricingCards() {
  return (
    <section className="mx-auto w-full max-w-7xl px-6 pb-14 pt-10">
      <div className="mx-auto mb-10 flex w-full max-w-lg rounded-full border-2 border-emerald-400 bg-white p-1">
        <button
          type="button"
          className="flex-1 rounded-full px-6 py-3 text-center text-md font-medium text-slate-900 sm:text-lg"
        >
          Pay monthly
        </button>
        <button
          type="button"
          className="flex-1 rounded-full bg-slate-900 px-6 py-3 text-center text-md font-medium text-white sm:text-lg"
        >
          Pay yearly (save 25%)*
        </button>
      </div>

      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
        {plans.map((plan) => (
          <article key={plan.name} className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
            <div
              className={`px-5 py-3 text-sm font-bold ${
                plan.highlighted ? "bg-emerald-400 text-slate-900" : "bg-blue-600 text-white"
              }`}
            >
              {plan.topLine}
            </div>
            <div className="flex min-h-107.5 flex-col p-5">
              <h3 className="text-4xl font-semibold text-slate-900">{plan.name}</h3>
              <p className="mt-2 text-slate-600">{plan.tagline}</p>
              <p className="mt-5 text-5xl font-semibold text-slate-950">₹{plan.price}</p>
              <p className="text-slate-600">INR/month billed yearly</p>
              <ul className="mt-8 space-y-3 text-slate-700">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-2">
                    <Check size={16} className="mt-1 text-slate-900" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
              <button className="mt-auto rounded-full bg-black py-3 font-semibold text-white">{plan.cta}</button>
            </div>
          </article>
        ))}
      </div>

      <div className="mx-auto mt-12 text-center">
        <p className="text-lg text-slate-600">*Yearly discount available on select plans</p>
        <button
          type="button"
          className="mx-auto mt-6 inline-flex items-center gap-3 rounded-full border-2 border-slate-900 px-7 py-3 text-lg font-semibold text-slate-900"
        >
          <Plus size={20} />
          Full list of features
        </button>
      </div>

      <h2 className="mt-10 text-center text-4xl font-medium tracking-tight text-slate-950 sm:text-5xl md:text-5xl">
        What every plan gets you
      </h2>

      <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
        {planFeatures.map((feature, index) => {
          const Icon = featureIcons[index];

          return (
            <article key={feature.title} className="rounded-3xl border border-slate-200 bg-white p-3 shadow-sm">
              <div className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-blue-50">
                <Icon size={26} className="text-blue-600" />
              </div>

              <h3 className="mt-6 text-xl font-medium text-slate-900">{feature.title}</h3>
              <p className="mt-4 text-lg leading-relaxed text-slate-600">
                {feature.description}
                {feature.linkLabel ? (
                  <Link href="/" className="font-medium underline underline-offset-4">
                    {feature.linkLabel}
                  </Link>
                ) : null}
              </p>
            </article>
          );
        })}
      </div>
    </section>
  );
}
