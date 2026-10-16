
"use client";

import { useEffect, useState } from "react";
import type {
  Member,
  Membership,
  MembershipPackage,
} from "@/types";

type MembershipFormProps = {
  item?: Membership;
  onSuccess: () => void;
  onCancel: () => void;
};

type PendingPayment = {
  membership_id: number;
  jumlah_pembayaran: number;
  tanggal_pembayaran: string;
  metode_pembayaran: string;
};

const inputStyle = {
  display: "block",
  width: "100%",
  padding: "10px",
  marginTop: "6px",
  marginBottom: "16px",
  border: "1px solid #ccc",
  borderRadius: "6px",
  boxSizing: "border-box" as const,
};

function getToday() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

export default function MembershipForm({
  item,
  onSuccess,
  onCancel,
}: MembershipFormProps) {
  const [members, setMembers] = useState<Member[]>([]);
  const [packages, setPackages] = useState<MembershipPackage[]>([]);

  const [memberId, setMemberId] = useState(
    item ? String(item.member_id) : ""
  );

  const [memberSearch, setMemberSearch] = useState(
    item?.member?.nama ?? ""
  );

  const [packageId, setPackageId] = useState(
    item ? String(item.membership_package_id) : ""
  );

  const [tanggalMulai, setTanggalMulai] = useState(
    item?.tanggal_mulai?.slice(0, 10) ?? ""
  );

  const [tanggalPembayaran, setTanggalPembayaran] =
    useState(getToday());

  const [metodePembayaran, setMetodePembayaran] =
    useState("transfer");

  const [pendingPayment, setPendingPayment] =
    useState<PendingPayment | null>(null);

  const [pesan, setPesan] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function loadData() {
      try {
        const [memberResponse, packageResponse] =
          await Promise.all([
            fetch("/api/members"),
            fetch("/api/membership-packages"),
          ]);

        const memberResult = await memberResponse.json();
        const packageResult = await packageResponse.json();

        if (!memberResponse.ok || memberResult.success === false) {
          throw new Error(
            memberResult.message || "Gagal mengambil data member."
          );
        }

        if (
          !packageResponse.ok ||
          packageResult.success === false
        ) {
          throw new Error(
            packageResult.message || "Gagal mengambil data paket."
          );
        }

        const memberData = Array.isArray(memberResult)
          ? memberResult
          : memberResult.data;

        const packageData = Array.isArray(packageResult)
          ? packageResult
          : packageResult.data;

        const loadedMembers: Member[] = Array.isArray(memberData)
          ? memberData
          : [];

        const loadedPackages: MembershipPackage[] =
          Array.isArray(packageData) ? packageData : [];

        setMembers(loadedMembers);
        setPackages(loadedPackages);

        if (item) {
          const selectedMember = loadedMembers.find(
            (member) => member.id === item.member_id
          );

          if (selectedMember) {
            setMemberSearch(selectedMember.nama);
          }
        }
      } catch (error) {
        setPesan(
          error instanceof Error
            ? error.message
            : "Gagal mengambil data."
        );
      }
    }

    void loadData();
  }, [item]);

  const filteredMembers = members.filter((member) =>
    member.nama
      .toLowerCase()
      .includes(memberSearch.trim().toLowerCase())
  );

  const selectedPackage = packages.find(
    (pkg) => String(pkg.id) === packageId
  );

  function pilihMember(member: Member) {
    setMemberId(String(member.id));
    setMemberSearch(member.nama);
    setPesan("");
  }

  async function simpanPembayaran(payment: PendingPayment) {
    const response = await fetch("/api/payments", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify(payment),
    });

    const result = await response.json();

    if (!response.ok || result.success === false) {
      const validationMessages = result.errors
        ? Object.values(result.errors).flat().join(" ")
        : "";

      throw new Error(
        validationMessages ||
          result.message ||
          "Pendaftaran tersimpan, tetapi pembayaran gagal disimpan."
      );
    }
  }

  async function handleSubmit(
    e: React.FormEvent<HTMLFormElement>
  ) {
    e.preventDefault();
    setPesan("");

    if (item) {
      if (
        !members.some(
          (member) =>
            String(member.id) === memberId &&
            member.nama === memberSearch
        )
      ) {
        setPesan("Silakan pilih member dari hasil pencarian.");
        return;
      }

      if (!packageId || !tanggalMulai) {
        setPesan("Paket dan tanggal mulai wajib diisi.");
        return;
      }

      setLoading(true);

      try {
        const response = await fetch(
          `/api/memberships/${item.id}`,
          {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
              Accept: "application/json",
            },
            body: JSON.stringify({
              member_id: Number(memberId),
              membership_package_id: Number(packageId),
              tanggal_mulai: tanggalMulai,
            }),
          }
        );

        const result = await response.json();

        if (!response.ok || result.success === false) {
          throw new Error(
            result.message || "Gagal memperbarui membership."
          );
        }

        onSuccess();
      } catch (error) {
        setPesan(
          error instanceof Error
            ? error.message
            : "Gagal memperbarui membership."
        );
      } finally {
        setLoading(false);
      }

      return;
    }

    if (
      !members.some(
        (member) =>
          String(member.id) === memberId &&
          member.nama === memberSearch
      )
    ) {
      setPesan("Silakan pilih member dari hasil pencarian.");
      return;
    }

    if (!selectedPackage || !tanggalMulai) {
      setPesan("Paket dan tanggal mulai wajib diisi.");
      return;
    }

    if (!tanggalPembayaran || !metodePembayaran) {
      setPesan("Tanggal dan metode pembayaran wajib diisi.");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch("/api/memberships", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({
          member_id: Number(memberId),
          membership_package_id: Number(packageId),
          tanggal_mulai: tanggalMulai,
        }),
      });

      const result = await response.json();

      if (!response.ok || result.success === false) {
        throw new Error(
          result.message || "Gagal menyimpan pendaftaran membership."
        );
      }

      const membershipId = Number(result.data?.id);

      if (!Number.isInteger(membershipId) || membershipId <= 0) {
        throw new Error(
          "Respons pendaftaran tidak menyertakan ID membership. Periksa daftar pendaftaran sebelum mencoba lagi agar tidak membuat data ganda."
        );
      }

      const payment: PendingPayment = {
        membership_id: membershipId,
        jumlah_pembayaran: Number(selectedPackage.harga),
        tanggal_pembayaran: tanggalPembayaran,
        metode_pembayaran: metodePembayaran,
      };

      try {
        await simpanPembayaran(payment);
      } catch (paymentError) {
        setPendingPayment(payment);
        setPesan(
          `Pendaftaran ID ${membershipId} berhasil dibuat, tetapi pembayaran belum tersimpan. Gunakan tombol Coba Simpan Pembayaran untuk mencoba kembali tanpa membuat pendaftaran baru. ${
            paymentError instanceof Error
              ? paymentError.message
              : ""
          }`
        );
        return;
      }

      onSuccess();
    } catch (error) {
      setPesan(
        error instanceof Error
          ? error.message
          : "Terjadi kesalahan saat menyimpan data."
      );
    } finally {
      setLoading(false);
    }
  }

  async function handleRetryPayment() {
    if (!pendingPayment) return;

    setLoading(true);
    setPesan("");

    try {
      await simpanPembayaran(pendingPayment);
      setPendingPayment(null);
      onSuccess();
    } catch (error) {
      setPesan(
        error instanceof Error
          ? error.message
          : "Gagal menyimpan pembayaran."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      style={{
        maxWidth: "500px",
        padding: "20px",
        border: "1px solid #ddd",
        borderRadius: "10px",
        marginBottom: "24px",
      }}
    >
      <h2 style={{ marginTop: 0 }}>
        {item ? "Edit Pendaftaran Membership" : "Pendaftaran Membership"}
      </h2>

      <label>
        Cari Member
        <input
          type="text"
          required
          autoComplete="off"
          placeholder="Ketik nama member..."
          value={memberSearch}
          onChange={(e) => {
            setMemberSearch(e.target.value);
            setMemberId("");
            setPesan("");
          }}
          style={inputStyle}
        />
      </label>

      {memberSearch.trim() !== "" && !memberId && (
        <div
          style={{
            border: "1px solid #ccc",
            borderRadius: "6px",
            maxHeight: "180px",
            overflowY: "auto",
            marginTop: "-12px",
            marginBottom: "16px",
          }}
        >
          {filteredMembers.length > 0 ? (
            filteredMembers.map((member) => (
              <button
                key={member.id}
                type="button"
                onClick={() => pilihMember(member)}
                style={{
                  display: "block",
                  width: "100%",
                  padding: "10px",
                  textAlign: "left",
                  border: "none",
                  borderBottom: "1px solid #eee",
                  cursor: "pointer",
                  background: "#fff",
                  color: "#222",
                }}
              >
                {member.nama} (ID: {member.id})
              </button>
            ))
          ) : (
            <p style={{ padding: "10px", margin: 0 }}>
              Member tidak ditemukan.
            </p>
          )}
        </div>
      )}

      {memberId && (
        <p
          style={{
            color: "green",
            fontSize: "14px",
            marginTop: "-10px",
          }}
        >
          Member dipilih: {memberSearch} (ID: {memberId})
        </p>
      )}

      <label>
        Pilih Paket Membership
        <select
          required
          value={packageId}
          onChange={(e) => setPackageId(e.target.value)}
          style={inputStyle}
        >
          <option value="">-- Pilih Paket --</option>

          {packages.map((pkg) => (
            <option key={pkg.id} value={pkg.id}>
              {pkg.nama_paket} - {pkg.durasi} hari - Rp
              {Number(pkg.harga).toLocaleString("id-ID")}
            </option>
          ))}
        </select>
      </label>

      <label>
        Tanggal Mulai
        <input
          type="date"
          required
          value={tanggalMulai}
          onChange={(e) => setTanggalMulai(e.target.value)}
          style={inputStyle}
        />
      </label>

      {!item && (
        <>
          <div
            style={{
              borderTop: "1px solid #ddd",
              margin: "24px 0",
            }}
          />

          <h3>Detail Pembayaran</h3>

          <label>
            Jumlah Pembayaran
            <input
              type="text"
              readOnly
              value={
                selectedPackage
                  ? `Rp ${Number(
                      selectedPackage.harga
                    ).toLocaleString("id-ID")}`
                  : "Pilih paket terlebih dahulu"
              }
              style={{
                ...inputStyle,
                background: "#f5f5f5",
              }}
            />
          </label>

          <p
            style={{
              fontSize: "13px",
              color: "#666",
              marginTop: "-8px",
              marginBottom: "16px",
            }}
          >
          </p>

          <label>
            Tanggal Pembayaran
            <input
              type="date"
              required
              value={tanggalPembayaran}
              onChange={(e) =>
                setTanggalPembayaran(e.target.value)
              }
              style={inputStyle}
            />
          </label>

          <label>
            Metode Pembayaran
            <select
              required
              value={metodePembayaran}
              onChange={(e) =>
                setMetodePembayaran(e.target.value)
              }
              style={inputStyle}
            >
              <option value="transfer">Transfer</option>
              <option value="tunai">Tunai</option>
              <option value="debit">Debit</option>
              <option value="qris">QRIS</option>
            </select>
          </label>
        </>
      )}

      {pesan && (
        <p
          role="alert"
          style={{
            color:
              pendingPayment || pesan.toLowerCase().includes("gagal")
                ? "crimson"
                : "green",
            marginBottom: "16px",
            overflowWrap: "anywhere",
          }}
        >
          {pesan}
        </p>
      )}

      {pendingPayment ? (
        <button
          type="button"
          onClick={() => void handleRetryPayment()}
          disabled={loading}
          style={{
            padding: "10px 16px",
            border: "none",
            borderRadius: "6px",
            background: "#d97706",
            color: "#fff",
            cursor: loading ? "not-allowed" : "pointer",
          }}
        >
          {loading ? "Menyimpan..." : "Coba Simpan Pembayaran"}
        </button>
      ) : (
        <div
          style={{
            display: "flex",
            gap: "10px",
            flexWrap: "wrap",
          }}
        >
          <button
            type="submit"
            disabled={loading}
            style={{
              padding: "10px 16px",
              border: "none",
              borderRadius: "6px",
              background: "#2563eb",
              color: "#fff",
              cursor: loading ? "not-allowed" : "pointer",
            }}
          >
            {loading
              ? "Menyimpan..."
              : item
                ? "Simpan Perubahan"
                : "Daftarkan & Simpan Pembayaran"}
          </button>

          <button
            type="button"
            onClick={onCancel}
            disabled={loading}
            style={{
              padding: "10px 16px",
              border: "1px solid #ccc",
              borderRadius: "6px",
              background: "#fff",
              cursor: "pointer",
            }}
          >
            Batal
          </button>
        </div>
      )}
    </form>
  );
}
