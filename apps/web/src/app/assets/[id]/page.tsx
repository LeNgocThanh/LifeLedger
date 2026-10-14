import { Download, FileText, Pencil, Plus } from "lucide-react";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import type { ReactNode } from "react";

import { AssetDocumentUploader } from "@/components/asset-document-uploader";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getAssetForSpace, getAssetPurchaseSource, listAssetDocuments, listAssetEvents } from "@/lib/assets";
import { getCurrentContext } from "@/lib/current-context";

function Field({ label, value }: { label: string; value?: ReactNode }) {
  const isEmpty = value === null || value === undefined || value === "";
  return (
    <div className="flex items-baseline justify-between gap-4 py-2.5 text-sm first:pt-0 last:pb-0">
      <dt className="text-muted-foreground shrink-0">{label}</dt>
      <dd className={isEmpty ? "text-muted-foreground" : "text-right font-medium break-words"}>
        {isEmpty ? "Chưa có" : value}
      </dd>
    </div>
  );
}

function EmptyNote({ children }: { children: ReactNode }) {
  return (
    <p className="text-muted-foreground rounded-lg border border-dashed px-4 py-6 text-center text-sm">
      {children}
    </p>
  );
}

export default async function AssetDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const context = await getCurrentContext();

  if (!context) {
    redirect("/login");
  }

  const { id } = await params;

  if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(id)) {
    notFound();
  }

  const asset = await getAssetForSpace(id, context.space.id);

  if (!asset) {
    notFound();
  }

  const item = asset;
  const [documents, events, purchaseSource] = await Promise.all([
    listAssetDocuments(item.id),
    listAssetEvents(item.id),
    getAssetPurchaseSource(item.id, context.space.id),
  ]);

  return (
    <main className="mx-auto w-full max-w-5xl space-y-6 px-4 py-6 sm:px-6 sm:py-10">
      {/* Header */}
      <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="min-w-0 space-y-1">
          <Link
            href="/assets"
            className="text-muted-foreground hover:text-foreground text-sm underline-offset-4 hover:underline"
          >
            ← Tài sản
          </Link>
          <p className="text-muted-foreground text-sm">{item.type}</p>
          <h1 className="text-3xl font-semibold tracking-tight break-words">{item.name}</h1>
          <p className="text-muted-foreground text-sm">{item.location ?? "Chưa ghi vị trí"}</p>
        </div>
        <Button asChild variant="secondary" className="w-full sm:w-auto">
          <Link href={`/assets/${item.id}/edit`}>
            <Pencil />
            Chỉnh sửa
          </Link>
        </Button>
      </header>

      <section className="grid gap-6 md:grid-cols-2">
        {/* Thông tin cơ bản */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Thông tin cơ bản</CardTitle>
          </CardHeader>
          <CardContent>
            {purchaseSource ? <p className="mb-4 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-800">Được đồng bộ từ <Link className="font-medium underline" href={purchaseSource.transaction.deletedAt ? "/expenses?trash=true" : `/expenses/${purchaseSource.transaction.id}/edit`}>khoản chi nguồn{purchaseSource.transaction.deletedAt ? " đang trong thùng rác" : ""}</Link>.</p> : null}
            <dl className="divide-y">
              <Field label="Hãng" value={item.brand} />
              <Field label="Model" value={item.model} />
              <Field label="Số sê-ri" value={item.serialNumber} />
            </dl>
          </CardContent>
        </Card>

        {/* Thông tin mua */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Thông tin mua</CardTitle>
          </CardHeader>
          <CardContent>
            <dl className="divide-y">
              <Field
                label="Ngày mua"
                value={item.purchaseDate ? new Date(item.purchaseDate).toLocaleDateString("vi-VN") : null}
              />
              <Field
                label={purchaseSource ? "Giá mua được phân bổ" : "Giá mua"}
                value={
                  item.purchasePrice !== null
                    ? `${Number(item.purchasePrice).toLocaleString("vi-VN")} ${item.currency}`
                    : null
                }
              />
              <Field label="Nơi mua" value={item.purchasePlace} />
              <Field label="Địa chỉ mua" value={item.purchaseAddress} />
              <Field label="Điện thoại" value={item.sellerPhone} />
              <Field label="Thanh toán" value={item.paymentMethod} />
              <Field label="Mã đơn hàng" value={item.orderNumber} />
            </dl>
          </CardContent>
        </Card>

        {/* Lịch sử */}
        <Card className="md:col-span-2">
          <CardHeader className="flex flex-row items-start justify-between gap-4">
            <div className="space-y-1">
              <CardTitle className="text-base">Lịch sử sử dụng và bảo trì</CardTitle>
              <p className="text-muted-foreground text-sm">{events.length} sự kiện</p>
            </div>
            <Button asChild variant="secondary" size="sm">
              <Link href={`/assets/${item.id}/history/new`}>
                <Plus />
                Thêm lịch sử
              </Link>
            </Button>
          </CardHeader>
          <CardContent>
            {events.length > 0 ? (
              <ol className="divide-y">
                {events.map((event) => {
                  const itemCost = event.items.reduce(
                    (total, eventItem) =>
                      total + Number(eventItem.quantity) * Number(eventItem.unitPrice ?? 0),
                    0,
                  );
                  const totalCost =
                    Number(event.laborCost ?? 0) + Number(event.otherCost ?? 0) + itemCost;

                  return (
                    <li
                      key={event.id}
                      className="grid gap-3 py-5 first:pt-0 last:pb-0 sm:grid-cols-[140px_1fr_auto] sm:gap-6"
                    >
                      <div className="text-sm">
                        <strong className="block font-medium">
                          {new Date(event.occurredAt).toLocaleDateString("vi-VN")}
                        </strong>
                        <span className="text-muted-foreground">{event.type}</span>
                      </div>

                      <div className="min-w-0 space-y-1.5">
                        <h3 className="font-medium">{event.title}</h3>
                        <p className="text-muted-foreground text-sm">
                          {[event.serviceProvider, event.serviceLocation].filter(Boolean).join(" · ") ||
                            "Không ghi đơn vị thực hiện"}
                        </p>
                        {event.usageValue !== null ? (
                          <small className="text-muted-foreground block text-xs">
                            Chỉ số: {Number(event.usageValue).toLocaleString("vi-VN")} {event.usageUnit}
                          </small>
                        ) : null}
                        {event.items.length > 0 ? (
                          <ul className="bg-muted/40 mt-2 divide-y rounded-lg border">
                            {event.items.map((eventItem) => (
                              <li
                                key={eventItem.id}
                                className="flex flex-col gap-0.5 px-3 py-2 text-sm sm:flex-row sm:items-baseline sm:justify-between sm:gap-4"
                              >
                                <span>
                                  {eventItem.name}
                                  {eventItem.partNumber ? ` · ${eventItem.partNumber}` : ""}
                                </span>
                                <small className="text-muted-foreground text-xs tabular-nums">
                                  {Number(eventItem.quantity).toLocaleString("vi-VN")}{" "}
                                  {eventItem.unit || "đơn vị"}
                                  {eventItem.unitPrice !== null
                                    ? ` × ${Number(eventItem.unitPrice).toLocaleString("vi-VN")} ${event.currency}`
                                    : ""}
                                  {eventItem.warrantyUntil
                                    ? ` · BH đến ${new Date(eventItem.warrantyUntil).toLocaleDateString("vi-VN")}`
                                    : ""}
                                </small>
                              </li>
                            ))}
                          </ul>
                        ) : null}
                        {event.description ? (
                          <p className="text-muted-foreground text-sm">{event.description}</p>
                        ) : null}
                      </div>

                      <div className="flex flex-col gap-1 text-sm sm:items-end sm:text-right">
                        <strong className="font-medium tabular-nums">
                          {totalCost.toLocaleString("vi-VN")} {event.currency}
                        </strong>
                        {event.nextMaintenanceDate ? (
                          <small className="text-muted-foreground text-xs">
                            Lần tới: {new Date(event.nextMaintenanceDate).toLocaleDateString("vi-VN")}
                          </small>
                        ) : null}
                        <Link
                          href={`/assets/${item.id}/history/${event.id}/edit`}
                          className="text-primary text-xs underline-offset-4 hover:underline"
                        >
                          Chỉnh sửa
                        </Link>
                      </div>
                    </li>
                  );
                })}
              </ol>
            ) : (
              <EmptyNote>Chưa có lịch sử sử dụng, bảo trì hoặc sửa chữa.</EmptyNote>
            )}
          </CardContent>
        </Card>

        {/* Giấy tờ */}
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle className="text-base">Giấy tờ và hình ảnh</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <AssetDocumentUploader assetId={item.id} />
            {documents.length > 0 ? (
              <div className="grid gap-2 sm:grid-cols-2">
                {documents.map((document) => (
                  <a
                    key={document.id}
                    href={`/api/v1/assets/${item.id}/documents/${document.id}/download`}
                    className="hover:bg-muted/50 focus-visible:ring-ring/50 flex items-center gap-3 rounded-lg border p-3 transition-colors outline-none focus-visible:ring-[3px]"
                  >
                    <div className="bg-muted text-muted-foreground flex size-10 shrink-0 items-center justify-center rounded-md">
                      <FileText className="size-5" aria-hidden="true" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <strong className="block truncate text-sm font-medium">
                        {document.documentType}
                      </strong>
                      <span className="text-muted-foreground block truncate text-sm">
                        {document.fileName}
                      </span>
                      <small className="text-muted-foreground text-xs">
                        {(Number(document.bytes) / 1024 / 1024).toFixed(2)} MB
                      </small>
                    </div>
                    <Download className="text-muted-foreground size-4 shrink-0" aria-label="Tải xuống" />
                  </a>
                ))}
              </div>
            ) : (
              <EmptyNote>Chưa có giấy tờ hoặc hình ảnh.</EmptyNote>
            )}
          </CardContent>
        </Card>

        {/* Mô tả */}
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle className="text-base">Mô tả</CardTitle>
          </CardHeader>
          <CardContent>
            <p
              className={
                item.description
                  ? "max-w-prose text-sm leading-relaxed whitespace-pre-line"
                  : "text-muted-foreground text-sm"
              }
            >
              {item.description ?? "Chưa có mô tả. Bạn có thể bổ sung khi chỉnh sửa tài sản."}
            </p>
          </CardContent>
        </Card>
      </section>
    </main>
  );
}
