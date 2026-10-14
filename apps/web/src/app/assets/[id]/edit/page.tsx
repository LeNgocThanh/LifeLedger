import Link from "next/link";
import { notFound, redirect } from "next/navigation";

import { AssetForm } from "@/components/asset-form";
import { getAssetForSpace, getAssetPurchaseSource, statusLabelByDatabase } from "@/lib/assets";
import { getCurrentContext } from "@/lib/current-context";

const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export default async function EditAssetPage({
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

  const purchaseSource = await getAssetPurchaseSource(asset.id, context.space.id);

  return (
    <main className="form-page">
      <header className="form-page-header">
        <Link className="back-link" href={`/assets/${asset.id}`}>{asset.name}</Link>
        <p className="eyebrow">Chỉnh sửa tài sản</p>
        <h1>{asset.name}</h1>
        <p>Những trường để trống sẽ được xóa khỏi hồ sơ tài sản.</p>
      </header>
      <AssetForm
        assetId={asset.id}
        sourceExpenseHref={purchaseSource ? purchaseSource.transaction.deletedAt ? "/expenses?trash=true" : `/expenses/${purchaseSource.transaction.id}/edit` : undefined}
        initialValues={{
          name: asset.name,
          type: asset.type,
          status: statusLabelByDatabase[asset.status],
          brand: asset.brand ?? "",
          model: asset.model ?? "",
          serialNumber: asset.serialNumber ?? "",
          purchaseDate: asset.purchaseDate ?? "",
          purchasePrice: asset.purchasePrice ? Number(asset.purchasePrice) : undefined,
          purchasePlace: asset.purchasePlace ?? "",
          purchaseAddress: asset.purchaseAddress ?? "",
          sellerPhone: asset.sellerPhone ?? "",
          paymentMethod: asset.paymentMethod ?? "",
          orderNumber: asset.orderNumber ?? "",
          location: asset.location ?? "",
          description: asset.description ?? "",
        }}
      />
    </main>
  );
}
