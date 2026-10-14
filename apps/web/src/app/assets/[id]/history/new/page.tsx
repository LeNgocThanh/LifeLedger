import Link from "next/link";
import { notFound, redirect } from "next/navigation";

import { AssetEventForm } from "@/components/asset-event-form";
import { getAssetForSpace } from "@/lib/assets";
import { listCatalogItems } from "@/lib/catalog";
import { getCurrentContext } from "@/lib/current-context";

const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export default async function NewAssetHistoryPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const context = await getCurrentContext();

  if (!context) {
    redirect("/login");
  }

  const { id } = await params;

  if (!uuidPattern.test(id)) {
    notFound();
  }

  const asset = await getAssetForSpace(id, context.space.id);

  if (!asset) {
    notFound();
  }

  return (
    <main className="form-page">
      <header className="form-page-header">
        <Link className="back-link" href={`/assets/${asset.id}`}>{asset.name}</Link>
        <p className="eyebrow">Lịch sử tài sản</p>
        <h1>Thêm lịch sử</h1>
        <p>Ghi lại sử dụng, bảo trì, sửa chữa, nâng cấp và linh kiện đã thay thế.</p>
      </header>
      <AssetEventForm assetId={asset.id} catalogItems={await listCatalogItems()} />
    </main>
  );
}
