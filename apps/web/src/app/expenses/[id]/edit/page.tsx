import Link from "next/link";
import { notFound, redirect } from "next/navigation";

import { ExpenseForm } from "@/components/expense-form";
import { listAssetsForSpace } from "@/lib/assets";
import { listCatalogItems } from "@/lib/catalog";
import { getCurrentContext } from "@/lib/current-context";
import { getExpenseForSpace } from "@/lib/expenses";

export default async function EditExpensePage({ params }: { params: Promise<{ id: string }> }) {
  const context = await getCurrentContext();
  if (!context) redirect("/login");
  if (context.role === "viewer") redirect("/expenses");
  const { id } = await params;
  const [transaction, assets, catalogItems] = await Promise.all([getExpenseForSpace(id, context.space.id), listAssetsForSpace(context.space.id), listCatalogItems()]);
  if (!transaction) notFound();
  const occurredAt = new Date(transaction.occurredAt.getTime() - transaction.occurredAt.getTimezoneOffset() * 60_000).toISOString().slice(0, 16);
  return <main className="form-page"><header className="form-page-header"><Link className="back-link" href="/expenses">Lịch sử dùng tiền</Link><p className="eyebrow">{context.space.name}</p><h1>Sửa khoản chi</h1><p>Lịch sử người tạo và lần chỉnh sửa cuối vẫn được giữ trong hệ thống.</p></header><ExpenseForm expenseId={id} assets={assets.map((asset) => ({ id: asset.id, name: asset.name }))} catalogItems={catalogItems.map((item) => ({ id: item.id, name: item.name, category: item.category, brand: item.brand, partNumber: item.partNumber, unit: item.unit }))} initialValues={{
    title: transaction.title, occurredAt, merchantName: transaction.merchantName ?? "", merchantAddress: transaction.merchantAddress ?? "", merchantPhone: transaction.merchantPhone ?? "", paymentMethod: transaction.paymentMethod ?? "", orderNumber: transaction.orderNumber ?? "", status: transaction.statusLabel, discountAmount: Number(transaction.discountAmount), feeAmount: Number(transaction.feeAmount), actualPaidAmount: Number(transaction.actualPaidAmount), notes: transaction.notes ?? "", items: transaction.items.map((item) => ({ id: item.id, catalogItemId: item.catalogItemId ?? "", name: item.name, category: item.category ?? "Khác", quantity: Number(item.quantity), unit: item.unit ?? "", unitPrice: Number(item.unitPrice), discountAmount: Number(item.discountAmount), linkedAssetId: item.linkedAssetId ?? "", notes: item.notes ?? "" })),
  }} /></main>;
}
