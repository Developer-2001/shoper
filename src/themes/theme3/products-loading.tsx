export function Theme3ProductsLoading() {
  return (
    <div className="min-h-screen bg-[#fae9e6] text-rose-950 font-['Helvetica']">
      <div className="sticky top-0 z-50 h-16 animate-pulse border-b border-[#efdad5] bg-[#fcf5f4]" />

      <main className="mx-auto w-full max-w-470 rounded-t-2xl bg-[#fcf5f4] px-3 py-4 sm:px-4 sm:py-5">
        <section className="mt-2 animate-pulse">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="h-10 w-28 rounded-lg bg-[#efddda]" />
            <div className="flex items-center gap-4">
              <div className="h-4 w-24 rounded bg-[#efddda]" />
              <div className="h-10 w-36 rounded-lg bg-[#efddda]" />
            </div>
          </div>

          <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {Array.from({ length: 8 }).map((_, index) => (
              <article
                key={index}
                className="overflow-hidden rounded-[22px] bg-[#fae9e6] shadow-[0_18px_42px_-36px_rgba(163,72,95,0.55)]"
              >
                <div className="relative rounded-t-[18px] bg-[#f1dfdc]">
                  <div className="absolute left-3 top-3 z-10 h-6 w-24 rounded-md bg-white" />
                  <div className="aspect-square w-full bg-[#ecd9d6]" />
                </div>

                <div className="bg-white px-2 pb-2 pt-2">
                  <div className="h-7 w-4/5 rounded bg-[#f0e7e4]" />
                  <div className="mt-2 flex items-center gap-2">
                    <div className="h-7 w-28 rounded bg-[#f0e7e4]" />
                    <div className="h-5 w-16 rounded bg-[#f6efed]" />
                  </div>

                  <div className="mt-4 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2">
                      {Array.from({ length: 2 }).map((__, thumbIndex) => (
                        <div
                          key={thumbIndex}
                          className="h-10 w-10 rounded-xl border border-[#ead6d2] bg-[#f8efec]"
                        />
                      ))}
                    </div>
                    <div className="h-10 w-10 rounded-xl border border-[#e9b7ab] bg-[#fff6f4]" />
                  </div>
                </div>
              </article>
            ))}
          </div>
        </section>
      </main>

      <div className="mt-16 h-32 animate-pulse bg-[#3c231d]" />
    </div>
  );
}
