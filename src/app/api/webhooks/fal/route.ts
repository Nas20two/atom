import { NextRequest, NextResponse } from "next/server";

/**
 * POST /api/webhooks/fal
 *
 * Called by Fal when an enqueued render completes. Guarded by a shared secret
 * (`FAL_WEBHOOK_SECRET`) sent as a Bearer token — mirrors the auth requirement
 * called out in review #3 so only Fal can talk to this endpoint.
 *
 * Actual order/video state persistence is the expected next step (Postgres);
 * today we validate auth and acknowledge.
 */
export async function POST(req: NextRequest) {
  const secret = process.env.FAL_WEBHOOK_SECRET;
  const authHeader = req.headers.get("authorization");
  const queryToken = req.nextUrl.searchParams.get("token");

  if (!secret) {
    return NextResponse.json(
      { error: "FAL_WEBHOOK_SECRET is not configured." },
      { status: 500 }
    );
  }

  const authorized =
    queryToken === secret || authHeader === `Bearer ${secret}`;
  if (!authorized) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Acknowledge quickly. Extend this to persist the completed video URL + sign
  // it for delivery (see README "Security").
  console.log("[Fal] webhook received and authorized");
  return NextResponse.json({ received: true });
}
