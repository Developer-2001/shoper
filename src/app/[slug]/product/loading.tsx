export default function ProductLoadingPage() {
  return (
    <div className="min-h-screen bg-slate-100 text-slate-900 font-['Helvetica']">
      {/* Navbar */}
      <div className="sticky top-0 z-50 h-16 bg-white border-b border-slate-200 animate-pulse" />

      {/* Product detail content */}
      <main className="mx-auto w-full max-w-470 rounded-t-2xl bg-white px-3 py-4 sm:px-4">
        <div className="grid gap-6 lg:grid-cols-[1.05fr_1fr] animate-pulse">
          {/* Product images skeleton */}
          <div>
            <div className="h-96 bg-slate-300 rounded-2xl mb-3" />
            <div className="grid grid-cols-4 gap-2">
              {[...Array(4)].map((_, i) => (
                <div
                  key={i}
                  className="aspect-square bg-slate-300 rounded-lg"
                />
              ))}
            </div>
          </div>

          {/* Product info skeleton */}
          <div className="space-y-6">
            <div className="space-y-2">
              <div className="h-8 bg-slate-300 rounded w-3/4" />
              <div className="h-6 bg-slate-300 rounded w-1/2" />
            </div>
            <div className="space-y-2">
              <div className="h-4 bg-slate-300 rounded" />
              <div className="h-4 bg-slate-300 rounded" />
              <div className="h-4 bg-slate-300 rounded w-2/3" />
            </div>
            <div className="h-12 bg-slate-300 rounded" />
          </div>
        </div>

        {/* Related products skeleton */}
        <div className="mt-8 border-t border-slate-200 pt-6 animate-pulse">
          <div className="h-6 bg-slate-300 rounded w-48 mb-4" />
          <div className="flex gap-3 overflow-x-auto">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="min-w-[180px] sm:min-w-[220px]">
                <div className="aspect-square bg-slate-300 rounded-xl mb-2" />
                <div className="h-4 bg-slate-300 rounded w-3/4" />
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
