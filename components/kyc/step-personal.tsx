"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { submitPersonalDetails } from "@/app/verify/actions";

interface StepPersonalProps {
  traderId: string;
  initialData?: {
    firstName?: string;
    lastName?: string;
    phone?: string;
    email?: string;
    market?: string;
    businessType?: string;
  };
  onComplete: () => void;
}

const MARKETS = [
  "Balogun Market",
  "Computer Village",
  "Alaba International",
  "Trade Fair Complex",
  "Ariaria Market",
  "Onitsha Main Market",
  "Oshodi Market",
  "Mile 12 Market",
  "Idumota Market",
  "Ladipo Market",
  "Other",
];

const BUSINESS_TYPES = [
  "fabric",
  "electronics",
  "food",
  "clothing",
  "cosmetics",
  "phones",
  "accessories",
  "building materials",
  "auto parts",
  "other",
];

export default function StepPersonal({ traderId, initialData, onComplete }: StepPersonalProps) {
  const [firstName, setFirstName] = useState(initialData?.firstName ?? "");
  const [lastName, setLastName] = useState(initialData?.lastName ?? "");
  const [phone, setPhone] = useState(initialData?.phone ?? "");
  const [email, setEmail] = useState(initialData?.email ?? "");
  const [market, setMarket] = useState(initialData?.market ?? "");
  const [businessType, setBusinessType] = useState(initialData?.businessType ?? "");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [validationErrors, setValidationErrors] = useState<Record<string, boolean>>({});
  const [shakeKey, setShakeKey] = useState(0);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const newErrors: Record<string, boolean> = {};
    if (!firstName.trim()) newErrors.firstName = true;
    if (!lastName.trim()) newErrors.lastName = true;
    if (!phone.trim()) newErrors.phone = true;
    if (!email.trim() || !email.includes("@")) newErrors.email = true;
    if (!market) newErrors.market = true;
    if (!businessType) newErrors.businessType = true;

    if (Object.keys(newErrors).length > 0) {
      setValidationErrors(newErrors);
      setShakeKey((k) => k + 1);
      return;
    }

    setValidationErrors({});
    setLoading(true);
    setError(null);

    try {
      await submitPersonalDetails({ traderId, firstName, lastName, phone, email, market, businessType });
      onComplete();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      style={{ padding: "20px 20px 0" }}
    >
      <div style={{ marginBottom: "24px" }}>
        <h2
          style={{
            fontSize: "20px",
            fontWeight: 700,
            color: "#111827",
            letterSpacing: "-0.025em",
            marginBottom: "4px",
            fontFamily: "inherit",
          }}
        >
          Tell us about yourself
        </h2>
        <p style={{ fontSize: "14px", color: "#6b7280", fontWeight: 400 }}>
          We need a few details to set up your account
        </p>
      </div>

      <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
          <KycInput
            label="First name"
            value={firstName}
            onChange={(v) => { setFirstName(v); setValidationErrors((e) => ({ ...e, firstName: false })); }}
            placeholder="Sade"
            hasError={validationErrors.firstName}
            shakeKey={shakeKey}
          />
          <KycInput
            label="Last name"
            value={lastName}
            onChange={(v) => { setLastName(v); setValidationErrors((e) => ({ ...e, lastName: false })); }}
            placeholder="Adebayo"
            hasError={validationErrors.lastName}
            shakeKey={shakeKey}
          />
        </div>

        <KycInput
          label="Phone number"
          value={phone}
          onChange={(v) => { setPhone(v); setValidationErrors((e) => ({ ...e, phone: false })); }}
          placeholder="08012345678"
          type="tel"
          hasError={validationErrors.phone}
          shakeKey={shakeKey}
        />

        <KycInput
          label="Email address"
          value={email}
          onChange={(v) => { setEmail(v); setValidationErrors((e) => ({ ...e, email: false })); }}
          placeholder="sade@example.com"
          type="email"
          hasError={validationErrors.email}
          shakeKey={shakeKey}
        />

        <KycSelect
          label="Market"
          value={market}
          onChange={(v) => { setMarket(v); setValidationErrors((e) => ({ ...e, market: false })); }}
          options={MARKETS}
          placeholder="Select your market"
          hasError={validationErrors.market}
          shakeKey={shakeKey}
        />

        <KycSelect
          label="Business type"
          value={businessType}
          onChange={(v) => { setBusinessType(v); setValidationErrors((e) => ({ ...e, businessType: false })); }}
          options={BUSINESS_TYPES}
          placeholder="What do you sell?"
          hasError={validationErrors.businessType}
          shakeKey={shakeKey}
        />

        {error && (
          <p style={{ fontSize: "13px", fontWeight: 500, color: "#dc2626" }}>{error}</p>
        )}

        <button
          type="submit"
          disabled={loading}
          style={{
            width: "100%",
            padding: "16px 24px",
            fontSize: "16px",
            fontWeight: 600,
            fontFamily: "inherit",
            letterSpacing: "-0.01em",
            borderRadius: "14px",
            border: "none",
            cursor: loading ? "not-allowed" : "pointer",
            backgroundColor: loading ? "#e5e7eb" : "#f25c19",
            color: loading ? "#9ca3af" : "#fff",
            transition: "all 0.15s ease",
            marginTop: "4px",
          }}
        >
          {loading ? "Saving..." : "Continue"}
        </button>
      </form>
    </motion.div>
  );
}

function KycInput({
  label,
  value,
  onChange,
  placeholder,
  type = "text",
  hasError,
  shakeKey,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
  type?: string;
  hasError?: boolean;
  shakeKey?: number;
}) {
  const [focused, setFocused] = useState(false);

  return (
    <motion.div
      animate={hasError ? { x: [-6, 6, -6, 6, -3, 3, 0] } : { x: 0 }}
      transition={{ duration: 0.35 }}
      key={hasError ? `shake-${shakeKey}` : "idle"}
      style={{ display: "flex", flexDirection: "column", gap: "6px" }}
    >
      <label
        style={{
          fontSize: "13px",
          fontWeight: 600,
          color: hasError ? "#dc2626" : "#4b5563",
          letterSpacing: "0.01em",
          fontFamily: "inherit",
        }}
      >
        {label}
      </label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        style={{
          width: "100%",
          padding: "13px 14px",
          fontSize: "15px",
          fontWeight: 500,
          fontFamily: "inherit",
          borderRadius: "12px",
          border: hasError
            ? "1.5px solid #dc2626"
            : focused
            ? "1.5px solid #f25c19"
            : "1.5px solid transparent",
          outline: "none",
          backgroundColor: hasError ? "#fef2f2" : focused ? "#fff" : "#f3f4f6",
          color: "#111827",
          boxShadow: focused && !hasError ? "0 0 0 3px rgba(242,92,25,0.12)" : "none",
          transition: "all 0.15s ease",
          appearance: "none",
          WebkitAppearance: "none",
        }}
      />
    </motion.div>
  );
}

function KycSelect({
  label,
  value,
  onChange,
  options,
  placeholder,
  hasError,
  shakeKey,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: string[];
  placeholder: string;
  hasError?: boolean;
  shakeKey?: number;
}) {
  const [focused, setFocused] = useState(false);

  return (
    <motion.div
      animate={hasError ? { x: [-6, 6, -6, 6, -3, 3, 0] } : { x: 0 }}
      transition={{ duration: 0.35 }}
      key={hasError ? `shake-${shakeKey}` : "idle"}
      style={{ display: "flex", flexDirection: "column", gap: "6px" }}
    >
      <label
        style={{
          fontSize: "13px",
          fontWeight: 600,
          color: hasError ? "#dc2626" : "#4b5563",
          letterSpacing: "0.01em",
          fontFamily: "inherit",
        }}
      >
        {label}
      </label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        style={{
          width: "100%",
          padding: "13px 14px",
          fontSize: "15px",
          fontWeight: 500,
          fontFamily: "inherit",
          borderRadius: "12px",
          border: hasError
            ? "1.5px solid #dc2626"
            : focused
            ? "1.5px solid #f25c19"
            : "1.5px solid transparent",
          outline: "none",
          backgroundColor: hasError ? "#fef2f2" : focused ? "#fff" : "#f3f4f6",
          color: value ? "#111827" : "#9ca3af",
          boxShadow: focused && !hasError ? "0 0 0 3px rgba(242,92,25,0.12)" : "none",
          transition: "all 0.15s ease",
          appearance: "none",
          WebkitAppearance: "none",
          cursor: "pointer",
        }}
      >
        <option value="" disabled>
          {placeholder}
        </option>
        {options.map((opt) => (
          <option key={opt} value={opt}>
            {opt.charAt(0).toUpperCase() + opt.slice(1)}
          </option>
        ))}
      </select>
    </motion.div>
  );
}
