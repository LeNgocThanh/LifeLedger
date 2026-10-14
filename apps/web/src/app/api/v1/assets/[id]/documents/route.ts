import { uploadAssetDocumentSchema } from "@qlts/validation";
import type { UploadApiResponse } from "cloudinary";

import { getDatabase } from "@/db/client";
import { assetDocuments } from "@/db/schema";
import { getAssetForSpace } from "@/lib/assets";
import { getCloudinary } from "@/lib/cloudinary";
import { getCurrentContext } from "@/lib/current-context";

const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const maximumFileSize = 10 * 1024 * 1024;
const allowedMimeTypes = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "application/pdf",
]);

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

  let formData: FormData;

  try {
    formData = await request.formData();
  } catch {
    return Response.json({ message: "Dữ liệu tải lên không hợp lệ." }, { status: 400 });
  }

  const file = formData.get("file");
  const parsedInput = uploadAssetDocumentSchema.safeParse({
    documentType: formData.get("documentType"),
  });

  if (!(file instanceof File) || file.size === 0) {
    return Response.json({ message: "Bạn chưa chọn tệp." }, { status: 400 });
  }

  if (!allowedMimeTypes.has(file.type)) {
    return Response.json(
      { message: "Chỉ hỗ trợ ảnh JPEG, PNG, WebP hoặc tệp PDF." },
      { status: 400 },
    );
  }

  if (file.size > maximumFileSize) {
    return Response.json({ message: "Tệp không được lớn hơn 10 MB." }, { status: 400 });
  }

  if (!parsedInput.success) {
    return Response.json({ message: "Loại giấy tờ chưa hợp lệ." }, { status: 400 });
  }

  let cloudinary;

  try {
    cloudinary = getCloudinary();
  } catch {
    return Response.json(
      { message: "Máy chủ chưa được cấu hình Cloudinary." },
      { status: 503 },
    );
  }

  let uploaded: UploadApiResponse;

  try {
    const buffer = Buffer.from(await file.arrayBuffer());
    uploaded = await new Promise<UploadApiResponse>((resolve, reject) => {
      cloudinary.uploader.upload_stream(
        {
          folder: `qlts/${context.space.id}/${id}`,
          resource_type: "auto",
          type: "authenticated",
          unique_filename: true,
          use_filename: false,
        },
        (error, result) => {
          if (error || !result) {
            reject(error ?? new Error("Cloudinary không trả về kết quả."));
            return;
          }
          resolve(result);
        },
      ).end(buffer);
    });
  } catch {
    return Response.json(
      { message: "Không thể tải tệp lên Cloudinary." },
      { status: 502 },
    );
  }

  const fallbackFormat = file.name.includes(".")
    ? file.name.split(".").pop()?.toLowerCase()
    : undefined;

  try {
    const [document] = await getDatabase()
      .insert(assetDocuments)
      .values({
        assetId: id,
        uploadedByUserId: context.session.user.id,
        documentType: parsedInput.data.documentType,
        fileName: file.name.slice(0, 255),
        mimeType: file.type,
        bytes: file.size.toString(),
        cloudinaryPublicId: uploaded.public_id,
        cloudinaryResourceType: uploaded.resource_type,
        cloudinaryFormat: uploaded.format || fallbackFormat || "bin",
        cloudinaryVersion: uploaded.version.toString(),
      })
      .returning({ id: assetDocuments.id });

    return Response.json({ data: document }, { status: 201 });
  } catch {
    await cloudinary.uploader.destroy(uploaded.public_id, {
      resource_type: uploaded.resource_type,
      type: "authenticated",
    });
    return Response.json(
      { message: "Không thể lưu thông tin tệp." },
      { status: 500 },
    );
  }
}
