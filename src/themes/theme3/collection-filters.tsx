"use client";

import { SlidersHorizontal, X } from "lucide-react";

type Theme3CollectionFiltersProps = {
  isOpen: boolean;
  fromPrice: string;
  toPrice: string;
  selectedDiscount: number | null;
  discountOptions: number[];
  onOpen: () => void;
  onClose: () => void;
  onChangeFromPrice: (value: string) => void;
  onChangeToPrice: (value: string) => void;
  onToggleDiscount: (value: number) => void;
  onClear: () => void;
  onApply: () => void;
};

export function Theme3CollectionFilters({
  isOpen,
  fromPrice,
  toPrice,
  selectedDiscount,
  discountOptions,
  onOpen,
  onClose,
  onChangeFromPrice,
  onChangeToPrice,
  onToggleDiscount,
  onClear,
  onApply,
}: Theme3CollectionFiltersProps) {
  return (
    <>
      <button
        type="button"
        onClick={onOpen}
        className="inline-flex cursor-pointer items-center gap-2 rounded-lg bg-[#fae9e6] px-4 py-2 text-sm font-semibold text-rose-900"
      >
        <SlidersHorizontal size={16} className="text-[#300303]" />
        Filter
      </button>

      <div
        className={`fixed inset-0 z-70 transition-opacity duration-300 ${
          isOpen
            ? "pointer-events-auto opacity-100"
            : "pointer-events-none opacity-0"
        }`}
      >
        <div className="absolute inset-0 bg-black/35" onClick={onClose} />
        <aside
          className={`absolute left-2 top-20 w-[calc(100%-1rem)] rounded-2xl border border-[#d87f66] bg-[#fff8f6] p-5 shadow-2xl transition-transform duration-300 ease-out sm:left-3 sm:top-24 sm:w-[min(calc(100%-1.5rem),430px)] ${
            isOpen ? "translate-x-0" : "-translate-x-full"
          }`}
        >
          <div className="flex items-center justify-between">
            <h3 className="text-2xl font-semibold text-[#2f2b2a]">Filters</h3>
            <button
              type="button"
              onClick={onClose}
              className="inline-flex h-10 w-10 items-center cursor-pointer justify-center rounded-full border border-[#8a6559] text-[#2f2b2a] transition hover:bg-[#f7ebe8]"
              aria-label="Close filters"
            >
              <X size={24} />
            </button>
          </div>

          <div className="mt-6">
            <p className="text-lg font-medium text-[#2c0e05]">Price Range</p>
            <div className="mt-4 rounded-md px-2 py-3 sm:px-4">
              <div className="grid grid-cols-2 items-center gap-2 text-sm font-medium sm:flex">
                <span>Rs.</span>
                <input
                  inputMode="decimal"
                  value={fromPrice}
                  onChange={(event) => onChangeFromPrice(event.target.value)}
                  placeholder="0"
                  className="w-full rounded border border-[#e2c1b2] bg-white px-2 py-1.5 text-[#2c0e05] sm:w-24"
                />
                <span>From</span>
                <span>Rs.</span>
                <input
                  inputMode="decimal"
                  value={toPrice}
                  onChange={(event) => onChangeToPrice(event.target.value)}
                  placeholder="4000"
                  className="w-full rounded border border-[#e2c1b2] bg-white px-2 py-1.5 text-[#2c0e05] sm:w-28"
                />
                <span>To</span>
              </div>
            </div>
          </div>

          <div className="mt-8">
            <p className="text-lg font-medium text-[#2c0e05]">Discount</p>
            <div className="mt-5 flex flex-wrap gap-3">
              {discountOptions.map((value) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => onToggleDiscount(value)}
                  className={`h-12 w-14 rounded-xl border text-sm font-semibold transition ${
                    selectedDiscount === value
                      ? "border-[#cc5639] bg-[#cc5639] text-white"
                      : "border-[#8a6559] text-[#8a6559] hover:bg-[#f7ebe8]"
                  }`}
                >
                  {value}
                </button>
              ))}
            </div>
          </div>

          <div className="mt-8 grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={onClear}
              className="rounded-lg cursor-pointer border border-[#8a6559] px-4 py-2 text-sm font-semibold text-[#8a6559] hover:bg-[#f7ebe8]"
            >
              Clear
            </button>
            <button
              type="button"
              onClick={onApply}
              className="rounded-lg cursor-pointer bg-[#cc5639] px-4 py-2 text-sm font-semibold text-white hover:bg-[#b94c31]"
            >
              Apply
            </button>
          </div>
        </aside>
      </div>
    </>
  );
}
