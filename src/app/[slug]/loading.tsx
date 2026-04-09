export default function StoreLoadingPage() {
  return (
    <div className="min-h-screen bg-slate-100 text-slate-900 font-['Helvetica']">
      {/* Navbar skeleton */}
      <div className="sticky top-0 z-50 animate-pulse">
        <div className="h-16 bg-white border-b border-slate-200" />
      </div>

      {/* Hero section skeleton */}
      <div className="mx-auto w-full max-w-470 px-3 sm:px-4">
        <div className="mt-4 animate-pulse">
          <div className="relative overflow-hidden rounded-2xl border border-slate-200 bg-slate-300">
            <div className="aspect-video w-full" />
          </div>
        </div>

        {/* Collections skeleton */}
        <div className="mt-8 animate-pulse">
          <div className="h-8 w-48 bg-slate-300 rounded mb-4" />
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="h-32 bg-slate-300 rounded-lg" />
            ))}
          </div>
        </div>

        {/* Products grid skeleton */}
        <div className="mt-8 animate-pulse">
          <div className="h-8 w-48 bg-slate-300 rounded mb-4" />
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="rounded-2xl bg-slate-300 overflow-hidden">
                <div className="aspect-square w-full bg-slate-300" />
                <div className="p-3 space-y-2">
                  <div className="h-4 bg-slate-200 rounded w-3/4" />
                  <div className="h-4 bg-slate-200 rounded w-1/2" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Footer skeleton */}
      <div className="mt-16 bg-slate-900 h-32 animate-pulse" />
    </div>
  );
}
