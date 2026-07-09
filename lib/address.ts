// ---------------------------------------------------------------------------
// Dữ liệu Tỉnh/Thành phố — Phường/Xã của Việt Nam
// Nguồn: file address.js do người dùng cung cấp (đã chuyển sang JSON tĩnh).
// Dùng cho dropdown "Tỉnh/Thành phố" và "Phường/Xã" ở trang thanh toán.
// ---------------------------------------------------------------------------

import rawData from "./vn-address.json";

export interface Province {
  name: string;
  wards: string[];
}

const VN_ADDRESS = rawData as Province[];

/** Danh sách tên tất cả Tỉnh/Thành phố, theo đúng thứ tự trong dữ liệu gốc. */
export function getProvinces(): string[] {
  return VN_ADDRESS.map((p) => p.name);
}

/** Danh sách Phường/Xã của một Tỉnh/Thành phố. Trả về [] nếu không tìm thấy. */
export function getWardsByProvince(provinceName: string): string[] {
  const found = VN_ADDRESS.find((p) => p.name === provinceName);
  return found ? found.wards : [];
}

export default VN_ADDRESS;
