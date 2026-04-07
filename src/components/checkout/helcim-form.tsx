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
  trigger?: boolean;
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
  trigger = true,
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

    if (!trigger) return;

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
      try {
        const data = typeof event.data === "string" ? JSON.parse(event.data) : event.data;
        
        // Handle SUCCESS
        if (data.eventStatus === "SUCCESS" || data.status === "APPROVED" || data.event === "SUCCESS") {
          let transactionId = data.transactionId || data.cardToken;
          
          // Re-parse eventMessage if available (this contains the real transactionId for purchases)
          if (data.eventMessage) {
            try {
              const messageJson = JSON.parse(data.eventMessage);
              transactionId = messageJson.data?.transactionId || transactionId;
            } catch (e) {
              console.error("Failed to parse Helcim eventMessage", e);
            }
          }
          
          if (transactionId) {
            onSuccess(transactionId);
          }
        } 
        
        // Handle errors or close
        if (data.eventStatus === "ERROR" || data.status === "DECLINED" || data.event === "ERROR") {
          onError(data.eventMessage || "Transaction declined.");
        }
      } catch (e) {
        // Not a valid JSON or from another source
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
        {!trigger ? (
          <div className="flex flex-col h-64 items-center justify-center space-y-4 py-20 px-6 text-center">
             <div className="w-12 h-12 rounded-full bg-slate-50 flex items-center justify-center">
                <svg className="w-6 h-6 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
             </div>
             <div className="space-y-1">
                <p className="text-sm font-semibold text-slate-900">Secure Helcim Payment</p>
                <p className="text-xs text-slate-500">Click the "Pay Now" button to load the secure payment form.</p>
             </div>
          </div>
        ) : loading && (
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
