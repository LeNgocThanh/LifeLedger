import "server-only";

import { and, asc, eq, inArray } from "drizzle-orm";

import { getDatabase } from "@/db/client";
import { catalogItems } from "@/db/schema";

export function listCatalogItems(includeInactive = false) {
  return getDatabase()
    .select()
    .from(catalogItems)
    .where(includeInactive ? undefined : eq(catalogItems.isActive, true))
    .orderBy(asc(catalogItems.name));
}

export async function areCatalogItemsAvailable(ids: string[]) {
  const uniqueIds = [...new Set(ids.filter(Boolean))];

  if (uniqueIds.length === 0) {
    return true;
  }

  const rows = await getDatabase()
    .select({ id: catalogItems.id })
    .from(catalogItems)
    .where(and(inArray(catalogItems.id, uniqueIds), eq(catalogItems.isActive, true)));

  return rows.length === uniqueIds.length;
}
