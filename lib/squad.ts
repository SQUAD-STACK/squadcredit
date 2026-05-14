import crypto from "crypto";
import { nairaToKobo } from "./format";

const BASE_URL = process.env.SQUAD_API_BASE_URL!;
const SECRET_KEY = process.env.SQUAD_SECRET_KEY!;
const MERCHANT_ID = "SB8644AAYV";

function assertSquadConfig() {
  if (!BASE_URL) throw new Error("SQUAD_API_BASE_URL is missing.");
  if (!SECRET_KEY) throw new Error("SQUAD_SECRET_KEY is missing.");
  if (!SECRET_KEY.startsWith("sandbox_sk_")) {
    throw new Error("SQUAD_SECRET_KEY must be a Squad sandbox secret key that starts with sandbox_sk_.");
  }
}

async function squadFetch<T>(path: string, options: RequestInit = {}): Promise<T> {
  assertSquadConfig();

  const res = await fetch(`${BASE_URL}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${SECRET_KEY}`,
      ...options.headers,
    },
  });

  const json = await res.json().catch(() => null);

  if (!res.ok) {
    throw new Error(`Squad API ${res.status} on ${path}: ${JSON.stringify(json)}`);
  }

  return json;
}

// ── Virtual Accounts ──────────────────────────────────────────────────────────

export interface CreateVirtualAccountParams {
  customer_identifier: string;
  first_name: string;
  last_name: string;
  middle_name?: string;
  mobile_num: string;
  dob: string; // DD/MM/YYYY
  email: string;
  bvn: string;
  gender: "1" | "2"; // 1 = male, 2 = female
  address: string;
  beneficiary_account?: string;
}

export interface VirtualAccountResponse {
  success: boolean;
  message: string;
  data: {
    first_name: string;
    last_name: string;
    bank_code: string;
    virtual_account_number: string;
    beneficiary_account: string;
    customer_identifier: string;
    created_at: string;
  };
}

export async function createVirtualAccount(
  params: CreateVirtualAccountParams
): Promise<VirtualAccountResponse> {
  return squadFetch("/virtual-account", {
    method: "POST",
    body: JSON.stringify(params),
  });
}

export interface SimulatePaymentParams {
  virtual_account_number: string;
  amount: string; // naira as string
  sender_name: string;
  sender_account_number: string;
  sender_bank_code: string;
}

export async function simulatePayment(
  params: SimulatePaymentParams
): Promise<{ success: boolean; message: string }> {
  return squadFetch("/virtual-account/simulate/payment", {
    method: "POST",
    body: JSON.stringify(params),
  });
}

// ── Payouts ───────────────────────────────────────────────────────────────────

export interface AccountLookupResponse {
  status: number;
  success: boolean;
  message: string;
  data: {
    account_name: string;
    account_number: string;
  } | null;
}

export async function lookupAccount(params: {
  bank_code: string;
  account_number: string;
}): Promise<{ accountName: string; accountNumber: string }> {
  const res = await squadFetch<AccountLookupResponse>("/payout/account/lookup", {
    method: "POST",
    body: JSON.stringify(params),
  });
  if (!res.data?.account_name) {
    throw new Error(res.message || "Account not found");
  }
  return { accountName: res.data.account_name, accountNumber: res.data.account_number };
}

export interface TransferResponse {
  status: number;
  success: boolean;
  data: {
    transaction_reference: string;
    response_description: string;
    currency_id: string;
    amount: string;
    nip_transaction_reference: string | null;
    account_number: string;
    account_name: string;
    destination_institution_name: string;
  };
}

export async function requeryTransfer(transactionReference: string): Promise<TransferResponse> {
  return squadFetch<TransferResponse>("/payout/requery", {
    method: "POST",
    body: JSON.stringify({ transaction_reference: transactionReference }),
  });
}

export async function disburseLoan(params: {
  loanId: string;
  amount: string; // already in kobo as string
  bankCode: string;
  accountNumber: string;
  accountName: string;
}): Promise<TransferResponse["data"]> {
  const transaction_reference = `${MERCHANT_ID}_${params.loanId.replace(/-/g, "")}`;
  let res: TransferResponse;

  try {
    res = await squadFetch<TransferResponse>("/payout/transfer", {
      method: "POST",
      body: JSON.stringify({
        transaction_reference,
        amount: params.amount,
        bank_code: params.bankCode,
        currency_id: "NGN",
        account_number: params.accountNumber,
        account_name: params.accountName,
        remark: transaction_reference,
      }),
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    if (msg.includes("424")) {
      res = await requeryTransfer(transaction_reference);
    } else {
      throw err;
    }
  }

  if (!res.data?.nip_transaction_reference) {
    throw Object.assign(new Error("WALLET_PENDING"), { code: "WALLET_PENDING" });
  }
  return res.data;
}

export interface LedgerBalanceResponse {
  status: number;
  success: boolean;
  data: { balance: number; currency: string };
}

export async function getLedgerBalance(): Promise<number> {
  const res = await squadFetch<LedgerBalanceResponse>("/payout/balance");
  return res.data.balance;
}

// ── Webhook verification ──────────────────────────────────────────────────────

export interface SquadWebhookPayload {
  transaction_reference: string;
  virtual_account_number: string;
  principal_amount: string;
  settled_amount: string;
  fee_charged: string;
  transaction_date: string;
  customer_identifier: string;
  transaction_indicator: string;
  remarks: string;
  currency: string;
  channel: string;
  sender_name: string;
  meta: {
    freeze_transaction_ref: string | null;
    reason_for_frozen_transaction: string | null;
  };
  first_name: string;
  last_name: string;
  prefix: string;
  session_id: string;
  masked_sender_account_number: string;
  version: string;
  transaction_uuid: string;
  encrypted_body: string;
}

export function verifySquadSignature(
  payload: SquadWebhookPayload,
  signatureHeader: string
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
    .createHmac("sha512", SECRET_KEY)
    .update(dataToHash)
    .digest("hex");

  try {
    return crypto.timingSafeEqual(
      Buffer.from(expected, "hex"),
      Buffer.from(signatureHeader, "hex")
    );
  } catch {
    return false;
  }
}

// Keep nairaToKobo re-export for any callers that import from here
export { nairaToKobo };
