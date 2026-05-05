import { useState, useEffect } from "react";
import type { ReactNode } from "react";
import type { PaymentResult } from "@juspay-tech/capacitor-react-hyperswitch";
import {
  BackIcon,
  CardIcon,
  ChevronDownIcon,
  CloseIcon,
  ShieldIcon,
} from "./icons";

export const AMOUNTS = [5, 10, 25, 50];

export type FormLayoutProps = {
  isAmountScreen: boolean;
  setIsAmountScreen: (v: boolean) => void;
  amount: number;
  setAmount: (v: number) => void;
  onClose: () => void;
  cvcSlot: ReactNode;
  paymentSlot: ReactNode;
  lastUsed: any | null | undefined;
  methodsSession: any | null;
  loadingSaved: boolean;
  canSubmit: boolean;
  /** Callback to confirm payment using element.confirmPayment(ref) */
  onConfirmPayment?: () => Promise<PaymentResult>;
};

function formatCardLabel(method: // CustomerLastUsedPaymentMethod 
  any | null): string {
  if (!method) return "Add payment method";
  const card = method.card as any;
  if (card) {
    const brand = card.scheme ?? card.card_network ?? card.card_brand ?? "Card";
    const last4 = card.last4Digits ?? card.last4 ?? card.last4_digits ?? "••••";
    return `${brand} •••• ${last4}`;
  }
  return method.payment_method_type ?? method.payment_method ?? "Saved method";
}

export function FormLayout({
  isAmountScreen,
  setIsAmountScreen,
  amount,
  setAmount,
  onClose,
  cvcSlot,
  paymentSlot,
  lastUsed,
  methodsSession,
  loadingSaved,
  canSubmit,
  onConfirmPayment,
}: FormLayoutProps) {
  const [message, setMessage] = useState("");
  const [amountVal, setAmountVal] = useState(amount);
  const [isConfirming, setIsConfirming] = useState(false);

  const handleDeposit = async () => {
    setMessage("");

    // If on the amount screen with saved methods, use the saved method flow
    if (isAmountScreen) {
      if (methodsSession) {
        // Saved payment method flow would go here
        // For now, navigate to payment method selection
        setIsAmountScreen(false);
      }
      return;
    }

    // Use the PaymentElement confirmation via the hook
    if (onConfirmPayment) {
      setIsConfirming(true);
      try {
        const result = await onConfirmPayment();

        if (result.type === "failed") {
          setMessage(result.message ?? "Payment failed");
        } else if (result.type === "canceled") {
          setMessage("Payment was canceled");
        } else {
          setMessage(`Payment ${result.type}`);
        }
      } catch (err) {
        const errorMsg = err instanceof Error ? err.message : "Payment error";
        setMessage(errorMsg);
      } finally {
        setIsConfirming(false);
      }
    }
  };

  // Sync amountVal with amount prop
  useEffect(() => {
    setAmountVal(amount);
  }, [amount]);

  // Handle amount selection
  const handleAmountSelect = (value: number) => {
    setAmount(value);
  };

  // Handle manual amount input blur
  const handleAmountBlur = () => {
    setAmount(amountVal);
  };

  useEffect(() => {
    setAmountVal(amount);
  }, [amount])

  return (
    <>
      <div className="relative px-6 pt-6 pb-2">
        {!isAmountScreen && (
          <button
            onClick={() => setIsAmountScreen(true)}
            className="absolute left-5 top-6 text-zinc-500 hover:text-zinc-800"
            aria-label="Back"
          >
            <BackIcon />
          </button>
        )}
        <h2 className="text-center text-2xl font-bold text-zinc-900">
          {isAmountScreen ? "Deposit Amount" : "Select Payment Method"}
        </h2>
        <button
          onClick={onClose}
          className="absolute right-5 top-6 text-zinc-500 hover:text-zinc-800"
          aria-label="Close"
        >
          <CloseIcon />
        </button>
        {isAmountScreen && (
          <p className="mt-1 text-center text-sm text-zinc-600">
            Balance: <span className="font-semibold text-zinc-900">$65.15</span>
          </p>
        )}
      </div>

      {isAmountScreen && (
        <div className="px-6 pt-4">
          {loadingSaved ? (
            <div className="h-14 animate-pulse rounded-xl bg-black/70" />
          ) : lastUsed && !lastUsed.error ? (
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setIsAmountScreen(false)}
                className="flex flex-1 items-center justify-between rounded-xl bg-white px-4 py-3 shadow-sm hover:bg-zinc-50"
              >
                <div className="flex items-center gap-3">
                  <CardIcon />
                  <span className="text-sm font-medium text-zinc-900">
                    {formatCardLabel(lastUsed)}
                  </span>
                </div>
                <ChevronDownIcon />
              </button>
              <div className="w-24 h-14 rounded-xl bg-white shadow-sm flex flex-col-reverse overflow-y-auto">
                {cvcSlot}
              </div>
            </div>
          ) : null}
        </div>
      )}

      {!isAmountScreen && (
        <div className="flex-1 px-6 pt-4 pb-2 flex flex-col min-h-[400px]">
          <div className="w-full flex-1">{paymentSlot}</div>
        </div>
      )}

      {isAmountScreen && (
        <>
          <div className="flex flex-col items-center px-6 pt-6 pb-2">
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-semibold text-zinc-900">CA$</span>
              <div className="bg-white p-2 rounded-lg">
                <span
                  className="text-6xl font-semibold text-zinc-900 focus:outline-none"
                  contentEditable="true"
                  onChange={(e) => {
                    const val = parseInt(e.target.textContent, 10);
                    setAmountVal(isNaN(val) ? 0 : val);
                  }}
                  onBlur={handleAmountBlur}
                >{amountVal}</span>
              </div>
            </div>
            <p className="mt-3 text-sm text-zinc-600">Minimum deposit is CA$1</p>
            <button className="mt-2 text-sm font-semibold text-emerald-600 hover:text-emerald-700">
              Manage Deposit limits
            </button>
          </div>

          <div className="grid grid-cols-4 gap-3 px-6 pt-2 pb-6">
            {AMOUNTS.map((value) => {
              const selected = value === amount;
              return (
                <button
                  key={value}
                  onClick={() => handleAmountSelect(value)}
                  className={
                    selected
                      ? "rounded-xl bg-emerald-600 py-3 text-sm font-bold text-white shadow"
                      : "rounded-xl bg-white py-3 text-sm font-semibold text-zinc-900 shadow-sm"
                  }
                >
                  CA${value}
                </button>
              );
            })}
          </div>
        </>
      )}

      <div className="px-6 pb-4 pt-4">
        {message && (
          <p className="mb-3 text-center text-sm text-red-600">{message}</p>
        )}
        <button
          disabled={!canSubmit || isConfirming}
          onClick={handleDeposit}
          className="w-full rounded-full bg-emerald-600 py-4 text-base font-bold text-white shadow-lg transition-colors hover:bg-emerald-700 disabled:opacity-60"
        >
          {isConfirming ? "Processing…" : `Deposit $${amount}`}
        </button>
        {isAmountScreen ? (
          <button
            onClick={onClose}
            className="mt-3 w-full text-sm text-zinc-500 hover:text-zinc-800"
          >
            Cancel
          </button>
        ) : (
          <div className="mt-3 flex items-center justify-center gap-2 text-xs text-zinc-500">
            <ShieldIcon />
            Your payment is secure &amp; encrypted
          </div>
        )}
      </div>
    </>
  );
}
