import { useEffect, useRef, useState, useCallback } from "react";
import {
  CvcWidget,
  PaymentElement,
  useElements,
  type PaymentElementHandle,
  type PaymentMethod,
} from "@juspay-tech/capacitor-react-hyperswitch";
import { FormLayout } from "./FormLayout";

const SERVER_URL =
  typeof window !== "undefined" &&
  (window as any).Capacitor?.getPlatform() === "android"
    ? "http://10.0.2.2:5252"
    : "http://localhost:5252";

export type SharedProps = {
  isAmountScreen: boolean;
  setIsAmountScreen: (v: boolean) => void;
  amount: number;
  setAmount: (v: number) => void;
  onClose: () => void;
  paymentId: string | null;
};

export function HyperContent(props: SharedProps) {
  const { amount, paymentId } = props;

  // Use the elements hook for confirmPayment and updateIntent
  const element = useElements();

  // Fetch last used payment method
  const [lastUsed, setLastUsed] = useState<PaymentMethod | null>(null);
  const [loadingSaved, setLoadingSaved] = useState(true);
  const hasFetched = useRef(false);

  useEffect(() => {
    if (!element.elements || hasFetched.current) {
      if (!element.elements) setLoadingSaved(false);
      return;
    }

    hasFetched.current = true;
    let cancelled = false;

    (async () => {
      if (!element.elements) return;
      try {
        setLoadingSaved(true);
        const handler = await element.elements.getCustomerSavedPaymentMethods();
        const result = await handler.getCustomerLastUsedPaymentMethodData();
        console.log("[Example] Last used payment method:", JSON.stringify(result, null, 2));
        if (!cancelled) {
          setLastUsed(result.data);
        }
      } catch (err) {
        console.error("[Example] Failed to fetch last used payment method:", err);
      } finally {
        if (!cancelled) {
          setLoadingSaved(false);
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [element.elements]);

  // PaymentElement ref
  const paymentRef = useRef<PaymentElementHandle>(null);

  // Confirm payment using the element hook
  const handleConfirmPayment = useCallback(async () => {
    const result = await element.confirmPayment(paymentRef, {
      confirmParams: { return_url: typeof window !== "undefined" ? window.location.origin : "" },
    });
    return result;
  }, [element]);

  // Update intent when amount changes
  const prevAmountRef = useRef(amount);
  const debounceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    // Only update if amount actually changed and we have a paymentId
    if (amount === prevAmountRef.current || !paymentId) {
      return;
    }

    // Clear existing timer
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    // Debounce the updateIntent call
    debounceTimerRef.current = setTimeout(async () => {
      try {
        console.log("[Example] Updating intent for amount:", amount);
        await element.updateIntent(async () => {
          const res = await fetch(`${SERVER_URL}/update-payment`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              paymentId,
              amount: amount * 100, // Convert to cents
              currency: "CAD",
            }),
          });
          if (!res.ok) throw new Error(`HTTP ${res.status}`);
          const data = await res.json();
          return data.sdkAuthorization;
        });
        prevAmountRef.current = amount;
        console.log("[Example] Intent updated successfully");
      } catch (err) {
        console.error("[Example] Failed to update intent:", err);
      }
    }, 500);

    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, [amount, paymentId, element]);

  return (
    <FormLayout
      {...props}
      cvcSlot={
        <CvcWidget
          onReady={() => console.log("[Example] CvcWidget ready")}
          style={{ minHeight: 50 }}
        />
      }
      paymentSlot={
        <PaymentElement
          ref={paymentRef}
          onReady={() => console.log("[Example] PaymentElement ready")}
        />
      }
      lastUsed={lastUsed}
      methodsSession={null}
      loadingSaved={loadingSaved}
      canSubmit={!!element.elements}
      onConfirmPayment={handleConfirmPayment}
    />
  );
}
