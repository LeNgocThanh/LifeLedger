import { and, eq } from "drizzle-orm";

import { getDatabase } from "@/db/client";
import { assetDocuments } from "@/db/schema";
import { getAssetForSpace } from "@/lib/assets";
import { getCloudinary } from "@/lib/cloudinary";
import { getCurrentContext } from "@/lib/current-context";

const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string; documentId: string }> },
) {
  const context = await getCurrentContext();

  if (!context) {
    return Response.json({ message: "Bạn cần đăng nhập." }, { status: 401 });
  }

  const { id, documentId } = await params;

  if (
    !uuidPattern.test(id)
    || !uuidPattern.test(documentId)
    || !await getAssetForSpace(id, context.space.id)
  ) {
    return Response.json({ message: "Không tìm thấy giấy tờ." }, { status: 404 });
  }

  const [document] = await getDatabase()
    .select()
    .from(assetDocuments)
    .where(
      and(
        eq(assetDocuments.id, documentId),
        eq(assetDocuments.assetId, id),
      ),
    )
    .limit(1);

  if (!document) {
    return Response.json({ message: "Không tìm thấy giấy tờ." }, { status: 404 });
  }

  try {
    const url = getCloudinary().utils.private_download_url(
      document.cloudinaryPublicId,
      document.cloudinaryFormat,
      {
        resource_type: document.cloudinaryResourceType as "image" | "video" | "raw",
        type: "authenticated",
        expires_at: Math.floor(Date.now() / 1000) + 300,
        attachment: true,
      },
    );

    return Response.redirect(url, 302);
  } catch {
    return Response.json(
      { message: "Máy chủ chưa được cấu hình Cloudinary." },
      { status: 503 },
    );
  }
}
