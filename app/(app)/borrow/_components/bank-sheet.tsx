"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { Command } from "cmdk";
import { NIGERIAN_BANKS, TOP_BANK_CODES, getBank } from "@/lib/banks";
import { lookupBankAccount } from "../_actions/lookupBankAccount";
import { saveDisbursementAccount } from "../_actions/saveDisbursementAccount";

interface BankSheetProps {
  open: boolean;
  onClose: () => void;
  onSaved: () => void;
  pendingAmount: number;
  pendingTenorDays: number;
}

const topBanks = TOP_BANK_CODES.map((code) => getBank(code)).filter(Boolean) as { code: string; name: string }[];
const otherBanks = NIGERIAN_BANKS.filter((b) => !TOP_BANK_CODES.includes(b.code)).sort((a, b) => a.name.localeCompare(b.name));

export default function BankSheet({ open, onClose, onSaved }: BankSheetProps) {
  const [bankCode, setBankCode] = useState("");
  const [accountNumber, setAccountNumber] = useState("");
  const [bankSearch, setBankSearch] = useState("");
  const [bankDropdownOpen, setBankDropdownOpen] = useState(false);
  const [lookupState, setLookupState] = useState<
    | { status: "idle" }
    | { status: "loading" }
    | { status: "success"; accountName: string }
    | { status: "error"; message: string }
  >({ status: "idle" });
  const [saving, setSaving] = useState(false);

  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const selectedBank = bankCode ? getBank(bankCode) : null;

  const reset = () => {
    setBankCode("");
    setAccountNumber("");
    setBankSearch("");
    setLookupState({ status: "idle" });
    setSaving(false);
  };

  useEffect(() => {
    if (!open) reset();
  }, [open]);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);

    if (!bankCode || !/^\d{10}$/.test(accountNumber)) {
      setLookupState({ status: "idle" });
      return;
    }

    setLookupState({ status: "loading" });
    debounceRef.current = setTimeout(async () => {
      const res = await lookupBankAccount({ bank_code: bankCode, account_number: accountNumber });
      if ("accountName" in res) {
        setLookupState({ status: "success", accountName: res.accountName });
      } else {
        setLookupState({ status: "error", message: res.error });
      }
    }, 600);

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [bankCode, accountNumber]);

  const canSave = lookupState.status === "success";

  const handleSave = useCallback(async () => {
    if (!canSave || lookupState.status !== "success") return;
    setSaving(true);
    const res = await saveDisbursementAccount({
      bankCode,
      accountNumber,
      accountName: lookupState.accountName,
    });
    setSaving(false);
    if ("success" in res) {
      onSaved();
    } else {
      setLookupState({ status: "error", message: res.error });
    }
  }, [canSave, lookupState, bankCode, accountNumber, onSaved]);

  return (
    <Dialog.Root open={open} onOpenChange={(v) => { if (!v) onClose(); }}>
      <Dialog.Portal>
        <Dialog.Overlay
          style={{
            position: "fixed",
            inset: 0,
            backgroundColor: "rgba(0,0,0,0.45)",
            zIndex: 50,
          }}
        />
        <Dialog.Content
          style={{
            position: "fixed",
            bottom: 0,
            left: 0,
            right: 0,
            zIndex: 51,
            backgroundColor: "#fff",
            borderRadius: "24px 24px 0 0",
            padding: "24px 20px 40px",
            maxHeight: "90vh",
            overflowY: "auto",
            boxShadow: "0 -8px 40px rgba(0,0,0,0.15)",
          }}
          aria-describedby={undefined}
        >
          {/* Handle */}
          <div style={{ width: "36px", height: "4px", backgroundColor: "#e5e7eb", borderRadius: "99px", margin: "0 auto 24px" }} />

          <Dialog.Title style={{ fontSize: "20px", fontWeight: 700, color: "#111827", letterSpacing: "-0.03em", marginBottom: "6px" }}>
            Where should we send your money?
          </Dialog.Title>
          <p style={{ fontSize: "14px", color: "#6b7280", marginBottom: "24px", lineHeight: "20px" }}>
            We will send your loan here every time you borrow.
          </p>

          {/* Bank selector */}
          <div style={{ marginBottom: "12px" }}>
            <label style={{ fontSize: "12px", fontWeight: 600, color: "#6b7280", display: "block", marginBottom: "6px", letterSpacing: "0.02em" }}>
              Bank
            </label>
            <button
              onClick={() => setBankDropdownOpen(true)}
              style={{
                width: "100%",
                padding: "14px 16px",
                backgroundColor: "#f9fafb",
                border: "1.5px solid #f3f4f6",
                borderRadius: "12px",
                fontSize: "15px",
                fontWeight: selectedBank ? 600 : 400,
                color: selectedBank ? "#111827" : "#9ca3af",
                fontFamily: "inherit",
                textAlign: "left",
                cursor: "pointer",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <span>{selectedBank ? selectedBank.name : "Select a bank"}</span>
              <span style={{ color: "#9ca3af", fontSize: "12px" }}>▾</span>
            </button>
          </div>

          {/* Account number */}
          <div style={{ marginBottom: "16px" }}>
            <label style={{ fontSize: "12px", fontWeight: 600, color: "#6b7280", display: "block", marginBottom: "6px", letterSpacing: "0.02em" }}>
              Account number
            </label>
            <input
              type="text"
              inputMode="numeric"
              maxLength={10}
              value={accountNumber}
              onChange={(e) => setAccountNumber(e.target.value.replace(/\D/g, "").slice(0, 10))}
              placeholder="10-digit account number"
              style={{
                width: "100%",
                padding: "14px 16px",
                backgroundColor: "#f9fafb",
                border: "1.5px solid #f3f4f6",
                borderRadius: "12px",
                fontSize: "15px",
                fontFamily: "var(--font-mono, 'JetBrains Mono', monospace)",
                letterSpacing: "0.05em",
                color: "#111827",
                outline: "none",
                boxSizing: "border-box",
              }}
            />
          </div>

          {/* Lookup feedback */}
          {lookupState.status === "loading" && (
            <p style={{ fontSize: "13px", color: "#9ca3af", marginBottom: "16px" }}>Looking up account...</p>
          )}
          {lookupState.status === "success" && (
            <p style={{ fontSize: "13px", fontWeight: 600, color: "#059669", marginBottom: "16px" }}>
              Account name: {lookupState.accountName}
            </p>
          )}
          {lookupState.status === "error" && (
            <p style={{ fontSize: "13px", color: "#dc2626", marginBottom: "16px" }}>
              {lookupState.message}
            </p>
          )}

          {/* Save button */}
          <button
            onClick={handleSave}
            disabled={!canSave || saving}
            style={{
              width: "100%",
              padding: "17px 24px",
              backgroundColor: canSave && !saving ? "#f25c19" : "#f3f4f6",
              color: canSave && !saving ? "#fff" : "#9ca3af",
              borderRadius: "14px",
              fontSize: "16px",
              fontWeight: 700,
              fontFamily: "inherit",
              letterSpacing: "-0.02em",
              border: "none",
              cursor: canSave && !saving ? "pointer" : "not-allowed",
              transition: "background-color 0.15s ease",
            }}
          >
            {saving ? "Saving..." : "Save and continue"}
          </button>
        </Dialog.Content>
      </Dialog.Portal>

      {/* Bank search modal */}
      {bankDropdownOpen && (
        <Dialog.Root open onOpenChange={(v) => { if (!v) setBankDropdownOpen(false); }}>
          <Dialog.Portal>
            <Dialog.Overlay style={{ position: "fixed", inset: 0, backgroundColor: "rgba(0,0,0,0.5)", zIndex: 60 }} />
            <Dialog.Content
              style={{
                position: "fixed",
                bottom: 0,
                left: 0,
                right: 0,
                zIndex: 61,
                backgroundColor: "#fff",
                borderRadius: "24px 24px 0 0",
                maxHeight: "80vh",
                display: "flex",
                flexDirection: "column",
                boxShadow: "0 -8px 40px rgba(0,0,0,0.2)",
              }}
              aria-describedby={undefined}
            >
              <Dialog.Title style={{ fontSize: "16px", fontWeight: 700, color: "#111827", padding: "20px 20px 0", letterSpacing: "-0.02em" }}>
                Choose your bank
              </Dialog.Title>
              <Command
                style={{ display: "flex", flexDirection: "column", flex: 1, overflow: "hidden" }}
                filter={(value, search) => {
                  if (!search) return 1;
                  return value.toLowerCase().includes(search.toLowerCase()) ? 1 : 0;
                }}
              >
                <div style={{ padding: "12px 16px", borderBottom: "1px solid #f3f4f6" }}>
                  <Command.Input
                    value={bankSearch}
                    onValueChange={setBankSearch}
                    placeholder="Search banks..."
                    style={{
                      width: "100%",
                      padding: "10px 14px",
                      backgroundColor: "#f9fafb",
                      border: "1.5px solid #f3f4f6",
                      borderRadius: "10px",
                      fontSize: "15px",
                      fontFamily: "inherit",
                      color: "#111827",
                      outline: "none",
                      boxSizing: "border-box",
                    }}
                  />
                </div>
                <Command.List style={{ flex: 1, overflowY: "auto", padding: "8px 0" }}>
                  <Command.Empty style={{ padding: "16px 20px", fontSize: "14px", color: "#9ca3af" }}>
                    No banks found.
                  </Command.Empty>

                  {!bankSearch && (
                    <>
                      <div style={{ padding: "8px 20px 4px", fontSize: "11px", fontWeight: 600, color: "#9ca3af", letterSpacing: "0.06em", textTransform: "uppercase" }}>
                        Popular banks
                      </div>
                      {topBanks.map((bank) => (
                        <Command.Item
                          key={bank.code}
                          value={bank.name}
                          onSelect={() => {
                            setBankCode(bank.code);
                            setBankSearch("");
                            setBankDropdownOpen(false);
                          }}
                          style={{
                            padding: "14px 20px",
                            fontSize: "15px",
                            fontWeight: bankCode === bank.code ? 600 : 400,
                            color: bankCode === bank.code ? "#f25c19" : "#111827",
                            cursor: "pointer",
                            borderBottom: "1px solid rgba(0,0,0,0.04)",
                          }}
                        >
                          {bank.name}
                        </Command.Item>
                      ))}
                      <div style={{ height: "1px", backgroundColor: "#f3f4f6", margin: "8px 0" }} />
                      <div style={{ padding: "8px 20px 4px", fontSize: "11px", fontWeight: 600, color: "#9ca3af", letterSpacing: "0.06em", textTransform: "uppercase" }}>
                        All banks
                      </div>
                    </>
                  )}

                  {otherBanks.map((bank) => (
                    <Command.Item
                      key={bank.code}
                      value={bank.name}
                      onSelect={() => {
                        setBankCode(bank.code);
                        setBankSearch("");
                        setBankDropdownOpen(false);
                      }}
                      style={{
                        padding: "14px 20px",
                        fontSize: "15px",
                        fontWeight: bankCode === bank.code ? 600 : 400,
                        color: bankCode === bank.code ? "#f25c19" : "#111827",
                        cursor: "pointer",
                        borderBottom: "1px solid rgba(0,0,0,0.04)",
                      }}
                    >
                      {bank.name}
                    </Command.Item>
                  ))}
                </Command.List>
              </Command>
            </Dialog.Content>
          </Dialog.Portal>
        </Dialog.Root>
      )}
    </Dialog.Root>
  );
}
