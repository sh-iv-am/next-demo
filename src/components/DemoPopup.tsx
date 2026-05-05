import { useEffect, useRef, useState } from "react";
import { Hyperswitch } from "@juspay-tech/capacitor-hyperswitch";
import { HyperElements } from "@juspay-tech/capacitor-react-hyperswitch";
import { FormLayout } from "./FormLayout";
import { HyperContent, type SharedProps } from "./HyperContent";

type DemoPopupProps = {
  onClose: () => void;
};

const PUBLISHABLE_KEY =
  process.env.NEXT_PUBLIC_HYPERSWITCH_PUBLISHABLE_KEY ?? "";
const PROFILE_ID = process.env.NEXT_PUBLIC_PROFILE_ID ?? "";

// Create Hyperswitch session - works directly with HyperElements
const hyperSession =
  typeof window !== "undefined" && PUBLISHABLE_KEY
    ? Hyperswitch.init({
        publishableKey: PUBLISHABLE_KEY,
        profileId: PROFILE_ID,
      })
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
    const serverUrl = process.env.NEXT_PUBLIC_SERVER_URL ?? "http://localhost:5252";
    fetch(`${serverUrl}/create-payment-intent`, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
      // body: JSON.stringify({ amount: 500, currency: "CAD" }),
    })
      .then((r) => r.json())
      .then(async (data) => {
        if (cancelled) return;
        if (data.sdkAuthorization) {
          hyperSession?.initPaymentSession({ sdkAuthorization: data.sdkAuthorization });
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
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative flex w-full max-w-md max-h-[90vh] flex-col overflow-y-auto rounded-3xl bg-gradient-to-b from-zinc-100 to-emerald-50 shadow-2xl"
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
          <p className="px-6 pt-4 text-center text-sm text-red-600">{loadError}</p>
        )}

        {hyperSession && sdkAuthorization ? (
          <HyperElements
            hyper={hyperSession}
            options={{
              sdkAuthorization,
            }}
          >
            <HyperContent {...sharedProps} />
          </HyperElements>
        ) : (
          <div className="flex h-full items-center p-20 justify-center text-sm text-zinc-400">
            Loading payment methods…
          </div>
        )}
      </div>
    </div>
  );
}
