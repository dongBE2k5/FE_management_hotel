import BaseUrl from "@/constants/BaseURL";
import Voucher from "@/models/Voucher"; // 👈 import thêm

export interface UserVoucher {
  id?: number;
  userId: number;
  voucherId: number;
}

// 🪣 Lấy danh sách voucher đã lưu theo userId
export async function getUserVouchers(userId: number): Promise<Voucher[]> {  // 👈 ĐỔI Ở ĐÂY
  try {
    const res = await fetch(`${BaseUrl}/user-vouchers/${userId}`);
    if (!res.ok) throw new Error("Không thể lấy danh sách voucher");
    const data = await res.json();
    console.log("🎯 Voucher từ backend:", data);
    return data; // ✅ chính xác: trả về list Voucher
  } catch (err) {
    console.error("Lỗi khi lấy user vouchers:", err);
    return [];
  }
}

// 💾 Lưu voucher cho user
export async function saveUserVoucher(userId: number, voucherId: number): Promise<UserVoucher | null> {
  try {
    const res = await fetch(`${BaseUrl}/user-vouchers`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId, voucherId }),
    });

    if (!res.ok) throw new Error("Không thể lưu voucher");

    const data = await res.json();
    if (data?.id) {
      console.log("✅ Voucher đã lưu hoặc đã tồn tại:", data);
    }
    return data;
  } catch (err) {
    console.error("Lỗi khi lưu user voucher:", err);
    return null;
  }
}

// ❌ Xóa voucher đã lưu
export async function deleteUserVoucher(id: number): Promise<boolean> {
  try {
    const res = await fetch(`${BaseUrl}/user-vouchers/${id}`, {
      method: "DELETE",
    });
    return res.ok;
  } catch (err) {
    console.error("Lỗi khi xóa user voucher:", err);
    return false;
  }
}
