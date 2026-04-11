export function Theme1ProductsLoading() {
  return (
    <div className="min-h-screen bg-slate-100 text-slate-900 font-['Helvetica']">
      <div className="sticky top-0 z-50 h-16 animate-pulse border-b border-slate-200 bg-white" />

      <main className="mx-auto w-full max-w-470 rounded-t-2xl bg-white px-3 py-4 sm:px-4 sm:py-5">
        <section className="mt-2 animate-pulse">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="h-10 w-28 rounded-lg bg-slate-200" />
            <div className="flex items-center gap-4">
              <div className="h-4 w-24 rounded bg-slate-200" />
              <div className="h-10 w-36 rounded-lg bg-slate-200" />
            </div>
          </div>

          <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {Array.from({ length: 8 }).map((_, index) => (
              <article
                key={index}
                className="overflow-hidden rounded-[22px] bg-white shadow-[0_18px_42px_-36px_rgba(15,23,42,0.38)]"
              >
                <div className="relative rounded-t-[18px] bg-slate-100">
                  <div className="absolute left-3 top-3 z-10 h-6 w-24 rounded-md bg-white" />
                  <div className="aspect-square w-full bg-slate-200" />
                </div>

                <div className="bg-white px-3 pb-3 pt-2">
                  <div className="h-7 w-4/5 rounded bg-slate-200" />
                  <div className="mt-2 flex items-center gap-2">
                    <div className="h-7 w-28 rounded bg-slate-200" />
                    <div className="h-5 w-16 rounded bg-slate-100" />
                  </div>

                  <div className="mt-4 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2">
                      {Array.from({ length: 3 }).map((__, thumbIndex) => (
                        <div
                          key={thumbIndex}
                          className="h-10 w-10 rounded-xl border border-slate-300 bg-slate-100"
                        />
                      ))}
                    </div>
                    <div className="h-10 w-10 rounded-xl border border-slate-300 bg-slate-100" />
                  </div>
                </div>
              </article>
            ))}
          </div>
        </section>
      </main>

      <div className="mt-16 h-32 animate-pulse bg-slate-900" />
    </div>
  );
}
