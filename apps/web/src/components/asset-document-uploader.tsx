"use client";

import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";

export function AssetDocumentUploader({ assetId }: { assetId: string }) {
  const router = useRouter();
  const [error, setError] = useState("");
  const [isUploading, setIsUploading] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setIsUploading(true);

    const form = event.currentTarget;
    const formData = new FormData(form);

    try {
      const response = await fetch(`/api/v1/assets/${assetId}/documents`, {
        method: "POST",
        body: formData,
      });
      const result = await response.json();

      if (!response.ok) {
        setError(result.message ?? "Không thể tải tệp lên.");
        return;
      }

      form.reset();
      router.refresh();
    } catch {
      setError("Không thể kết nối tới hệ thống.");
    } finally {
      setIsUploading(false);
    }
  }

  return (
    <form className="document-upload-form" onSubmit={handleSubmit}>
      <label>
        Loại giấy tờ
        <select defaultValue="Hóa đơn" name="documentType">
          <option>Hóa đơn</option>
          <option>Phiếu bảo hành</option>
          <option>Đăng ký xe</option>
          <option>Hợp đồng</option>
          <option>Hướng dẫn sử dụng</option>
          <option>Ảnh tài sản</option>
          <option>Khác</option>
        </select>
      </label>
      <label>
        Chọn tệp
        <input accept="image/jpeg,image/png,image/webp,application/pdf" name="file" required type="file" />
      </label>
      <button className="secondary-button" disabled={isUploading} type="submit">
        {isUploading ? "Đang tải..." : "Tải lên"}
      </button>
      <small>JPEG, PNG, WebP hoặc PDF · tối đa 10 MB</small>
      {error ? <p className="form-error" role="alert">{error}</p> : null}
    </form>
  );
}
