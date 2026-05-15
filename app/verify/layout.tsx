export default function VerifyLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "flex-start",
        width: "100%",
        padding: "24px 16px 40px",
        backgroundColor: "#F9FAFB",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: "480px",
          minHeight: "calc(100vh - 64px)",
          display: "flex",
          flexDirection: "column",
          position: "relative",
          borderRadius: "24px",
          overflow: "hidden",
          backgroundColor: "#fff",
          boxShadow: "0 4px 32px rgba(0,0,0,0.08), 0 0 0 1px rgba(0,0,0,0.04)",
        }}
      >
        {/* Header */}
        <header
          style={{
            padding: "20px 20px 12px",
            borderBottom: "1px solid rgba(0,0,0,0.05)",
            display: "flex",
            alignItems: "center",
            gap: "10px",
          }}
        >
          {/* SC mark */}
          <div
            style={{
              width: "32px",
              height: "32px",
              borderRadius: "9px",
              backgroundColor: "#f25c19",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
            }}
          >
            <span
              style={{
                color: "#fff",
                fontSize: "13px",
                fontWeight: 700,
                fontFamily: "inherit",
                letterSpacing: "-0.03em",
              }}
            >
              SC
            </span>
          </div>
          <div>
            <p
              style={{
                fontSize: "15px",
                fontWeight: 700,
                color: "#111827",
                letterSpacing: "-0.02em",
                lineHeight: 1,
                fontFamily: "inherit",
              }}
            >
              Squad <span style={{ color: "#f25c19" }}>Credit</span>
            </p>
            <p
              style={{
                fontSize: "11px",
                color: "#9ca3af",
                fontWeight: 500,
                marginTop: "2px",
                letterSpacing: "0.04em",
                textTransform: "uppercase",
              }}
            >
              Identity verification
            </p>
          </div>
        </header>

        {/* Content */}
        <main
          style={{
            flex: 1,
            paddingBottom: "32px",
            overflowY: "auto",
            overflowX: "hidden",
            position: "relative",
          }}
        >
          {children}
        </main>
      </div>
    </div>
  );
}
