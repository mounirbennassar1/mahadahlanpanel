export function Card({
  title,
  subtitle,
  right,
  children,
  padding = true,
  className,
}: {
  title?: React.ReactNode;
  subtitle?: React.ReactNode;
  right?: React.ReactNode;
  children: React.ReactNode;
  padding?: boolean;
  className?: string;
}) {
  return (
    <div
      className={className}
      style={{
        background: "var(--surface)",
        border: "1px solid var(--hairline)",
        borderRadius: "var(--radius)",
        padding: padding ? 22 : 0,
        overflow: "hidden",
      }}
    >
      {(title || right) && (
        <div
          style={{
            display: "flex",
            alignItems: "flex-start",
            justifyContent: "space-between",
            marginBottom: 18,
            gap: 12,
          }}
        >
          <div>
            {title && (
              <div
                style={{
                  fontFamily: "var(--font-display)",
                  fontSize: 16,
                  fontWeight: 700,
                  letterSpacing: "-0.01em",
                  color: "var(--ink)",
                }}
              >
                {title}
              </div>
            )}
            {subtitle && (
              <div style={{ fontSize: 12.5, color: "var(--ink-3)", marginTop: 3 }}>{subtitle}</div>
            )}
          </div>
          {right}
        </div>
      )}
      {children}
    </div>
  );
}
