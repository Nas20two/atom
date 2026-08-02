-- Atom — Neon Postgres schema (orders + videos)
-- Run with: npm run db:migrate   (requires DATABASE_URL in env)

create extension if not exists pgcrypto;

-- One row per paid order (one-time Stripe Checkout).
create table if not exists orders (
  id               uuid primary key default gen_random_uuid(),
  order_id         text not null unique,          -- generated at checkout
  stripe_session_id text,
  tier             text not null,                 -- basic | pro | agent
  customer_email   text,
  product          text,                          -- short business/product description
  amount_cents     bigint,                        -- what the customer paid
  model            text,                          -- Fal model used for this order's render(s)
  status           text not null default 'created', -- created | enqueued | completed | refunded
  fal_request_id   text,                          -- Fal queue request we submitted for it
  video_url        text,                          -- signed/private URL (prevents double spend + enables delivery)
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now(),
  enqueued_at      timestamptz,
  completed_at     timestamptz
);

-- One row per rendered clip. The unique order_id in `orders` makes enqueue
-- idempotent: a duplicated checkout.session.completed can't double-enqueue.
create table if not exists videos (
  id              uuid primary key default gen_random_uuid(),
  order_id        text not null references orders(order_id),
  clip_index      int not null,
  fal_request_id  text,
  url             text,
  model           text,
  duration_seconds int,
  status          text not null default 'queued', -- queued | completed | failed
  created_at      timestamptz not null default now(),
  completed_at    timestamptz
);

create index if not exists idx_orders_fal_request_id on orders (fal_request_id);
create index if not exists idx_videos_order_id on videos (order_id);
