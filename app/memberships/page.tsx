
"use client";

import { useCallback, useEffect, useState } from "react";
import MembershipForm from "./MembershipForm";
import type { Membership } from "@/types";

const ITEMS_PER_PAGE = 10;

type PaymentData = {
  id: number;
  jumlah_pembayaran: number | string;
  tanggal_pembayaran: string;
  metode_pembayaran: string;
};

type MembershipWithPayments = Membership & {
  payments?: PaymentData[];
};

export default function MembershipsPage() {
  const [memberships, setMemberships] = useState<
    MembershipWithPayments[]
  >([]);
  const [showForm, setShowForm] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadMemberships = useCallback(async () => {
    try {
      setError("");

      const response = await fetch("/api/memberships", {
        headers: { Accept: "application/json" },
        cache: "no-store",
      });

      const result = await response.json();

      if (!response.ok || result.success === false) {
        throw new Error(
          result.message || "Gagal mengambil data membership."
        );
      }

      setMemberships(
        Array.isArray(result.data) ? result.data : []
      );
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Gagal mengambil data membership."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadMemberships();
  }, [loadMemberships]);

  const totalPages = Math.max(
    1,
    Math.ceil(memberships.length / ITEMS_PER_PAGE)
  );

  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;

  const displayedMemberships = memberships.slice(
    startIndex,
    startIndex + ITEMS_PER_PAGE
  );

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  function closeForm() {
    setShowForm(false);
  }

  function openAddForm() {
    setShowForm(true);

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }

  async function deleteMembership(item: MembershipWithPayments) {
    if (
      !window.confirm(
        `Yakin ingin menghapus pendaftaran membership ID ${item.id}?`
      )
    ) {
      return;
    }

    try {
      const response = await fetch(`/api/memberships/${item.id}`, {
        method: "DELETE",
        headers: { Accept: "application/json" },
      });

      const result = await response.json();

      if (!response.ok || result.success === false) {
        throw new Error(
          result.message ||
            "Gagal menghapus pendaftaran membership."
        );
      }

      await loadMemberships();
    } catch (err) {
      window.alert(
        err instanceof Error
          ? err.message
          : "Gagal menghapus pendaftaran membership."
      );
    }
  }

  function formatDate(date?: string | null) {
    if (!date) return "-";

    const dateOnly = date.slice(0, 10);
    const parts = dateOnly.split("-");

    if (parts.length !== 3) return dateOnly;

    return `${parts[2]}/${parts[1]}/${parts[0]}`;
  }

  function formatRupiah(amount?: number | string | null) {
    if (
      amount === undefined ||
      amount === null ||
      amount === ""
    ) {
      return "-";
    }

    const value = Number(amount);

    if (!Number.isFinite(value)) return "-";

    return `Rp ${value.toLocaleString("id-ID")}`;
  }

  function getLatestPayment(item: MembershipWithPayments) {
    if (!Array.isArray(item.payments) || item.payments.length === 0) {
      return undefined;
    }

    return [...item.payments].sort((a, b) => {
      const dateDifference =
        new Date(b.tanggal_pembayaran).getTime() -
        new Date(a.tanggal_pembayaran).getTime();

      if (dateDifference !== 0) return dateDifference;

      return b.id - a.id;
    })[0];
  }

  return (
    <main style={pageStyle}>
      <div style={headerStyle}>
        <h1 style={titleStyle}>Pendaftaran Membership</h1>

        <div style={headerActionsStyle}>
          <div style={summaryCardStyle}>
            <div>
              <p style={summaryLabelStyle}>Total Pendaftaran</p>
              <h2 style={summaryNumberStyle}>
                {memberships.length}
              </h2>
            </div>
          </div>

          <button
            type="button"
            onClick={showForm ? closeForm : openAddForm}
            style={
              showForm ? secondaryButtonStyle : primaryButtonStyle
            }
          >
            {showForm ? "Tutup Form" : "+ Tambah Pendaftaran"}
          </button>
        </div>
      </div>

      {showForm && (
        <section style={cardStyle}>
          <div style={sectionHeaderStyle}>
            <h2 style={sectionTitleStyle}>
              Tambah Pendaftaran Membership
            </h2>

            <button
              type="button"
              onClick={closeForm}
              style={secondaryButtonStyle}
            >
              Batal
            </button>
          </div>

          <MembershipForm
            key="new"
            onSuccess={() => {
              closeForm();
              setCurrentPage(1);
              void loadMemberships();
            }}
            onCancel={closeForm}
          />
        </section>
      )}

      {error && (
        <div style={errorStyle}>
          <p>Gagal memuat data: {error}</p>
          <button
            type="button"
            onClick={() => void loadMemberships()}
            style={secondaryButtonStyle}
          >
            Coba Lagi
          </button>
        </div>
      )}

      <section style={cardStyle}>
        <div style={sectionHeaderStyle}>
          <h2 style={sectionTitleStyle}>Daftar Pendaftaran</h2>
        </div>

        {loading ? (
          <p style={messageStyle}>Memuat data membership...</p>
        ) : (
          <>
            <div style={{ overflowX: "auto" }}>
              <table style={tableStyle}>
                <thead>
                  <tr>
                    <th style={headerCellStyle}>No</th>
                    <th style={headerCellStyle}>Nama Member</th>
                    <th style={headerCellStyle}>Paket</th>
                    <th style={headerCellStyle}>Tanggal Mulai</th>
                    <th style={headerCellStyle}>Tanggal Berakhir</th>
                    <th style={headerCellStyle}>
                      Jumlah Pembayaran
                    </th>
                    <th style={headerCellStyle}>
                      Metode Pembayaran
                    </th>
                    <th style={headerCellStyle}>Status</th>
                    <th style={headerCellStyle}>Aksi</th>
                  </tr>
                </thead>

                <tbody>
                  {displayedMemberships.map((item, index) => {
                    const payment = getLatestPayment(item);

                    return (
                      <tr key={item.id}>
                        <td style={cellStyle}>
                          {startIndex + index + 1}
                        </td>

                        <td style={cellStyle}>
                          {item.member?.nama ??
                            `Member ID ${item.member_id}`}
                        </td>

                        <td style={cellStyle}>
                          {item.membership_package?.nama_paket ??
                            `Paket ID ${item.membership_package_id}`}
                        </td>

                        <td style={cellStyle}>
                          {formatDate(item.tanggal_mulai)}
                        </td>

                        <td style={cellStyle}>
                          {formatDate(item.tanggal_berakhir)}
                        </td>

                        <td style={cellStyle}>
                          {formatRupiah(payment?.jumlah_pembayaran)}
                        </td>

                        <td style={cellStyle}>
                          {payment?.metode_pembayaran
                            ? payment.metode_pembayaran.toUpperCase()
                            : "-"}
                        </td>

                        <td style={cellStyle}>
                          <span
                            style={
                              item.status_membership?.toLowerCase() ===
                              "aktif"
                                ? activeStatusStyle
                                : inactiveStatusStyle
                            }
                          >
                            {item.status_membership ?? "-"}
                          </span>
                        </td>

                        <td style={cellStyle}>
                          <button
                            type="button"
                            onClick={() =>
                              void deleteMembership(item)
                            }
                            style={deleteButtonStyle}
                          >
                            Hapus
                          </button>
                        </td>
                      </tr>
                    );
                  })}

                  {memberships.length === 0 && (
                    <tr>
                      <td style={emptyCellStyle} colSpan={9}>
                        Belum ada pendaftaran membership.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {memberships.length > 0 && (
              <div style={paginationStyle}>
                <p style={paginationInfoStyle}>
                  Menampilkan {startIndex + 1}–
                  {Math.min(
                    startIndex + ITEMS_PER_PAGE,
                    memberships.length
                  )}{" "}
                  dari {memberships.length} data
                </p>

                <div style={actionGroupStyle}>
                  <button
                    type="button"
                    disabled={currentPage === 1}
                    onClick={() =>
                      setCurrentPage((page) =>
                        Math.max(1, page - 1)
                      )
                    }
                    style={{
                      ...paginationButtonStyle,
                      ...(currentPage === 1
                        ? disabledButtonStyle
                        : {}),
                    }}
                  >
                    Sebelumnya
                  </button>

                  <span style={pageNumberStyle}>
                    Halaman {currentPage} dari {totalPages}
                  </span>

                  <button
                    type="button"
                    disabled={currentPage >= totalPages}
                    onClick={() =>
                      setCurrentPage((page) =>
                        Math.min(totalPages, page + 1)
                      )
                    }
                    style={{
                      ...paginationButtonStyle,
                      ...(currentPage >= totalPages
                        ? disabledButtonStyle
                        : {}),
                    }}
                  >
                    Berikutnya
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </section>
    </main>
  );
}

const pageStyle = {
  padding: "32px 24px",
  maxWidth: "1600px",
  margin: "0 auto",
  color: "#1e293b",
  fontFamily: "Arial, Helvetica, sans-serif",
};

const headerStyle = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  flexWrap: "wrap" as const,
  gap: "24px",
  marginBottom: "28px",
};

const titleStyle = {
  fontSize: "30px",
  fontWeight: 700,
  color: "#0f172a",
  margin: 0,
};

const headerActionsStyle = {
  display: "flex",
  alignItems: "center",
  flexWrap: "wrap" as const,
  gap: "12px",
};

const primaryButtonStyle = {
  padding: "13px 18px",
  backgroundColor: "#2563eb",
  color: "#ffffff",
  border: "none",
  borderRadius: "9px",
  fontSize: "13px",
  fontWeight: 600,
  cursor: "pointer",
  whiteSpace: "nowrap" as const,
};

const secondaryButtonStyle = {
  padding: "9px 14px",
  backgroundColor: "#ffffff",
  color: "#334155",
  border: "1px solid #cbd5e1",
  borderRadius: "8px",
  fontSize: "13px",
  fontWeight: 600,
  cursor: "pointer",
};

const summaryCardStyle = {
  display: "flex",
  alignItems: "center",
  gap: "16px",
  backgroundColor: "#ffffff",
  border: "1px solid #e2e8f0",
  borderRadius: "12px",
  padding: "12px 18px",
  boxShadow: "0 2px 8px rgba(15, 23, 42, 0.03)",
};

const summaryLabelStyle = {
  color: "#64748b",
  fontSize: "13px",
  margin: "0 0 5px",
};

const summaryNumberStyle = {
  fontSize: "27px",
  fontWeight: 700,
  color: "#2563eb",
  margin: 0,
};

const cardStyle = {
  backgroundColor: "#ffffff",
  border: "1px solid #e2e8f0",
  borderRadius: "14px",
  padding: "24px",
  marginBottom: "24px",
  minWidth: 0,
  boxShadow: "0 2px 8px rgba(15, 23, 42, 0.03)",
};

const sectionHeaderStyle = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  flexWrap: "wrap" as const,
  gap: "12px",
  marginBottom: "20px",
};

const sectionTitleStyle = {
  fontSize: "18px",
  fontWeight: 700,
  color: "#0f172a",
  margin: 0,
};

const tableStyle = {
  width: "100%",
  borderCollapse: "collapse" as const,
  fontSize: "14px",
};

const headerCellStyle = {
  padding: "14px 12px",
  textAlign: "left" as const,
  backgroundColor: "#eff6ff",
  color: "#1e40af",
  borderBottom: "1px solid #dbeafe",
  fontWeight: 600,
  whiteSpace: "nowrap" as const,
};

const cellStyle = {
  padding: "14px 12px",
  textAlign: "left" as const,
  borderBottom: "1px solid #e2e8f0",
  verticalAlign: "middle" as const,
  color: "#475569",
  lineHeight: 1.6,
};

const emptyCellStyle = {
  ...cellStyle,
  textAlign: "center" as const,
  padding: "32px 12px",
  color: "#64748b",
};

const actionGroupStyle = {
  display: "flex",
  alignItems: "center",
  flexWrap: "wrap" as const,
  gap: "8px",
};

const deleteButtonStyle = {
  padding: "8px 13px",
  backgroundColor: "#fef2f2",
  color: "#dc2626",
  border: "1px solid #fecaca",
  borderRadius: "7px",
  fontSize: "12px",
  fontWeight: 600,
  cursor: "pointer",
};

const activeStatusStyle = {
  display: "inline-block",
  padding: "5px 9px",
  borderRadius: "20px",
  backgroundColor: "#dcfce7",
  color: "#166534",
  fontSize: "12px",
  fontWeight: 600,
};

const inactiveStatusStyle = {
  display: "inline-block",
  padding: "5px 9px",
  borderRadius: "20px",
  backgroundColor: "#f1f5f9",
  color: "#475569",
  fontSize: "12px",
  fontWeight: 600,
};

const paginationStyle = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  flexWrap: "wrap" as const,
  gap: "16px",
  paddingTop: "20px",
};

const paginationInfoStyle = {
  color: "#64748b",
  fontSize: "13px",
};

const paginationButtonStyle = {
  padding: "8px 12px",
  backgroundColor: "#ffffff",
  border: "1px solid #cbd5e1",
  borderRadius: "7px",
  color: "#334155",
  cursor: "pointer",
};

const disabledButtonStyle = {
  opacity: 0.45,
  cursor: "not-allowed",
};

const pageNumberStyle = {
  color: "#475569",
  fontSize: "13px",
  whiteSpace: "nowrap" as const,
};

const messageStyle = {
  padding: "24px 0",
  color: "#64748b",
};

const errorStyle = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  flexWrap: "wrap" as const,
  gap: "12px",
  padding: "16px",
  marginBottom: "20px",
  backgroundColor: "#fef2f2",
  color: "#b91c1c",
  border: "1px solid #fecaca",
  borderRadius: "8px",
};
