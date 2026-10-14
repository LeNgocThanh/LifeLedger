import Link from "next/link";
import { notFound, redirect } from "next/navigation";

import { AssetEventForm } from "@/components/asset-event-form";
import { getAssetEvent, getAssetForSpace } from "@/lib/assets";
import { listCatalogItems } from "@/lib/catalog";
import { getCurrentContext } from "@/lib/current-context";

const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export default async function EditAssetHistoryPage({
  params,
}: {
  params: Promise<{ id: string; eventId: string }>;
}) {
  const context = await getCurrentContext();

  if (!context) {
    redirect("/login");
  }

  const { id, eventId } = await params;

  if (!uuidPattern.test(id) || !uuidPattern.test(eventId)) {
    notFound();
  }

  const asset = await getAssetForSpace(id, context.space.id);
  const event = asset ? await getAssetEvent(id, eventId) : null;

  if (!asset || !event) {
    notFound();
  }

  return (
    <main className="form-page">
      <header className="form-page-header">
        <Link className="back-link" href={`/assets/${asset.id}`}>{asset.name}</Link>
        <p className="eyebrow">Chỉnh sửa lịch sử</p>
        <h1>{event.title}</h1>
        <p>Các thay đổi chỉ áp dụng cho sự kiện lịch sử này.</p>
      </header>
      <AssetEventForm
        assetId={asset.id}
        catalogItems={await listCatalogItems()}
        eventId={event.id}
        initialValues={{
          type: event.type,
          occurredAt: event.occurredAt,
          title: event.title,
          description: event.description ?? "",
          serviceProvider: event.serviceProvider ?? "",
          serviceLocation: event.serviceLocation ?? "",
          usageValue: event.usageValue ? Number(event.usageValue) : undefined,
          usageUnit: event.usageUnit ?? "",
          laborCost: event.laborCost ? Number(event.laborCost) : undefined,
          otherCost: event.otherCost ? Number(event.otherCost) : undefined,
          nextMaintenanceDate: event.nextMaintenanceDate ?? "",
          items: event.items.map((item) => ({
            catalogItemId: item.catalogItemId ?? "",
            name: item.name,
            partNumber: item.partNumber ?? "",
            quantity: Number(item.quantity),
            unit: item.unit ?? "",
            unitPrice: item.unitPrice ? Number(item.unitPrice) : undefined,
            warrantyUntil: item.warrantyUntil ?? "",
            notes: item.notes ?? "",
          })),
        }}
      />
    </main>
  );
}
