import { createAssetEventSchema } from "@qlts/validation";
import { eq } from "drizzle-orm";

import { getDatabase } from "@/db/client";
import { assetEventItems, assetEvents, assets } from "@/db/schema";
import { getAssetForSpace, listAssetEvents } from "@/lib/assets";
import { areCatalogItemsAvailable } from "@/lib/catalog";
import { getCurrentContext } from "@/lib/current-context";

const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const context = await getCurrentContext();

  if (!context) {
    return Response.json({ message: "Bạn cần đăng nhập." }, { status: 401 });
  }

  const { id } = await params;

  if (!uuidPattern.test(id) || !await getAssetForSpace(id, context.space.id)) {
    return Response.json({ message: "Không tìm thấy tài sản." }, { status: 404 });
  }

  return Response.json({ data: await listAssetEvents(id) });
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const context = await getCurrentContext();

  if (!context) {
    return Response.json({ message: "Bạn cần đăng nhập." }, { status: 401 });
  }

  const { id } = await params;

  if (!uuidPattern.test(id) || !await getAssetForSpace(id, context.space.id)) {
    return Response.json({ message: "Không tìm thấy tài sản." }, { status: 404 });
  }

  let body: unknown;

  try {
    body = await request.json();
  } catch {
    return Response.json({ message: "Dữ liệu gửi lên không hợp lệ." }, { status: 400 });
  }

  const parsedInput = createAssetEventSchema.safeParse(body);

  if (!parsedInput.success) {
    return Response.json(
      {
        message: "Thông tin lịch sử chưa hợp lệ.",
        issues: parsedInput.error.flatten(),
      },
      { status: 400 },
    );
  }

  const input = parsedInput.data;

  if (!await areCatalogItemsAvailable(input.items.map((item) => item.catalogItemId ?? ""))) {
    return Response.json({ message: "Danh mục linh kiện hoặc vật tư không hợp lệ." }, { status: 400 });
  }

  const event = await getDatabase().transaction(async (transaction) => {
    const [createdEvent] = await transaction
      .insert(assetEvents)
      .values({
        assetId: id,
        createdByUserId: context.session.user.id,
        type: input.type,
        occurredAt: input.occurredAt,
        title: input.title,
        description: input.description,
        serviceProvider: input.serviceProvider,
        serviceLocation: input.serviceLocation,
        usageValue: input.usageValue?.toString(),
        usageUnit: input.usageUnit,
        laborCost: input.laborCost?.toString(),
        otherCost: input.otherCost?.toString(),
        currency: input.currency,
        nextMaintenanceDate: input.nextMaintenanceDate || undefined,
      })
      .returning({ id: assetEvents.id });

    if (input.items.length > 0) {
      await transaction.insert(assetEventItems).values(
        input.items.map((item) => ({
          eventId: createdEvent.id,
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

    return createdEvent;
  });

  return Response.json({ data: event }, { status: 201 });
}
