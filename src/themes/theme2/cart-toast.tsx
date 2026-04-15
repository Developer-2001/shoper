"use client";

import { CheckCircle2, X } from "lucide-react";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";

type Theme2CartToast = {
  id: number;
  title: string;
  message: string;
};

type Theme2CartToastContextValue = {
  showAddedToCart: (productName: string) => void;
};

const TOAST_DURATION = 3000;
const MAX_TOASTS = 3;

const Theme2CartToastContext = createContext<Theme2CartToastContextValue | null>(
  null,
);

export function Theme2CartToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Theme2CartToast[]>([]);
  const idRef = useRef(0);
  const timersRef = useRef<Map<number, ReturnType<typeof setTimeout>>>(
    new Map(),
  );

  const removeToast = useCallback((id: number) => {
    const timer = timersRef.current.get(id);
    if (timer) {
      clearTimeout(timer);
      timersRef.current.delete(id);
    }

    setToasts((current) => current.filter((toast) => toast.id !== id));
  }, []);

  const showAddedToCart = useCallback(
    (productName: string) => {
      idRef.current += 1;
      const id = idRef.current;
      const safeName = productName.trim() || "Item";

      setToasts((current) => {
        const next = [
          ...current,
          {
            id,
            title: "Added to cart",
            message: `${safeName} has been added to your cart.`,
          },
        ];

        if (next.length <= MAX_TOASTS) return next;

        const [oldestToast] = next;
        if (oldestToast) {
          const oldestTimer = timersRef.current.get(oldestToast.id);
          if (oldestTimer) {
            clearTimeout(oldestTimer);
            timersRef.current.delete(oldestToast.id);
          }
        }

        return next.slice(-MAX_TOASTS);
      });

      const timer = setTimeout(() => {
        removeToast(id);
      }, TOAST_DURATION);
      timersRef.current.set(id, timer);
    },
    [removeToast],
  );

  useEffect(() => {
    return () => {
      timersRef.current.forEach((timer) => clearTimeout(timer));
      timersRef.current.clear();
    };
  }, []);

  return (
    <Theme2CartToastContext.Provider value={{ showAddedToCart }}>
      {children}
      <div className="pointer-events-none fixed right-4 top-20 z-[120] flex w-[min(92vw,380px)] flex-col gap-3">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className="pointer-events-auto rounded-xl border border-[#cad1ce] bg-[#f7f9f7]/95 px-4 py-3 shadow-[0_20px_40px_-24px_rgba(41,59,53,0.36)] backdrop-blur"
            role="status"
            aria-live="polite"
          >
            <div className="flex items-start gap-3">
              <span className="mt-0.5 inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#dce6e2] text-[#2f4a45]">
                <CheckCircle2 size={16} />
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-[#2f403d]">{toast.title}</p>
                <p className="line-clamp-2 text-sm text-[#556864]">{toast.message}</p>
              </div>
              <button
                type="button"
                onClick={() => removeToast(toast.id)}
                className="inline-flex h-7 w-7 items-center justify-center rounded-full text-[#5f726e] transition hover:bg-[#e6ece9] hover:text-[#2f403d]"
                aria-label="Close notification"
              >
                <X size={14} />
              </button>
            </div>
          </div>
        ))}
      </div>
    </Theme2CartToastContext.Provider>
  );
}

export function useTheme2CartToast() {
  const context = useContext(Theme2CartToastContext);

  if (!context) {
    return {
      showAddedToCart: () => {},
    };
  }

  return context;
}
