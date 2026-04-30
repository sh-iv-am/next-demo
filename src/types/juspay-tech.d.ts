declare module "@juspay-tech/react-hyper-js" {
  import type { ComponentType, ReactNode } from "react";

  export const HyperElements: ComponentType<{
    hyper: Promise<unknown> | unknown;
    options?: Record<string, unknown>;
    children?: ReactNode;
  }>;

  export const PaymentElement: ComponentType<{
    options?: Record<string, unknown>;
    onReady?: () => void;
    onChange?: (event: unknown) => void;
  }>;

  export const CardElement: ComponentType<Record<string, unknown>>;
  export const CardNumberElement: ComponentType<Record<string, unknown>>;
  export const CardExpiryElement: ComponentType<Record<string, unknown>>;
  export const CardCVCElement: ComponentType<Record<string, unknown>>;
  export const ApplePayElement: ComponentType<Record<string, unknown>>;
  export const GooglePayElement: ComponentType<Record<string, unknown>>;
  export const PayPalElement: ComponentType<Record<string, unknown>>;
  export const PazeElement: ComponentType<Record<string, unknown>>;
  export const ExpressCheckoutElement: ComponentType<Record<string, unknown>>;
  export const PaymentMethodsManagementElement: ComponentType<Record<string, unknown>>;

  export type ConfirmPaymentError = {
    type?: "card_error" | "validation_error" | string;
    message?: string;
  };

  export type ConfirmPaymentResult = {
    error?: ConfirmPaymentError;
    status?: string;
    paymentIntent?: unknown;
  };

  export type ConfirmPaymentArgs = {
    widgets?: unknown;
    elements?: unknown;
    confirmParams: { return_url: string; [key: string]: unknown };
    redirect?: "always" | "if_required";
  };

  export type HyperInstance = {
    confirmPayment: (args: ConfirmPaymentArgs) => Promise<ConfirmPaymentResult>;
    [key: string]: unknown;
  };

  export type CustomerSavedPaymentMethodsSession = {
    getCustomerLastUsedPaymentMethodData: () => CustomerLastUsedPaymentMethod | null;
    getCustomerDefaultPaymentMethodData?: () => CustomerLastUsedPaymentMethod | null;
    confirmWithLastUsedPaymentMethod: (args: {
      confirmParams: { return_url: string; [key: string]: unknown };
      redirect?: "always" | "if_required";
      id?: string;
    }) => Promise<ConfirmPaymentResult>;
    [key: string]: unknown;
  };

  export type CustomerLastUsedPaymentMethodCard = {
    card_network?: string;
    card_brand?: string;
    scheme?: string;
    last4_digits?: string;
    last4?: string;
    last4Digits?: string;
    card_exp_month?: string;
    card_exp_year?: string;
    [key: string]: unknown;
  };

  export type CustomerLastUsedPaymentMethod = {
    payment_method?: string;
    payment_method_type?: string;
    card?: CustomerLastUsedPaymentMethodCard;
    error?: unknown;
    [key: string]: unknown;
  };

  export type PaymentSessionInstance = {
    getCustomerSavedPaymentMethods: () => Promise<CustomerSavedPaymentMethodsSession>;
    updateIntent: (
      fetcher: () => Promise<{ sdkAuthorization: string }>,
    ) => Promise<unknown>;
    [key: string]: unknown;
  };

  export type WidgetInstance = {
    updateIntent: (
      fetcher: () => Promise<{ sdkAuthorization: string }>,
    ) => Promise<unknown>;
    [key: string]: unknown;
  };

  export function usePaymentSession(): PaymentSessionInstance | null;
  export function useWidgets(): WidgetInstance | null;
  export function useHyper(): HyperInstance | null;
}

declare module "@juspay-tech/hyper-js" {
  export function loadHyper(
    publishableKey: string,
    options?: Record<string, unknown>,
  ): Promise<unknown>;

  export function loadStripe(
    publishableKey: string,
    options?: Record<string, unknown>,
  ): Promise<unknown>;
}
