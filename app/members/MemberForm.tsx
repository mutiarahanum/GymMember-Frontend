"use client";

import { useState } from "react";
import type { Member } from "@/types";

type Props = {
  member?: Member;
  onCancel?: () => void;
};

export default function MemberForm({ member, onCancel }: Props) {
  const [nama, setNama] = useState(member?.nama ?? "");
  const [noHp, setNoHp] = useState(member?.no_hp ?? "");
  const [alamat, setAlamat] = useState(member?.alamat ?? "");
  const [tanggalDaftar, setTanggalDaftar] = useState(
    member?.tanggal_daftar ?? ""
  );
  const [pesan, setPesan] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setPesan("");
    setLoading(true);

    try {
      const response = await fetch(
        member ? `/api/members/${member.id}` : "/api/members",
        {
          method: member ? "PUT" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            nama,
            no_hp: noHp,
            alamat,
            tanggal_daftar: tanggalDaftar,
          }),
        }
      );

      const result = await response.json();

      if (!response.ok || result.success === false) {
        const detail = result.errors
          ? Object.values(result.errors).flat().join(", ")
          : result.message;

        throw new Error(detail || "Gagal menyimpan data member.");
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
    <section
      style={{
        marginBottom: "24px",
        padding: "20px",
        border: "1px solid #ddd",
        borderRadius: "8px",
      }}
    >
      <h2 style={{ marginTop: 0, marginBottom: "20px" }}>
        {member ? "Edit Member" : "Tambah Member"}
      </h2>
      
      <form
        onSubmit={handleSubmit}
        style={{ display: "grid", gap: "12px", maxWidth: "500px" }}
      >
        <input
          required
          placeholder="Nama member"
          value={nama}
          onChange={(e) => setNama(e.target.value)}
          style={inputStyle}
        />

        <input
          required
          placeholder="Nomor HP"
          value={noHp}
          onChange={(e) => setNoHp(e.target.value)}
          style={inputStyle}
        />

        <textarea
          required
          placeholder="Alamat"
          value={alamat}
          onChange={(e) => setAlamat(e.target.value)}
          style={inputStyle}
        />

        <label>
          Tanggal daftar
          <input
            required
            type="date"
            value={tanggalDaftar}
            onChange={(e) => setTanggalDaftar(e.target.value)}
            style={inputStyle}
          />
        </label>

        <div style={{ display: "flex", gap: "8px" }}>
          <button type="submit" disabled={loading} style={buttonStyle}>
            {loading
              ? "Menyimpan..."
              : member
                ? "Simpan Perubahan"
                : "Simpan Member"}
          </button>

          {member && onCancel && (
            <button type="button" onClick={onCancel} style={cancelStyle}>
              Batal
            </button>
          )}
        </div>

        {pesan && <p style={{ color: "red" }}>{pesan}</p>}
      </form>
    </section>
  );
}

const inputStyle = {
  width: "100%",
  boxSizing: "border-box" as const,
  padding: "10px",
  border: "1px solid #ccc",
  borderRadius: "6px",
  fontSize: "14px",
};

const buttonStyle = {
  padding: "10px 16px",
  backgroundColor: "#2563eb",
  color: "white",
  border: "none",
  borderRadius: "6px",
  cursor: "pointer",
};

const cancelStyle = {
  padding: "10px 16px",
  backgroundColor: "#eee",
  border: "1px solid #ccc",
  borderRadius: "6px",
  cursor: "pointer",
};