"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { ChevronDown, Search, X } from "lucide-react";

export type SingleSelectOption = {
  id: string;
  label: string;
  value: string;
};

type SingleSelectDropdownProps = {
  id?: string;
  value: string;
  options: SingleSelectOption[];
  placeholder: string;
  searchPlaceholder: string;
  onChange: (value: string) => void;
  className?: string;
  disabled?: boolean;
  emptyMessage?: string;
  clearLabel?: string;
};

export function SingleSelectDropdown({
  id,
  value,
  options,
  placeholder,
  searchPlaceholder,
  onChange,
  className = "",
  disabled = false,
  emptyMessage = "No results found.",
  clearLabel = "Clear selection",
}: SingleSelectDropdownProps) {
  const [search, setSearch] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement | null>(null);

  const selectedOption = useMemo(
    () => options.find((option) => option.value === value) || null,
    [options, value],
  );

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

  return (
    <div ref={rootRef} className={`relative mt-1 ${className}`}>
      <button
        id={id}
        type="button"
        disabled={disabled}
        onClick={() => setIsOpen((prev) => !prev)}
        className="flex h-12 w-full items-center justify-between rounded-xl border border-slate-300 bg-slate-50 px-3 text-left text-sm text-slate-900 outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-200 disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-400"
      >
        <span className={`truncate ${selectedOption ? "text-slate-900" : "text-slate-500"}`}>
          {selectedOption?.label || placeholder}
        </span>
        <span className="ml-2 flex items-center gap-1">
          {selectedOption ? (
            <span
              role="button"
              tabIndex={0}
              onClick={(event) => {
                event.stopPropagation();
                onChange("");
                setSearch("");
                setIsOpen(false);
              }}
              onKeyDown={(event) => {
                if (event.key === "Enter" || event.key === " ") {
                  event.preventDefault();
                  event.stopPropagation();
                  onChange("");
                  setSearch("");
                  setIsOpen(false);
                }
              }}
              aria-label={clearLabel}
              className="inline-flex h-5 w-5 items-center justify-center rounded-full text-slate-400 hover:bg-slate-200 hover:text-slate-700"
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

      {isOpen && !disabled ? (
        <div className="absolute z-50 mt-2 w-full overflow-hidden rounded-xl border border-slate-200 bg-white shadow-xl">
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
                className="w-full rounded-lg border border-slate-200 py-2 pl-8 pr-2 text-sm outline-none focus:border-slate-300"
              />
            </div>
          </div>

          <div className="max-h-56 overflow-y-auto py-1">
            {filteredOptions.length ? (
              filteredOptions.map((option) => (
                <button
                  key={option.id}
                  type="button"
                  onClick={() => {
                    onChange(option.value);
                    setSearch("");
                    setIsOpen(false);
                  }}
                  className={`flex w-full items-center justify-between px-3 py-2 text-left text-sm hover:bg-slate-50 ${
                    option.value === value ? "bg-slate-100 text-slate-900" : "text-slate-700"
                  }`}
                >
                  <span className="truncate pr-3">{option.label}</span>
                </button>
              ))
            ) : (
              <p className="px-3 py-2 text-sm text-slate-500">{emptyMessage}</p>
            )}
          </div>
        </div>
      ) : null}
    </div>
  );
}
