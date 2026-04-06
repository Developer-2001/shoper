"use client";

import { useEffect, useState } from "react";
import { Spinner } from "@/components/admin/ui/loader";

interface HelcimFormProps {
  slug: string;
  accountId: string;
  amount: number;
  currency: string;
  email: string;
  shipping: any;
  items: any[];
  onSuccess: (transactionId: string) => void;
  onError: (error: string) => void;
}

declare global {
  interface Window {
    helcim: any;
  }
}

export function HelcimForm({
  slug,
  accountId,
  amount,
  currency,
  email,
  shipping,
  items,
  onSuccess,
  onError,
}: HelcimFormProps) {
  const [loading, setLoading] = useState(true);
  const [checkoutToken, setCheckoutToken] = useState<string | null>(null);

  useEffect(() => {
    const scriptId = "helcim-pay-script";
    const existingScript = document.getElementById(scriptId);

    if (!existingScript) {
      const script = document.createElement("script");
      script.id = scriptId;
      script.src = "https://secure.helcim.app/helcim-pay/services/start.js";
      script.async = true;
      script.onload = () => console.log("HelcimPay script loaded.");
      script.onerror = () => onError("Failed to load Helcim payment service.");
      document.body.appendChild(script);
    }

    // Initialize HelcimPay Session
    async function initSession() {
      try {
        const response = await fetch(`/api/store/${slug}/payment/helcim/initialize`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ items, email, shipping }),
        });

        if (!response.ok) {
          const data = await response.json();
          throw new Error(data.error || "Failed to initialize Helcim session.");
        }

        const { checkoutToken } = await response.json();
        setCheckoutToken(checkoutToken);
      } catch (err: any) {
        console.error(err);
        onError(err.message);
      } finally {
        setLoading(false);
      }
    }

    initSession();

    // Listen for HelcimPay events
    const handleMessage = (event: MessageEvent) => {
      // HelcimPay sends messages via postMessage
      if (typeof event.data === "string") {
        try {
          const data = JSON.parse(event.data);
          if (data.event === "SUCCESS" || data.status === "APPROVED") {
            onSuccess(data.transactionId || data.cardToken);
          } else if (data.event === "CLOSE" || data.status === "DECLINED") {
            // Handle close or decline if needed
          }
        } catch (e) {
          // Not a JSON message or not from HelcimPay
        }
      }
    };

    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, [slug, items, email, shipping, onError, onSuccess]);

  useEffect(() => {
    if (checkoutToken && (window as any).appendHelcimPayIframe) {
      const container = document.getElementById("helcim-pay-container");
      if (container) {
        container.innerHTML = ""; // Clear loader
        (window as any).appendHelcimPayIframe(checkoutToken, "helcim-pay-container");
      }
    }
  }, [checkoutToken]);

  return (
    <div className="space-y-4">
      <div 
        id="helcim-pay-container" 
        className="min-h-[450px] rounded-2xl border border-slate-200 bg-white overflow-hidden shadow-sm"
      >
        {loading && (
          <div className="flex flex-col h-64 items-center justify-center space-y-4 py-20">
            <Spinner size={40} className="text-slate-900" />
            <p className="text-sm font-medium text-slate-500">Initializing secure payment...</p>
          </div>
        )}
      </div>
      <p className="px-2 text-center text-[10px] text-slate-400">
        All transactions are secure and encrypted by Helcim.
      </p>
    </div>
  );
}
