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

type Theme1CartToast = {
  id: number;
  title: string;
  message: string;
};

type Theme1CartToastContextValue = {
  showAddedToCart: (productName: string) => void;
};

const TOAST_DURATION = 3000;
const MAX_TOASTS = 3;

const Theme1CartToastContext = createContext<Theme1CartToastContextValue | null>(
  null,
);

export function Theme1CartToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Theme1CartToast[]>([]);
  const idRef = useRef(0);
  const timersRef = useRef<Map<number, ReturnType<typeof setTimeout>>>(new Map());

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
      const toast: Theme1CartToast = {
        id,
        title: "Added to cart",
        message: `${safeName} has been added to your cart.`,
      };

      setToasts((current) => {
        const next = [...current, toast];
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
    <Theme1CartToastContext.Provider value={{ showAddedToCart }}>
      {children}
      <div className="pointer-events-none fixed right-4 top-20 z-[120] flex w-[min(92vw,380px)] flex-col gap-3">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className="pointer-events-auto Theme1-cart-toast-enter rounded-2xl border border-slate-200 bg-white/95 px-4 py-3 shadow-[0_20px_40px_-22px_rgba(15,23,42,0.28)] backdrop-blur"
            role="status"
            aria-live="polite"
          >
            <div className="flex items-start gap-3">
              <span className="mt-0.5 inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#e8f7ef] text-emerald-700">
                <CheckCircle2 size={16} />
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-slate-900">{toast.title}</p>
                <p className="line-clamp-2 text-sm text-slate-600">{toast.message}</p>
              </div>
              <button
                type="button"
                onClick={() => removeToast(toast.id)}
                className="inline-flex h-7 w-7 items-center justify-center rounded-full text-slate-500 transition hover:bg-slate-100 hover:text-slate-900"
                aria-label="Close notification"
              >
                <X size={14} />
              </button>
            </div>
          </div>
        ))}
      </div>

      <style jsx>{`
        .Theme1-cart-toast-enter {
          animation: Theme1-cart-toast-enter 260ms ease-out;
        }

        @keyframes Theme1-cart-toast-enter {
          from {
            opacity: 0;
            transform: translateY(-12px) scale(0.97);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }
      `}</style>
    </Theme1CartToastContext.Provider>
  );
}

export function useTheme1CartToast() {
  const context = useContext(Theme1CartToastContext);

  if (!context) {
    return {
      showAddedToCart: () => {},
    };
  }

  return context;
}




