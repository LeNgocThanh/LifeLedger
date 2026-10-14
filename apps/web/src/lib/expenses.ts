import "server-only";

import type { ExpenseStatus } from "@qlts/domain";
import { and, desc, eq, exists, ilike, inArray, isNotNull, isNull, lt, or } from "drizzle-orm";

import { getDatabase } from "@/db/client";
import { expenseItems, expenseTransactions } from "@/db/schema";

export const expenseStatusByLabel = {
  "Hoàn tất": "completed",
  "Hoàn tiền một phần": "partially_refunded",
  "Đã hoàn tiền": "refunded",
  "Đã hủy": "canceled",
} as const;

export const expenseStatusLabelByDatabase = Object.fromEntries(
  Object.entries(expenseStatusByLabel).map(([label, value]) => [value, label]),
) as Record<(typeof expenseStatusByLabel)[ExpenseStatus], ExpenseStatus>;

export function calculateExpense(items: Array<{ quantity: number; unitPrice: number; discountAmount: number }>, discountAmount: number, feeAmount: number, actualPaidAmount: number) {
  const lineTotals = items.map((item) => Math.max(0, item.quantity * item.unitPrice - item.discountAmount));
  const subtotal = items.reduce((total, item) => total + item.quantity * item.unitPrice, 0);
  const itemDiscountAmount = items.reduce((total, item) => total + item.discountAmount, 0);
  const expectedTotal = Math.max(0, subtotal - itemDiscountAmount - discountAmount + feeAmount);
  const targetMinor = Math.round(actualPaidAmount * 100);
  const totalWeight = lineTotals.reduce((total, value) => total + value, 0);
  let allocatedMinor = 0;
  const allocations = lineTotals.map((value, index) => {
    if (index === lineTotals.length - 1) return (targetMinor - allocatedMinor) / 100;
    const weight = totalWeight > 0 ? value / totalWeight : 1 / lineTotals.length;
    const valueMinor = Math.floor(targetMinor * weight);
    allocatedMinor += valueMinor;
    return valueMinor / 100;
  });

  return { subtotal, itemDiscountAmount, expectedTotal, lineTotals, allocations };
}

export async function listExpensesForSpace(spaceId: string, options: { query?: string; trash?: boolean } = {}) {
  await getDatabase().delete(expenseTransactions).where(and(
    eq(expenseTransactions.spaceId, spaceId),
    isNotNull(expenseTransactions.purgeAfter),
    lt(expenseTransactions.purgeAfter, new Date()),
  ));
  const query = options.query?.trim();
  const matchingItems = query
    ? getDatabase().select({ id: expenseItems.id }).from(expenseItems).where(
        and(
          eq(expenseItems.transactionId, expenseTransactions.id),
          or(
            ilike(expenseItems.name, `%${query}%`),
            ilike(expenseItems.category, `%${query}%`),
            ilike(expenseItems.notes, `%${query}%`),
          ),
        ),
      )
    : undefined;
  const transactions = await getDatabase()
    .select()
    .from(expenseTransactions)
    .where(and(
      eq(expenseTransactions.spaceId, spaceId),
      options.trash ? isNotNull(expenseTransactions.deletedAt) : isNull(expenseTransactions.deletedAt),
      query ? or(
        ilike(expenseTransactions.title, `%${query}%`),
        ilike(expenseTransactions.merchantName, `%${query}%`),
        ilike(expenseTransactions.notes, `%${query}%`),
        matchingItems ? exists(matchingItems) : undefined,
      ) : undefined,
    ))
    .orderBy(desc(expenseTransactions.occurredAt), desc(expenseTransactions.createdAt));

  if (transactions.length === 0) return [];

  const items = await getDatabase().select().from(expenseItems).where(
    inArray(expenseItems.transactionId, transactions.map((transaction) => transaction.id)),
  );

  return transactions.map((transaction) => ({
    ...transaction,
    statusLabel: expenseStatusLabelByDatabase[transaction.status],
    items: items.filter((item) => item.transactionId === transaction.id),
  }));
}

export async function getExpenseForSpace(id: string, spaceId: string, includeDeleted = false) {
  const [transaction] = await getDatabase().select().from(expenseTransactions).where(and(
    eq(expenseTransactions.id, id),
    eq(expenseTransactions.spaceId, spaceId),
    includeDeleted ? undefined : isNull(expenseTransactions.deletedAt),
  )).limit(1);

  if (!transaction) return null;

  const items = await getDatabase().select().from(expenseItems).where(eq(expenseItems.transactionId, id));
  return { ...transaction, statusLabel: expenseStatusLabelByDatabase[transaction.status], items };
}

export async function getExpenseItemForSpace(id: string, spaceId: string) {
  const [row] = await getDatabase()
    .select({ item: expenseItems, transaction: expenseTransactions })
    .from(expenseItems)
    .innerJoin(expenseTransactions, eq(expenseTransactions.id, expenseItems.transactionId))
    .where(and(
      eq(expenseItems.id, id),
      eq(expenseTransactions.spaceId, spaceId),
      isNull(expenseTransactions.deletedAt),
    ))
    .limit(1);

  return row ?? null;
}
