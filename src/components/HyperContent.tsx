import { useEffect, useState } from "react";
import {
  CardCVCElement,
  PaymentElement,
  useWidgets,
  usePaymentSession,
  type CustomerLastUsedPaymentMethod,
  type CustomerSavedPaymentMethodsSession,
} from "@juspay-tech/react-hyper-js";
import { FormLayout } from "./FormLayout";

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
  const paymentSession = usePaymentSession();
  const widgets = useWidgets();
  const [lastUsed, setLastUsed] = useState<CustomerLastUsedPaymentMethod | null | undefined>(null);
  const [methodsSession, setMethodsSession] =
    useState<CustomerSavedPaymentMethodsSession | null>(null);
  const [loadingSaved, setLoadingSaved] = useState(true);

  useEffect(() => {
    if (!paymentSession) return;
    let cancelled = false;
    (async () => {
      try {
        const session = await paymentSession.getCustomerSavedPaymentMethods();
        if (cancelled) return;
        setMethodsSession(session);
        const data = session.getCustomerLastUsedPaymentMethodData();
        setLastUsed(data);
      } catch {
        setLastUsed(undefined);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [paymentSession]);

  useEffect(() => {
    if (lastUsed != null) setLoadingSaved(false);
  }, [lastUsed]);

  const updateAmount =
    widgets && paymentId
      ? 
      async () => {
          await widgets.updateIntent(async () => {
            const response = await fetch("/api/update-payment", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ paymentId, amount: amount * 100 }),
            });
            const data = await response.json();
            if (!response.ok) throw new Error(data.error ?? "Update failed");
            return { sdkAuthorization: data.sdkAuthorization };
          });
        }
      : null;

  return (
    <FormLayout
      {...props}
      cvcSlot={
        <CardCVCElement
          id={"card-cvc-element"}
          options={{ placeholder: "123" }}
        />
      }
      paymentSlot={
        <PaymentElement
          options={{
            layout: {
              type: "accordion",
              radios: true,
              maxAccordionItems: 2,
              spacedAccordionItems: true,
              savedMethodCustomization: {
                hideCardExpiry: true,
                maxItems: 2,
                groupingBehavior: { displayInSeparateScreen: false },
              },
            },
            wallets: { walletReturnUrl: window.location.origin },
            branding: "never",
          }}
        />
      }
      lastUsed={lastUsed}
      methodsSession={methodsSession}
      loadingSaved={loadingSaved}
      canSubmit={!!paymentSession}
      amount={amount}
      updateAmount={updateAmount}
    />
  );
}
