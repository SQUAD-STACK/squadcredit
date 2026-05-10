-- SquadCredit initial schema

create extension if not exists "uuid-ossp";

-- Traders
create table traders (
  id                    uuid primary key default gen_random_uuid(),
  phone                 text unique not null,
  first_name            text not null,
  last_name             text not null,
  email                 text not null,
  market                text not null,
  business_type         text not null,
  squad_customer_id     text unique not null,
  virtual_account_number text unique,
  beneficiary_account   text not null,
  bank_code             text not null default '000013',
  bvn                   text,
  trust_score           integer not null default 0,
  credit_limit          numeric not null default 0,
  created_at            timestamptz not null default now()
);

-- Transactions (inbound payments via Squad virtual account webhook)
create table transactions (
  id                      uuid primary key default gen_random_uuid(),
  trader_id               uuid not null references traders(id) on delete cascade,
  transaction_reference   text unique not null,
  sender_name             text not null,
  sender_account          text,
  amount                  numeric not null,
  settled_amount          numeric not null,
  transaction_date        timestamptz not null,
  raw_payload             jsonb not null,
  created_at              timestamptz not null default now()
);

create index transactions_trader_id_idx on transactions(trader_id);
create index transactions_transaction_date_idx on transactions(transaction_date desc);

-- Loans
create table loans (
  id                      uuid primary key default gen_random_uuid(),
  trader_id               uuid not null references traders(id) on delete cascade,
  principal               numeric not null,
  fee                     numeric not null,
  total_due               numeric not null,
  amount_repaid           numeric not null default 0,
  holdback_percentage     numeric not null,
  tier                    integer not null,
  status                  text not null default 'active'
                            check (status in ('active', 'repaid', 'overdue', 'defaulted')),
  disbursed_at            timestamptz not null default now(),
  due_at                  timestamptz not null,
  repaid_at               timestamptz,
  squad_payout_reference  text not null
);

create index loans_trader_id_idx on loans(trader_id);
create index loans_status_idx on loans(status);

-- Savings
create table savings (
  id                uuid primary key default gen_random_uuid(),
  trader_id         uuid not null references traders(id) on delete cascade,
  balance           numeric not null default 0,
  rule_type         text not null default 'percentage_above_threshold',
  rule_percentage   numeric not null default 0.05,
  rule_threshold    numeric not null default 5000,
  goal_amount       numeric,
  goal_label        text,
  created_at        timestamptz not null default now()
);

create unique index savings_trader_id_idx on savings(trader_id);

-- Enable Row Level Security
alter table traders enable row level security;
alter table transactions enable row level security;
alter table loans enable row level security;
alter table savings enable row level security;

-- RLS policies: service role bypasses RLS; anon has no access.
-- We use the service role key for all server-side operations.
-- Trader-facing reads are done server-side (no client-to-db direct access).

create policy "service_role_all" on traders
  for all to service_role using (true) with check (true);

create policy "service_role_all" on transactions
  for all to service_role using (true) with check (true);

create policy "service_role_all" on loans
  for all to service_role using (true) with check (true);

create policy "service_role_all" on savings
  for all to service_role using (true) with check (true);

-- Enable Supabase Realtime for live dashboard updates
alter publication supabase_realtime add table transactions;
alter publication supabase_realtime add table traders;
alter publication supabase_realtime add table loans;
