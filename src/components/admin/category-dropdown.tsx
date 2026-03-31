"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Check, ChevronDown, Plus, Search } from "lucide-react";

type CategoryOption = {
  id: string;
  name: string;
};

type CategoryDropdownProps = {
  value: string;
  options: CategoryOption[];
  loading?: boolean;
  onSelect: (name: string) => void;
  onAddNew: (initialName: string) => void;
};

export function CategoryDropdown({
  value,
  options,
  loading = false,
  onSelect,
  onAddNew,
}: CategoryDropdownProps) {
  const [search, setSearch] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement | null>(null);

  const filteredOptions = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return options;
    return options.filter((option) => option.name.toLowerCase().includes(query));
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
    <div ref={rootRef} className="relative">
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className="flex w-full items-center justify-between rounded-xl border border-slate-300 px-4 py-2 text-left"
      >
        <span className={value ? "text-slate-900" : "text-slate-400"}>
          {value || "Select category"}
        </span>
        <ChevronDown
          size={16}
          className={`transition ${isOpen ? "rotate-180" : ""}`}
        />
      </button>

      {isOpen ? (
        <div className="absolute z-30 mt-2 w-full overflow-hidden rounded-xl border border-slate-200 bg-white shadow-xl">
          <div className="border-b border-slate-200 p-2">
            <div className="relative">
              <Search size={14} className="absolute left-2 top-2.5 text-slate-400" />
              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search category..."
                className="w-full rounded-lg border border-slate-200 py-2 pl-8 pr-2 text-sm"
              />
            </div>
          </div>

          <button
            type="button"
            onClick={() => onAddNew(search.trim())}
            className="flex w-full items-center gap-2 border-b border-slate-200 px-3 py-2 text-left text-sm font-semibold text-slate-700 hover:bg-slate-50"
          >
            <Plus size={14} />
            Add new category
          </button>

          <div className="max-h-56 overflow-y-auto py-1">
            {loading ? (
              <p className="px-3 py-2 text-sm text-slate-500">Loading categories...</p>
            ) : filteredOptions.length ? (
              filteredOptions.map((option) => (
                <button
                  key={option.id}
                  type="button"
                  onClick={() => {
                    onSelect(option.name);
                    setSearch("");
                    setIsOpen(false);
                  }}
                  className="flex w-full items-center justify-between px-3 py-2 text-left text-sm hover:bg-slate-50"
                >
                  <span>{option.name}</span>
                  {value === option.name ? <Check size={14} className="text-emerald-600" /> : null}
                </button>
              ))
            ) : (
              <p className="px-3 py-2 text-sm text-slate-500">No categories found.</p>
            )}
          </div>
        </div>
      ) : null}
    </div>
  );
}
