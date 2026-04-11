export function Theme1ProductDetailLoading() {
  return (
    <div className="min-h-screen bg-slate-100 text-slate-900 font-['Helvetica']">
      <div className="sticky top-0 z-50 h-16 animate-pulse border-b border-slate-200 bg-white" />

      <main className="mx-auto w-full max-w-470 rounded-t-2xl bg-white px-3 py-4 sm:px-4">
        <article className="grid animate-pulse gap-6 lg:grid-cols-[1.05fr_1fr] lg:gap-8 lg:p-8">
          <div>
            <div className="overflow-hidden rounded-2xl border border-slate-200 bg-slate-100">
              <div className="h-[300px] w-full bg-slate-200 sm:h-[420px] lg:h-[520px]" />
            </div>

            <div className="mt-3 grid grid-cols-4 gap-2 sm:grid-cols-6">
              {Array.from({ length: 6 }).map((_, index) => (
                <div
                  key={index}
                  className="h-16 rounded-xl border border-slate-200 bg-slate-100"
                />
              ))}
            </div>
          </div>

          <div>
            <div className="inline-block h-7 w-24 rounded-full bg-slate-200" />
            <div className="mt-3 h-10 w-4/5 rounded bg-slate-200" />
            <div className="mt-2 h-10 w-3/5 rounded bg-slate-100" />
            <div className="mt-4 space-y-2">
              <div className="h-4 rounded bg-slate-100" />
              <div className="h-4 rounded bg-slate-100" />
              <div className="h-4 w-4/5 rounded bg-slate-100" />
            </div>

            <div className="mt-6 h-10 w-40 rounded bg-slate-200" />
            <div className="mt-2 h-6 w-24 rounded bg-slate-100" />
            <div className="mt-2 h-5 w-20 rounded bg-slate-100" />

            <div className="mt-6 flex flex-wrap gap-3">
              <div className="h-12 w-36 rounded-full bg-slate-200" />
              <div className="h-12 w-36 rounded-full border border-slate-300 bg-slate-100" />
            </div>
          </div>
        </article>

        <section className="mt-8 animate-pulse border-t border-slate-200 pt-6">
          <div className="h-8 w-56 rounded bg-slate-200" />
          <div className="mt-4 flex gap-3 overflow-x-auto pb-2">
            {Array.from({ length: 5 }).map((_, index) => (
              <article
                key={index}
                className="min-w-[180px] overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm sm:min-w-[220px]"
              >
                <div className="aspect-square w-full bg-slate-200" />
                <div className="space-y-2 p-3">
                  <div className="h-4 w-4/5 rounded bg-slate-200" />
                  <div className="h-4 w-2/5 rounded bg-slate-100" />
                </div>
              </article>
            ))}
          </div>
        </section>
      </main>

      <div className="mt-12 h-40 animate-pulse rounded-t-2xl bg-slate-900" />
    </div>
  );
}
