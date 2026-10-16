"use client";

import { useCallback, useEffect, useState } from "react";
import type { Payment, Membership } from "@/types";

type PaymentForm = {
  membership_id: string;
  jumlah_pembayaran: string;
  tanggal_pembayaran: string;
  metode_pembayaran: string;
};

const initialForm: PaymentForm = {
  membership_id: "",
  jumlah_pembayaran: "",
  tanggal_pembayaran: new Date().toLocaleDateString("en-CA"),
  metode_pembayaran: "transfer",
};

export default function PaymentsPage() {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [memberships, setMemberships] = useState<Membership[]>([]);
  const [form, setForm] = useState<PaymentForm>(initialForm);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const loadData = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const [paymentResponse, membershipResponse] = await Promise.all([
        fetch("/api/payments", { cache: "no-store" }),
        fetch("/api/memberships", { cache: "no-store" }),
      ]);

      const paymentResult = await paymentResponse.json();
      const membershipResult = await membershipResponse.json();

      if (!paymentResponse.ok || paymentResult.success === false) {
        throw new Error(
          paymentResult.message || "Gagal mengambil data pembayaran."
        );
      }

      if (!membershipResponse.ok || membershipResult.success === false) {
        throw new Error(
          membershipResult.message || "Gagal mengambil data membership."
        );
      }

      setPayments(Array.isArray(paymentResult.data) ? paymentResult.data : []);
      setMemberships(
        Array.isArray(membershipResult.data) ? membershipResult.data : []
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal memuat data.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadData();
  }, [loadData]);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSaving(true);
    setError("");
    setMessage("");

    try {
      const response = await fetch("/api/payments", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({
          ...form,
          membership_id: Number(form.membership_id),
          jumlah_pembayaran: Number(form.jumlah_pembayaran),
        }),
      });

      const result = await response.json();

      if (!response.ok || result.success === false) {
        const validationMessages = result.errors
          ? Object.values(result.errors).flat().join(" ")
          : "";

        throw new Error(
          validationMessages ||
            result.message ||
            "Gagal menyimpan pembayaran."
        );
      }

      setMessage(result.message || "Pembayaran berhasil ditambahkan.");

      setForm({
        ...initialForm,
        tanggal_pembayaran: new Date().toLocaleDateString("en-CA"),
      });

      await loadData();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Gagal menyimpan pembayaran."
      );
    } finally {
      setSaving(false);
    }
  }

  const cellStyle = {
    border: "1px solid #ddd",
    padding: "12px",
    textAlign: "left" as const,
    verticalAlign: "top" as const,
  };

  const inputStyle = {
    width: "100%",
    padding: "10px",
    marginTop: "6px",
    boxSizing: "border-box" as const,
    border: "1px solid #ccc",
    borderRadius: "5px",
  };

  return (
    <main style={{ padding: "32px", fontFamily: "Arial, sans-serif" }}>
      <h1>Data Pembayaran</h1>
      <p>Kelola transaksi pembayaran membership gym.</p>

      <section
        style={{
          maxWidth: "650px",
          marginTop: "24px",
          marginBottom: "32px",
          padding: "24px",
          border: "1px solid #ddd",
          borderRadius: "8px",
        }}
      >
        <h2>Tambah Pembayaran</h2>

        <form onSubmit={handleSubmit}>
          <label>
            Pendaftaran Membership
            <select
              required
              value={form.membership_id}
              onChange={(e) =>
                setForm({ ...form, membership_id: e.target.value })
              }
              style={inputStyle}
            >
              <option value="">-- Pilih membership --</option>

              {memberships.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.member?.nama ?? `Member ID ${item.member_id}`} —{" "}
                  {item.membership_package?.nama_paket ??
                    `Paket ID ${item.membership_package_id}`}{" "}
                  (ID {item.id})
                </option>
              ))}
            </select>
          </label>

          <label style={{ display: "block", marginTop: "16px" }}>
            Jumlah Pembayaran (Rp)
            <input
              required
              type="number"
              min="0"
              step="1"
              value={form.jumlah_pembayaran}
              onChange={(e) =>
                setForm({ ...form, jumlah_pembayaran: e.target.value })
              }
              placeholder="Contoh: 100000"
              style={inputStyle}
            />
          </label>

          <label style={{ display: "block", marginTop: "16px" }}>
            Tanggal Pembayaran
            <input
              required
              type="date"
              value={form.tanggal_pembayaran}
              onChange={(e) =>
                setForm({ ...form, tanggal_pembayaran: e.target.value })
              }
              style={inputStyle}
            />
          </label>

          <label style={{ display: "block", marginTop: "16px" }}>
            Metode Pembayaran
            <select
              required
              value={form.metode_pembayaran}
              onChange={(e) =>
                setForm({ ...form, metode_pembayaran: e.target.value })
              }
              style={inputStyle}
            >
              <option value="transfer">Transfer</option>
              <option value="tunai">Tunai</option>
              <option value="debit">Debit</option>
              <option value="qris">QRIS</option>
            </select>
          </label>

          {error && (
            <p role="alert" style={{ color: "red", marginTop: "16px" }}>
              {error}
            </p>
          )}

          {message && (
            <p role="status" style={{ color: "green", marginTop: "16px" }}>
              {message}
            </p>
          )}

          <button
            type="submit"
            disabled={saving || memberships.length === 0}
            style={{
              marginTop: "20px",
              padding: "11px 18px",
              background:
                saving || memberships.length === 0 ? "#999" : "#2563eb",
              color: "white",
              border: "none",
              borderRadius: "5px",
              cursor:
                saving || memberships.length === 0
                  ? "not-allowed"
                  : "pointer",
            }}
          >
            {saving ? "Menyimpan..." : "Simpan Pembayaran"}
          </button>

          {memberships.length === 0 && !loading && (
            <p style={{ color: "#666" }}>
              Belum ada pendaftaran membership. Tambahkan pendaftaran
              terlebih dahulu.
            </p>
          )}
        </form>
      </section>

      <h2>Daftar Transaksi</h2>

      {error && payments.length === 0 && (
        <p style={{ color: "red" }}>Gagal memuat data: {error}</p>
      )}

      {loading ? (
        <p>Memuat data pembayaran...</p>
      ) : (
        <div style={{ overflowX: "auto" }}>
          <table
            style={{
              width: "100%",
              borderCollapse: "collapse",
              marginTop: "16px",
            }}
          >
            <thead>
              <tr>
                <th style={cellStyle}>ID</th>
                <th style={cellStyle}>Nama Member</th>
                <th style={cellStyle}>Paket</th>
                <th style={cellStyle}>Jumlah Pembayaran</th>
                <th style={cellStyle}>Tanggal Pembayaran</th>
                <th style={cellStyle}>Metode</th>
              </tr>
            </thead>

            <tbody>
              {payments.map((item) => (
                <tr key={item.id}>
                  <td style={cellStyle}>{item.id}</td>
                  <td style={cellStyle}>
                    {item.membership?.member?.nama ?? "-"}
                  </td>
                  <td style={cellStyle}>
                    {item.membership?.membership_package?.nama_paket ?? "-"}
                  </td>
                  <td style={cellStyle}>
                    {Number(item.jumlah_pembayaran).toLocaleString("id-ID", {
                      style: "currency",
                      currency: "IDR",
                      maximumFractionDigits: 0,
                    })}
                  </td>
                  <td style={cellStyle}>
                    {item.tanggal_pembayaran?.slice(0, 10)}
                  </td>
                  <td style={cellStyle}>{item.metode_pembayaran}</td>
                </tr>
              ))}

              {payments.length === 0 && (
                <tr>
                  <td style={cellStyle} colSpan={6}>
                    Belum ada data pembayaran.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </main>
  );
}
