import { ASSET_STATUSES, ASSET_TYPES, type AssetStatus } from "@qlts/domain";
import { ChevronRight, History, PackageOpen, Plus, SearchX, X } from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";
import type { ReactNode } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { listAssetEvents, listAssetsForSpace } from "@/lib/assets";
import { getCurrentContext } from "@/lib/current-context";
import { cn } from "@/lib/utils";

const selectClassName = cn(
  "border-input bg-background h-9 w-full rounded-md border px-3 text-sm shadow-xs outline-none",
  "focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]",
);

function formatCurrency(value: number) {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
    maximumFractionDigits: 0,
  }).format(value);
}

function firstValue(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

function Highlight({ children, query }: { children: string; query: string }): ReactNode {
  if (!query) return children;
  const escapedQuery = query.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  return children.split(new RegExp(`(${escapedQuery})`, "gi")).map((part, index) =>
    part.toLocaleLowerCase("vi-VN") === query.toLocaleLowerCase("vi-VN") ? (
      <mark
        key={index}
        className="rounded-sm bg-yellow-200 px-0.5 text-foreground dark:bg-yellow-500/30"
      >
        {part}
      </mark>
    ) : (
      part
    ),
  );
}

function eventContainsQuery(
  event: Awaited<ReturnType<typeof listAssetEvents>>[number],
  query: string,
) {
  if (!query) return false;
  const searchText = [
    event.type,
    event.title,
    event.description,
    event.serviceProvider,
    event.serviceLocation,
    ...event.items.flatMap((item) => [item.name, item.partNumber, item.notes]),
  ]
    .filter(Boolean)
    .join(" ")
    .toLocaleLowerCase("vi-VN");
  return searchText.includes(query.toLocaleLowerCase("vi-VN"));
}

export default async function AssetsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const context = await getCurrentContext();

  if (!context) {
    redirect("/login");
  }

  const queryParams = await searchParams;
  const query = firstValue(queryParams.q)?.trim() ?? "";
  const type = firstValue(queryParams.type) ?? "";
  const requestedStatus = firstValue(queryParams.status);
  const status = ASSET_STATUSES.find((item) => item === requestedStatus) as AssetStatus | undefined;
  const hasFilters = Boolean(query || type || status);
  const assets = await listAssetsForSpace(context.space.id, {
    query: query || undefined,
    type: type || undefined,
    status,
  });
  const histories = new Map(
    await Promise.all(
      assets.map(async (asset) => [asset.id, await listAssetEvents(asset.id)] as const),
    ),
  );

  return (
    <main className="mx-auto w-full max-w-5xl space-y-6 px-4 py-6 sm:px-6 sm:py-10">
      {/* Header */}
      <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="space-y-1">
          <Link
            href="/"
            className="text-muted-foreground hover:text-foreground text-sm underline-offset-4 hover:underline"
          >
            ← Tổng quan
          </Link>
          <p className="text-muted-foreground text-sm">{context.space.name}</p>
          <h1 className="text-3xl font-semibold tracking-tight">Tài sản</h1>
          <p className="text-muted-foreground max-w-prose text-sm">
            Tìm và quản lý những tài sản trong không gian hiện hành.
          </p>
        </div>
        <Button asChild className="w-full sm:w-auto">
          <Link href="/assets/new">
            <Plus />
            Thêm tài sản
          </Link>
        </Button>
      </header>

      {/* Filters */}
      <Card className="p-4">
        <form
          method="get"
          className="grid gap-4 sm:grid-cols-2 lg:grid-cols-[1fr_180px_180px_auto] lg:items-end"
        >
          <div className="space-y-2 sm:col-span-2 lg:col-span-1">
            <Label htmlFor="q">Tìm kiếm</Label>
            <Input
              id="q"
              name="q"
              defaultValue={query}
              placeholder="Tài sản, lịch sử, đơn vị hoặc linh kiện"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="type">Loại</Label>
            <select id="type" name="type" defaultValue={type} className={selectClassName}>
              <option value="">Tất cả loại</option>
              {ASSET_TYPES.map((item) => (
                <option key={item}>{item}</option>
              ))}
            </select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="status">Trạng thái</Label>
            <select id="status" name="status" defaultValue={status ?? ""} className={selectClassName}>
              <option value="">Tất cả trạng thái</option>
              {ASSET_STATUSES.map((item) => (
                <option key={item}>{item}</option>
              ))}
            </select>
          </div>
          <div className="flex items-center gap-2 sm:col-span-2 lg:col-span-1">
            <Button type="submit" variant="secondary">
              Áp dụng
            </Button>
            {hasFilters ? (
              <Button asChild variant="ghost">
                <Link href="/assets">
                  <X />
                  Xóa lọc
                </Link>
              </Button>
            ) : null}
          </div>
        </form>
      </Card>

      {/* Content */}
      {assets.length === 0 && !hasFilters ? (
        <Card className="items-center gap-3 border-dashed px-6 py-14 text-center">
          <div className="bg-muted text-muted-foreground flex size-12 items-center justify-center rounded-full">
            <PackageOpen className="size-6" aria-hidden="true" />
          </div>
          <h2 className="text-xl font-semibold">Chưa có tài sản nào</h2>
          <p className="text-muted-foreground max-w-md text-sm">
            Thêm tài sản đầu tiên trong chưa đầy một phút. Bạn có thể bổ sung giấy tờ và lịch sử sau.
          </p>
          <Button asChild className="mt-2">
            <Link href="/assets/new">
              <Plus />
              Thêm tài sản đầu tiên
            </Link>
          </Button>
        </Card>
      ) : assets.length === 0 ? (
        <Card className="items-center gap-3 border-dashed px-6 py-10 text-center">
          <div className="bg-muted text-muted-foreground flex size-10 items-center justify-center rounded-full">
            <SearchX className="size-5" aria-hidden="true" />
          </div>
          <h2 className="text-lg font-semibold">Không tìm thấy tài sản</h2>
          <p className="text-muted-foreground text-sm">Thử thay đổi từ khóa hoặc bỏ bớt điều kiện lọc.</p>
          <Button asChild variant="secondary" className="mt-1">
            <Link href="/assets">Xóa bộ lọc</Link>
          </Button>
        </Card>
      ) : (
        <section className="space-y-3">
          <div className="flex items-center justify-between px-1 text-sm">
            <strong className="font-medium">{assets.length} tài sản</strong>
            <span className="text-muted-foreground">Sắp xếp theo cập nhật mới nhất</span>
          </div>

          <div className="space-y-3">
            {assets.map((asset) => {
              const events = histories.get(asset.id) ?? [];
              const matchingEvents = events.filter((event) => eventContainsQuery(event, query));
              const displayedEvents = query && matchingEvents.length > 0 ? matchingEvents : events;
              const isMaintenance = asset.status.includes("bảo trì");

              return (
                <Card key={asset.id} className="gap-0 overflow-hidden p-0">
                  <Link
                    href={`/assets/${asset.id}`}
                    className="hover:bg-muted/50 focus-visible:bg-muted/50 grid grid-cols-[auto_1fr_auto] items-center gap-3 p-4 outline-none transition-colors sm:grid-cols-[auto_1fr_auto_auto_auto] sm:gap-4"
                  >
                    <div
                      aria-hidden="true"
                      className="bg-primary/10 text-primary flex size-10 items-center justify-center rounded-lg font-semibold uppercase"
                    >
                      {asset.type.slice(0, 1)}
                    </div>

                    <div className="min-w-0">
                      <strong className="block truncate font-medium">
                        <Highlight query={query}>{asset.name}</Highlight>
                      </strong>
                      <span className="text-muted-foreground block truncate text-sm">
                        {asset.type}
                        {asset.location ? ` · ${asset.location}` : ""}
                      </span>
                    </div>

                    <Badge
                      variant={isMaintenance ? "outline" : "secondary"}
                      className={cn(
                        "justify-self-end",
                        isMaintenance &&
                          "border-amber-300 bg-amber-50 text-amber-700 dark:border-amber-500/40 dark:bg-amber-500/10 dark:text-amber-300",
                      )}
                    >
                      {asset.status}
                    </Badge>

                    <div className="col-span-2 col-start-2 text-left sm:col-span-1 sm:col-start-auto sm:text-right">
                      <strong className="block text-sm font-medium tabular-nums">
                        {asset.purchasePrice !== undefined
                          ? formatCurrency(asset.purchasePrice)
                          : "Chưa có giá"}
                      </strong>
                      <span className="text-muted-foreground text-xs">
                        {new Date(asset.updatedAt).toLocaleDateString("vi-VN")}
                      </span>
                    </div>

                    <ChevronRight
                      className="text-muted-foreground hidden size-5 sm:block"
                      aria-hidden="true"
                    />
                  </Link>

                  {events.length > 0 ? (
                    <details
                      className="group bg-muted/30 border-t"
                      open={matchingEvents.length > 0}
                    >
                      <summary className="text-muted-foreground hover:text-foreground flex cursor-pointer list-none items-center gap-2 px-4 py-2.5 text-sm select-none [&::-webkit-details-marker]:hidden">
                        <History className="size-4" aria-hidden="true" />
                        <span>{events.length} sự kiện sử dụng và bảo trì</span>
                        <ChevronRight
                          className="ml-auto size-4 transition-transform group-open:rotate-90"
                          aria-hidden="true"
                        />
                      </summary>

                      <ol className="space-y-4 px-4 pt-1 pb-4">
                        {displayedEvents.map((event) => (
                          <li
                            key={event.id}
                            className="border-border relative space-y-0.5 border-l-2 pl-4 text-sm"
                          >
                            <time className="text-muted-foreground block text-xs">
                              {new Date(event.occurredAt).toLocaleDateString("vi-VN")}
                            </time>
                            <p>
                              <strong className="font-medium">
                                <Highlight query={query}>{event.title}</Highlight>
                              </strong>{" "}
                              ·{" "}
                              <span className="text-muted-foreground">
                                <Highlight query={query}>{event.type}</Highlight>
                              </span>
                            </p>
                            {event.serviceProvider ? (
                              <small className="text-muted-foreground block">
                                <Highlight query={query}>{event.serviceProvider}</Highlight>
                              </small>
                            ) : null}
                            {event.serviceLocation ? (
                              <small className="text-muted-foreground block">
                                <Highlight query={query}>{event.serviceLocation}</Highlight>
                              </small>
                            ) : null}
                            {event.description ? (
                              <small className="text-muted-foreground block">
                                <Highlight query={query}>{event.description}</Highlight>
                              </small>
                            ) : null}
                            {event.items.map((item) => (
                              <small key={item.id} className="text-muted-foreground block">
                                Linh kiện: <Highlight query={query}>{item.name}</Highlight>
                                {item.partNumber ? (
                                  <>
                                    {" · "}
                                    <Highlight query={query}>{item.partNumber}</Highlight>
                                  </>
                                ) : null}
                                {item.notes ? (
                                  <>
                                    {" · "}
                                    <Highlight query={query}>{item.notes}</Highlight>
                                  </>
                                ) : null}
                              </small>
                            ))}
                          </li>
                        ))}
                      </ol>
                    </details>
                  ) : null}
                </Card>
              );
            })}
          </div>
        </section>
      )}
    </main>
  );
}
