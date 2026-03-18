import Link from "next/link";

type Props = {
  params: Promise<{ slug: string; orderId: string }>;
};

export default async function OrderSuccessPage({ params }: Props) {
  const { slug, orderId } = await params;

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-xl items-center px-4">
      <section className="w-full rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm">
        <p className="text-sm font-semibold text-emerald-600">Order confirmed</p>
        <h1 className="mt-2 text-3xl font-bold text-slate-900">Thank you for your purchase</h1>
        <p className="mt-3 text-sm text-slate-600">Your order ID is {orderId}</p>

        <div className="mt-6 flex justify-center gap-3">
          <Link href={`/${slug}`} className="rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white">
            Back to Store
          </Link>
          <Link href={`/${slug}/products`} className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700">
            Continue Shopping
          </Link>
        </div>
      </section>
    </main>
  );
}
