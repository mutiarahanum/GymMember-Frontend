export interface Member {
  id: number;
  nama: string;
  no_hp: string;
  alamat: string;
  tanggal_daftar: string;
  created_at?: string;
  updated_at?: string;
}

export interface MembershipPackage {
  id: number;
  nama_paket: string;
  durasi: number;
  harga: string | number;
  created_at?: string;
  updated_at?: string;
}

export interface Membership {
  id: number;
  member_id: number;
  membership_package_id: number;
  tanggal_mulai: string;
  tanggal_berakhir: string;
  status_membership?: "belum aktif" | "aktif" | "sudah berakhir";
  member?: Member;
  membership_package?: MembershipPackage;
  created_at?: string;
  updated_at?: string;
}

export interface Payment {
  id: number;
  membership_id: number;
  jumlah_pembayaran: string | number;
  tanggal_pembayaran: string;
  metode_pembayaran: string;
  membership?: Membership;
  created_at?: string;
  updated_at?: string;
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}
