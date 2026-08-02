import { neon } from "@neondatabase/serverless";

/**
 * Neon serverless Postgres client.
 *
 * Connection string is taken from DATABASE_URL (or POSTGRES_URL). This is a
 * fetch-based HTTP client, so it works on serverless (Vercel) functions and
 * needs no long-lived pool. (fetchConnectionCache is always-on in the SDK.)
 */

export function connectionString(): string {
  const url = process.env.DATABASE_URL ?? process.env.POSTGRES_URL;
  if (!url) {
    throw new Error(
      "DATABASE_URL is not set. Create a Neon project and set DATABASE_URL (see db/schema.sql)."
    );
  }
  return url;
}

export type Db = ReturnType<typeof neon>;

/** A plain DB row (results of SELECT / INSERT..RETURNING). */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Row = Record<string, any>;

/** Returns a tagged-template query function bound to the Neon connection. */
export function getDb(): Db {
  return neon(connectionString());
}

/**
 * Like getDb() but returns null when no connection string is configured, so
 * webhook handlers can degrade gracefully in local dev (no Neon yet) instead
 * of throwing on every request. Callers that get null fall back to their
 * legacy path (enqueue without persisting).
 */
export function getDbSafe(): Db | null {
  const url = process.env.DATABASE_URL ?? process.env.POSTGRES_URL;
  return url ? neon(url) : null;
}

// ---- Orders ----

export interface NewOrder {
  orderId: string;
  tier: string;
  email?: string | null;
  product?: string | null;
  amountCents?: number | null;
}

/**
 * Insert a paid order, idempotently. Idempotency rests on the
 * `UNIQUE(order_id)` constraint in db/schema.sql: if the row already exists
 * (Stripe retry, duplicated checkout.session.completed), we do nothing and
 * return false. A caller MUST NOT re-enqueue or re-charge when this returns
 * false — that's the double-spend guard. Returns true only for a fresh order.
 */
export async function insertOrder(db: Db, order: NewOrder): Promise<boolean> {
  const rows = (await db`
    insert into orders (order_id, tier, customer_email, product, amount_cents, status)
    values (
      ${order.orderId}, ${order.tier}, ${order.email ?? null},
      ${order.product ?? null}, ${order.amountCents ?? null}, 'created'
    )
    on conflict (order_id) do nothing
    returning order_id
  `) as Row[];
  return rows.length > 0;
}

/** Record the Fal render job(s) for an order as enqueued. */
export async function markOrderEnqueued(
  db: Db,
  orderId: string,
  model: string
): Promise<void> {
  await db`
    update orders
    set status = 'enqueued', model = ${model}, enqueued_at = now(), updated_at = now()
    where order_id = ${orderId}
  `;
}

// ---- Videos (one row per rendered clip) ----

export interface NewVideo {
  orderId: string;
  clipIndex: number;
  falRequestId: string;
  model: string;
}

/** Insert a clip row once its Fal enqueue returns a request id. */
export async function insertVideo(db: Db, v: NewVideo): Promise<void> {
  await db`
    insert into videos (order_id, clip_index, fal_request_id, model, status)
    values (${v.orderId}, ${v.clipIndex}, ${v.falRequestId}, ${v.model}, 'queued')
  `;
}

/**
 * Mark a single clip completed when Fal calls back. Returns the order it
 * belongs to (null if no clip matched that request id).
 */
export async function completeClip(
  db: Db,
  falRequestId: string,
  videoUrl: string
): Promise<string | null> {
  const rows = (await db`
    update videos
    set status = 'completed', url = ${videoUrl}, completed_at = now()
    where fal_request_id = ${falRequestId}
    returning order_id
  `) as Row[];
  return rows.length > 0 ? rows[0].order_id : null;
}

/** If every clip of an order is done, mark the order completed. */
export async function finalizeOrderIfComplete(db: Db, orderId: string): Promise<void> {
  const pending = (await db`
    select count(*)::int as n
    from videos
    where order_id = ${orderId} and status <> 'completed'
  `) as Row[];
  if (pending[0]?.n === 0) {
    await db`
      update orders
      set status = 'completed', completed_at = now(), updated_at = now()
      where order_id = ${orderId}
    `;
  }
}

/** Read an order's live status (used by the success page / atom-submit). */
export async function getOrderStatus(
  db: Db,
  orderId: string
): Promise<{ status: string; tier: string } | null> {
  const rows = (await db`
    select status, tier from orders where order_id = ${orderId} limit 1
  `) as Row[];
  return rows.length > 0 ? { status: rows[0].status, tier: rows[0].tier } : null;
}
