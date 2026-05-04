import { useEffect, useState, useRef } from "react";
import { type PaymentSessionHandler } from "@juspay-tech/capacitor-hyperswitch";
import {
  CvcWidget,
  PaymentElement,
  // useWidgets,
  usePaymentSession,
  // type CustomerLastUsedPaymentMethod,
  // type CustomerSavedPaymentMethodsSession,
  type PaymentElementHandle,
} from "@juspay-tech/capacitor-react-hyperswitch";
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
  // const widgets = useWidgets();
  // const [lastUsed, setLastUsed] = useState<CustomerLastUsedPaymentMethod | null | undefined>(null);
  // const [methodsSession, setMethodsSession] =
  //   useState<CustomerSavedPaymentMethodsSession | null>(null);
  const [handler, setHandler] = useState<PaymentSessionHandler | null>(null);
  const [lastUsed, setLastUsed] = useState<any | null | undefined>(null);

  const [loadingSaved, setLoadingSaved] = useState(true);

  const paymentRef = useRef<PaymentElementHandle>(null);

  useEffect(() => {
    if (!paymentSession) return;
    let cancelled = false;
    (async () => {
      try {
        const session = await paymentSession.getCustomerSavedPaymentMethods();
        if (cancelled) return;
        // setMethodsSession(session);
        setHandler(handler);
        const data = await session.getCustomerLastUsedPaymentMethodData();
        setLastUsed(data);

      } catch {
        setLastUsed(undefined);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [paymentSession]);

  // useEffect(() => {
  //   if (lastUsed != null) setLoadingSaved(false);
  // }, [lastUsed]);

  const updateAmount = null;
    // widgets && paymentId
    //   ? 
    //   async () => {
    //       await widgets.updateIntent(async () => {
    //         const serverUrl = process.env.NEXT_PUBLIC_SERVER_URL ?? "http://localhost:5252";
    //         const response = await fetch(`${serverUrl}/update-payment`, {
    //           method: "POST",
    //           headers: { "Content-Type": "application/json" },
    //           body: JSON.stringify({ paymentId, amount: amount * 100 }),
    //         });
    //         const data = await response.json();
    //         if (!response.ok) throw new Error(data.error ?? "Update failed");
    //         return { sdkAuthorization: data.sdkAuthorization };
    //       });
    //     }
    //   : null;

  return (
    <FormLayout
      {...props}
      cvcSlot={
        <CvcWidget
          // id={"card-cvc-element"}
          // options={{ placeholder: "123" }}
          onReady={() => console.log('[Example] CvcWidget ready')}
          style={{ minHeight: 50 }}
        />
      }
      paymentSlot={
        <PaymentElement
          // options={{
          //   layout: {
          //     type: "accordion",
          //     radios: true,
          //     maxAccordionItems: 2,
          //     spacedAccordionItems: true,
          //     savedMethodCustomization: {
          //       hideCardExpiry: true,
          //       maxItems: 2,
          //       groupingBehavior: { displayInSeparateScreen: false },
          //     },
          //   },
          //   wallets: { walletReturnUrl: window.location.origin },
          //   branding: "never",
          // }}
          ref={paymentRef}
          onReady={() => console.log('[Example] PaymentElement ready')}
          style={{ width: '100%', height: '100%' }}
        />
      }
      lastUsed={lastUsed}
      // methodsSession={methodsSession}
      methodsSession={null}
      loadingSaved={loadingSaved}
      canSubmit={!!paymentSession}
      amount={amount}
      updateAmount={updateAmount}
    />
  );
}
