"use client";

/**
 * 루트 레이아웃까지 실패할 때 사용. 자체 html/body 필요(Next.js 규약).
 * 글로벌 CSS가 없을 수 있어 유틸리티 의존을 최소화함.
 */
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="ko">
      <body
        style={{
          margin: 0,
          minHeight: "100vh",
          fontFamily:
            'ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, "Noto Sans KR", "Apple SD Gothic Neo", "Malgun Gothic", sans-serif',
          background: "#f8fafc",
          color: "#0f172a",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "1.5rem",
        }}
      >
        <div style={{ textAlign: "center", maxWidth: "28rem" }}>
          <h1 style={{ fontSize: "1.125rem", fontWeight: 700, marginBottom: "0.5rem" }}>
            문제가 발생했습니다
          </h1>
          <p style={{ fontSize: "0.875rem", color: "#475569", marginBottom: "1.5rem", lineHeight: 1.6 }}>
            일시적인 오류일 수 있습니다. 잠시 후 다시 시도해 주세요.
          </p>
          <button
            type="button"
            onClick={() => reset()}
            style={{
              height: "2.75rem",
              paddingLeft: "1.5rem",
              paddingRight: "1.5rem",
              borderRadius: "0.75rem",
              border: "none",
              background: "#124559",
              color: "#fff",
              fontSize: "0.875rem",
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            다시 시도
          </button>
        </div>
      </body>
    </html>
  );
}
