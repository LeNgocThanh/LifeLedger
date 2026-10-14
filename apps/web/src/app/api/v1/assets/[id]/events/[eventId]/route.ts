import { updateAssetEventSchema } from "@qlts/validation";
import { and, eq } from "drizzle-orm";

import { getDatabase } from "@/db/client";
import { assetEventItems, assetEvents, assets } from "@/db/schema";
import { getAssetEvent, getAssetForSpace } from "@/lib/assets";
import { areCatalogItemsAvailable } from "@/lib/catalog";
import { getCurrentContext } from "@/lib/current-context";

const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string; eventId: string }> },
) {
  const context = await getCurrentContext();

  if (!context) {
    return Response.json({ message: "Bạn cần đăng nhập." }, { status: 401 });
  }

  const { id, eventId } = await params;

  if (
    !uuidPattern.test(id)
    || !uuidPattern.test(eventId)
    || !await getAssetForSpace(id, context.space.id)
    || !await getAssetEvent(id, eventId)
  ) {
    return Response.json({ message: "Không tìm thấy lịch sử." }, { status: 404 });
  }

  let body: unknown;

  try {
    body = await request.json();
  } catch {
    return Response.json({ message: "Dữ liệu gửi lên không hợp lệ." }, { status: 400 });
  }

  const parsedInput = updateAssetEventSchema.safeParse(body);

  if (!parsedInput.success) {
    return Response.json({ message: "Thông tin lịch sử chưa hợp lệ." }, { status: 400 });
  }

  const input = parsedInput.data;

  if (!await areCatalogItemsAvailable(input.items.map((item) => item.catalogItemId ?? ""))) {
    return Response.json({ message: "Danh mục linh kiện hoặc vật tư không hợp lệ." }, { status: 400 });
  }

  await getDatabase().transaction(async (transaction) => {
    await transaction
      .update(assetEvents)
      .set({
        type: input.type,
        occurredAt: input.occurredAt,
        title: input.title,
        description: input.description ?? null,
        serviceProvider: input.serviceProvider ?? null,
        serviceLocation: input.serviceLocation ?? null,
        usageValue: input.usageValue?.toString() ?? null,
        usageUnit: input.usageUnit ?? null,
        laborCost: input.laborCost?.toString() ?? null,
        otherCost: input.otherCost?.toString() ?? null,
        currency: input.currency,
        nextMaintenanceDate: input.nextMaintenanceDate || null,
        updatedAt: new Date(),
      })
      .where(and(eq(assetEvents.id, eventId), eq(assetEvents.assetId, id)));

    await transaction.delete(assetEventItems).where(eq(assetEventItems.eventId, eventId));

    if (input.items.length > 0) {
      await transaction.insert(assetEventItems).values(
        input.items.map((item) => ({
          eventId,
          catalogItemId: item.catalogItemId || undefined,
          name: item.name,
          partNumber: item.partNumber,
          quantity: item.quantity.toString(),
          unit: item.unit,
          unitPrice: item.unitPrice?.toString(),
          warrantyUntil: item.warrantyUntil || undefined,
          notes: item.notes,
        })),
      );
    }

    await transaction
      .update(assets)
      .set({ updatedAt: new Date() })
      .where(eq(assets.id, id));
  });

  return Response.json({ data: { id: eventId } });
}
