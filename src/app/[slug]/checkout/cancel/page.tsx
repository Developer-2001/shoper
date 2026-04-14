import Link from "next/link";
import { AlertCircle, ArrowLeft } from "lucide-react";
import { CheckoutCancelCleanup } from "./checkout-cancel-cleanup";

export default async function CheckoutCancelPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-slate-50 px-4 py-8">
      <CheckoutCancelCleanup slug={slug} />
      <div className="w-full max-w-md rounded-3xl bg-white p-8 text-center shadow-xl shadow-slate-200/50 sm:p-12">
        <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-orange-100">
          <AlertCircle className="h-10 w-10 text-orange-600" />
        </div>
        
        <h1 className="mb-2 text-2xl font-bold text-slate-900">Payment Canceled</h1>
        <p className="mb-8 text-slate-600">
          The transaction was not completed. No charges have been made to your account.
        </p>

        <div className="mt-8 space-y-3">
          <Link
            href={`/${slug}/checkout`}
            className="flex w-full items-center justify-center gap-2 rounded-2xl bg-slate-900 py-4 font-bold text-white shadow-lg transition-all hover:bg-slate-800 hover:shadow-xl active:scale-95"
          >
            Try Again
          </Link>
          
          <Link
            href={`/${slug}/cart`}
            className="flex w-full items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white py-4 font-bold text-slate-600 transition-all hover:bg-slate-50 hover:text-slate-900 active:scale-95"
          >
            <ArrowLeft className="h-5 w-5" />
            Back to Cart
          </Link>
        </div>
      </div>
      
      <p className="mt-8 text-sm text-slate-400 text-center">
        If you're having trouble paying, please contact the store owner.
      </p>
    </div>
  );
}
