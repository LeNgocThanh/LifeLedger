import { updateExpenseSchema } from "@qlts/validation";
import { and, eq, notInArray } from "drizzle-orm";

import { getDatabase } from "@/db/client";
import { assets, expenseItems, expenseTransactions } from "@/db/schema";
import { areCatalogItemsAvailable } from "@/lib/catalog";
import { getCurrentContext } from "@/lib/current-context";
import { calculateExpense, expenseStatusByLabel, getExpenseForSpace } from "@/lib/expenses";

const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const context = await getCurrentContext();
  if (!context) return Response.json({ message: "Bạn cần đăng nhập." }, { status: 401 });
  const { id } = await params;
  if (!uuidPattern.test(id)) return Response.json({ message: "Không tìm thấy khoản chi." }, { status: 404 });
  const transaction = await getExpenseForSpace(id, context.space.id);
  return transaction
    ? Response.json({ data: transaction })
    : Response.json({ message: "Không tìm thấy khoản chi." }, { status: 404 });
}

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const context = await getCurrentContext();
  if (!context) return Response.json({ message: "Bạn cần đăng nhập." }, { status: 401 });
  if (context.role === "viewer") return Response.json({ message: "Bạn không có quyền sửa khoản chi." }, { status: 403 });
  const { id } = await params;
  const existing = uuidPattern.test(id) ? await getExpenseForSpace(id, context.space.id) : null;
  if (!existing) return Response.json({ message: "Không tìm thấy khoản chi." }, { status: 404 });

  let body: unknown;
  try { body = await request.json(); } catch {
    return Response.json({ message: "Dữ liệu gửi lên không hợp lệ." }, { status: 400 });
  }
  const parsedInput = updateExpenseSchema.safeParse(body);
  if (!parsedInput.success) return Response.json({ message: "Thông tin khoản chi chưa hợp lệ.", issues: parsedInput.error.flatten() }, { status: 400 });
  const input = parsedInput.data;
  if (!await areCatalogItemsAvailable(input.items.map((item) => item.catalogItemId ?? ""))) {
    return Response.json({ message: "Danh mục dùng chung đã chọn không tồn tại hoặc đã ngừng sử dụng." }, { status: 400 });
  }
  const totals = calculateExpense(input.items, input.discountAmount, input.feeAmount, input.actualPaidAmount);
  const existingItemsById = new Map(existing.items.map((item) => [item.id, item]));
  const retainedItemIds = input.items.flatMap((item) => item.id ? [item.id] : []);

  if (retainedItemIds.some((itemId) => !existingItemsById.has(itemId))) {
    return Response.json({ message: "Có mặt hàng không thuộc khoản chi này." }, { status: 400 });
  }

  if (existing.items.some((item) => item.linkedAssetId && !retainedItemIds.includes(item.id))) {
    return Response.json({ message: "Không thể xóa mặt hàng đã liên kết với tài sản." }, { status: 400 });
  }

  const itemIds = await getDatabase().transaction(async (database) => {
    await database.update(expenseTransactions).set({
      paidByUserId: input.paidByUserId || context.session.user.id,
      lastEditedByUserId: context.session.user.id,
      title: input.title,
      occurredAt: new Date(input.occurredAt),
      merchantName: input.merchantName ?? null,
      merchantAddress: input.merchantAddress ?? null,
      merchantPhone: input.merchantPhone ?? null,
      paymentMethod: input.paymentMethod ?? null,
      orderNumber: input.orderNumber ?? null,
      status: expenseStatusByLabel[input.status],
      currency: input.currency,
      subtotal: totals.subtotal.toString(),
      itemDiscountAmount: totals.itemDiscountAmount.toString(),
      discountAmount: input.discountAmount.toString(),
      feeAmount: input.feeAmount.toString(),
      expectedTotal: totals.expectedTotal.toString(),
      actualPaidAmount: input.actualPaidAmount.toString(),
      notes: input.notes ?? null,
      updatedAt: new Date(),
    }).where(eq(expenseTransactions.id, id));
    if (retainedItemIds.length > 0) {
      await database.delete(expenseItems).where(and(
        eq(expenseItems.transactionId, id),
        notInArray(expenseItems.id, retainedItemIds),
      ));
    } else {
      await database.delete(expenseItems).where(eq(expenseItems.transactionId, id));
    }

    const savedItemIds: string[] = [];

    for (const [index, item] of input.items.entries()) {
      const values = {
        catalogItemId: item.catalogItemId || null,
        name: item.name,
        category: item.category,
        quantity: item.quantity.toString(),
        unit: item.unit,
        unitPrice: item.unitPrice.toString(),
        discountAmount: item.discountAmount.toString(),
        lineTotal: totals.lineTotals[index].toString(),
        allocatedAmount: totals.allocations[index].toString(),
        notes: item.notes,
      };

      if (item.id) {
        const existingItem = existingItemsById.get(item.id);
        await database.update(expenseItems).set({
          ...values,
          linkedAssetId: existingItem?.linkedAssetId ?? (item.linkedAssetId || null),
        }).where(and(eq(expenseItems.id, item.id), eq(expenseItems.transactionId, id)));
        savedItemIds.push(item.id);
      } else {
        const [createdItem] = await database.insert(expenseItems).values({
          ...values,
          transactionId: id,
          linkedAssetId: item.linkedAssetId || undefined,
          linkedAssetEventId: item.linkedAssetEventId || undefined,
        }).returning({ id: expenseItems.id });
        savedItemIds.push(createdItem.id);
      }

      const linkedAssetId = existingItemsById.get(item.id ?? "")?.linkedAssetId ?? item.linkedAssetId;
      if (linkedAssetId) {
        await database.update(assets).set({
          purchaseDate: input.occurredAt.slice(0, 10),
          purchasePrice: totals.allocations[index].toString(),
          currency: input.currency,
          purchasePlace: input.merchantName ?? null,
          purchaseAddress: input.merchantAddress ?? null,
          sellerPhone: input.merchantPhone ?? null,
          paymentMethod: input.paymentMethod ?? null,
          orderNumber: input.orderNumber ?? null,
          updatedAt: new Date(),
        }).where(eq(assets.id, linkedAssetId));
      }
    }

    return savedItemIds;
  });

  return Response.json({ data: { id, itemIds }, warning: totals.expectedTotal !== input.actualPaidAmount
    ? `Tổng dự kiến là ${totals.expectedTotal}, khác số thực trả ${input.actualPaidAmount}.`
    : undefined });
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const context = await getCurrentContext();
  if (!context) return Response.json({ message: "Bạn cần đăng nhập." }, { status: 401 });
  if (context.role === "viewer") return Response.json({ message: "Bạn không có quyền chuyển khoản chi vào thùng rác." }, { status: 403 });
  const { id } = await params;
  const existing = uuidPattern.test(id) ? await getExpenseForSpace(id, context.space.id) : null;
  if (!existing) return Response.json({ message: "Không tìm thấy khoản chi." }, { status: 404 });
  const purgeAfter = new Date();
  purgeAfter.setDate(purgeAfter.getDate() + 7);
  await getDatabase().update(expenseTransactions).set({ deletedAt: new Date(), purgeAfter, updatedAt: new Date() }).where(eq(expenseTransactions.id, id));
  return Response.json({ data: { id, purgeAfter: purgeAfter.toISOString() } });
}
