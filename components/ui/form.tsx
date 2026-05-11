"use client";

import type { InputHTMLAttributes, ButtonHTMLAttributes, ReactNode } from "react";

export function Input({
  label,
  className: _,
  ...props
}: InputHTMLAttributes<HTMLInputElement> & { label?: string }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "7px" }}>
      {label && (
        <label
          htmlFor={props.id ?? props.name}
          style={{
            fontSize: "13px",
            fontWeight: 600,
            color: "#4b5563",
            letterSpacing: "0.01em",
          }}
        >
          {label}
        </label>
      )}
      <input
        id={props.id ?? props.name}
        style={{
          width: "100%",
          padding: "15px 18px",
          fontSize: "16px",
          fontWeight: 500,
          fontFamily: "inherit",
          borderRadius: "14px",
          border: "1.5px solid transparent",
          outline: "none",
          backgroundColor: "#f3f4f6",
          color: "#111827",
          transition: "all 0.15s ease",
          appearance: "none",
          WebkitAppearance: "none",
        }}
        onFocus={(e) => {
          e.currentTarget.style.backgroundColor = "#fff";
          e.currentTarget.style.border = "1.5px solid #f25c19";
          e.currentTarget.style.boxShadow = "0 0 0 3px rgba(242,92,25,0.12)";
        }}
        onBlur={(e) => {
          e.currentTarget.style.backgroundColor = "#f3f4f6";
          e.currentTarget.style.border = "1.5px solid transparent";
          e.currentTarget.style.boxShadow = "none";
        }}
        {...props}
      />
    </div>
  );
}

export function PrimaryButton({
  children,
  pending,
  disabled,
  ...props
}: {
  children: ReactNode;
  pending?: boolean;
  disabled?: boolean;
} & ButtonHTMLAttributes<HTMLButtonElement>) {
  const isDisabled = pending || disabled;
  return (
    <button
      type="submit"
      disabled={isDisabled}
      style={{
        width: "100%",
        padding: "16px 24px",
        fontSize: "16px",
        fontWeight: 600,
        fontFamily: "inherit",
        letterSpacing: "-0.01em",
        borderRadius: "14px",
        border: "none",
        cursor: isDisabled ? "not-allowed" : "pointer",
        backgroundColor: isDisabled ? "#e5e7eb" : "#f25c19",
        color: isDisabled ? "#9ca3af" : "#fff",
        transition: "all 0.15s ease",
      }}
      onMouseEnter={(e) => {
        if (!isDisabled) e.currentTarget.style.backgroundColor = "#d94f14";
      }}
      onMouseLeave={(e) => {
        if (!isDisabled) e.currentTarget.style.backgroundColor = "#f25c19";
      }}
      onMouseDown={(e) => {
        if (!isDisabled) e.currentTarget.style.transform = "scale(0.985)";
      }}
      onMouseUp={(e) => {
        if (!isDisabled) e.currentTarget.style.transform = "scale(1)";
      }}
      {...props}
    >
      {pending ? "Please wait..." : children}
    </button>
  );
}

export function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return (
    <p
      style={{
        fontSize: "13px",
        fontWeight: 500,
        color: "#dc2626",
        marginTop: "4px",
      }}
    >
      {message}
    </p>
  );
}

export function SelectCard({
  value,
  selected,
  onSelect,
  children,
}: {
  value: string;
  selected: boolean;
  onSelect: (v: string) => void;
  children: ReactNode;
}) {
  return (
    <label
      style={{
        display: "flex",
        alignItems: "center",
        gap: "12px",
        padding: "14px 16px",
        borderRadius: "14px",
        cursor: "pointer",
        transition: "all 0.15s ease",
        backgroundColor: selected ? "#fff4ef" : "#fff",
        border: `1.5px solid ${selected ? "#f25c19" : "rgba(0,0,0,0.08)"}`,
        boxShadow: selected ? "0 0 0 3px rgba(242,92,25,0.08)" : "none",
      }}
    >
      <input
        type="radio"
        name="selection"
        value={value}
        checked={selected}
        onChange={() => onSelect(value)}
        style={{ position: "absolute", opacity: 0, pointerEvents: "none" }}
      />
      <span
        style={{
          width: "18px",
          height: "18px",
          borderRadius: "50%",
          border: `2px solid ${selected ? "#f25c19" : "rgba(0,0,0,0.2)"}`,
          flexShrink: 0,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          transition: "border-color 0.15s ease",
          backgroundColor: selected ? "#f25c19" : "transparent",
        }}
      >
        {selected && (
          <span
            style={{
              width: "6px",
              height: "6px",
              borderRadius: "50%",
              backgroundColor: "#fff",
            }}
          />
        )}
      </span>
      <span
        style={{
          fontSize: "15px",
          fontWeight: 500,
          color: selected ? "#c44112" : "#374151",
          transition: "color 0.15s ease",
        }}
      >
        {children}
      </span>
    </label>
  );
}

export function PillCard({
  value,
  selected,
  onSelect,
  children,
}: {
  value: string;
  selected: boolean;
  onSelect: (v: string) => void;
  children: ReactNode;
}) {
  return (
    <label
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "13px 10px",
        borderRadius: "14px",
        cursor: "pointer",
        textAlign: "center",
        transition: "all 0.15s ease",
        backgroundColor: selected ? "#f25c19" : "#fff",
        border: `1.5px solid ${selected ? "#f25c19" : "rgba(0,0,0,0.08)"}`,
        boxShadow: selected ? "0 4px 12px rgba(242,92,25,0.3)" : "none",
        fontSize: "14px",
        fontWeight: 600,
        color: selected ? "#fff" : "#374151",
        lineHeight: "18px",
      }}
    >
      <input
        type="radio"
        value={value}
        checked={selected}
        onChange={() => onSelect(value)}
        style={{ position: "absolute", opacity: 0, pointerEvents: "none" }}
      />
      {children}
    </label>
  );
}
