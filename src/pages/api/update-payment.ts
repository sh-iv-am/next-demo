import type { NextApiRequest, NextApiResponse } from "next";

type Data = { sdkAuthorization: string } | { error: string };

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

  const { paymentId, ...updateFields } = req.body ?? {};

  if (!paymentId) {
    return res.status(400).json({ error: "paymentId is required" });
  }

  try {
    const response = await fetch(`${baseUrl}/payments/${paymentId}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "api-key": apiKey,
      },
      body: JSON.stringify(updateFields),
    });

    const data = await response.json();

    if (!response.ok || !data.sdk_authorization) {
      return res
        .status(response.status || 500)
        .json({ error: data?.error?.message ?? "Payment update failed" });
    }

    return res.status(200).json({ sdkAuthorization: data.sdk_authorization });
  } catch (err) {
    return res
      .status(500)
      .json({ error: err instanceof Error ? err.message : "Unknown error" });
  }
}
