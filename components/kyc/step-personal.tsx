"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { User, Phone, Mail, MapPin, ShoppingBag } from "lucide-react";
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

export default function StepPersonal({
  traderId,
  initialData,
  onComplete,
}: StepPersonalProps) {
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

    // Manual validation
    const newErrors: Record<string, boolean> = {};
    if (!firstName.trim()) newErrors.firstName = true;
    if (!lastName.trim()) newErrors.lastName = true;
    if (!phone.trim()) newErrors.phone = true;
    if (!email.trim() || !email.includes('@')) newErrors.email = true;
    if (!market) newErrors.market = true;
    if (!businessType) newErrors.businessType = true;

    if (Object.keys(newErrors).length > 0) {
      setValidationErrors(newErrors);
      setShakeKey(k => k + 1); // trigger shake animation
      return;
    }

    setValidationErrors({});
    setLoading(true);
    setError(null);

    try {
      await submitPersonalDetails({
        traderId,
        firstName,
        lastName,
        phone,
        email,
        market,
        businessType,
      });
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
      className="px-4"
    >
      <div className="mb-6">
        <h2
          className="text-xl font-medium mb-1"
          style={{ color: "var(--color-text-primary, #1a1815)" }}
        >
          Tell us about yourself
        </h2>
        <p
          className="text-sm"
          style={{ color: "var(--color-text-secondary, #5c5852)" }}
        >
          We need a few details to set up your account
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* First Name */}
        <InputField
          icon={<User size={18} />}
          label="First name"
          value={firstName}
          onChange={(v) => { setFirstName(v); setValidationErrors(e => ({...e, firstName: false})); }}
          placeholder="Sade"
          hasError={validationErrors.firstName}
          shakeKey={shakeKey}
        />

        {/* Last Name */}
        <InputField
          icon={<User size={18} />}
          label="Last name"
          value={lastName}
          onChange={(v) => { setLastName(v); setValidationErrors(e => ({...e, lastName: false})); }}
          placeholder="Adebayo"
          hasError={validationErrors.lastName}
          shakeKey={shakeKey}
        />

        {/* Phone */}
        <InputField
          icon={<Phone size={18} />}
          label="Phone number"
          value={phone}
          onChange={(v) => { setPhone(v); setValidationErrors(e => ({...e, phone: false})); }}
          placeholder="08012345678"
          type="tel"
          hasError={validationErrors.phone}
          shakeKey={shakeKey}
        />

        {/* Email */}
        <InputField
          icon={<Mail size={18} />}
          label="Email address"
          value={email}
          onChange={(v) => { setEmail(v); setValidationErrors(e => ({...e, email: false})); }}
          placeholder="sade@example.com"
          type="email"
          hasError={validationErrors.email}
          shakeKey={shakeKey}
        />

        {/* Market */}
        <SelectField
          icon={<MapPin size={18} />}
          label="Market"
          value={market}
          onChange={(v) => { setMarket(v); setValidationErrors(e => ({...e, market: false})); }}
          options={MARKETS}
          placeholder="Select your market"
          hasError={validationErrors.market}
          shakeKey={shakeKey}
        />

        {/* Business Type */}
        <SelectField
          icon={<ShoppingBag size={18} />}
          label="Business type"
          value={businessType}
          onChange={(v) => { setBusinessType(v); setValidationErrors(e => ({...e, businessType: false})); }}
          options={BUSINESS_TYPES}
          placeholder="What do you sell?"
          hasError={validationErrors.businessType}
          shakeKey={shakeKey}
        />

        {error && (
          <p className="text-sm" style={{ color: "var(--color-danger, #a8211a)" }}>
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full py-3.5 rounded-xl text-sm font-semibold transition-all"
          style={{
            backgroundColor: loading
              ? "var(--color-surface-muted, #edebe3)"
              : "var(--color-squad-orange, #f25c19)",
            color: loading ? "var(--color-text-tertiary)" : "#fff",
            cursor: loading ? "not-allowed" : "pointer",
          }}
        >
          {loading ? "Saving..." : "Continue"}
        </button>
      </form>
    </motion.div>
  );
}

/* ------------------------------------------------------------------ */
/*  Reusable field components                                          */
/* ------------------------------------------------------------------ */

function InputField({
  icon,
  label,
  value,
  onChange,
  placeholder,
  type = "text",
  hasError,
  shakeKey,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
  type?: string;
  hasError?: boolean;
  shakeKey?: number;
}) {
  return (
    <motion.div
      animate={hasError ? { x: [-8, 8, -8, 8, -4, 4, 0] } : { x: 0 }}
      transition={{ duration: 0.4 }}
      key={hasError ? `shake-${shakeKey}` : "idle"}
    >
      <label
        className="block text-xs font-medium mb-1.5"
        style={{
          color: "var(--color-text-secondary, #5c5852)",
          letterSpacing: "0.02em",
        }}
      >
        {label}
      </label>
      <div
        className="flex items-center gap-3 rounded-lg px-3.5 py-3 transition-colors"
        style={{
          backgroundColor: hasError ? "var(--color-danger-bg, #fae8e6)" : "var(--color-surface-raised, #fff)",
          border: `1px solid ${hasError ? "var(--color-danger, #a8211a)" : "var(--border-default, rgba(26,24,21,0.14))"}`,
        }}
      >
        <span style={{ color: "var(--color-text-tertiary, #8b867e)" }}>{icon}</span>
        <input
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="flex-1 bg-transparent outline-none text-sm"
          style={{ color: "var(--color-text-primary, #1a1815)" }}
        />
      </div>
    </motion.div>
  );
}

function SelectField({
  icon,
  label,
  value,
  onChange,
  options,
  placeholder,
  hasError,
  shakeKey,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: string[];
  placeholder: string;
  hasError?: boolean;
  shakeKey?: number;
}) {
  return (
    <motion.div
      animate={hasError ? { x: [-8, 8, -8, 8, -4, 4, 0] } : { x: 0 }}
      transition={{ duration: 0.4 }}
      key={hasError ? `shake-${shakeKey}` : "idle"}
    >
      <label
        className="block text-xs font-medium mb-1.5"
        style={{
          color: "var(--color-text-secondary, #5c5852)",
          letterSpacing: "0.02em",
        }}
      >
        {label}
      </label>
      <div
        className="flex items-center gap-3 rounded-lg px-3.5 py-3 transition-colors"
        style={{
          backgroundColor: hasError ? "var(--color-danger-bg, #fae8e6)" : "var(--color-surface-raised, #fff)",
          border: `1px solid ${hasError ? "var(--color-danger, #a8211a)" : "var(--border-default, rgba(26,24,21,0.14))"}`,
        }}
      >
        <span style={{ color: "var(--color-text-tertiary, #8b867e)" }}>{icon}</span>
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="flex-1 bg-transparent outline-none text-sm"
          style={{
            color: value ? "var(--color-text-primary, #1a1815)" : "var(--color-text-tertiary, #8b867e)",
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
      </div>
    </motion.div>
  );
}
