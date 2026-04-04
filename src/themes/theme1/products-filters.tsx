"use client";

import { SlidersHorizontal, X } from "lucide-react";

import { FilterDropdown } from "@/components/admin/ui/filter-dropdown";

type FilterOption = {
  id: string;
  label: string;
  value: string;
};

type Theme1ProductsFiltersProps = {
  isOpen: boolean;
  productOptions: FilterOption[];
  categoryOptions: FilterOption[];
  discountOptions: FilterOption[];
  minPrice: number;
  maxPrice: number;
  selectedProducts: string[];
  selectedCategories: string[];
  selectedDiscounts: string[];
  fromPrice: string;
  toPrice: string;
  onOpen: () => void;
  onClose: () => void;
  onChangeProducts: (values: string[]) => void;
  onChangeCategories: (values: string[]) => void;
  onChangeDiscounts: (values: string[]) => void;
  onChangeFromPrice: (value: string) => void;
  onChangeToPrice: (value: string) => void;
  onClear: () => void;
  onApply: () => void;
};

export function Theme1ProductsFilters({
  isOpen,
  productOptions,
  categoryOptions,
  discountOptions,
  minPrice,
  maxPrice,
  selectedProducts,
  selectedCategories,
  selectedDiscounts,
  fromPrice,
  toPrice,
  onOpen,
  onClose,
  onChangeProducts,
  onChangeCategories,
  onChangeDiscounts,
  onChangeFromPrice,
  onChangeToPrice,
  onClear,
  onApply,
}: Theme1ProductsFiltersProps) {
  function toggleDiscount(value: string) {
    if (selectedDiscounts.includes(value)) {
      onChangeDiscounts([]);
      return;
    }

    onChangeDiscounts([value]);
  }

  const sliderMin = Number.isFinite(minPrice) ? minPrice : 0;
  const sliderMax =
    Number.isFinite(maxPrice) && maxPrice > sliderMin
      ? maxPrice
      : sliderMin + 1;

  const parsedFrom = Number(fromPrice);
  const parsedTo = Number(toPrice);

  const currentFrom =
    fromPrice.trim() === "" || Number.isNaN(parsedFrom)
      ? sliderMin
      : Math.min(Math.max(parsedFrom, sliderMin), sliderMax);
  const currentTo =
    toPrice.trim() === "" || Number.isNaN(parsedTo)
      ? sliderMax
      : Math.min(Math.max(parsedTo, sliderMin), sliderMax);

  const safeFrom = Math.min(currentFrom, currentTo);
  const safeTo = Math.max(currentFrom, currentTo);
  const totalRange = sliderMax - sliderMin;
  const fromPercent = ((safeFrom - sliderMin) / totalRange) * 100;
  const toPercent = ((safeTo - sliderMin) / totalRange) * 100;

  function normalizePrice(value: number) {
    if (Number.isInteger(value)) {
      return String(value);
    }
    return value.toFixed(2);
  }

  function onFromSliderChange(value: number) {
    const bounded = Math.min(Math.max(value, sliderMin), safeTo);
    onChangeFromPrice(normalizePrice(bounded));
  }

  function onToSliderChange(value: number) {
    const bounded = Math.max(Math.min(value, sliderMax), safeFrom);
    onChangeToPrice(normalizePrice(bounded));
  }

  return (
    <>
      <button
        type="button"
        onClick={onOpen}
        className="inline-flex cursor-pointer items-center gap-2 rounded-lg bg-slate-100 px-4 py-2 text-sm font-semibold text-slate-800"
      >
        <SlidersHorizontal size={16} className="text-slate-900" />
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
          className={`absolute left-2 top-20 w-[calc(100%-1rem)] rounded-2xl border border-slate-300 bg-white p-5 shadow-2xl transition-transform duration-300 ease-out sm:left-3 sm:top-24 sm:w-[min(calc(100%-1.5rem),440px)] ${
            isOpen ? "translate-x-0" : "-translate-x-full"
          }`}
        >
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-semibold text-slate-900">Filters</h3>
            <button
              type="button"
              onClick={onClose}
              className="inline-flex h-8 w-8 items-center cursor-pointer justify-center rounded-full border border-slate-400 text-slate-900 transition hover:bg-slate-100"
              aria-label="Close filters"
            >
              <X size={20} />
            </button>
          </div>

          <div className="mt-3 space-y-2">
            <div>
              <p className="text-md font-medium text-slate-900">Products</p>
              <FilterDropdown
                values={selectedProducts}
                options={productOptions}
                placeholder="Select products"
                searchPlaceholder="Search products..."
                allLabel="All products"
                onChange={onChangeProducts}
                className="mt-2"
              />
            </div>

            <div>
              <p className="text-md font-medium text-slate-900">Category</p>
              <FilterDropdown
                values={selectedCategories}
                options={categoryOptions}
                placeholder="Select categories"
                searchPlaceholder="Search categories..."
                allLabel="All categories"
                onChange={onChangeCategories}
                className="mt-2"
              />
            </div>

            <div>
              <p className="text-md font-medium text-slate-900">Price Range</p>
              <div className="mt-2 rounded-xl border border-slate-300 bg-white px-3 py-3">
                <div className="relative h-8">
                  <div className="absolute top-1/2 h-1 w-full -translate-y-1/2 rounded-full bg-slate-200" />
                  <div
                    className="absolute top-1/2 h-1 -translate-y-1/2 rounded-full bg-[#1d4ed8]"
                    style={{
                      left: `${fromPercent}%`,
                      width: `${toPercent - fromPercent}%`,
                    }}
                  />
                  <input
                    type="range"
                    min={sliderMin}
                    max={sliderMax}
                    step={0.01}
                    value={safeFrom}
                    onChange={(event) =>
                      onFromSliderChange(Number(event.target.value))
                    }
                    className="pointer-events-none absolute top-1/2 h-0 w-full -translate-y-1/2 appearance-none bg-transparent [&::-webkit-slider-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:h-6 [&::-webkit-slider-thumb]:w-6 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-[#1d4ed8] [&::-webkit-slider-thumb]:bg-white [&::-moz-range-thumb]:pointer-events-auto [&::-moz-range-thumb]:h-6 [&::-moz-range-thumb]:w-6 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:border-2 [&::-moz-range-thumb]:border-[#1d4ed8] [&::-moz-range-thumb]:bg-white"
                    aria-label="Minimum price"
                  />
                  <input
                    type="range"
                    min={sliderMin}
                    max={sliderMax}
                    step={0.01}
                    value={safeTo}
                    onChange={(event) =>
                      onToSliderChange(Number(event.target.value))
                    }
                    className="pointer-events-none absolute top-1/2 h-0 w-full -translate-y-1/2 appearance-none bg-transparent [&::-webkit-slider-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:h-6 [&::-webkit-slider-thumb]:w-6 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-[#1d4ed8] [&::-webkit-slider-thumb]:bg-white [&::-moz-range-thumb]:pointer-events-auto [&::-moz-range-thumb]:h-6 [&::-moz-range-thumb]:w-6 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:border-2 [&::-moz-range-thumb]:border-[#1d4ed8] [&::-moz-range-thumb]:bg-white"
                    aria-label="Maximum price"
                  />
                </div>
                <div className="mt-1 flex items-center justify-between text-sm text-[#1d4ed8]">
                  <span>{normalizePrice(safeFrom)}</span>
                  <span>{normalizePrice(safeTo)}</span>
                </div>
              </div>
            </div>

            <div>
              <p className="text-md font-medium text-slate-900">Discount</p>
              {discountOptions.length ? (
                <div className="mt-2 flex flex-wrap gap-2">
                  {discountOptions.map((option) => {
                    const isSelected = selectedDiscounts.includes(option.value);
                    return (
                      <button
                        key={option.id}
                        type="button"
                        onClick={() => toggleDiscount(option.value)}
                        className={`flex h-10 min-w-20 cursor-pointer items-center justify-center rounded-lg border px-4 text-sm font-medium transition ${
                          isSelected
                            ? "border-slate-300 bg-[#1d4ed8] text-white"
                            : "border-slate-300 bg-white text-[#1d4ed8] hover:bg-slate-100"
                        }`}
                      >
                        {option.label}
                      </button>
                    );
                  })}
                </div>
              ) : (
                <p className="mt-3 text-sm text-slate-600">
                  No discounted products
                </p>
              )}
            </div>
          </div>

          <div className="mt-6 grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={onClear}
              className="rounded-lg cursor-pointer border border-slate-400 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-100"
            >
              Clear
            </button>
            <button
              type="button"
              onClick={onApply}
              className="rounded-lg cursor-pointer bg-[#1d4ed8] px-4 py-2 text-sm font-semibold text-white hover:bg-[#1e40af]"
            >
              Apply
            </button>
          </div>
        </aside>
      </div>
    </>
  );
}




