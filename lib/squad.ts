import { nairaToKobo } from "./format";

const BASE_URL = process.env.SQUAD_API_BASE_URL!;
const SECRET_KEY = process.env.SQUAD_SECRET_KEY!;
const MERCHANT_ID = "SBK9CS1TJ5";

function assertSquadConfig() {
  if (!BASE_URL) {
    throw new Error("SQUAD_API_BASE_URL is missing.");
  }

  if (!SECRET_KEY) {
    throw new Error("SQUAD_SECRET_KEY is missing.");
  }

  if (!SECRET_KEY.startsWith("sandbox_sk_")) {
    throw new Error("SQUAD_SECRET_KEY must be a Squad sandbox secret key that starts with sandbox_sk_.");
  }
}

async function squadFetch<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
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
    throw new Error(
      `Squad API ${res.status} on ${path}: ${JSON.stringify(json)}`
    );
  }

  return json;
}

export interface CreateVirtualAccountParams {
  customer_identifier: string;
  first_name: string;
  last_name: string;
  middle_name?: string;
  mobile_num: string;
  dob: string; // mm/dd/yyyy
  email: string;
  bvn: string;
  gender: "1" | "2";
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
}

export async function simulatePayment(
  params: SimulatePaymentParams
): Promise<{ success: boolean; message: string }> {
  return squadFetch("/virtual-account/simulate/payment", {
    method: "POST",
    body: JSON.stringify(params),
  });
}

export interface AccountLookupParams {
  bank_code: string; // NIP 6-digit code
  account_number: string;
}

export interface AccountLookupResponse {
  status: number;
  success: boolean;
  data: {
    account_name: string;
    account_number: string;
  };
}

export async function lookupAccount(
  params: AccountLookupParams
): Promise<AccountLookupResponse> {
  return squadFetch("/payout/account/lookup", {
    method: "POST",
    body: JSON.stringify(params),
  });
}

export interface TransferParams {
  loan_id: string;
  amount_naira: number;
  bank_code: string; // NIP 6-digit code
  account_number: string;
  account_name: string;
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

export async function disburseLoan(
  params: TransferParams
): Promise<TransferResponse> {
  const transaction_reference = `${MERCHANT_ID}_loan_${params.loan_id}`;

  return squadFetch("/payout/transfer", {
    method: "POST",
    body: JSON.stringify({
      transaction_reference,
      amount: nairaToKobo(params.amount_naira),
      bank_code: params.bank_code,
      currency_id: "NGN",
      account_number: params.account_number,
      account_name: params.account_name,
      remark: "SquadCredit advance",
    }),
  });
}

export async function requeryTransfer(
  transaction_reference: string
): Promise<TransferResponse> {
  return squadFetch("/payout/requery", {
    method: "POST",
    body: JSON.stringify({ transaction_reference }),
  });
}

import crypto from "crypto";

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
