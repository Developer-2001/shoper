import Link from "next/link";
import { CheckCircle2, ShoppingBag } from "lucide-react";

export default function CheckoutSuccessPage({ params }: { params: { slug: string } }) {
  const { slug } = params;

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-slate-50 px-4 py-8">
      <div className="w-full max-w-md rounded-3xl bg-white p-8 text-center shadow-xl shadow-slate-200/50 sm:p-12">
        <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-green-100">
          <CheckCircle2 className="h-10 w-10 text-green-600" />
        </div>
        
        <h1 className="mb-2 text-3xl font-bold text-slate-900">Order Confirmed!</h1>
        <p className="mb-8 text-slate-600">
          Thank you for your purchase. We've received your order and the store owner is now processing it.
        </p>

        <div className="divide-y divide-slate-100 border-y border-slate-100 py-4 text-left">
          <div className="flex justify-between py-2">
            <span className="text-sm text-slate-500">Payment Status</span>
            <span className="text-sm font-bold text-green-600">Paid Securely</span>
          </div>
          <div className="flex justify-between py-2">
            <span className="text-sm text-slate-500">Processing</span>
            <span className="text-sm font-bold text-slate-700">Immediate</span>
          </div>
        </div>

        <div className="mt-10 space-y-3">
          <Link
            href={`/${slug}/products`}
            className="flex w-full items-center justify-center gap-2 rounded-2xl bg-slate-900 py-4 font-bold text-white shadow-lg transition-all hover:bg-slate-800 hover:shadow-xl active:scale-95"
          >
            <ShoppingBag className="h-5 w-5" />
            Continue Shopping
          </Link>
          
          <Link
            href={`/${slug}`}
            className="block text-sm font-semibold text-slate-500 hover:text-slate-900"
          >
            Go to Home Page
          </Link>
        </div>
      </div>
      
      <p className="mt-8 text-sm text-slate-400">
        &copy; {new Date().getFullYear()} Shoper. All rights reserved.
      </p>
    </div>
  );
}
