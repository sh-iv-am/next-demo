import { useEffect, useState, useRef } from "react";
import {
  CardCVCElement,
  PaymentElement,
  useWidgets,
  usePaymentSession,
  type CustomerLastUsedPaymentMethod,
  type CustomerSavedPaymentMethodsSession,
  type PaymentElementHandle,
} from "@juspay-tech/capacitor-react-hyperswitch";
import { FormLayout } from "./FormLayout";
import { Capacitor } from "@capacitor/core";

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
  const [lastUsed, setLastUsed] = useState<
    CustomerLastUsedPaymentMethod | null | undefined
  >(null);
  const [methodsSession, setMethodsSession] =
    useState<CustomerSavedPaymentMethodsSession | null>(null);
  const [loadingSaved, setLoadingSaved] = useState(true);

  const paymentRef = useRef<PaymentElementHandle>(null);

  useEffect(() => {
    if (!paymentSession) return;
    let cancelled = false;
    (async () => {
      try {
        const session = await paymentSession.getCustomerSavedPaymentMethods({hiddenPaymentMethods: ["paypal", "google_pay", "apple_pay"]});
        if (cancelled) return;
        setMethodsSession(session);
        const data = await session.getCustomerLastUsedPaymentMethodData();
        console.log(data);
        setLastUsed(data);
        setLoadingSaved(false);
      } catch (ex) {
        setLastUsed(undefined);
        setLoadingSaved(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [paymentSession]);

  const updateAmount =
    widgets && paymentId
      ? async () => {
          await widgets.updateIntent(async () => {
            const serverUrl =
              Capacitor.getPlatform() === "android"
                ? "http://10.0.2.2:5252"
                : "http://localhost:5252";
            const response = await fetch(`${serverUrl}/update-payment`, {
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
        lastUsed?.payment_method == "card" ? (
          <CardCVCElement
            id={"card-cvc-element"}
            options={{
              placeholder: "123",
              appearance: {
                shapes: {
                  borderRadius: 0,
                  borderWidth: 0,
                  shadow: {
                    blurRadius: 0,
                    intensity: 0,
                  },
                },
              },
              cvcIcon: "hidden"
            }}
            onReady={() => console.log("[Example] CvcWidget ready")}
            style={{ minHeight: 50 }}
          />
        ) : null
      }
      paymentSlot={
        <PaymentElement
          id="payment-element-id"
          onPaymentResult={(data) => {
            props.onClose();
            setTimeout(() => {
              alert(`Type: ${data?.type}\nMessage: ${data?.message}`);
            }, 0);
          }}
          options={{
            paymentMethodLayout: {
              type: "accordion",
              radios: false,
              maxAccordionItems:2,
              defaultCollapsed: true,
              spacedAccordionItems: true,
              savedMethodCustomization: {
                hideCardExpiry: true,
                defaultCollapsed: false,
                groupingBehavior: { displayInSeparateScreen: false },
                hiddenPaymentMethods: ["paypal", "google_pay", "apple_pay"]
              },
            },
            appearance: {
              theme: "Minimal",
              primaryButton: {
                height: 50.
              }
            },
          }}
          ref={paymentRef}
          onReady={() => console.log("[Example] PaymentElement ready")}
          style={{ width: "100%", height: "100%" }}
        />
      }
      lastUsed={lastUsed}
      methodsSession={methodsSession}
      loadingSaved={loadingSaved}
      canSubmit={!!paymentSession}
      amount={amount}
      updateAmount={updateAmount}
      widgets={widgets}
    />
  );
}
