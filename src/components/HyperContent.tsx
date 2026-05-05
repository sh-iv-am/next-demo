import { useEffect, useRef, useState } from "react";
import {
  CvcWidget,
  PaymentElement,
  usePaymentSession,
  type PaymentElementHandle,
  type LastUsedPaymentMethod,
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
  const { amount } = props;
  const paymentSession = usePaymentSession();

  // Fetch last used payment method directly via paymentSession
  const [lastUsed, setLastUsed] = useState<LastUsedPaymentMethod | null>(null);
  const [loadingSaved, setLoadingSaved] = useState(true);
  const hasFetched = useRef(false);

  useEffect(() => {
    if (!paymentSession || hasFetched.current) {
      if (!paymentSession) setLoadingSaved(false);
      return;
    }

    hasFetched.current = true;
    let cancelled = false;

    (async () => {
      try {
        setLoadingSaved(true);
        const handler = await paymentSession.getCustomerSavedPaymentMethods();
        const data = await handler.getCustomerLastUsedPaymentMethodData();
        console.log('[Example] Last used payment method:', JSON.stringify(data, null, 2));
        if (!cancelled) {
          setLastUsed(data);
        }
      } catch (err) {
        console.error('[Example] Failed to fetch last used payment method:', err);
      } finally {
        if (!cancelled) {
          setLoadingSaved(false);
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [paymentSession]);

  const paymentRef = useRef<PaymentElementHandle>(null);

  // updateIntent is available via paymentSession?.updateIntent()
  // when the SDK supports dynamic amount updates
  const updateAmount = null;

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
