"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
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
  onReady?: () => void;
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
  onReady,
  trigger = true,
}: HelcimFormProps) {
  const [loading, setLoading] = useState(true);
  const [isIframeReady, setIsIframeReady] = useState(false);
  const [checkoutToken, setCheckoutToken] = useState<string | null>(null);
  const hasInitialized = useRef(false);

  // Reset initialization if trigger becomes false (user switched providers)
  useEffect(() => {
    if (!trigger) {
      hasInitialized.current = false;
      setIsIframeReady(false);
    }
  }, [trigger]);

  // Memoize data to prevent re-initialization loops
  const initData = useMemo(() => JSON.stringify({ items, email, shipping }), [items, email, shipping]);

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
  }, [onError]);

  const initSession = useCallback(async () => {
    if (!trigger || hasInitialized.current) return;
    
    hasInitialized.current = true;
    setLoading(true);

    try {
      const response = await fetch(`/api/store/${slug}/payment/helcim/initialize`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: initData,
      });
      
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Failed to initialize Helcim payment.");
      setCheckoutToken(data.checkoutToken);
    } catch (err: any) {
      console.error("Helcim Init Error:", err);
      onError(err.message);
      hasInitialized.current = false; // Allow retry on error
    } finally {
      setLoading(false);
    }
  }, [slug, initData, trigger, onError]);

  useEffect(() => {
    initSession();
  }, [initSession]);

  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      try {
        const data = typeof event.data === "string" ? JSON.parse(event.data) : event.data;
        
        // HelcimPay.js SUCCESS message handling
        const identifier = `helcim-pay-js-${checkoutToken}`;
        
        // Deep search check for APPROVED status
        const findStatus = (obj: any): string | undefined => {
          if (!obj || typeof obj !== "object") return undefined;
          if (obj.status === "APPROVED" || obj.eventStatus === "SUCCESS" || obj.event === "SUCCESS") return "APPROVED";
          return findStatus(obj.data) || findStatus(obj.eventMessage ? JSON.parse(obj.eventMessage) : null);
        };

        const findId = (obj: any): string | undefined => {
          if (!obj || typeof obj !== "object") return undefined;
          if (obj.transactionId || obj.cardToken) return obj.transactionId || obj.cardToken;
          return findId(obj.data) || findId(obj.eventMessage ? JSON.parse(obj.eventMessage) : null);
        };

        const status = findStatus(data);
        if (status === "APPROVED") {
          const transactionId = findId(data);
          if (transactionId) {
            onSuccess(transactionId);
          }
        }

        // Handle READY event to hide loader
        if (data.eventStatus === "READY" || data.event === "READY") {
          setIsIframeReady(true);
          onReady?.();
        }

        // Handle errors
        if (data.eventStatus === "ERROR" || data.status === "DECLINED" || data.event === "ERROR") {
          onError(data.eventMessage || "Transaction declined.");
        }
      } catch (e) {
        // Not a Helcim message
      }
    };

    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, [checkoutToken, onSuccess, onError]);

  useEffect(() => {
    if (checkoutToken && (window as any).appendHelcimPayIframe) {
      const container = document.getElementById("helcim-pay-container");
      if (container) {
        container.innerHTML = "";
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
        ) : (loading || !isIframeReady) && (
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
