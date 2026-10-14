import { catalogItemSchema } from "@qlts/validation";
import { eq } from "drizzle-orm";

import { getDatabase } from "@/db/client";
import { catalogItems } from "@/db/schema";
import { isAdministrator } from "@/lib/administrator";
import { getCurrentContext } from "@/lib/current-context";

const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const context = await getCurrentContext();

  if (!context) {
    return Response.json({ message: "Bạn cần đăng nhập." }, { status: 401 });
  }

  if (!isAdministrator(context.session.user.email)) {
    return Response.json({ message: "Bạn không có quyền quản trị." }, { status: 403 });
  }

  const { id } = await params;

  if (!uuidPattern.test(id)) {
    return Response.json({ message: "Không tìm thấy mục danh mục." }, { status: 404 });
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
    .update(catalogItems)
    .set({ ...parsedInput.data, updatedAt: new Date() })
    .where(eq(catalogItems.id, id))
    .returning();

  if (!item) {
    return Response.json({ message: "Không tìm thấy mục danh mục." }, { status: 404 });
  }

  return Response.json({ data: item });
}
