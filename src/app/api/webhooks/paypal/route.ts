import { NextResponse } from "next/server";
import { verifyWebhookSignature, captureOrder, getOrder } from "@/lib/paypal";
import { createAdminClient } from "@/lib/supabase/admin";
import { recordPaypalOrder } from "@/lib/paypal-fulfillment";

export async function POST(request: Request) {
  const rawBody = await request.text();

  let verified = false;
  try {
    verified = await verifyWebhookSignature(request.headers, rawBody);
  } catch (err) {
    console.error("PayPal webhook verification error:", err);
  }
  if (!verified) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  const event = JSON.parse(rawBody) as { event_type: string; resource: Record<string, unknown> };
  const supabase = createAdminClient();

  switch (event.event_type) {
    // Fallback path for when the buyer's browser never made it back to
    // /api/checkout/paypal/return (closed tab, network drop) — the return
    // route normally captures the order synchronously already, so a
    // "this order was already captured" error here is expected, not a bug.
    case "CHECKOUT.ORDER.APPROVED": {
      const orderId = event.resource.id as string;
      try {
        const captured = await captureOrder(orderId);
        await recordPaypalOrder(supabase, captured);
      } catch (err) {
        console.error("PayPal webhook capture (likely already captured):", err);
      }
      break;
    }
    case "PAYMENT.CAPTURE.COMPLETED": {
      const relatedIds = (
        event.resource.supplementary_data as { related_ids?: { order_id?: string } } | undefined
      )?.related_ids;
      if (relatedIds?.order_id) {
        const order = await getOrder(relatedIds.order_id);
        await recordPaypalOrder(supabase, order);
      }
      break;
    }
    case "PAYMENT.CAPTURE.REFUNDED": {
      const captureId = (event.resource.id as string) || "";
      const link = (event.resource.links as { rel: string; href: string }[] | undefined)?.find(
        (l) => l.rel === "up",
      );
      const relatedCaptureId = link ? link.href.split("/").pop() : captureId;
      await supabase
        .from("orders")
        .update({ status: "refunded" })
        .eq("paypal_capture_id", relatedCaptureId);
      break;
    }
    default:
      break;
  }

  return NextResponse.json({ received: true });
}
