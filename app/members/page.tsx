"use client";

import { useEffect, useState } from "react";
import type { Member } from "@/types";
import MemberForm from "./MemberForm";

const ITEMS_PER_PAGE = 10;

export default function MembersPage() {
  const [members, setMembers] = useState<Member[]>([]);
  const [editingMember, setEditingMember] = useState<Member | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  async function loadMembers() {
    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/members", {
        headers: { Accept: "application/json" },
        cache: "no-store",
      });

      const result = await response.json();

      if (!response.ok || result.success === false) {
        throw new Error(result.message || "Gagal mengambil data member.");
      }

      setMembers(result.data);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Gagal mengambil data member."
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadMembers();
  }, []);

  const totalPages = Math.max(
    1,
    Math.ceil(members.length / ITEMS_PER_PAGE)
  );

  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;

  const displayedMembers = members.slice(
    startIndex,
    startIndex + ITEMS_PER_PAGE
  );

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  async function deleteMember(member: Member) {
    const yakin = window.confirm(
      `Yakin ingin menghapus member ${member.nama}?`
    );

    if (!yakin) return;

    try {
      const response = await fetch(`/api/members/${member.id}`, {
        method: "DELETE",
        headers: { Accept: "application/json" },
      });

      const result = await response.json();

      if (!response.ok || result.success === false) {
        throw new Error(result.message || "Gagal menghapus member.");
      }

      if (editingMember?.id === member.id) {
        setEditingMember(null);
        setShowForm(false);
      }

      await loadMembers();
    } catch (err) {
      window.alert(
        err instanceof Error ? err.message : "Gagal menghapus member."
      );
    }
  }

  function openAddForm() {
    setEditingMember(null);
    setShowForm(true);
  }

  function openEditForm(member: Member) {
    setEditingMember(member);
    setShowForm(true);
  }

  function closeForm() {
    setShowForm(false);
    setEditingMember(null);
  }

  return (
    <main style={pageStyle}>
      <div style={containerStyle}>
        {}
        <div style={headerStyle}>
          <div style={{ paddingBottom: "20px" }}>
            <h1 style={titleStyle}>Data Member</h1>
          </div>

          <div style={headerActionsStyle}>
            <div style={summaryCardStyle}>
              <span style={summaryLabelStyle}>Total Member</span>
              <strong style={summaryNumberStyle}>
                {loading ? "..." : members.length}
              </strong>
            </div>

            <button
              type="button"
              onClick={openAddForm}
              style={addButtonStyle}
            >
              + Tambah Member
            </button>
          </div>
        </div>

        {showForm && (
          <section style={panelStyle}>
            <div style={sectionHeaderStyle}>
              <div>
                <h2 style={{ ...sectionTitleStyle, marginBottom: "12px" }}>
                  {editingMember ? "Edit Data Member" : "Tambah Member Baru"}
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

            <MemberForm
              key={editingMember?.id ?? "new"}
              member={editingMember ?? undefined}
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
              onClick={() => void loadMembers()}
              style={secondaryButtonStyle}
            >
              Coba Lagi
            </button>
          </div>
        )}

        <section style={panelStyle}>
          <div style={sectionHeaderStyle}>
            <div>
              <h2 style={sectionTitleStyle}>Daftar Member</h2>
            </div>
          </div>

          {loading ? (
            <p style={messageStyle}>Memuat data member...</p>
          ) : (
            <>
              <div style={tableWrapperStyle}>
                <table style={tableStyle}>
                  <thead>
                    <tr>
                      <th style={headerCellStyle}>No.</th>
                      <th style={headerCellStyle}>Nama</th>
                      <th style={headerCellStyle}>No. HP</th>
                      <th style={headerCellStyle}>Alamat</th>
                      <th style={headerCellStyle}>Tanggal Daftar</th>
                      <th style={headerCellStyle}>Aksi</th>
                    </tr>
                  </thead>

                  <tbody>
                    {displayedMembers.map((member, index) => (
                      <tr key={member.id}>
                        <td style={cellStyle}>
                          {startIndex + index + 1}
                        </td>

                        <td style={cellStyle}>
                          <strong style={{ color: "#1e293b" }}>
                            {member.nama}
                          </strong>
                        </td>

                        <td style={cellStyle}>{member.no_hp}</td>
                        <td style={cellStyle}>{member.alamat}</td>
                        <td style={cellStyle}>{member.tanggal_daftar}</td>

                        <td style={cellStyle}>
                          <div style={actionContainerStyle}>
                            <button
                              type="button"
                              onClick={() => openEditForm(member)}
                              style={editButtonStyle}
                            >
                              Edit
                            </button>

                            <button
                              type="button"
                              onClick={() => void deleteMember(member)}
                              style={deleteButtonStyle}
                            >
                              Hapus
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}

                    {members.length === 0 && (
                      <tr>
                        <td style={emptyCellStyle} colSpan={6}>
                          Belum ada data member. Klik tombol Tambah Member
                          untuk menambahkan anggota baru.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              {members.length > 0 && (
                <div style={paginationStyle}>
                  <p style={paginationInfoStyle}>
                    Menampilkan{" "}
                    <strong>{startIndex + 1}</strong>–
                    <strong>
                      {Math.min(
                        startIndex + ITEMS_PER_PAGE,
                        members.length
                      )}
                    </strong>{" "}
                    dari <strong>{members.length}</strong> data
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
                        opacity: currentPage === totalPages ? 0.45 : 1,
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
  minWidth: "170px",
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