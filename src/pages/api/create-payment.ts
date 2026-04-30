import type { NextApiRequest, NextApiResponse } from "next";

type Data =
  | { sdkAuthorization: string; paymentId: string }
  | { error: string };

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>,
) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const apiKey = process.env.HYPERSWITCH_API_KEY;
  const baseUrl =
    process.env.HYPERSWITCH_API_URL ?? "https://sandbox.hyperswitch.io";

  if (!apiKey) {
    return res.status(500).json({ error: "HYPERSWITCH_API_KEY is not set" });
  }

  const { amount = 500, currency = "USD" } = req.body ?? {};

  try {
    const response = await fetch(`${baseUrl}/payments`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "api-key": apiKey,
      },
      body: JSON.stringify({
        amount,
        currency,
        capture_method: "automatic",
        confirm: false,
        profile_id: process.env.NEXT_PUBLIC_PROFILE_ID,
        customer_id: 'hyperswitch_demo_customer_id',
        billing: {
            address: {
                line1: '1467',
                line2: 'Harrison Street',
                line3: 'Harrison Street',
                city: 'San Fransico',
                state: 'California',
                zip: '94122',
                country: 'US',
                first_name: 'joseph',
                last_name: 'Doe',
            },
        },
      }),
    });

    const data = await response.json();

    if (!response.ok || !data.sdk_authorization) {
      return res
        .status(response.status || 500)
        .json({ error: data?.error?.message ?? "Payment creation failed" });
    }

    return res.status(200).json({
      sdkAuthorization: data.sdk_authorization,
      paymentId: data.payment_id,
    });
  } catch (err) {
    return res
      .status(500)
      .json({ error: err instanceof Error ? err.message : "Unknown error" });
  }
}
