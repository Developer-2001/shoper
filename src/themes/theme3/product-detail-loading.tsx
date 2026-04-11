export function Theme3ProductDetailLoading() {
  return (
    <div className="min-h-screen bg-[#fae9e6] text-rose-950 font-['Helvetica']">
      <div className="sticky top-0 z-50 h-16 animate-pulse border-b border-[#efdad5] bg-[#fcf5f4]" />

      <main className="mx-auto w-full max-w-470 rounded-t-2xl bg-[#fcf5f4] px-3 py-4 sm:px-4">
        <article className="grid animate-pulse gap-6 lg:grid-cols-[1.05fr_1fr] lg:gap-8 lg:p-8">
          <div>
            <div className="overflow-hidden rounded-2xl border border-[#f2dfdb] bg-[#f7ebe8]">
              <div className="h-[300px] w-full bg-[#ecd9d6] sm:h-[420px] lg:h-[520px]" />
            </div>

            <div className="mt-3 grid grid-cols-4 gap-2 sm:grid-cols-6">
              {Array.from({ length: 6 }).map((_, index) => (
                <div
                  key={index}
                  className="h-16 rounded-xl border border-[#ead6d2] bg-[#f8efec]"
                />
              ))}
            </div>
          </div>

          <div>
            <div className="inline-block h-7 w-24 rounded-full bg-[#efddda]" />
            <div className="mt-3 h-10 w-4/5 rounded bg-[#efddda]" />
            <div className="mt-2 h-10 w-3/5 rounded bg-[#f4ebe8]" />
            <div className="mt-4 space-y-2">
              <div className="h-4 rounded bg-[#f4ebe8]" />
              <div className="h-4 rounded bg-[#f4ebe8]" />
              <div className="h-4 w-4/5 rounded bg-[#f4ebe8]" />
            </div>

            <div className="mt-6 h-10 w-40 rounded bg-[#efddda]" />
            <div className="mt-2 h-6 w-24 rounded bg-[#f4ebe8]" />
            <div className="mt-2 h-5 w-20 rounded bg-[#f4ebe8]" />

            <div className="mt-6 flex flex-wrap gap-3">
              <div className="h-12 w-36 rounded-full bg-[#e9b7ab]" />
              <div className="h-12 w-36 rounded-full border border-[#e9b7ab] bg-[#fff6f4]" />
            </div>
          </div>
        </article>
      </main>

      <div className="mt-12 h-40 animate-pulse rounded-t-2xl bg-[#2b0b05]" />
    </div>
  );
}
