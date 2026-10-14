export const ASSET_STATUSES = [
  "Đang sử dụng",
  "Đang lưu kho",
  "Đang cho mượn",
  "Đang bảo trì hoặc sửa chữa",
  "Ngừng sử dụng",
  "Đã bán",
  "Đã cho hoặc chuyển nhượng",
  "Đã mất",
  "Đã thanh lý",
] as const;

export const ASSET_TYPES = [
  "Xe cộ",
  "Máy móc",
  "Đồ điện tử",
  "Nội thất",
  "Đồ gia dụng",
  "Khác",
] as const;

export const ASSET_EVENT_TYPES = [
  "Nhật ký sử dụng",
  "Bảo trì hoặc bảo dưỡng",
  "Sửa chữa",
  "Thay thế linh kiện, vật tư",
  "Nâng cấp",
  "Kiểm định hoặc đăng kiểm",
  "Sự cố hoặc hư hỏng",
  "Ghi chú khác",
] as const;

export const EXPENSE_STATUSES = [
  "Hoàn tất",
  "Hoàn tiền một phần",
  "Đã hoàn tiền",
  "Đã hủy",
] as const;

export const EXPENSE_CATEGORIES = [
  "Mua tài sản",
  "Bảo trì và sửa chữa",
  "Linh kiện và vật tư",
  "Đồ gia dụng",
  "Dịch vụ",
  "Khác",
] as const;

export type AssetStatus = (typeof ASSET_STATUSES)[number];
export type AssetType = (typeof ASSET_TYPES)[number];
export type AssetEventType = (typeof ASSET_EVENT_TYPES)[number];
export type ExpenseStatus = (typeof EXPENSE_STATUSES)[number];

export type AssetSummary = {
  id: string;
  name: string;
  type: string;
  status: AssetStatus;
  location?: string;
  purchasePrice?: number;
  updatedAt: string;
};

export type ApiStatus = {
  service: "qlts-api";
  status: "ok" | "degraded";
  database: "connected" | "unavailable";
  timestamp: string;
};
