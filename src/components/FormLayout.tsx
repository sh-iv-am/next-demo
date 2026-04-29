import { useState } from "react";
import type { ReactNode } from "react";
import {
  useHyper,
  useWidgets,
  type CustomerLastUsedPaymentMethod,
  type CustomerSavedPaymentMethodsSession,
} from "@juspay-tech/react-hyper-js";
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
  lastUsed: CustomerLastUsedPaymentMethod | null | undefined;
  methodsSession: CustomerSavedPaymentMethodsSession | null;
  loadingSaved: boolean;
  canSubmit: boolean;
  updateAmount: (() => Promise<void>) | null;
};

function formatCardLabel(method: CustomerLastUsedPaymentMethod | null): string {
  if (!method) return "Add payment method";
  const card = method.card;
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
  updateAmount,
}: FormLayoutProps) {
  const hyper = useHyper();
  const widgets = useWidgets();
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleDeposit = async () => {
    setMessage("");
    setIsLoading(true);

    try {
      if (updateAmount) await updateAmount();
    } catch (err) {
      setMessage(err instanceof Error ? err.message : "Failed to update amount");
      setIsLoading(false);
      return;
    }

    if (isAmountScreen && (!lastUsed || lastUsed.error)) {
      setIsAmountScreen(false);
      setIsLoading(false);
      return;
    }
    if (isAmountScreen) {
      if (!methodsSession) return;
      const { error, status } = await methodsSession.confirmWithLastUsedPaymentMethod({
        confirmParams: {
          return_url: window.location.origin,
        },
        redirect: "always",
        id: "card-cvc-element",
      });
      if (error) setMessage(error.message ?? "Payment error");
      if (status) setMessage(`Payment status: ${status}`);
      setIsLoading(false);
      return;
    }

    if (!hyper || !widgets) return;

    const { error, status } = await hyper.confirmPayment({
      widgets,
      confirmParams: { return_url: window.location.origin },
      redirect: "always",
    });

    if (error) {
      if (error.type === "card_error" || error.type === "validation_error") {
        setMessage(error.message ?? "Payment error");
      } else {
        setMessage(error.message ?? "An unexpected error occurred.");
      }
    }
    if (status) setMessage(`Payment status: ${status}`);
    setIsLoading(false);
  };

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
        <div className="px-6 pt-4 pb-2">
          <div className="w-full min-h-[380px]">{paymentSlot}</div>
        </div>
      )}

      {isAmountScreen && (
        <>
          <div className="flex flex-col items-center px-6 pt-6 pb-2">
            <div className="flex items-baseline">
              <span className="text-2xl font-semibold text-zinc-900">CA$</span>
              <span className="text-6xl font-semibold text-zinc-900">{amount}</span>
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
                  onClick={() => setAmount(value)}
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
          disabled={!canSubmit || isLoading}
          onClick={handleDeposit}
          className="w-full rounded-full bg-emerald-600 py-4 text-base font-bold text-white shadow-lg transition-colors hover:bg-emerald-700 disabled:opacity-60"
        >
          {isLoading ? "Processing…" : `Deposit $${amount}`}
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
