import Link from "next/link";

const menuItems = [
  {
    title: "Data Member",
    href: "/members",
  },
  {
    title: "Paket Membership",
    href: "/packages",
  },
  {
    title: "Pendaftaran Membership",
    href: "/memberships",
  },
];

export default function Home() {
  return (
    <main
      style={{
        minHeight: "100vh",
        padding: "48px 24px",
        fontFamily: "Arial, sans-serif",
        backgroundColor: "#f4f6f9",
      }}
    >
      <div style={{ maxWidth: "1000px", margin: "0 auto" }}>
        <h1
          style={{
            fontSize: "32px",
            marginBottom: "40px",
            textAlign: "center",
            color: "#1e293b",
          }}
        >
          GymMember Dashboard
        </h1>

        <div
          style={{
            display: "grid",
            gridTemplateColumns:
              "repeat(auto-fit, minmax(220px, 1fr))",
            gap: "24px",
          }}
        >
          {menuItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                minHeight: "180px",
                padding: "28px 20px",
                boxSizing: "border-box",
                backgroundColor: "#ffffff",
                border: "1px solid #e2e8f0",
                borderRadius: "14px",
                textDecoration: "none",
                color: "#1e293b",
                textAlign: "center",
                boxShadow: "0 4px 12px rgba(15, 23, 42, 0.04)",
                transition: "transform 0.2s, box-shadow 0.2s",
              }}
            >
              <h2
                style={{
                  fontSize: "20px",
                  fontWeight: 700,
                  marginBottom: "20px",
                  lineHeight: 1.5,
                }}
              >
                {item.title}
              </h2>

              <span
                style={{
                  color: "#2563eb",
                  fontSize: "14px",
                  fontWeight: 600,
                }}
              >
                Buka Halaman →
              </span>
            </Link>
          ))}
        </div>
      </div>
    </main>
  );
}
