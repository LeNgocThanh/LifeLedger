import "server-only";

import type { AssetStatus, AssetSummary } from "@qlts/domain";
import { and, desc, eq, exists, ilike, inArray, isNull, or } from "drizzle-orm";

import { getDatabase } from "@/db/client";
import {
  assetDocuments,
  assetEventItems,
  assetEvents,
  assets,
  assetSpaces,
  expenseItems,
  expenseTransactions,
} from "@/db/schema";

export const databaseStatusByLabel = {
  "Đang sử dụng": "in_use",
  "Đang lưu kho": "stored",
  "Đang cho mượn": "loaned",
  "Đang bảo trì hoặc sửa chữa": "maintenance",
  "Ngừng sử dụng": "inactive",
  "Đã bán": "sold",
  "Đã cho hoặc chuyển nhượng": "transferred",
  "Đã mất": "lost",
  "Đã thanh lý": "disposed",
} as const;

export const statusLabelByDatabase = Object.fromEntries(
  Object.entries(databaseStatusByLabel).map(([label, value]) => [value, label]),
) as Record<(typeof databaseStatusByLabel)[AssetStatus], AssetStatus>;

export type AssetListFilters = {
  query?: string;
  type?: string;
  status?: AssetStatus;
};

export async function listAssetsForSpace(
  spaceId: string,
  filters: AssetListFilters = {},
): Promise<AssetSummary[]> {
  const query = filters.query?.trim();
  const databaseStatus = filters.status
    ? databaseStatusByLabel[filters.status]
    : undefined;
  const database = getDatabase();
  const matchingItems = query
    ? database
        .select({ id: assetEventItems.id })
        .from(assetEventItems)
        .where(
          and(
            eq(assetEventItems.eventId, assetEvents.id),
            or(
              ilike(assetEventItems.name, `%${query}%`),
              ilike(assetEventItems.partNumber, `%${query}%`),
              ilike(assetEventItems.notes, `%${query}%`),
            ),
          ),
        )
    : undefined;
  const matchingEvents = query
    ? database
        .select({ id: assetEvents.id })
        .from(assetEvents)
        .where(
          and(
            eq(assetEvents.assetId, assets.id),
            or(
              ilike(assetEvents.title, `%${query}%`),
              ilike(assetEvents.description, `%${query}%`),
              ilike(assetEvents.serviceProvider, `%${query}%`),
              ilike(assetEvents.serviceLocation, `%${query}%`),
              matchingItems ? exists(matchingItems) : undefined,
            ),
          ),
        )
    : undefined;
  const rows = await database
    .select({
      id: assets.id,
      name: assets.name,
      type: assets.type,
      status: assets.status,
      location: assets.location,
      purchasePrice: assets.purchasePrice,
      updatedAt: assets.updatedAt,
    })
    .from(assets)
    .innerJoin(assetSpaces, eq(assetSpaces.assetId, assets.id))
    .where(
      and(
        eq(assetSpaces.spaceId, spaceId),
        isNull(assets.deletedAt),
        filters.type ? eq(assets.type, filters.type) : undefined,
        databaseStatus ? eq(assets.status, databaseStatus) : undefined,
        query
          ? or(
              ilike(assets.name, `%${query}%`),
              ilike(assets.brand, `%${query}%`),
              ilike(assets.model, `%${query}%`),
              ilike(assets.serialNumber, `%${query}%`),
              matchingEvents ? exists(matchingEvents) : undefined,
            )
          : undefined,
      ),
    )
    .orderBy(desc(assets.updatedAt));

  return rows.map((row) => ({
    id: row.id,
    name: row.name,
    type: row.type,
    status: statusLabelByDatabase[row.status],
    location: row.location ?? undefined,
    purchasePrice: row.purchasePrice ? Number(row.purchasePrice) : undefined,
    updatedAt: row.updatedAt.toISOString(),
  }));
}

export async function getAssetForSpace(assetId: string, spaceId: string) {
  const [row] = await getDatabase()
    .select({ asset: assets })
    .from(assets)
    .innerJoin(assetSpaces, eq(assetSpaces.assetId, assets.id))
    .where(
      and(
        eq(assets.id, assetId),
        eq(assetSpaces.spaceId, spaceId),
        isNull(assets.deletedAt),
      ),
    )
    .limit(1);

  return row?.asset ?? null;
}

export async function getAssetPurchaseSource(assetId: string, spaceId: string) {
  const [row] = await getDatabase()
    .select({ item: expenseItems, transaction: expenseTransactions })
    .from(expenseItems)
    .innerJoin(expenseTransactions, eq(expenseTransactions.id, expenseItems.transactionId))
    .where(and(
      eq(expenseItems.linkedAssetId, assetId),
      eq(expenseTransactions.spaceId, spaceId),
    ))
    .limit(1);

  return row ?? null;
}

export async function listAssetDocuments(assetId: string) {
  return getDatabase()
    .select()
    .from(assetDocuments)
    .where(eq(assetDocuments.assetId, assetId))
    .orderBy(desc(assetDocuments.createdAt));
}

export async function listAssetEvents(assetId: string) {
  const events = await getDatabase()
    .select()
    .from(assetEvents)
    .where(eq(assetEvents.assetId, assetId))
    .orderBy(desc(assetEvents.occurredAt), desc(assetEvents.createdAt));

  if (events.length === 0) {
    return [];
  }

  const items = await getDatabase()
    .select()
    .from(assetEventItems)
    .where(inArray(assetEventItems.eventId, events.map((event) => event.id)));

  return events.map((event) => ({
    ...event,
    items: items.filter((item) => item.eventId === event.id),
  }));
}

export async function getAssetEvent(assetId: string, eventId: string) {
  const [event] = await getDatabase()
    .select()
    .from(assetEvents)
    .where(and(eq(assetEvents.id, eventId), eq(assetEvents.assetId, assetId)))
    .limit(1);

  if (!event) {
    return null;
  }

  const items = await getDatabase()
    .select()
    .from(assetEventItems)
    .where(eq(assetEventItems.eventId, event.id));

  return { ...event, items };
}
