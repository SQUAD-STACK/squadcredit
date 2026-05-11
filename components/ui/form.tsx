"use client";

import type { InputHTMLAttributes, ButtonHTMLAttributes, ReactNode } from "react";

export function Input({
  label,
  className: _,
  ...props
}: InputHTMLAttributes<HTMLInputElement> & { label?: string }) {
  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label
          htmlFor={props.id ?? props.name}
          style={{
            fontSize: "13px",
            fontWeight: 500,
            color: "var(--color-text-secondary, #5c5852)",
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
          padding: "14px 16px",
          fontSize: "15px",
          lineHeight: "22px",
          borderRadius: "10px",
          border: "none",
          outline: "none",
          backgroundColor: "#f4f3ee",
          color: "#1a1815",
          boxShadow: "0 0 0 1.5px transparent",
          transition: "box-shadow 0.15s ease, background-color 0.15s ease",
          appearance: "none",
          WebkitAppearance: "none",
        }}
        onFocus={(e) => {
          e.currentTarget.style.backgroundColor = "#fff";
          e.currentTarget.style.boxShadow = "0 0 0 2px #f25c19";
        }}
        onBlur={(e) => {
          e.currentTarget.style.backgroundColor = "#f4f3ee";
          e.currentTarget.style.boxShadow = "0 0 0 1.5px transparent";
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
        fontSize: "15px",
        fontWeight: 500,
        borderRadius: "10px",
        border: "none",
        cursor: isDisabled ? "not-allowed" : "pointer",
        backgroundColor: isDisabled ? "#fde0d2" : "#f25c19",
        color: isDisabled ? "#a93808" : "#fff",
        transition: "background-color 0.15s ease, transform 0.1s ease",
        letterSpacing: "0.01em",
      }}
      onMouseEnter={(e) => {
        if (!isDisabled)
          e.currentTarget.style.backgroundColor = "#d44a0f";
      }}
      onMouseLeave={(e) => {
        if (!isDisabled)
          e.currentTarget.style.backgroundColor = "#f25c19";
      }}
      onMouseDown={(e) => {
        if (!isDisabled) e.currentTarget.style.transform = "scale(0.98)";
      }}
      onMouseUp={(e) => {
        if (!isDisabled) e.currentTarget.style.transform = "scale(1)";
      }}
      {...props}
    >
      {pending ? "Please wait…" : children}
    </button>
  );
}

export function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return (
    <p
      style={{
        fontSize: "13px",
        color: "#a8211a",
        marginTop: "6px",
        display: "flex",
        alignItems: "center",
        gap: "4px",
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
        borderRadius: "10px",
        cursor: "pointer",
        transition: "all 0.15s ease",
        backgroundColor: selected ? "#fef1eb" : "#fff",
        boxShadow: selected
          ? "0 0 0 1.5px #f25c19"
          : "0 0 0 1px rgba(26,24,21,0.1)",
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
          border: `2px solid ${selected ? "#f25c19" : "rgba(26,24,21,0.2)"}`,
          flexShrink: 0,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          transition: "border-color 0.15s ease",
        }}
      >
        {selected && (
          <span
            style={{
              width: "8px",
              height: "8px",
              borderRadius: "50%",
              backgroundColor: "#f25c19",
            }}
          />
        )}
      </span>
      <span
        style={{
          fontSize: "15px",
          color: selected ? "#a93808" : "#1a1815",
          fontWeight: selected ? 500 : 400,
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
        padding: "12px 8px",
        borderRadius: "10px",
        cursor: "pointer",
        textAlign: "center",
        transition: "all 0.15s ease",
        backgroundColor: selected ? "#fef1eb" : "#fff",
        boxShadow: selected
          ? "0 0 0 1.5px #f25c19"
          : "0 0 0 1px rgba(26,24,21,0.1)",
        fontSize: "14px",
        color: selected ? "#a93808" : "#1a1815",
        fontWeight: selected ? 500 : 400,
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
