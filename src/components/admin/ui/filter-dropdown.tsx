"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Check, ChevronDown, Search, X } from "lucide-react";

type FilterOption = {
  id: string;
  label: string;
  value: string;
};

type FilterDropdownProps = {
  values: string[];
  options: FilterOption[];
  placeholder: string;
  searchPlaceholder: string;
  allLabel: string;
  onChange: (values: string[]) => void;
  className?: string;
};

export function FilterDropdown({
  values,
  options,
  placeholder,
  searchPlaceholder,
  allLabel,
  onChange,
  className = "",
}: FilterDropdownProps) {
  const [search, setSearch] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement | null>(null);

  const filteredOptions = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return options;
    return options.filter((option) =>
      option.label.toLowerCase().includes(query),
    );
  }, [options, search]);

  useEffect(() => {
    function onPointerDown(event: MouseEvent) {
      if (rootRef.current && !rootRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    document.addEventListener("mousedown", onPointerDown);
    return () => document.removeEventListener("mousedown", onPointerDown);
  }, []);

  const selectedLabels = options
    .filter((option) => values.includes(option.value))
    .map((option) => option.label);

  const triggerLabel = !selectedLabels.length
    ? placeholder
    : selectedLabels.length === 1
      ? selectedLabels[0]
      : `${selectedLabels[0]} +${selectedLabels.length - 1}`;

  function toggleValue(nextValue: string) {
    if (values.includes(nextValue)) {
      onChange(values.filter((value) => value !== nextValue));
      return;
    }

    onChange([...values, nextValue]);
  }

  return (
    <div ref={rootRef} className={`relative ${className}`}>
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className="flex h-10 w-full items-center justify-between rounded-xl border border-slate-300 bg-white px-3 py-2 text-left text-sm"
      >
        <span
          className={`truncate ${selectedLabels.length ? "text-slate-900" : "text-slate-500"}`}
        >
          {triggerLabel}
        </span>
        <span className="ml-2 flex items-center gap-1">
          {selectedLabels.length ? (
            <span
              role="button"
              tabIndex={0}
              onClick={(event) => {
                event.stopPropagation();
                onChange([]);
                setSearch("");
                setIsOpen(false);
              }}
              onKeyDown={(event) => {
                if (event.key === "Enter" || event.key === " ") {
                  event.preventDefault();
                  event.stopPropagation();
                  onChange([]);
                  setSearch("");
                  setIsOpen(false);
                }
              }}
              aria-label="Clear selected filters"
              className="inline-flex h-5 w-5 items-center justify-center rounded-full text-slate-400 hover:bg-slate-100 hover:text-slate-700"
            >
              <X size={12} />
            </span>
          ) : null}
          <ChevronDown
            size={16}
            className={`transition ${isOpen ? "rotate-180" : ""}`}
          />
        </span>
      </button>

      {isOpen ? (
        <div className="absolute z-40 mt-2 w-full overflow-hidden rounded-xl border border-slate-200 bg-white shadow-xl">
          <div className="border-b border-slate-200 p-2">
            <div className="relative">
              <Search
                size={14}
                className="absolute left-2 top-2.5 text-slate-400"
              />
              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder={searchPlaceholder}
                className="w-full rounded-lg border border-slate-200 py-2 pl-8 pr-2 text-sm"
              />
            </div>
          </div>

          <button
            type="button"
            onClick={() => {
              onChange([]);
              setSearch("");
              setIsOpen(false);
            }}
            className="flex w-full items-center justify-between border-b border-slate-200 px-3 py-2 text-left text-sm hover:bg-slate-50"
          >
            <span>{allLabel}</span>
            {!values.length ? (
              <Check size={14} className="text-emerald-600" />
            ) : null}
          </button>

          <div className="max-h-56 overflow-y-auto py-1">
            {filteredOptions.length ? (
              filteredOptions.map((option) => (
                <button
                  key={option.id}
                  type="button"
                  onClick={() => {
                    toggleValue(option.value);
                  }}
                  className="flex w-full items-center justify-between px-3 py-2 text-left text-sm hover:bg-slate-50"
                >
                  <span className="truncate pr-3">{option.label}</span>
                  <input
                    type="checkbox"
                    checked={values.includes(option.value)}
                    readOnly
                    className="h-4 w-4 cursor-pointer accent-emerald-600"
                  />
                </button>
              ))
            ) : (
              <p className="px-3 py-2 text-sm text-slate-500">
                No results found.
              </p>
            )}
          </div>
        </div>
      ) : null}
    </div>
  );
}
