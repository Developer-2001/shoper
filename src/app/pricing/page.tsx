import { PricingCards } from "@/components/platform/pricing-cards";
import { PlatformFooter } from "@/components/platform/platform-footer";
import { PlatformNavbar } from "@/components/platform/platform-navbar";

export default function PricingPage() {
  return (
    <div className="min-h-screen bg-slate-50">
      <PlatformNavbar />
      <section className="mx-auto w-full max-w-7xl px-6 pb-4 pt-14">
        <h1 className="text-5xl font-black tracking-tight text-slate-900">Plans & pricing</h1>
        <p className="mt-4 max-w-3xl text-2xl font-semibold text-slate-800">
          Start for free, then enjoy ?20/month for 3 months
        </p>
        <p className="mt-2 max-w-2xl text-slate-600">
          Choose the best plan for your business. Change plans as you grow.
        </p>
      </section>
      <PricingCards />
      <PlatformFooter />
    </div>
  );
}
