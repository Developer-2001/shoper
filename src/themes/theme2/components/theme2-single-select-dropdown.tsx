"use client";

import { ChevronDown, Search, X } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";

export type Theme2SingleSelectOption = {
  id: string;
  label: string;
  value: string;
};

type Theme2SingleSelectDropdownProps = {
  id?: string;
  value: string;
  options: Theme2SingleSelectOption[];
  placeholder: string;
  searchPlaceholder: string;
  onChange: (value: string) => void;
  className?: string;
  disabled?: boolean;
  emptyMessage?: string;
  clearLabel?: string;
};

export function Theme2SingleSelectDropdown({
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
}: Theme2SingleSelectDropdownProps) {
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
    return options.filter((option) => option.label.toLowerCase().includes(query));
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
        onClick={() => setIsOpen((previous) => !previous)}
        className="flex h-11 w-full items-center justify-between rounded border border-[#ccd3d0] bg-white px-3 text-left text-sm text-[#304340] outline-none transition focus:border-[#8ea39e] focus:ring-2 focus:ring-[#dce4e1] disabled:cursor-not-allowed disabled:bg-[#f3f6f5] disabled:text-[#8da09b]"
      >
        <span className={`truncate ${selectedOption ? "text-[#304340]" : "text-[#6b7e79]"}`}>
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
              className="inline-flex h-5 w-5 items-center justify-center rounded-full text-[#7f8f8b] hover:bg-[#e8efed] hover:text-[#304340]"
            >
              <X size={12} />
            </span>
          ) : null}
          <ChevronDown size={16} className={`transition ${isOpen ? "rotate-180" : ""}`} />
        </span>
      </button>

      {isOpen && !disabled ? (
        <div className="absolute z-50 mt-2 w-full overflow-hidden rounded border border-[#cfd8d5] bg-white shadow-xl">
          <div className="border-b border-[#d7e0dd] p-2">
            <div className="relative">
              <Search size={14} className="absolute left-2 top-2.5 text-[#8b9a96]" />
              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder={searchPlaceholder}
                className="h-9 w-full rounded border border-[#cfd8d5] bg-white py-2 pl-8 pr-2 text-sm text-[#304340] outline-none focus:border-[#8ea39e]"
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
                  className={`flex w-full items-center justify-between px-3 py-2 text-left text-sm ${
                    option.value === value
                      ? "bg-[#edf4f1] text-[#2f403d]"
                      : "text-[#445955] hover:bg-[#f5f9f7]"
                  }`}
                >
                  <span className="truncate pr-3">{option.label}</span>
                </button>
              ))
            ) : (
              <p className="px-3 py-2 text-sm text-[#6d7f7a]">{emptyMessage}</p>
            )}
          </div>
        </div>
      ) : null}
    </div>
  );
}
