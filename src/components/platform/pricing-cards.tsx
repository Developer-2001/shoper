import { Check } from "lucide-react";

type Plan = {
  name: string;
  tagline: string;
  price: string;
  topLine: string;
  cta: string;
  highlighted?: boolean;
  features: string[];
};

const plans: Plan[] = [
  {
    name: "Basic",
    tagline: "For solo entrepreneurs",
    price: "1,499",
    topLine: "?20/month for first 3 months",
    cta: "Try for free",
    highlighted: true,
    features: ["2% 3rd-party payment providers", "10 inventory locations", "24/7 chat support"],
  },
  {
    name: "Grow",
    tagline: "For small teams",
    price: "5,599",
    topLine: "?20/month for first 3 months",
    cta: "Try for free",
    features: ["1% 3rd-party payment providers", "24/7 chat support", "5 staff accounts"],
  },
  {
    name: "Advanced",
    tagline: "For global reach",
    price: "22,680",
    topLine: "?20/month for first 3 months",
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

export function PricingCards() {
  return (
    <section className="mx-auto grid w-full max-w-7xl gap-5 px-6 pb-14 pt-10 md:grid-cols-2 xl:grid-cols-4">
      {plans.map((plan) => (
        <article key={plan.name} className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
          <div
            className={`px-5 py-3 text-sm font-bold ${
              plan.highlighted ? "bg-emerald-400 text-slate-900" : "bg-blue-600 text-white"
            }`}
          >
            {plan.topLine}
          </div>
          <div className="flex min-h-[430px] flex-col p-5">
            <h3 className="text-4xl font-semibold text-slate-900">{plan.name}</h3>
            <p className="mt-2 text-slate-600">{plan.tagline}</p>
            <p className="mt-5 text-5xl font-semibold text-slate-950">?{plan.price}</p>
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
    </section>
  );
}
