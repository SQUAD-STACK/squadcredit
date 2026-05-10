# /squad

Squad sandbox API reference. Pulled directly from https://docs.squadco.com/.

## Environment

- **Test base URL:** `https://sandbox-api-d.squadco.com`
- **Production base URL:** `https://api-d.squadco.com`
- **Auth header:** `Authorization: Bearer ${SQUAD_SECRET_KEY}`
- **Our merchant ID:** `SBK9CS1TJ5` (sandbox)

## CRITICAL CONVENTIONS

1. **Two different bank code systems exist.**
   - Virtual account responses return `bank_code: "058"` (legacy 3-digit code for GTBank)
   - Transfer/payout endpoints require **NIP codes (6 digits)**. GTBank NIP code is `000013`
   - Always use NIP codes for `/payout/account/lookup` and `/payout/transfer`

2. **Transfer transaction_reference MUST be prefixed with merchant ID.**
   - Format: `SBK9CS1TJ5_<unique_suffix>`
   - Example: `SBK9CS1TJ5_loan_disbursal_xyz123`
   - Without the prefix, API returns `400 Bad ref format`

3. **Amounts in `/payout/transfer` are in kobo as a string.**
   - ₦100 = `"10000"` (one hundred naira = ten thousand kobo)
   - For `/transaction/initiate`, amounts are also in kobo
   - For `/virtual-account/simulate/payment`, amounts are in naira as a string

4. **Webhook validation: implement V3, not V1.**
   - V1 hashes the entire payload (deprecated)
   - V3 hashes only six fields joined by pipes (current)
   - HMAC algorithm: SHA-512 with our secret key
   - Hex-encoded output, lowercase

## Endpoint 1: Create virtual account (B2C)

**POST** `/virtual-account`

Used at trader onboarding to mint each trader a NUBAN.

### Required body fields

```json
{
  "customer_identifier": "trader_<uuid>",
  "first_name": "Sade",
  "last_name": "Adebayo",
  "middle_name": "Ada",
  "mobile_num": "08012345678",
  "dob": "01/15/1990",
  "email": "[email protected]",
  "bvn": "22343211654",
  "gender": "2",
  "address": "Balogun Market, Lagos Island",
  "beneficiary_account": "4920299492"
}
```

### Field rules

- `mobile_num` — exactly 11 digits
- `dob` — `mm/dd/yyyy` format (NOT iso-8601)
- `gender` — `"1"` for male, `"2"` for female
- `bvn` — production validates strictly against name + DOB + gender + phone. Sandbox is permissive.
- `customer_identifier` — must be unique per customer. We use the trader's UUID.
- `beneficiary_account` — 10-digit GTBank account where settled funds land. Without it, funds sit in our Squad wallet and settle T+1.

### Success response (200)

```json
{
  "success": true,
  "message": "Success",
  "data": {
    "first_name": "Sade",
    "last_name": "Adebayo",
    "bank_code": "058",
    "virtual_account_number": "5519693166",
    "beneficiary_account": "4920299492",
    "customer_identifier": "trader_xyz",
    "created_at": "2026-05-10T07:54:25.375Z",
    "updated_at": "2026-05-10T07:54:25.375Z"
  }
}
```

## Endpoint 2: Simulate payment (sandbox only)

**POST** `/virtual-account/simulate/payment`

Used to fire fake inbound payments for the demo. Triggers our webhook end-to-end.

```json
{
  "virtual_account_number": "5519693166",
  "amount": "12500"
}
```

`amount` here is in **naira as a string**. Returns `200 Success` with empty data on success. The webhook fires moments later.

## Endpoint 3: Webhook receiver (we host this)

Squad POSTs to our webhook URL set in the dashboard. Configure at: Squad sandbox → Settings → API & Webhooks → Webhook URL.

### Webhook payload (V3)

```json
{
  "transaction_reference": "REF20260424S67978035_M01682015_9013151600",
  "virtual_account_number": "9013151600",
  "principal_amount": "1.00",
  "settled_amount": "1.00",
  "fee_charged": "0.00",
  "transaction_date": "2026-04-24T11:29:10+01:00",
  "customer_identifier": "newva1",
  "transaction_indicator": "C",
  "remarks": "...",
  "currency": "NGN",
  "channel": "virtual-account",
  "sender_name": "AKINOLA MOBOLAJI NIFEMI",
  "meta": {
    "freeze_transaction_ref": null,
    "reason_for_frozen_transaction": null
  },
  "first_name": "William",
  "last_name": "Udousoro",
  "prefix": "TAM",
  "session_id": "000001260424112858828788701400",
  "masked_sender_account_number": "009****919",
  "version": "v2",
  "transaction_uuid": "019DBF094ABEA366",
  "encrypted_body": "..."
}
```

### V3 signature verification

```typescript
import crypto from "crypto";

function verifySquadSignature(
  payload: SquadWebhookPayload,
  signatureHeader: string,
): boolean {
  const dataToHash = [
    payload.transaction_reference,
    payload.virtual_account_number,
    payload.currency,
    payload.principal_amount,
    payload.settled_amount,
    payload.customer_identifier,
  ].join("|");

  const expected = crypto
    .createHmac("sha512", process.env.SQUAD_SECRET_KEY!)
    .update(dataToHash)
    .digest("hex");

  return crypto.timingSafeEqual(
    Buffer.from(expected, "hex"),
    Buffer.from(signatureHeader, "hex"),
  );
}
```

Header name: `x-squad-signature`. Output is lowercase hex.

### Expected response from our webhook

```json
{
  "response_code": 200,
  "transaction_reference": "<the same ref>",
  "response_description": "Success"
}
```

Return 200 for success, 400 for validation failure, 500 for system error. Implement duplicate-transaction check (we keyed `transactions.transaction_reference` UNIQUE) so retries don't double-process.

## Endpoint 4: Account lookup (before any transfer)

**POST** `/payout/account/lookup`

Run this immediately before every loan disbursement to confirm the destination is real.

```json
{
  "bank_code": "000013",
  "account_number": "0123456789"
}
```

Note: `bank_code` is NIP six-digit code. GTBank is `000013`, not `058`.

### Success

```json
{
  "status": 200,
  "success": true,
  "data": {
    "account_name": "JENNY SQUAD",
    "account_number": "0123456789"
  }
}
```

## Endpoint 5: Fund transfer (loan disbursement)

**POST** `/payout/transfer`

Disburses money from our Squad wallet to a trader's personal bank account.

```json
{
  "transaction_reference": "SBK9CS1TJ5_loan_<loan_uuid>",
  "amount": "1940000",
  "bank_code": "000013",
  "currency_id": "NGN",
  "account_number": "0123456789",
  "account_name": "JENNY SQUAD",
  "remark": "SquadCredit advance"
}
```

### CRITICAL field rules

- `transaction_reference` — MUST be prefixed with `SBK9CS1TJ5_`. Throws `400 Bad ref format` otherwise.
- `amount` — string, in **kobo**. ₦19,400 = `"1940000"`.
- `bank_code` — NIP code, six digits (`000013` for GTBank).
- `account_name` — must match what was returned by the lookup. Squad does not validate but we should.
- `currency_id` — only `"NGN"` supported.
- `remark` — must be unique per transfer.

### Success

```json
{
  "status": 200,
  "success": true,
  "data": {
    "transaction_reference": "SBK9CS1TJ5_loan_xyz",
    "response_description": "Approved or completed successfully",
    "currency_id": "NGN",
    "amount": "1940000",
    "nip_transaction_reference": "110059250901053503159119194486",
    "account_number": "0933384111",
    "account_name": "EZE SUNDAY",
    "destination_institution_name": "GTBank Plc"
  }
}
```

### Error code table

| Code | Meaning                            | Action                            |
| ---- | ---------------------------------- | --------------------------------- |
| 200  | Success                            | Mark loan as disbursed            |
| 400  | Bad request (often bad ref format) | Fix and retry                     |
| 422  | Unprocessed                        | Re-query                          |
| 424  | Timeout/failed                     | Re-query                          |
| 404  | Not found                          | Re-query                          |
| 412  | Reversed                           | Mark loan as failed, do not retry |

**Best practice:** never trust the status code alone. Check that `data.nip_transaction_reference` is non-null. If in doubt, re-query.

## Endpoint 6: Re-query transfer

**POST** `/payout/requery`

Use whenever a transfer response is ambiguous.

```json
{ "transaction_reference": "SBK9CS1TJ5_loan_xyz" }
```

Never reuse a transaction_reference for a retry. If a transfer failed, generate a new ref.

## Endpoint 7: Query merchant transactions (with filters)

**GET** `/virtual-account/merchant/transactions/all`

Used for back-filling transaction history when needed. Query params: `page`, `perPage`, `virtualAccount`, `customerIdentifier`, `startDate`, `endDate`, `transactionReference`, `session_id`, `dir`.

Date format: `MM-DD-YYYY` (e.g. `09-19-2022`).

## Endpoint 8: Initiate hosted payment

**POST** `/transaction/initiate`

For the customer-facing site (browse and pay). Returns a `checkout_url` we redirect to.

```json
{
  "amount": 10000,
  "email": "[email protected]",
  "currency": "NGN",
  "initiate_type": "inline",
  "transaction_ref": "<our_unique_ref>"
}
```

Amount in kobo. `transaction_ref` need not be prefixed for `/transaction/initiate` (only `/payout/*` requires the merchant ID prefix).

## Endpoints we use later (phase 2)

- `POST /merchant/create-sub-users` — sub-merchants for market associations
- Dynamic Virtual Account v2 endpoints — for ajo/group savings (one-time use accounts with target amount and expiry)
- VAS endpoints — SMS notifications, airtime/data vending, USSD

## Things to remember

- Sandbox accepts a permissive BVN like `22343211654` for testing
- Production strictly validates BVN against name, DOB, gender, phone
- Webhook URL must be publicly reachable — Vercel preview URLs work; for local dev use ngrok
- Implement duplicate-transaction check via UNIQUE constraint on `transactions.transaction_reference`
- Always log the raw webhook payload to `transactions.raw_payload` (jsonb) before processing — gives us audit trail
- Squad wallet must be funded before disbursing loans. In sandbox, request test funds from dashboard or via support.

## Going live checklist

1. Switch base URL from `sandbox-api-d.squadco.com` to `api-d.squadco.com`
2. Sign up at dashboard.squadco.com (production)
3. Complete KYC
4. Share merchant ID with Technical Account Manager for profiling (especially for B2B virtual accounts and aggregator/sub-merchants)
5. Use production keys
