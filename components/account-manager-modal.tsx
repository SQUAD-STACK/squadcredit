"use client";

import { useEffect, useState } from "react";
import { X, Copy, ExternalLink, Trash2, AlertCircle, Loader2 } from "lucide-react";
import { motion } from "framer-motion";
import { getTraderAccount, deactivateTraderAccount } from "@/app/(app)/_actions/manage-account";

interface AccountManagerModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface ManagedAccount {
  name: string;
  phone: string;
  virtualAccount: string | null | undefined;
  bankName: string;
  beneficiaryAccount: string | null | undefined;
  verificationStatus: string | null | undefined;
}

export default function AccountManagerModal({ open, onOpenChange }: AccountManagerModalProps) {
  const [account, setAccount] = useState<ManagedAccount | null>(null);
  const [loading, setLoading] = useState(true);
  const [deactivating, setDeactivating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  useEffect(() => {
    if (open) {
      setLoading(true);
      setError(null);
      setConfirmDelete(false);

      getTraderAccount().then((result) => {
        if (result.error) {
          setError(result.error);
        } else if (result.success) {
          setAccount(result.account);
        }
        setLoading(false);
      });
    }
  }, [open]);

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDeactivate = async () => {
    setDeactivating(true);
    setError(null);

    try {
      const result = await deactivateTraderAccount();
      if (result.error) {
        setError(result.error);
      } else {
        setError(null);
        setTimeout(() => {
          onOpenChange(false);
          window.location.reload();
        }, 1500);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setDeactivating(false);
    }
  };

  if (!open) return null;

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 70,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      {/* Backdrop */}
      <div
        onClick={() => {
          if (!confirmDelete && !deactivating) onOpenChange(false);
        }}
        style={{
          position: "absolute",
          inset: 0,
          background: "rgba(0,0,0,0.35)",
          backdropFilter: "blur(6px)",
        }}
      />

      {/* Modal */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        style={{
          position: "relative",
          width: "min(96vw, 520px)",
          background: "#fff",
          borderRadius: 20,
          boxShadow: "0 28px 80px rgba(15,23,42,0.4)",
          border: "1px solid rgba(15,23,42,0.08)",
          overflow: "hidden",
        }}
      >
        {/* Header */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "16px 20px",
            borderBottom: "1px solid rgba(15,23,42,0.06)",
            background: "rgba(255,255,255,0.72)",
            backdropFilter: "blur(10px)",
          }}
        >
          <h2 style={{ fontSize: 18, fontWeight: 700, color: "#111827" }}>Account management</h2>
          <button
            onClick={() => onOpenChange(false)}
            disabled={confirmDelete || deactivating}
            style={{
              background: "transparent",
              border: "none",
              padding: 8,
              cursor: confirmDelete || deactivating ? "not-allowed" : "pointer",
              opacity: confirmDelete || deactivating ? 0.5 : 1,
            }}
          >
            <X size={20} color="#6b7280" />
          </button>
        </div>

        {/* Content */}
        <div style={{ padding: 20, maxHeight: "80vh", overflow: "auto" }}>
          {loading ? (
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "40px 20px", gap: 12 }}>
              <Loader2 size={32} className="animate-spin" color="#f25c19" />
              <p style={{ color: "#6b7280", fontSize: 14 }}>Loading your account...</p>
            </div>
          ) : error && !confirmDelete ? (
            <div style={{ background: "rgba(220,38,38,0.08)", border: "1px solid rgba(220,38,38,0.16)", borderRadius: 12, padding: 16, display: "flex", gap: 12 }}>
              <AlertCircle size={20} color="#dc2626" style={{ flexShrink: 0, marginTop: 2 }} />
              <div>
                <p style={{ fontSize: 14, fontWeight: 600, color: "#dc2626", marginBottom: 4 }}>Error loading account</p>
                <p style={{ fontSize: 13, color: "#7f1d1d" }}>{error}</p>
              </div>
            </div>
          ) : confirmDelete ? (
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              <div
                style={{
                  background: "rgba(220,38,38,0.08)",
                  border: "1px solid rgba(220,38,38,0.16)",
                  borderRadius: 12,
                  padding: 16,
                  display: "flex",
                  gap: 12,
                }}
              >
                <AlertCircle size={20} color="#dc2626" style={{ flexShrink: 0, marginTop: 2 }} />
                <div>
                  <p style={{ fontSize: 14, fontWeight: 600, color: "#dc2626", marginBottom: 4 }}>Deactivate this account?</p>
                  <p style={{ fontSize: 13, color: "#7f1d1d", lineHeight: 1.5 }}>This will deactivate your Squad virtual account on SquadCredit. You will need to contact Squad support to fully close the virtual account and stop receiving payments.</p>
                </div>
              </div>

              {error && (
                <div style={{ background: "#fee2e2", border: "1px solid #fecaca", borderRadius: 12, padding: 12 }}>
                  <p style={{ fontSize: 13, color: "#7f1d1d" }}>{error}</p>
                </div>
              )}

              <div style={{ display: "flex", gap: 12 }}>
                <button
                  onClick={() => setConfirmDelete(false)}
                  disabled={deactivating}
                  style={{
                    flex: 1,
                    padding: 12,
                    border: "1px solid rgba(15,23,42,0.08)",
                    borderRadius: 12,
                    background: "#f3f4f6",
                    color: "#374151",
                    fontSize: 14,
                    fontWeight: 600,
                    cursor: deactivating ? "not-allowed" : "pointer",
                    opacity: deactivating ? 0.5 : 1,
                  }}
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeactivate}
                  disabled={deactivating}
                  style={{
                    flex: 1,
                    padding: 12,
                    border: "none",
                    borderRadius: 12,
                    background: "#dc2626",
                    color: "#fff",
                    fontSize: 14,
                    fontWeight: 600,
                    cursor: deactivating ? "not-allowed" : "pointer",
                    opacity: deactivating ? 0.7 : 1,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 8,
                  }}
                >
                  {deactivating ? (
                    <>
                      <Loader2 size={16} className="animate-spin" />
                      Deactivating...
                    </>
                  ) : (
                    <>
                      <Trash2 size={16} />
                      Deactivate
                    </>
                  )}
                </button>
              </div>
            </div>
          ) : account ? (
            <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
              {/* Account Info Card */}
              <div style={{ background: "#fffaf6", border: "1px solid rgba(242,92,25,0.16)", borderRadius: 16, padding: 16 }}>
                <div style={{ fontSize: 12, fontWeight: 600, color: "#7c2d12", textTransform: "uppercase", letterSpacing: "0.04em", marginBottom: 8 }}>Account holder</div>
                <div style={{ fontSize: 18, fontWeight: 700, color: "#1a1815", marginBottom: 16 }}>{account.name}</div>

                <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                  <div>
                    <div style={{ fontSize: 11, fontWeight: 600, color: "#7c2d12", textTransform: "uppercase", letterSpacing: "0.04em", marginBottom: 4 }}>Virtual account number</div>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <code
                        style={{
                          fontFamily: "'JetBrains Mono', monospace",
                          fontSize: 14,
                          fontWeight: 600,
                          color: "#1a1815",
                          background: "#fff",
                          padding: "8px 10px",
                          borderRadius: 6,
                          flex: 1,
                        }}
                      >
                        {account.virtualAccount}
                      </code>
                      <button
                        onClick={() => handleCopy(account.virtualAccount)}
                        style={{
                          background: "#fff",
                          border: "1px solid rgba(15,23,42,0.08)",
                          padding: 8,
                          borderRadius: 6,
                          cursor: "pointer",
                          color: "#6b7280",
                        }}
                      >
                        <Copy size={16} />
                      </button>
                    </div>
                    {copied && <p style={{ fontSize: 11, color: "#059669", marginTop: 4 }}>✓ Copied to clipboard</p>}
                  </div>

                  <div>
                    <div style={{ fontSize: 11, fontWeight: 600, color: "#7c2d12", textTransform: "uppercase", letterSpacing: "0.04em", marginBottom: 4 }}>Bank</div>
                    <p style={{ fontSize: 14, color: "#1a1815", fontWeight: 500 }}>{account.bankName}</p>
                  </div>

                  <div>
                    <div style={{ fontSize: 11, fontWeight: 600, color: "#7c2d12", textTransform: "uppercase", letterSpacing: "0.04em", marginBottom: 4 }}>Phone</div>
                    <p style={{ fontSize: 14, color: "#1a1815", fontWeight: 500 }}>{account.phone}</p>
                  </div>

                  <div>
                    <div style={{ fontSize: 11, fontWeight: 600, color: "#7c2d12", textTransform: "uppercase", letterSpacing: "0.04em", marginBottom: 4 }}>Verification status</div>
                    <div style={{ display: "inline-block", padding: "4px 12px", borderRadius: 999, background: account.verificationStatus === "verified" ? "rgba(5,150,105,0.12)" : "rgba(245,158,11,0.12)", color: account.verificationStatus === "verified" ? "#047857" : "#92400e", fontSize: 12, fontWeight: 600 }}>
                      {account.verificationStatus === "verified" ? "Verified" : "Pending"}
                    </div>
                  </div>
                </div>
              </div>

              {/* Info Box */}
              <div style={{ background: "rgba(59,130,246,0.08)", border: "1px solid rgba(59,130,246,0.16)", borderRadius: 12, padding: 14, display: "flex", gap: 10 }}>
                <div style={{ fontSize: 12, color: "#1e40af", lineHeight: 1.6 }}>
                  <strong>Squad Account Limit:</strong> If you&apos;ve reached your limit, you can deactivate this account below or log into your Squad dashboard to manage multiple accounts.
                </div>
              </div>

              {/* Action Buttons */}
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                <a
                  href="https://dashboard.squadco.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    width: "100%",
                    padding: "14px",
                    borderRadius: 12,
                    border: "1px solid rgba(15,23,42,0.12)",
                    background: "#fff",
                    color: "#111827",
                    fontSize: 14,
                    fontWeight: 600,
                    textAlign: "center",
                    textDecoration: "none",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 8,
                  }}
                >
                  <ExternalLink size={16} />
                  Go to Squad dashboard
                </a>

                <button
                  onClick={() => setConfirmDelete(true)}
                  style={{
                    width: "100%",
                    padding: "14px",
                    borderRadius: 12,
                    border: "1px solid rgba(220,38,38,0.16)",
                    background: "rgba(220,38,38,0.08)",
                    color: "#dc2626",
                    fontSize: 14,
                    fontWeight: 600,
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 8,
                  }}
                >
                  <Trash2 size={16} />
                  Deactivate this account
                </button>
              </div>
            </div>
          ) : null}
        </div>
      </motion.div>
    </div>
  );
}
