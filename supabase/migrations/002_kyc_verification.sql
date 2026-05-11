-- KYC verification schema
-- Adds kyc_status to traders and creates kyc_verifications table

-- Add KYC status to traders
alter table traders add column kyc_status text not null default 'pending'
  check (kyc_status in ('pending', 'in_progress', 'verified', 'rejected'));

-- KYC verification records (metadata only — no image blobs)
create table kyc_verifications (
  id                     uuid primary key default gen_random_uuid(),
  trader_id              uuid not null references traders(id) on delete cascade,
  status                 text not null default 'pending'
                           check (status in ('pending', 'in_progress', 'verified', 'rejected')),
  current_step           integer not null default 1,

  -- Step 1: Personal details
  personal_completed_at  timestamptz,

  -- Step 2: Document (Gemini Vision)
  document_type          text,           -- 'nin', 'passport', 'voters_card'
  document_extracted     jsonb,          -- Gemini-extracted fields
  document_confidence    numeric,
  document_completed_at  timestamptz,

  -- Step 3: Liveness (face-api.js)
  liveness_score         numeric,        -- 0.0 to 1.0
  liveness_challenges    jsonb,          -- { turn_left: true, turn_right: true, smile: true }
  liveness_completed_at  timestamptz,

  -- Step 4: Workspace (Gemini Vision)
  workspace_objects      jsonb,          -- detected objects with bounding boxes
  workspace_assessment   text,           -- Gemini's plain-language assessment
  workspace_score        numeric,
  workspace_completed_at timestamptz,

  -- Step 5: Merchandise (Gemini Vision)
  merchandise_objects    jsonb,          -- detected items with bounding boxes
  merchandise_assessment text,           -- Gemini's match explanation
  merchandise_match      boolean,
  merchandise_score      numeric,
  merchandise_completed_at timestamptz,

  completed_at           timestamptz,
  created_at             timestamptz not null default now()
);

create unique index kyc_verifications_trader_id_idx on kyc_verifications(trader_id);

-- RLS: service_role full access
alter table kyc_verifications enable row level security;
create policy "service_role_all" on kyc_verifications
  for all to service_role using (true) with check (true);
