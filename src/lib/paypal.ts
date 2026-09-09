// Thin wrapper around PayPal's REST API (Orders v2 + webhook signature
// verification) using plain fetch — no official SDK dependency, mirroring
// how lean the rest of this codebase's third-party integrations are.
// PAYPAL_ENV selects sandbox vs live; defaults to sandbox so a missing/unset
// value never accidentally goes live.
const PAYPAL_API_BASE =
  process.env.PAYPAL_ENV === "live"
    ? "https://api-m.paypal.com"
    : "https://api-m.sandbox.paypal.com";

let cachedToken: { value: string; expiresAt: number } | null = null;

async function getAccessToken(): Promise<string> {
  if (cachedToken && cachedToken.expiresAt > Date.now()) {
    return cachedToken.value;
  }

  const clientId = process.env.PAYPAL_CLIENT_ID;
  const clientSecret = process.env.PAYPAL_CLIENT_SECRET;
  if (!clientId || !clientSecret) {
    throw new Error("PAYPAL_CLIENT_ID / PAYPAL_CLIENT_SECRET are not set");
  }

  const res = await fetch(`${PAYPAL_API_BASE}/v1/oauth2/token`, {
    method: "POST",
    headers: {
      Authorization: `Basic ${Buffer.from(`${clientId}:${clientSecret}`).toString("base64")}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: "grant_type=client_credentials",
    cache: "no-store",
  });

  if (!res.ok) {
    throw new Error(`PayPal auth failed: ${res.status} ${await res.text()}`);
  }

  const data = (await res.json()) as { access_token: string; expires_in: number };
  // Refresh a little early rather than right at expiry.
  cachedToken = { value: data.access_token, expiresAt: Date.now() + (data.expires_in - 60) * 1000 };
  return data.access_token;
}

export async function paypalFetch(path: string, init: RequestInit = {}): Promise<Response> {
  const token = await getAccessToken();
  return fetch(`${PAYPAL_API_BASE}${path}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
      ...init.headers,
    },
    cache: "no-store",
  });
}

async function paypalJson<T>(path: string, init: RequestInit = {}): Promise<T> {
  const res = await paypalFetch(path, init);
  const data = await res.json();
  if (!res.ok) {
    throw new Error(`PayPal API error (${path}): ${res.status} ${JSON.stringify(data)}`);
  }
  return data as T;
}

export type PayPalOrder = {
  id: string;
  status: string;
  links: { rel: string; href: string; method: string }[];
  purchase_units?: {
    custom_id?: string;
    amount?: { value: string; currency_code: string };
    shipping?: {
      name?: { full_name?: string };
      address?: {
        address_line_1?: string;
        address_line_2?: string;
        admin_area_2?: string;
        admin_area_1?: string;
        postal_code?: string;
        country_code?: string;
      };
    };
    items?: { sku?: string; quantity?: string; name?: string }[];
    payments?: {
      captures?: { id: string; status: string; amount?: { value: string } }[];
    };
  }[];
};

export function createOrder(body: Record<string, unknown>) {
  return paypalJson<PayPalOrder>("/v2/checkout/orders", {
    method: "POST",
    body: JSON.stringify(body),
  });
}

export function getOrder(orderId: string) {
  return paypalJson<PayPalOrder>(`/v2/checkout/orders/${orderId}`);
}

export function captureOrder(orderId: string) {
  return paypalJson<PayPalOrder>(`/v2/checkout/orders/${orderId}/capture`, {
    method: "POST",
  });
}

export function refundCapture(captureId: string) {
  return paypalJson<{ id: string; status: string }>(`/v2/payments/captures/${captureId}/refund`, {
    method: "POST",
    body: JSON.stringify({}),
  });
}

// Verifies an incoming webhook actually came from PayPal, using PayPal's
// own verification endpoint rather than reimplementing its signature
// scheme by hand.
export async function verifyWebhookSignature(
  headers: Headers,
  rawBody: string,
): Promise<boolean> {
  const webhookId = process.env.PAYPAL_WEBHOOK_ID;
  if (!webhookId) return false;

  const result = await paypalJson<{ verification_status: string }>(
    "/v1/notifications/verify-webhook-signature",
    {
      method: "POST",
      body: JSON.stringify({
        auth_algo: headers.get("paypal-auth-algo"),
        cert_url: headers.get("paypal-cert-url"),
        transmission_id: headers.get("paypal-transmission-id"),
        transmission_sig: headers.get("paypal-transmission-sig"),
        transmission_time: headers.get("paypal-transmission-time"),
        webhook_id: webhookId,
        webhook_event: JSON.parse(rawBody),
      }),
    },
  );
  return result.verification_status === "SUCCESS";
}
