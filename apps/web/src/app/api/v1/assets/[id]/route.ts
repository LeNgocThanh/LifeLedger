import { updateAssetSchema } from "@qlts/validation";
import { eq } from "drizzle-orm";

import { getDatabase } from "@/db/client";
import { assets } from "@/db/schema";
import {
  databaseStatusByLabel,
  getAssetForSpace,
  getAssetPurchaseSource,
  listAssetDocuments,
  listAssetEvents,
  statusLabelByDatabase,
} from "@/lib/assets";
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

  if (!uuidPattern.test(id)) {
    return Response.json({ message: "Không tìm thấy tài sản." }, { status: 404 });
  }

  const asset = await getAssetForSpace(id, context.space.id);

  if (!asset) {
    return Response.json({ message: "Không tìm thấy tài sản." }, { status: 404 });
  }

  const [documents, events, purchaseSource] = await Promise.all([
    listAssetDocuments(id),
    listAssetEvents(id),
    getAssetPurchaseSource(id, context.space.id),
  ]);

  return Response.json({
    data: {
      ...asset,
      status: statusLabelByDatabase[asset.status],
      documents: documents.map((document) => ({
        id: document.id,
        documentType: document.documentType,
        fileName: document.fileName,
        mimeType: document.mimeType,
        bytes: Number(document.bytes),
        createdAt: document.createdAt.toISOString(),
      })),
      events,
      purchaseSource: purchaseSource ? {
        expenseId: purchaseSource.transaction.id,
        expenseItemId: purchaseSource.item.id,
        allocatedAmount: Number(purchaseSource.item.allocatedAmount),
        deletedAt: purchaseSource.transaction.deletedAt?.toISOString(),
      } : null,
    },
  });
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const context = await getCurrentContext();

  if (!context) {
    return Response.json({ message: "Bạn cần đăng nhập." }, { status: 401 });
  }

  const { id } = await params;

  if (!uuidPattern.test(id)) {
    return Response.json({ message: "Không tìm thấy tài sản." }, { status: 404 });
  }

  const existingAsset = await getAssetForSpace(id, context.space.id);

  if (!existingAsset) {
    return Response.json({ message: "Không tìm thấy tài sản." }, { status: 404 });
  }

  let body: unknown;

  try {
    body = await request.json();
  } catch {
    return Response.json({ message: "Dữ liệu gửi lên không hợp lệ." }, { status: 400 });
  }

  const parsedInput = updateAssetSchema.safeParse(body);

  if (!parsedInput.success) {
    return Response.json(
      {
        message: "Thông tin tài sản chưa hợp lệ.",
        issues: parsedInput.error.flatten().fieldErrors,
      },
      { status: 400 },
    );
  }

  const input = parsedInput.data;
  const purchaseSource = await getAssetPurchaseSource(id, context.space.id);
  await getDatabase()
    .update(assets)
    .set({
      name: input.name,
      type: input.type,
      status: databaseStatusByLabel[input.status],
      brand: input.brand ?? null,
      model: input.model ?? null,
      serialNumber: input.serialNumber ?? null,
      purchaseDate: purchaseSource ? existingAsset.purchaseDate : input.purchaseDate || null,
      purchasePrice: purchaseSource ? existingAsset.purchasePrice : input.purchasePrice?.toString() ?? null,
      currency: purchaseSource ? existingAsset.currency : input.currency,
      purchasePlace: purchaseSource ? existingAsset.purchasePlace : input.purchasePlace ?? null,
      purchaseAddress: purchaseSource ? existingAsset.purchaseAddress : input.purchaseAddress ?? null,
      sellerPhone: purchaseSource ? existingAsset.sellerPhone : input.sellerPhone ?? null,
      paymentMethod: purchaseSource ? existingAsset.paymentMethod : input.paymentMethod ?? null,
      orderNumber: purchaseSource ? existingAsset.orderNumber : input.orderNumber ?? null,
      location: input.location ?? null,
      description: input.description ?? null,
      updatedAt: new Date(),
    })
    .where(eq(assets.id, id));

  return Response.json({ data: { id } });
}
