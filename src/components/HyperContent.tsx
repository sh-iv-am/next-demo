import { useEffect, useState, useRef } from "react";
import {
  CardCVCElement,
  PaymentElement,
  useWidgets,
  usePaymentSession,
  type CustomerLastUsedPaymentMethod,
  type CustomerSavedPaymentMethodsSession,
  type PaymentElementHandle,
  PaymentEventData,
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
  const [isCvcComplete, setIsCvcComplete] = useState(false);
  const [formStatus, setFormStatus] = useState<string | null>(null);

  const paymentRef = useRef<PaymentElementHandle>(null);

  useEffect(() => {
    if (!paymentSession) return;
    let cancelled = false;
    (async () => {
      try {
        const session = await paymentSession.getCustomerSavedPaymentMethods();
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
                    color: "#ffffff00",
                    intensity: 0,
                  },
                },
                colors: {
                  light: {
                    background: "#ffffff00",
                    componentBackground: "#ffffff00",
                  },
                  dark: {
                    background: "#ffffff00",
                    componentBackground: "#ffffff00",
                  },
                },
              },
            }}
            onChange={(data?: PaymentEventData) => {
              console.log("CvcWidget changed", JSON.stringify(data));
              const cvcStatus = (data as { payload?: { cvcStatus?: { isCvcComplete?: boolean } } } | null | undefined)?.payload?.cvcStatus;
              if (cvcStatus) setIsCvcComplete(!!cvcStatus.isCvcComplete);
            }}
          onFocus={() => console.log('[Example] CvcWidget focused')}
          onBlur={() => console.log('[Example] CvcWidget blurred')}
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
          onChange={(data: any) => {
            if (!data) return;
            console.log("[PaymentElement Event]", JSON.stringify(data.type), JSON.stringify(data.payload));
            switch (data.type) {
              case "FORM_STATUS":
                setFormStatus(data.payload?.status ?? null);
                break;
              case "PAYMENT_METHOD_STATUS":
                // console.log("[PaymentMethodStatus]", data.payload);
                break;
              case "PAYMENT_METHOD_INFO_CARD":
                // console.log("[CardInfo]", data.payload);
                break;
              case "PAYMENT_METHOD_INFO_BILLING_ADDRESS":
                // console.log("[BillingAddress]", data.payload);
                break;
            }
          }}
          options={{
            subscribedEvents: [
              "FORM_STATUS" as const,
              "PAYMENT_METHOD_STATUS" as const,
              "PAYMENT_METHOD_INFO_CARD" as const,
              "PAYMENT_METHOD_INFO_BILLING_ADDRESS" as const,
            ],
            appearance: {
              layout: {
                type: "accordion",
                radios: true,
                maxAccordionItems: 2,
                spacedAccordionItems: true,
                savedMethodCustomization: {
                  groupingBehavior: { displayInSeparateScreen: false },
                },
              },
              shapes: {
                shadow: {
                  blurRadius: 0,
                  color: "#ffffff00",
                  intensity: 0,
                },
              },
              colors: {
                light: {
                  background: "#00000000",
                  componentBackground: "#00000000",
                  componentBorder: "#00000050",
                },
                dark: {
                  background: "#00000000",
                  componentBackground: "#00000000",
                  componentBorder: "#00000050",
                },
              },
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
      isCvcComplete={isCvcComplete}
      formStatus={formStatus}
      amount={amount}
      updateAmount={updateAmount}
      widgets={widgets}
    />
  );
}
