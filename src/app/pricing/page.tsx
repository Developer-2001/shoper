import { PricingCards } from "@/components/platform/pricing-cards";
import { PlatformFooter } from "@/components/platform/platform-footer";
import { PlatformNavbar } from "@/components/platform/platform-navbar";

export default function PricingPage() {
  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_10%_20%,#cffafe_0%,#ffffff_35%,#f8fafc_70%)]">
      <PlatformNavbar />
      <section>
        <div className="mx-auto flex w-full max-w-5xl flex-col items-center px-6 pb-12 pt-14 text-center md:pb-14">
          <p className="text-sm font-semibold uppercase tracking-wide text-slate-900">
            Plans & pricing
          </p>
          <h1 className="mt-3 max-w-4xl text-xl  leading-tight tracking-tight text-black md:text-6xl">
            Start for free, then enjoy {"\u20B9"}20/month for 3 months
          </h1>
          <p className="mt-4 max-w-3xl text-xl text-slate-600">
            Choose the best plan for your business. Change plans as you grow.
          </p>

          <div className="mt-8 flex w-full max-w-4xl flex-col gap-3 rounded-full border border-slate-300 bg-slate-100 p-2 sm:flex-row">
            <input
              type="email"
              placeholder="Enter your email address"
              className="h-14 flex-1 rounded-full bg-transparent px-5 text-lg text-slate-900 outline-none placeholder:text-slate-700 sm:text-2xl"
            />
            <button className="h-14 rounded-full bg-black px-8 text-lg font-semibold text-white transition hover:bg-slate-900">
              Start for free
            </button>
          </div>

          <p className="mt-4 text-base text-slate-600">
            You agree to receive Shopify marketing emails.
          </p>
        </div>
      </section>
      <div className="w-full bg-slate-50">
        <PricingCards />
      </div>
      <PlatformFooter />
    </div>
  );
}
