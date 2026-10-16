
"use client";

import { useState } from "react";
import type { MembershipPackage } from "@/types";

type Props = {
  item?: MembershipPackage;
  onCancel?: () => void;
};

export default function PackageForm({ item, onCancel }: Props) {
  const [namaPaket, setNamaPaket] = useState(item?.nama_paket ?? "");
  const [durasi, setDurasi] = useState(
    item ? String(item.durasi) : ""
  );
  const [harga, setHarga] = useState(item ? String(item.harga) : "");
  const [pesan, setPesan] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setPesan("");
    setLoading(true);

    try {
      const response = await fetch(
        item
          ? `/api/membership-packages/${item.id}`
          : "/api/membership-packages",
        {
          method: item ? "PUT" : "POST",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
          body: JSON.stringify({
            nama_paket: namaPaket,
            durasi: Number(durasi),
            harga: Number(harga),
          }),
        }
      );

      const result = await response.json();

      if (!response.ok || result.success === false) {
        const detail = result.errors
          ? Object.values(result.errors).flat().join(", ")
          : result.message;

        throw new Error(detail || "Gagal menyimpan paket membership.");
      }

      window.location.reload();
    } catch (error) {
      setPesan(
        error instanceof Error ? error.message : "Terjadi kesalahan."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <section style={sectionStyle}>
      <h2>{item ? "Edit Paket Membership" : "Tambah Paket Membership"}</h2>

      <form onSubmit={handleSubmit} style={formStyle}>
        <input
          required
          placeholder="Nama paket"
          value={namaPaket}
          onChange={(e) => setNamaPaket(e.target.value)}
          style={inputStyle}
        />

        <label>
          Durasi (hari)
          <input
            required
            type="number"
            min="1"
            value={durasi}
            onChange={(e) => setDurasi(e.target.value)}
            style={inputStyle}
          />
        </label>

        <label>
          Harga (Rp)
          <input
            required
            type="number"
            min="0"
            step="0.01"
            value={harga}
            onChange={(e) => setHarga(e.target.value)}
            style={inputStyle}
          />
        </label>

        <div style={{ display: "flex", gap: "8px" }}>
          <button type="submit" disabled={loading} style={buttonStyle}>
            {loading
              ? "Menyimpan..."
              : item
                ? "Simpan Perubahan"
                : "Simpan Paket"}
          </button>

          {item && onCancel && (
            <button
              type="button"
              onClick={onCancel}
              style={cancelStyle}
            >
              Batal
            </button>
          )}
        </div>

        {pesan && <p style={{ color: "red" }}>{pesan}</p>}
      </form>
    </section>
  );
}

const sectionStyle = {
  marginBottom: "24px",
  padding: "20px",
  border: "1px solid #ddd",
  borderRadius: "8px",
};

const formStyle = {
  display: "grid",
  gap: "12px",
  maxWidth: "500px",
};

const inputStyle = {
  display: "block",
  width: "100%",
  boxSizing: "border-box" as const,
  padding: "10px",
  marginTop: "6px",
  border: "1px solid #ccc",
  borderRadius: "6px",
  fontSize: "14px",
};

const buttonStyle = {
  padding: "10px 16px",
  backgroundColor: "#2563eb",
  color: "white",
  border: "none",
  borderRadius: "5px",
  cursor: "pointer",
};

const cancelStyle = {
  padding: "10px 16px",
  backgroundColor: "#eee",
  border: "1px solid #ccc",
  borderRadius: "5px",
  cursor: "pointer",
};
