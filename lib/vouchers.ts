// ---------------------------------------------------------------------------
// Vouchers — lớp trung gian tương tự lib/catalog.ts nhưng cho mã giảm giá.
// Server-only (import googleSheets → googleapis).
// ---------------------------------------------------------------------------

import { getVouchersMock, type Voucher } from "./data";
import { isSheetsConfigured, readVouchers, type SheetVoucher } from "./googleSheets";

function sheetVoucherToVoucher(v: SheetVoucher): Voucher {
  return {
    code: v.code,
    type: v.type,
    value: v.value,
    minSubtotal: v.minSubtotal,
    label: v.label,
    active: v.active,
    expiresAt: v.expiresAt,
    exclusive: v.exclusive,
    excludesFreeship: v.excludesFreeship,
  };
}

let cache: { data: Voucher[]; expiresAt: number } | null = null;
const CACHE_TTL_MS = 30_000;

export async function getVouchers(): Promise<Voucher[]> {
  if (!isSheetsConfigured()) return getVouchersMock();

  if (cache && cache.expiresAt > Date.now()) return cache.data;

  try {
    const rows = await readVouchers();
    const mapped = rows.map(sheetVoucherToVoucher);
    cache = { data: mapped, expiresAt: Date.now() + CACHE_TTL_MS };
    return mapped;
  } catch (err) {
    console.error(
      "[vouchers] Không đọc được Google Sheets, tạm dùng mã giảm giá mẫu:",
      err
    );
    return getVouchersMock();
  }
}

export function invalidateVoucherCache(): void {
  cache = null;
}

function isExpired(voucher: Voucher): boolean {
  if (!voucher.expiresAt) return false;
  const expiry = new Date(voucher.expiresAt + "T23:59:59");
  return Date.now() > expiry.getTime();
}

export interface VoucherValidationResult {
  ok: boolean;
  error?: string;
  voucher?: Voucher;
}

/**
 * Kiểm tra điều kiện "kết hợp" giữa 1 mã ứng viên và danh sách mã đang áp dụng.
 * Trả về lý do không dùng được (nếu có), hoặc null nếu kết hợp được.
 */
function checkCombination(
  candidate: Voucher,
  currentlyApplied: Voucher[]
): string | null {
  if (currentlyApplied.length === 0) return null;

  // Ứng viên là mã độc quyền → không được áp cùng bất kỳ mã nào đang có.
  if (candidate.exclusive) {
    return "Mã này không dùng chung được với mã giảm giá khác.";
  }
  // Đã có 1 mã độc quyền đang áp dụng → không thêm được mã nào nữa.
  if (currentlyApplied.some((v) => v.exclusive)) {
    return "Bạn đang dùng một mã độc quyền, không thể áp thêm mã khác.";
  }

  const hasFreeship = currentlyApplied.some((v) => v.type === "freeship");
  const hasNonFreeship = currentlyApplied.some((v) => v.type !== "freeship");

  // Loại trừ freeship 2 chiều: discount loại trừ freeship, hoặc freeship loại trừ discount.
  if (candidate.excludesFreeship) {
    if (candidate.type === "freeship" && hasNonFreeship) {
      return "Mã miễn phí vận chuyển này không dùng chung được với mã giảm giá khác.";
    }
    if (candidate.type !== "freeship" && hasFreeship) {
      return "Mã này không đi kèm được với mã miễn phí vận chuyển.";
    }
  }
  if (
    candidate.type !== "freeship" &&
    currentlyApplied.some((v) => v.type === "freeship" && v.excludesFreeship)
  ) {
    return "Mã miễn phí vận chuyển đang áp dụng không cho phép dùng thêm mã khác.";
  }
  if (
    candidate.type === "freeship" &&
    currentlyApplied.some((v) => v.type !== "freeship" && v.excludesFreeship)
  ) {
    return "Mã giảm giá đang áp dụng không cho phép đi kèm mã miễn phí vận chuyển.";
  }

  // Chỉ cho tối đa 1 mã giảm giá (percent/fixed) + 1 mã freeship cùng lúc.
  if (candidate.type !== "freeship" && hasNonFreeship) {
    return "Bạn chỉ có thể áp dụng 1 mã giảm giá cho mỗi đơn hàng.";
  }
  if (candidate.type === "freeship" && hasFreeship) {
    return "Bạn chỉ có thể áp dụng 1 mã miễn phí vận chuyển cho mỗi đơn hàng.";
  }

  return null;
}

/**
 * Kiểm tra 1 mã giảm giá có áp dụng được với `subtotal` hiện tại không.
 * `appliedCodes` (tuỳ chọn): các mã đang được áp dụng cùng lúc, để kiểm tra điều kiện kết hợp.
 */
export async function validateVoucher(
  code: string,
  subtotal: number,
  appliedCodes: string[] = []
): Promise<VoucherValidationResult> {
  const normalized = code.trim().toUpperCase();
  if (!normalized) {
    return { ok: false, error: "Vui lòng nhập mã giảm giá." };
  }

  const all = await getVouchers();
  const voucher = all.find((v) => v.code.toUpperCase() === normalized);

  if (!voucher) {
    return { ok: false, error: "Mã giảm giá không tồn tại." };
  }
  if (!voucher.active) {
    return { ok: false, error: "Mã giảm giá này hiện không còn hiệu lực." };
  }
  if (isExpired(voucher)) {
    return { ok: false, error: "Mã giảm giá đã hết hạn." };
  }
  if (subtotal < voucher.minSubtotal) {
    return {
      ok: false,
      error: `Đơn hàng cần tối thiểu ${voucher.minSubtotal.toLocaleString(
        "vi-VN"
      )}₫ để áp dụng mã này.`,
    };
  }

  const currentlyApplied = all.filter((v) =>
    appliedCodes.map((c) => c.toUpperCase()).includes(v.code.toUpperCase())
  );
  const combinationError = checkCombination(voucher, currentlyApplied);
  if (combinationError) {
    return { ok: false, error: combinationError };
  }

  return { ok: true, voucher };
}

export interface VoucherUsability {
  voucher: Voucher;
  usable: boolean;
  reason?: string;
}

/**
 * Trả về TOÀN BỘ mã đang kích hoạt, kèm cờ "dùng được hay không" + lý do,
 * dùng cho popup "Chọn mã giảm giá" kiểu Shopee ở trang thanh toán.
 */
export async function getVouchersWithUsability(
  subtotal: number,
  appliedCodes: string[] = []
): Promise<VoucherUsability[]> {
  const all = (await getVouchers()).filter((v) => v.active);
  const currentlyApplied = all.filter((v) =>
    appliedCodes.map((c) => c.toUpperCase()).includes(v.code.toUpperCase())
  );

  return all.map((voucher) => {
    if (isExpired(voucher)) {
      return { voucher, usable: false, reason: "Mã đã hết hạn." };
    }
    if (subtotal < voucher.minSubtotal) {
      return {
        voucher,
        usable: false,
        reason: `Đơn tối thiểu ${voucher.minSubtotal.toLocaleString("vi-VN")}₫`,
      };
    }
    const alreadyApplied = appliedCodes
      .map((c) => c.toUpperCase())
      .includes(voucher.code.toUpperCase());
    if (alreadyApplied) {
      return { voucher, usable: false, reason: "Đang được áp dụng." };
    }
    const combinationError = checkCombination(voucher, currentlyApplied);
    if (combinationError) {
      return { voucher, usable: false, reason: combinationError };
    }
    return { voucher, usable: true };
  });
}
