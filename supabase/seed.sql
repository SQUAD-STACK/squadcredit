-- Demo seed: Sade Adebayo — fabric trader, Balogun Market
-- Run AFTER 001_initial_schema.sql

insert into traders (
  id,
  phone,
  first_name,
  last_name,
  email,
  market,
  business_type,
  squad_customer_id,
  virtual_account_number,
  beneficiary_account,
  bank_code,
  bvn,
  trust_score,
  credit_limit
) values (
  'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
  '08012345678',
  'Sade',
  'Adebayo',
  'sade@squadcredit.test',
  'Balogun Market',
  'fabric',
  'trader_a1b2c3d4-e5f6-7890-abcd-ef1234567890',
  '5519693166',
  '4920299492',
  '000013',
  '22222222222',
  642,
  18000
);

insert into savings (trader_id, balance, rule_percentage, rule_threshold, goal_label)
values (
  'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
  12500,
  0.05,
  5000,
  'Second stall deposit'
);

-- Note: transaction history is seeded via Squad simulate/payment endpoint
-- to prove the full webhook → DB → score → UI loop.
-- See CLAUDE.md "Demo data" section for the script.
