import { eq } from "drizzle-orm";

import { getDatabase } from "@/db/client";
import { expenseTransactions } from "@/db/schema";
import { getCurrentContext } from "@/lib/current-context";
import { getExpenseForSpace } from "@/lib/expenses";

export async function POST(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const context = await getCurrentContext();
  if (!context) return Response.json({ message: "Bạn cần đăng nhập." }, { status: 401 });
  if (context.role !== "owner") return Response.json({ message: "Chỉ chủ không gian được khôi phục khoản chi." }, { status: 403 });
  const { id } = await params;
  const existing = await getExpenseForSpace(id, context.space.id, true);
  if (!existing?.deletedAt) return Response.json({ message: "Không tìm thấy khoản chi trong thùng rác." }, { status: 404 });
  await getDatabase().update(expenseTransactions).set({ deletedAt: null, purgeAfter: null, updatedAt: new Date() }).where(eq(expenseTransactions.id, id));
  return Response.json({ data: { id } });
}
