"use client";

import { useEffect, useState } from "react";
import type { MembershipPackage } from "@/types";
import PackageForm from "./PackageForm";

const ITEMS_PER_PAGE = 10;

export default function PackagesPage() {
  const [packages, setPackages] = useState<MembershipPackage[]>([]);
  const [editingItem, setEditingItem] =
    useState<MembershipPackage | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  async function loadPackages() {
    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/membership-packages", {
        headers: { Accept: "application/json" },
        cache: "no-store",
      });

      const result = await response.json();

      if (!response.ok || result.success === false) {
        throw new Error(
          result.message || "Gagal mengambil data paket membership."
        );
      }

      setPackages(result.data);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Gagal mengambil data paket membership."
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadPackages();
  }, []);

  const totalPages = Math.max(
    1,
    Math.ceil(packages.length / ITEMS_PER_PAGE)
  );

  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;

  const displayedPackages = packages.slice(
    startIndex,
    startIndex + ITEMS_PER_PAGE
  );

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  function openAddForm() {
    setEditingItem(null);
    setShowForm(true);
  }

  function openEditForm(item: MembershipPackage) {
    setEditingItem(item);
    setShowForm(true);

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }

  function closeForm() {
    setShowForm(false);
    setEditingItem(null);
  }

  async function deletePackage(item: MembershipPackage) {
    if (
      !window.confirm(
        `Yakin ingin menghapus paket "${item.nama_paket}"?`
      )
    ) {
      return;
    }

    try {
      const response = await fetch(
        `/api/membership-packages/${item.id}`,
        {
          method: "DELETE",
          headers: { Accept: "application/json" },
        }
      );

      const result = await response.json();

      if (!response.ok || result.success === false) {
        throw new Error(
          result.message || "Gagal menghapus paket membership."
        );
      }

      if (editingItem?.id === item.id) {
        closeForm();
      }

      await loadPackages();
    } catch (err) {
      window.alert(
        err instanceof Error
          ? err.message
          : "Gagal menghapus paket membership."
      );
    }
  }

  return (
    <main style={pageStyle}>
      <div style={containerStyle}>
        
        <div style={headerStyle}>
          <div>
            <h1 style={titleStyle}>Paket Membership</h1>
          </div>

          <div style={headerActionsStyle}>
            <div style={summaryCardStyle}>
              <span style={summaryLabelStyle}>Total Paket</span>
              <strong style={summaryNumberStyle}>
                {loading ? "..." : packages.length}
              </strong>
              <span style={summaryCaptionStyle}>Paket terdaftar</span>
            </div>

            <button
              type="button"
              onClick={openAddForm}
              style={addButtonStyle}
            >
              + Tambah Paket
            </button>
          </div>
        </div>

        {showForm && (
          <section style={panelStyle}>
            <div style={sectionHeaderStyle}>
              <div>
                <h2 style={sectionTitleStyle}>
                  {editingItem
                    ? "Edit Paket Membership"
                    : "Tambah Paket Baru"}
                </h2>

              </div>

              <button
                type="button"
                onClick={closeForm}
                style={secondaryButtonStyle}
              >
                ✕ Tutup
              </button>
            </div>

            <PackageForm
              key={editingItem?.id ?? "new"}
              item={editingItem ?? undefined}
              onCancel={closeForm}
            />
          </section>
        )}

        {error && (
          <div style={errorStyle}>
            <strong>Terjadi kesalahan</strong>
            <p>{error}</p>

            <button
              type="button"
              onClick={() => void loadPackages()}
              style={secondaryButtonStyle}
            >
              Coba Lagi
            </button>
          </div>
        )}

        <section style={panelStyle}>
          <div style={sectionHeaderStyle}>
            <div>
              <h2 style={sectionTitleStyle}>Daftar Paket</h2>
            </div>

            <button
              type="button"
              onClick={() => void loadPackages()}
              disabled={loading}
              style={{
                ...secondaryButtonStyle,
                opacity: loading ? 0.6 : 1,
              }}
            >
              {loading ? "Memuat..." : "↻ Refresh"}
            </button>
          </div>

          {loading ? (
            <p style={messageStyle}>Memuat data paket membership...</p>
          ) : (
            <>
              <div style={tableWrapperStyle}>
                <table style={tableStyle}>
                  <thead>
                    <tr>
                      <th style={headerCellStyle}>No.</th>
                      <th style={headerCellStyle}>Nama Paket</th>
                      <th style={headerCellStyle}>Durasi (hari)</th>
                      <th style={headerCellStyle}>Harga</th>
                      <th style={headerCellStyle}>Aksi</th>
                    </tr>
                  </thead>

                  <tbody>
                    {displayedPackages.map((item, index) => (
                      <tr key={item.id}>
                        <td style={cellStyle}>
                          {startIndex + index + 1}
                        </td>

                        <td style={cellStyle}>
                          <strong style={{ color: "#1e293b" }}>
                            {item.nama_paket}
                          </strong>
                        </td>

                        <td style={cellStyle}>{item.durasi} hari</td>

                        <td style={cellStyle}>
                          <strong style={{ color: "#2563eb" }}>
                            {Number(item.harga).toLocaleString("id-ID", {
                              style: "currency",
                              currency: "IDR",
                              maximumFractionDigits: 0,
                            })}
                          </strong>
                        </td>

                        <td style={cellStyle}>
                          <div style={actionContainerStyle}>
                            <button
                              type="button"
                              onClick={() => openEditForm(item)}
                              style={editButtonStyle}
                            >
                              Edit
                            </button>

                            <button
                              type="button"
                              onClick={() => void deletePackage(item)}
                              style={deleteButtonStyle}
                            >
                              Hapus
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}

                    {packages.length === 0 && (
                      <tr>
                        <td style={emptyCellStyle} colSpan={5}>
                          Belum ada paket membership. Klik Tambah Paket
                          untuk menambahkan paket baru.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              {packages.length > 0 && (
                <div style={paginationStyle}>
                  <p style={paginationInfoStyle}>
                    Menampilkan <strong>{startIndex + 1}</strong>–
                    <strong>
                      {Math.min(
                        startIndex + ITEMS_PER_PAGE,
                        packages.length
                      )}
                    </strong>{" "}
                    dari <strong>{packages.length}</strong> data
                  </p>

                  <div style={paginationControlsStyle}>
                    <button
                      type="button"
                      onClick={() =>
                        setCurrentPage((page) => Math.max(1, page - 1))
                      }
                      disabled={currentPage === 1}
                      style={{
                        ...pageButtonStyle,
                        opacity: currentPage === 1 ? 0.45 : 1,
                        cursor:
                          currentPage === 1 ? "not-allowed" : "pointer",
                      }}
                    >
                      ← Sebelumnya
                    </button>

                    <span style={pageNumberStyle}>
                      Halaman {currentPage} dari {totalPages}
                    </span>

                    <button
                      type="button"
                      onClick={() =>
                        setCurrentPage((page) =>
                          Math.min(totalPages, page + 1)
                        )
                      }
                      disabled={currentPage === totalPages}
                      style={{
                        ...pageButtonStyle,
                        opacity:
                          currentPage === totalPages ? 0.45 : 1,
                        cursor:
                          currentPage === totalPages
                            ? "not-allowed"
                            : "pointer",
                      }}
                    >
                      Selanjutnya →
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </section>
      </div>
    </main>
  );
}

const pageStyle = {
  minHeight: "100vh",
  padding: "32px 24px",
  backgroundColor: "#f5f7fb",
  color: "#1e293b",
};

const containerStyle = {
  maxWidth: "1400px",
  margin: "0 auto",
};

const headerStyle = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  flexWrap: "wrap" as const,
  gap: "24px",
  marginBottom: "28px",
};

const eyebrowStyle = {
  color: "#2563eb",
  fontSize: "12px",
  fontWeight: 700,
  letterSpacing: "1.5px",
  marginBottom: "8px",
};

const titleStyle = {
  fontSize: "30px",
  fontWeight: 700,
  marginBottom: "8px",
  color: "#0f172a",
};

const subtitleStyle = {
  color: "#64748b",
  fontSize: "14px",
  lineHeight: 1.6,
};

const headerActionsStyle = {
  display: "flex",
  alignItems: "center",
  flexWrap: "wrap" as const,
  gap: "12px",
};

const summaryCardStyle = {
  minWidth: "150px",
  padding: "16px 20px",
  backgroundColor: "#ffffff",
  border: "1px solid #e2e8f0",
  borderRadius: "12px",
  display: "flex",
  flexDirection: "column" as const,
  gap: "5px",
  boxShadow: "0 2px 8px rgba(15, 23, 42, 0.03)",
};

const summaryLabelStyle = {
  color: "#64748b",
  fontSize: "13px",
};

const summaryNumberStyle = {
  color: "#2563eb",
  fontSize: "28px",
  fontWeight: 700,
};

const summaryCaptionStyle = {
  color: "#94a3b8",
  fontSize: "12px",
};

const addButtonStyle = {
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

const panelStyle = {
  backgroundColor: "#ffffff",
  border: "1px solid #e2e8f0",
  borderRadius: "14px",
  padding: "24px",
  marginBottom: "24px",
  boxShadow: "0 2px 8px rgba(15, 23, 42, 0.03)",
};

const sectionHeaderStyle = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  flexWrap: "wrap" as const,
  gap: "16px",
  marginBottom: "22px",
};

const sectionTitleStyle = {
  color: "#0f172a",
  fontSize: "19px",
  fontWeight: 700,
  marginBottom: "6px",
};

const sectionDescriptionStyle = {
  color: "#64748b",
  fontSize: "13px",
  lineHeight: 1.6,
};

const tableWrapperStyle = {
  width: "100%",
  overflowX: "auto" as const,
  border: "1px solid #e2e8f0",
  borderRadius: "10px",
};

const tableStyle = {
  width: "100%",
  borderCollapse: "collapse" as const,
  fontSize: "13px",
  textAlign: "left" as const,
};

const headerCellStyle = {
  padding: "15px 14px",
  backgroundColor: "#eff6ff",
  color: "#1e40af",
  borderBottom: "1px solid #dbeafe",
  fontSize: "12px",
  fontWeight: 700,
  whiteSpace: "nowrap" as const,
};

const cellStyle = {
  padding: "15px 14px",
  borderBottom: "1px solid #edf0f5",
  color: "#475569",
  verticalAlign: "top" as const,
  lineHeight: 1.6,
};

const emptyCellStyle = {
  padding: "36px 20px",
  textAlign: "center" as const,
  color: "#64748b",
  fontSize: "14px",
};

const actionContainerStyle = {
  display: "flex",
  flexWrap: "wrap" as const,
  gap: "8px",
};

const editButtonStyle = {
  padding: "8px 13px",
  backgroundColor: "#2563eb",
  color: "#ffffff",
  border: "none",
  borderRadius: "7px",
  fontSize: "12px",
  fontWeight: 600,
  cursor: "pointer",
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

const paginationControlsStyle = {
  display: "flex",
  alignItems: "center",
  flexWrap: "wrap" as const,
  gap: "10px",
};

const pageButtonStyle = {
  padding: "9px 12px",
  border: "1px solid #cbd5e1",
  borderRadius: "8px",
  backgroundColor: "#ffffff",
  color: "#334155",
  fontSize: "12px",
  fontWeight: 600,
};

const pageNumberStyle = {
  color: "#475569",
  fontSize: "12px",
  fontWeight: 600,
  whiteSpace: "nowrap" as const,
};

const messageStyle = {
  padding: "24px 0",
  color: "#64748b",
  fontSize: "14px",
};

const errorStyle = {
  padding: "18px",
  marginBottom: "24px",
  backgroundColor: "#fef2f2",
  border: "1px solid #fecaca",
  borderRadius: "10px",
  color: "#b91c1c",
  lineHeight: 1.7,
};
