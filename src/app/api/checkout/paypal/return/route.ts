import { NextResponse } from "next/server";
import { captureOrder } from "@/lib/paypal";
import { createAdminClient } from "@/lib/supabase/admin";
import { recordPaypalOrder } from "@/lib/paypal-fulfillment";

// PayPal redirects the buyer here after approval with ?token=<order id>
// (and PayerID, unused — capture doesn't need it). Captures the payment
// immediately for fast feedback; the webhook is the fallback path if the
// buyer's browser never makes it back here.
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const token = searchParams.get("token");
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

  if (!token) {
    return NextResponse.redirect(`${siteUrl}/cart`);
  }

  try {
    const captured = await captureOrder(token);
    await recordPaypalOrder(createAdminClient(), captured);
    return NextResponse.redirect(`${siteUrl}/order/success?paypal_order_id=${token}`);
  } catch (err) {
    console.error("PayPal capture error:", err);
    return NextResponse.redirect(`${siteUrl}/cart?error=paypal`);
  }
}
