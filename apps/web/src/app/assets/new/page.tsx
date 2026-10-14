import Link from "next/link";
import { notFound, redirect } from "next/navigation";

import { AssetForm } from "@/components/asset-form";
import { getCurrentContext } from "@/lib/current-context";
import { getExpenseItemForSpace } from "@/lib/expenses";

export default async function NewAssetPage({ searchParams }: { searchParams: Promise<{ expenseItemId?: string }> }) {
  const context = await getCurrentContext();

  if (!context) {
    redirect("/login");
  }

  if (context.role === "viewer") {
    redirect("/assets");
  }

  const { expenseItemId } = await searchParams;
  const source = expenseItemId
    ? await getExpenseItemForSpace(expenseItemId, context.space.id)
    : null;

  if (expenseItemId && (!source || source.item.linkedAssetId)) {
    notFound();
  }

  const initialValues = source ? {
    name: source.item.name,
    type: "Khác",
    status: "Đang sử dụng",
    brand: "",
    model: "",
    serialNumber: "",
    purchaseDate: source.transaction.occurredAt.toISOString().slice(0, 10),
    purchasePrice: Number(source.item.allocatedAmount),
    purchasePlace: source.transaction.merchantName ?? "",
    purchaseAddress: source.transaction.merchantAddress ?? "",
    sellerPhone: source.transaction.merchantPhone ?? "",
    paymentMethod: source.transaction.paymentMethod ?? "",
    orderNumber: source.transaction.orderNumber ?? "",
    location: "",
    description: source.item.notes ?? "",
  } : undefined;

  return (
    <main className="form-page">
      <header className="form-page-header">
        <Link className="back-link" href="/assets">Tài sản</Link>
        <p className="eyebrow">{context.space.name}</p>
        <h1>{source ? "Tạo tài sản từ khoản chi" : "Thêm tài sản"}</h1>
        <p>{source ? "Thông tin mua đã được điền từ mặt hàng. Bạn có thể kiểm tra và chỉnh sửa trước khi lưu." : "Bắt đầu với tên tài sản, sau đó bổ sung những thông tin bạn đang có."}</p>
      </header>
      <AssetForm expenseItemId={expenseItemId} sourceExpenseHref={source ? `/expenses/${source.transaction.id}/edit` : undefined} initialValues={initialValues} />
    </main>
  );
}
