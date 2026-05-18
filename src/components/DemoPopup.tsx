import { useEffect, useRef, useState } from "react";
import { loadHyper } from "@juspay-tech/capacitor-hyperswitch";
// import { loadHyper } from "../utils/loadHyper";
import { HyperElements } from "@juspay-tech/capacitor-react-hyperswitch";
import { FormLayout } from "./FormLayout";
import { HyperContent, type SharedProps } from "./HyperContent";
import { Capacitor } from "@capacitor/core";

type DemoPopupProps = {
  onClose: () => void;
};

const PUBLISHABLE_KEY =
  process.env.NEXT_PUBLIC_HYPERSWITCH_PUBLISHABLE_KEY ?? "";
const PROFILE_ID = process.env.NEXT_PUBLIC_PROFILE_ID ?? "";

const hyperPromise =
  typeof window !== "undefined" && PUBLISHABLE_KEY
    ? loadHyper({ publishableKey: PUBLISHABLE_KEY, profileId: PROFILE_ID })
    : null;

export default function DemoPopup({ onClose }: DemoPopupProps) {
  const [isAmountScreen, setIsAmountScreen] = useState(true);
  const [amount, setAmount] = useState(5);
  const [sdkAuthorization, setSdkAuthorization] = useState<string | null>(null);
  const [paymentId, setPaymentId] = useState<string | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const firstRenderRef = useRef(true);

  useEffect(() => {
    if (firstRenderRef.current) {
      firstRenderRef.current = false;
      return;
    }
    setIsTransitioning(true);
    const id = setTimeout(() => setIsTransitioning(false), 300);
    return () => clearTimeout(id);
  }, [isAmountScreen]);

  useEffect(() => {
    let cancelled = false;
    const serverUrl = "http://10.100.13.231:5252";
    fetch(`${serverUrl}/create-payment-intent`, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
      // body: JSON.stringify({ amount: 500, currency: "USD" }),
    })
      .then((r) => r.json())
      .then((data) => {
        if (cancelled) return;
        if (data.sdkAuthorization) {
          setSdkAuthorization(data.sdkAuthorization);
          setPaymentId(data.paymentId);
        } else {
          setLoadError(data.error ?? "Failed to load payment");
        }
      })
      .catch((err) => !cancelled && setLoadError(err.message));
    return () => {
      cancelled = true;
    };
  }, []);

  const sharedProps: SharedProps = {
    isAmountScreen,
    setIsAmountScreen,
    amount,
    setAmount,
    onClose,
    paymentId,
  };

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/40"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative flex w-full max-w-md max-h-[90vh] flex-col flex-end overflow-y-auto rounded-t-3xl bg-gradient-to-b from-zinc-100 to-emerald-50 shadow-2xl"
      >
        {isTransitioning && (
          <div className="absolute inset-0 z-10 flex items-center justify-center bg-white/60 backdrop-blur-sm">
            <div className="h-10 w-10 animate-spin rounded-full border-4 border-emerald-600 border-t-transparent" />
          </div>
        )}
        {!PUBLISHABLE_KEY && (
          <p className="px-6 pt-4 text-center text-sm text-red-600">
            Set NEXT_PUBLIC_HYPERSWITCH_PUBLISHABLE_KEY to enable payments.
          </p>
        )}

        {loadError && (
          <p className="px-6 pt-4 text-center text-sm text-red-600">
            {loadError}
          </p>
        )}

        {hyperPromise && sdkAuthorization ? (
          <HyperElements
            hyper={hyperPromise as any}
            options={{
              sdkAuthorization,
            }}
          >
            <HyperContent {...sharedProps} />
          </HyperElements>
        ) : (
          <FormLayout
            {...sharedProps}
            cvcSlot={
              <div className="flex h-full w-full items-end px-3 pb-2 text-sm text-zinc-300">
                CVC
              </div>
            }
            paymentSlot={
              <div className="flex h-full items-center justify-center text-sm text-zinc-400">
                Loading payment methods…
              </div>
            }
            lastUsed={null}
            methodsSession={null}
            loadingSaved={true}
            canSubmit={false}
            isCvcComplete={false}
            formStatus={null}
            amount={amount}
            updateAmount={null}
            widgets={null}
          />
        )}
      </div>
    </div>
  );
}
