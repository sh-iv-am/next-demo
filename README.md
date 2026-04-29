# Next Demo — HyperSwitch Deposit Popup

A Next.js demo that integrates [`@juspay-tech/hyper-js`](https://www.npmjs.com/package/@juspay-tech/hyper-js) and [`@juspay-tech/react-hyper-js`](https://www.npmjs.com/package/@juspay-tech/react-hyper-js) to render a two-screen deposit flow: an amount-selection screen with the customer's last-used payment method (CVC-only confirm) and a full payment-method selection screen powered by `<PaymentElement>`.

## Demo

<video src="./demo.mov" controls width="600"></video>

[Download / open `demo.mov`](./demo.mov) if your viewer can't render it inline.

## Summary

- **Start screen** — single "Start Demo" button opens a modal popup.
- **Amount screen** — popup chrome (header, balance, CA$ amount, quick-amount chips, deposit button) renders immediately. The HyperElements-bound CVC field and saved-method dropdown fade in once the payment intent is created on the server.
- **Saved card flow** — the dropdown shows the customer's last-used card (`paymentSession.getCustomerSavedPaymentMethods` → `getCustomerLastUsedPaymentMethodData`). Clicking **Deposit** runs `paymentSession.updateIntent` to push the new amount, then `methodsSession.confirmWithLastUsedPaymentMethod` with the on-screen `<CardCVCElement>`.
- **Add-method flow** — clicking the dropdown switches to the "Select Payment Method" screen with `<PaymentElement>` (accordion layout, wallets, branding off). Deposit calls `hyper.confirmPayment`.
- **Transition spinner** — a 300ms overlay fades over the popup whenever `isAmountScreen` flips, masking PaymentElement re-mount.

## File layout

```
src/
├── components/
│   ├── DemoPopup.tsx     popup shell, hyperPromise, transition overlay,
│   │                     create-payment fetch, HyperElements provider
│   ├── HyperContent.tsx  usePaymentSession, saved-methods load, updateAmount
│   ├── FormLayout.tsx    layout + handleDeposit (slots: cvcSlot, paymentSlot)
│   └── icons.tsx         small SVG icons
├── pages/
│   ├── index.tsx         "Start Demo" button + popup mount
│   └── api/
│       ├── create-payment.ts  POST /payments → { sdkAuthorization, paymentId }
│       └── update-payment.ts  POST /payments/{id} → { sdkAuthorization }
└── types/
    └── juspay-tech.d.ts  module declarations for the two Juspay packages
```

## Environment

Create `.env.local` in the project root:

```
NEXT_PUBLIC_HYPERSWITCH_PUBLISHABLE_KEY=pk_snd_…
NEXT_PUBLIC_PROFILE_ID=pro_…
HYPERSWITCH_API_KEY=snd_…
HYPERSWITCH_API_URL=https://sandbox.hyperswitch.io
```

`NEXT_PUBLIC_*` keys reach the browser bundle; the unprefixed API key stays server-only and is only used by the `/api/*` routes. Restart `npm run dev` after editing — Next.js inlines these at boot.

## Development

```bash
npm install
npm run dev
```

Then open http://localhost:3000 and click **Start Demo**.
