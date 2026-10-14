import { ASSET_EVENT_TYPES, ASSET_STATUSES, ASSET_TYPES, EXPENSE_STATUSES } from "@qlts/domain";
import { z } from "zod";

const optionalTrimmedText = (maxLength: number) =>
  z
    .string()
    .trim()
    .max(maxLength)
    .optional()
    .transform((value) => value || undefined);

export const createAssetSchema = z.object({
  expenseItemId: z.uuid().optional().or(z.literal("")),
  name: z.string().trim().min(1, "Tên tài sản là bắt buộc.").max(200),
  type: z.enum(ASSET_TYPES).default("Khác"),
  status: z.enum(ASSET_STATUSES).default("Đang sử dụng"),
  brand: optionalTrimmedText(160),
  model: optionalTrimmedText(160),
  serialNumber: optionalTrimmedText(200),
  purchaseDate: z.iso.date().optional().or(z.literal("")),
  purchasePrice: z.number().nonnegative().optional(),
  currency: z.string().trim().length(3).default("VND"),
  purchasePlace: optionalTrimmedText(200),
  purchaseAddress: optionalTrimmedText(500),
  sellerPhone: optionalTrimmedText(30),
  paymentMethod: optionalTrimmedText(100),
  orderNumber: optionalTrimmedText(120),
  location: optionalTrimmedText(200),
  description: optionalTrimmedText(2_000),
});

export type CreateAssetInput = z.infer<typeof createAssetSchema>;
export const updateAssetSchema = createAssetSchema;
export type UpdateAssetInput = z.infer<typeof updateAssetSchema>;

export const uploadAssetDocumentSchema = z.object({
  documentType: z.string().trim().min(1).max(100),
});

const eventItemSchema = z.object({
  catalogItemId: z.uuid().optional().or(z.literal("")),
  name: z.string().trim().min(1, "Tên linh kiện hoặc vật tư là bắt buộc.").max(200),
  partNumber: optionalTrimmedText(120),
  quantity: z.number().positive().max(999_999),
  unit: optionalTrimmedText(30),
  unitPrice: z.number().nonnegative().optional(),
  warrantyUntil: z.iso.date().optional().or(z.literal("")),
  notes: optionalTrimmedText(500),
});

export const createAssetEventSchema = z.object({
  type: z.enum(ASSET_EVENT_TYPES),
  occurredAt: z.iso.date(),
  title: z.string().trim().min(1, "Nội dung sự kiện là bắt buộc.").max(200),
  description: optionalTrimmedText(2_000),
  serviceProvider: optionalTrimmedText(200),
  serviceLocation: optionalTrimmedText(500),
  usageValue: z.number().nonnegative().optional(),
  usageUnit: optionalTrimmedText(30),
  laborCost: z.number().nonnegative().optional(),
  otherCost: z.number().nonnegative().optional(),
  currency: z.string().trim().length(3).default("VND"),
  nextMaintenanceDate: z.iso.date().optional().or(z.literal("")),
  items: z.array(eventItemSchema).max(100).default([]),
});

export type CreateAssetEventInput = z.infer<typeof createAssetEventSchema>;
export const updateAssetEventSchema = createAssetEventSchema;

export const catalogItemSchema = z.object({
  name: z.string().trim().min(1, "Tên linh kiện hoặc vật tư là bắt buộc.").max(200),
  category: optionalTrimmedText(120),
  brand: optionalTrimmedText(160),
  partNumber: optionalTrimmedText(120),
  unit: optionalTrimmedText(30),
  description: optionalTrimmedText(1_000),
  isActive: z.boolean().default(true),
});

const expenseItemSchema = z.object({
  id: z.uuid().optional(),
  catalogItemId: z.uuid().optional().or(z.literal("")),
  linkedAssetId: z.uuid().optional().or(z.literal("")),
  linkedAssetEventId: z.uuid().optional().or(z.literal("")),
  name: z.string().trim().min(1, "Tên mặt hàng hoặc dịch vụ là bắt buộc.").max(200),
  category: optionalTrimmedText(120),
  quantity: z.number().positive().max(999_999),
  unit: optionalTrimmedText(30),
  unitPrice: z.number().nonnegative(),
  discountAmount: z.number().nonnegative().default(0),
  notes: optionalTrimmedText(500),
});

export const createExpenseSchema = z.object({
  title: z.string().trim().min(1, "Nội dung khoản chi là bắt buộc.").max(200),
  occurredAt: z.iso.datetime({ offset: true }),
  paidByUserId: z.uuid().optional().or(z.literal("")),
  merchantName: optionalTrimmedText(200),
  merchantAddress: optionalTrimmedText(500),
  merchantPhone: optionalTrimmedText(30),
  paymentMethod: optionalTrimmedText(100),
  orderNumber: optionalTrimmedText(120),
  status: z.enum(EXPENSE_STATUSES).default("Hoàn tất"),
  currency: z.string().trim().length(3).default("VND"),
  discountAmount: z.number().nonnegative().default(0),
  feeAmount: z.number().nonnegative().default(0),
  actualPaidAmount: z.number().nonnegative(),
  notes: optionalTrimmedText(2_000),
  items: z.array(expenseItemSchema).min(1, "Cần ít nhất một mặt hàng hoặc dịch vụ.").max(100),
});

export type CreateExpenseInput = z.infer<typeof createExpenseSchema>;
export const updateExpenseSchema = createExpenseSchema;
