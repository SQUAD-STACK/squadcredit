import KycProgressBar from "@/components/kyc/progress-bar";

export default function VerifyLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div
      className="min-h-screen flex justify-center items-center w-full py-8 px-4 sm:py-12"
      style={{ backgroundColor: "var(--color-surface-muted, #edebe3)" }}
    >
      <div
        className="w-full max-w-4xl min-h-[80vh] max-h-[95vh] flex flex-col relative rounded-3xl overflow-hidden"
        style={{
          backgroundColor: "var(--color-surface-base, #fafaf7)",
          boxShadow: "0 20px 40px rgba(0,0,0,0.08), 0 1px 3px rgba(0,0,0,0.05)",
        }}
      >
        {/* Header */}
        <header
          className="px-4 pt-6 pb-2"
          style={{ backgroundColor: "var(--color-surface-base)" }}
        >
          <p
            className="text-lg font-medium mb-1"
            style={{
              fontFamily: "var(--font-display)",
              color: "var(--color-squad-orange, #f25c19)",
            }}
          >
            SquadCredit
          </p>
          <p
            className="text-xs"
            style={{
              color: "var(--color-text-tertiary, #8b867e)",
              letterSpacing: "0.02em",
              textTransform: "uppercase",
            }}
          >
            Identity verification
          </p>
        </header>

        {/* Content */}
        <main className="flex-1 pb-8 overflow-y-auto overflow-x-hidden relative">
          {children}
        </main>
      </div>
    </div>
  );
}
