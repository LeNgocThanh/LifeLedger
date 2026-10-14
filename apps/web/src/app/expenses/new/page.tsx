import Link from "next/link";
import { redirect } from "next/navigation";

import { ExpenseForm } from "@/components/expense-form";
import { listAssetsForSpace } from "@/lib/assets";
import { listCatalogItems } from "@/lib/catalog";
import { getCurrentContext } from "@/lib/current-context";

export default async function NewExpensePage() {
  const context = await getCurrentContext();
  if (!context) redirect("/login");
  if (context.role === "viewer") redirect("/expenses");
  const [assets, catalogItems] = await Promise.all([listAssetsForSpace(context.space.id), listCatalogItems()]);
  return <main className="form-page"><header className="form-page-header"><Link className="back-link" href="/expenses">Lịch sử dùng tiền</Link><p className="eyebrow">{context.space.name}</p><h1>Ghi khoản chi</h1><p>Thêm một hoặc nhiều mặt hàng, dịch vụ trong cùng lần thanh toán.</p></header><ExpenseForm assets={assets.map((asset) => ({ id: asset.id, name: asset.name }))} catalogItems={catalogItems.map((item) => ({ id: item.id, name: item.name, category: item.category, brand: item.brand, partNumber: item.partNumber, unit: item.unit }))} /></main>;
}
