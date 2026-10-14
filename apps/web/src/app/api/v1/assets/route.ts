import { ASSET_STATUSES } from "@qlts/domain";
import { createAssetSchema } from "@qlts/validation";
import { and, eq, isNull } from "drizzle-orm";

import { getDatabase } from "@/db/client";
import { assetOwners, assets, assetSpaces, expenseItems } from "@/db/schema";
import { databaseStatusByLabel, listAssetsForSpace } from "@/lib/assets";
import { getCurrentContext } from "@/lib/current-context";
import { getExpenseItemForSpace } from "@/lib/expenses";

export async function GET(request: Request) {
  const context = await getCurrentContext();

  if (!context) {
    return Response.json({ message: "Bạn cần đăng nhập." }, { status: 401 });
  }

  const searchParams = new URL(request.url).searchParams;
  const requestedStatus = searchParams.get("status");
  const status = ASSET_STATUSES.find((item) => item === requestedStatus);

  return Response.json({
    data: await listAssetsForSpace(context.space.id, {
      query: searchParams.get("q") ?? undefined,
      type: searchParams.get("type") ?? undefined,
      status,
    }),
  });
}

export async function POST(request: Request) {
  const context = await getCurrentContext();

  if (!context) {
    return Response.json({ message: "Bạn cần đăng nhập." }, { status: 401 });
  }

  if (context.role === "viewer") {
    return Response.json({ message: "Bạn không có quyền thêm tài sản." }, { status: 403 });
  }

  let body: unknown;

  try {
    body = await request.json();
  } catch {
    return Response.json({ message: "Dữ liệu gửi lên không hợp lệ." }, { status: 400 });
  }

  const parsedInput = createAssetSchema.safeParse(body);

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
  const sourceExpenseItem = input.expenseItemId
    ? await getExpenseItemForSpace(input.expenseItemId, context.space.id)
    : null;

  if (input.expenseItemId && (!sourceExpenseItem || sourceExpenseItem.item.linkedAssetId)) {
    return Response.json(
      { message: sourceExpenseItem?.item.linkedAssetId ? "Mặt hàng này đã được liên kết với một tài sản." : "Không tìm thấy mặt hàng trong không gian hiện hành." },
      { status: sourceExpenseItem?.item.linkedAssetId ? 409 : 404 },
    );
  }

  const database = getDatabase();
  const asset = await database.transaction(async (transaction) => {
    const [createdAsset] = await transaction
      .insert(assets)
      .values({
        managingSpaceId: context.space.id,
        createdByUserId: context.session.user.id,
        name: input.name,
        type: input.type,
        status: databaseStatusByLabel[input.status],
        brand: input.brand,
        model: input.model,
        serialNumber: input.serialNumber,
        purchaseDate: sourceExpenseItem ? sourceExpenseItem.transaction.occurredAt.toISOString().slice(0, 10) : input.purchaseDate || undefined,
        purchasePrice: sourceExpenseItem ? sourceExpenseItem.item.allocatedAmount : input.purchasePrice?.toString(),
        currency: sourceExpenseItem ? sourceExpenseItem.transaction.currency : input.currency,
        purchasePlace: sourceExpenseItem ? sourceExpenseItem.transaction.merchantName : input.purchasePlace,
        purchaseAddress: sourceExpenseItem ? sourceExpenseItem.transaction.merchantAddress : input.purchaseAddress,
        sellerPhone: sourceExpenseItem ? sourceExpenseItem.transaction.merchantPhone : input.sellerPhone,
        paymentMethod: sourceExpenseItem ? sourceExpenseItem.transaction.paymentMethod : input.paymentMethod,
        orderNumber: sourceExpenseItem ? sourceExpenseItem.transaction.orderNumber : input.orderNumber,
        location: input.location,
        description: input.description,
      })
      .returning();

    await transaction.insert(assetSpaces).values({
      assetId: createdAsset.id,
      spaceId: context.space.id,
      addedByUserId: context.session.user.id,
    });

    await transaction.insert(assetOwners).values({
      assetId: createdAsset.id,
      userId: context.session.user.id,
    });

    if (input.expenseItemId) {
      const linkedItems = await transaction
        .update(expenseItems)
        .set({ linkedAssetId: createdAsset.id })
        .where(and(
          eq(expenseItems.id, input.expenseItemId),
          isNull(expenseItems.linkedAssetId),
        ))
        .returning({ id: expenseItems.id });

      if (linkedItems.length === 0) {
        throw new Error("EXPENSE_ITEM_ALREADY_LINKED");
      }
    }

    return createdAsset;
  }).catch((error: unknown) => {
    if (error instanceof Error && error.message === "EXPENSE_ITEM_ALREADY_LINKED") return null;
    throw error;
  });

  if (!asset) {
    return Response.json({ message: "Mặt hàng này vừa được liên kết với một tài sản khác." }, { status: 409 });
  }

  return Response.json({ data: { id: asset.id } }, { status: 201 });
}
