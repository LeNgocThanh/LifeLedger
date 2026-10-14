import { createExpenseSchema } from "@qlts/validation";

import { getDatabase } from "@/db/client";
import { expenseItems, expenseTransactions } from "@/db/schema";
import { areCatalogItemsAvailable } from "@/lib/catalog";
import { getCurrentContext } from "@/lib/current-context";
import { calculateExpense, expenseStatusByLabel, listExpensesForSpace } from "@/lib/expenses";

export async function GET(request: Request) {
  const context = await getCurrentContext();
  if (!context) return Response.json({ message: "Bạn cần đăng nhập." }, { status: 401 });

  const searchParams = new URL(request.url).searchParams;
  return Response.json({ data: await listExpensesForSpace(context.space.id, {
    query: searchParams.get("q") ?? undefined,
    trash: searchParams.get("trash") === "true",
  }) });
}

export async function POST(request: Request) {
  const context = await getCurrentContext();
  if (!context) return Response.json({ message: "Bạn cần đăng nhập." }, { status: 401 });
  if (context.role === "viewer") return Response.json({ message: "Bạn không có quyền thêm khoản chi." }, { status: 403 });

  let body: unknown;
  try { body = await request.json(); } catch {
    return Response.json({ message: "Dữ liệu gửi lên không hợp lệ." }, { status: 400 });
  }

  const parsedInput = createExpenseSchema.safeParse(body);
  if (!parsedInput.success) return Response.json({
    message: "Thông tin khoản chi chưa hợp lệ.",
    issues: parsedInput.error.flatten(),
  }, { status: 400 });

  const input = parsedInput.data;
  if (!await areCatalogItemsAvailable(input.items.map((item) => item.catalogItemId ?? ""))) {
    return Response.json({ message: "Danh mục dùng chung đã chọn không tồn tại hoặc đã ngừng sử dụng." }, { status: 400 });
  }
  const totals = calculateExpense(input.items, input.discountAmount, input.feeAmount, input.actualPaidAmount);
  const transaction = await getDatabase().transaction(async (database) => {
    const [created] = await database.insert(expenseTransactions).values({
      spaceId: context.space.id,
      createdByUserId: context.session.user.id,
      paidByUserId: input.paidByUserId || context.session.user.id,
      lastEditedByUserId: context.session.user.id,
      title: input.title,
      occurredAt: new Date(input.occurredAt),
      merchantName: input.merchantName,
      merchantAddress: input.merchantAddress,
      merchantPhone: input.merchantPhone,
      paymentMethod: input.paymentMethod,
      orderNumber: input.orderNumber,
      status: expenseStatusByLabel[input.status],
      currency: input.currency,
      subtotal: totals.subtotal.toString(),
      itemDiscountAmount: totals.itemDiscountAmount.toString(),
      discountAmount: input.discountAmount.toString(),
      feeAmount: input.feeAmount.toString(),
      expectedTotal: totals.expectedTotal.toString(),
      actualPaidAmount: input.actualPaidAmount.toString(),
      notes: input.notes,
    }).returning();

    const createdItems = await database.insert(expenseItems).values(input.items.map((item, index) => ({
      transactionId: created.id,
      catalogItemId: item.catalogItemId || undefined,
      linkedAssetId: item.linkedAssetId || undefined,
      linkedAssetEventId: item.linkedAssetEventId || undefined,
      name: item.name,
      category: item.category,
      quantity: item.quantity.toString(),
      unit: item.unit,
      unitPrice: item.unitPrice.toString(),
      discountAmount: item.discountAmount.toString(),
      lineTotal: totals.lineTotals[index].toString(),
      allocatedAmount: totals.allocations[index].toString(),
      notes: item.notes,
    }))).returning({ id: expenseItems.id });
    return { created, itemIds: createdItems.map((item) => item.id) };
  });

  return Response.json({
    data: { id: transaction.created.id, itemIds: transaction.itemIds },
    warning: totals.expectedTotal !== input.actualPaidAmount
      ? `Tổng dự kiến là ${totals.expectedTotal}, khác số thực trả ${input.actualPaidAmount}.`
      : undefined,
  }, { status: 201 });
}
