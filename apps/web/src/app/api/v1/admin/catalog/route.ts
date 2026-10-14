import { catalogItemSchema } from "@qlts/validation";

import { getDatabase } from "@/db/client";
import { catalogItems } from "@/db/schema";
import { isAdministrator } from "@/lib/administrator";
import { listCatalogItems } from "@/lib/catalog";
import { getCurrentContext } from "@/lib/current-context";

export async function GET() {
  const context = await getCurrentContext();

  if (!context) {
    return Response.json({ message: "Bạn cần đăng nhập." }, { status: 401 });
  }

  return Response.json({ data: await listCatalogItems() });
}

export async function POST(request: Request) {
  const context = await getCurrentContext();

  if (!context) {
    return Response.json({ message: "Bạn cần đăng nhập." }, { status: 401 });
  }

  if (!isAdministrator(context.session.user.email)) {
    return Response.json({ message: "Bạn không có quyền quản trị." }, { status: 403 });
  }

  let body: unknown;

  try {
    body = await request.json();
  } catch {
    return Response.json({ message: "Dữ liệu gửi lên không hợp lệ." }, { status: 400 });
  }

  const parsedInput = catalogItemSchema.safeParse(body);

  if (!parsedInput.success) {
    return Response.json({ message: "Thông tin danh mục chưa hợp lệ." }, { status: 400 });
  }

  const [item] = await getDatabase()
    .insert(catalogItems)
    .values({
      ...parsedInput.data,
      createdByUserId: context.session.user.id,
    })
    .returning();

  return Response.json({ data: item }, { status: 201 });
}
