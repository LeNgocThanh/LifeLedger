"use client";

import { ASSET_STATUSES, ASSET_TYPES } from "@qlts/domain";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";

type AssetFormValues = {
  name: string;
  type: string;
  status: string;
  brand: string;
  model: string;
  serialNumber: string;
  purchaseDate: string;
  purchasePrice?: number;
  purchasePlace: string;
  purchaseAddress: string;
  sellerPhone: string;
  paymentMethod: string;
  orderNumber: string;
  location: string;
  description: string;
};

type AssetFormProps = {
  assetId?: string;
  expenseItemId?: string;
  sourceExpenseHref?: string;
  initialValues?: AssetFormValues;
};

const emptyValues: AssetFormValues = {
  name: "",
  type: "Khác",
  status: "Đang sử dụng",
  brand: "",
  model: "",
  serialNumber: "",
  purchaseDate: "",
  purchasePlace: "",
  purchaseAddress: "",
  sellerPhone: "",
  paymentMethod: "",
  orderNumber: "",
  location: "",
  description: "",
};

export function AssetForm({ assetId, expenseItemId, sourceExpenseHref, initialValues = emptyValues }: AssetFormProps) {
  const router = useRouter();
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [purchaseDate, setPurchaseDate] = useState(initialValues.purchaseDate);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setIsSubmitting(true);

    const form = new FormData(event.currentTarget);
    const price = String(form.get("purchasePrice") ?? "").trim();
    const payload = {
      expenseItemId,
      name: String(form.get("name") ?? ""),
      type: String(form.get("type") ?? "Khác"),
      status: String(form.get("status") ?? "Đang sử dụng"),
      brand: String(form.get("brand") ?? ""),
      model: String(form.get("model") ?? ""),
      serialNumber: String(form.get("serialNumber") ?? ""),
      purchaseDate: String(form.get("purchaseDate") ?? ""),
      purchasePrice: price ? Number(price) : undefined,
      currency: "VND",
      purchasePlace: String(form.get("purchasePlace") ?? ""),
      purchaseAddress: String(form.get("purchaseAddress") ?? ""),
      sellerPhone: String(form.get("sellerPhone") ?? ""),
      paymentMethod: String(form.get("paymentMethod") ?? ""),
      orderNumber: String(form.get("orderNumber") ?? ""),
      location: String(form.get("location") ?? ""),
      description: String(form.get("description") ?? ""),
    };

    try {
      const response = await fetch(assetId ? `/api/v1/assets/${assetId}` : "/api/v1/assets", {
        method: assetId ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const result = await response.json();

      if (!response.ok) {
        setError(result.message ?? "Không thể lưu tài sản.");
        return;
      }

      router.push(`/assets/${result.data.id}`);
      router.refresh();
    } catch {
      setError("Không thể kết nối tới hệ thống. Nội dung đã nhập vẫn được giữ lại.");
    } finally {
      setIsSubmitting(false);
    }
  }

  const today = new Date().toISOString().slice(0, 10);

  return (
    <form className="asset-form" onSubmit={handleSubmit}>
      <section className="form-section open-section">
        <div className="form-section-heading">
          <span>01</span>
          <div>
            <h2>Thông tin cơ bản</h2>
            <p>Chỉ tên tài sản là bắt buộc.</p>
          </div>
        </div>

        <div className="form-grid">
          <label className="full-field">
            Tên tài sản <strong>*</strong>
            <input autoFocus defaultValue={initialValues.name} maxLength={200} name="name" placeholder="Ví dụ: Honda City" required />
          </label>
          <label>
            Loại tài sản
            <select defaultValue={initialValues.type} name="type">
              {ASSET_TYPES.map((type) => <option key={type}>{type}</option>)}
            </select>
          </label>
          <label>
            Trạng thái
            <select defaultValue={initialValues.status} name="status">
              {ASSET_STATUSES.map((status) => <option key={status}>{status}</option>)}
            </select>
          </label>
          <label>
            Vị trí
            <input defaultValue={initialValues.location} maxLength={200} name="location" placeholder="Ví dụ: Nhà, phòng làm việc" />
          </label>
        </div>
      </section>

      <details className="form-section">
        <summary>Nhận dạng</summary>
        <div className="form-grid details-grid">
          <label>Hãng<input defaultValue={initialValues.brand} maxLength={160} name="brand" /></label>
          <label>Model<input defaultValue={initialValues.model} maxLength={160} name="model" /></label>
          <label className="full-field">Số sê-ri<input defaultValue={initialValues.serialNumber} maxLength={200} name="serialNumber" /></label>
        </div>
      </details>

      <details className="form-section">
        <summary>Mua và sở hữu</summary>
        <div className="form-grid details-grid">
          {sourceExpenseHref ? <p className="field-warning full-field">Thông tin mua được đồng bộ từ khoản chi và chỉ có thể sửa tại <a className="text-button" href={sourceExpenseHref}>khoản chi nguồn</a>.</p> : null}
          <label>
            Ngày mua
            <input defaultValue={initialValues.purchaseDate} name="purchaseDate" onChange={(event) => setPurchaseDate(event.target.value)} readOnly={Boolean(sourceExpenseHref)} type="date" />
            {purchaseDate > today ? <small className="field-warning">Ngày mua đang ở tương lai.</small> : null}
          </label>
          <label>
            Giá mua (VND)
            <input defaultValue={initialValues.purchasePrice} min="0" name="purchasePrice" placeholder="0" readOnly={Boolean(sourceExpenseHref)} step="1000" type="number" />
          </label>
          <label>
            Nơi mua
            <input defaultValue={initialValues.purchasePlace} maxLength={200} name="purchasePlace" placeholder="Tên cửa hàng hoặc người bán" readOnly={Boolean(sourceExpenseHref)} />
          </label>
          <label>
            Số điện thoại cửa hàng
            <input defaultValue={initialValues.sellerPhone} maxLength={30} name="sellerPhone" readOnly={Boolean(sourceExpenseHref)} type="tel" />
          </label>
          <label>
            Hình thức thanh toán
            <input defaultValue={initialValues.paymentMethod} maxLength={100} name="paymentMethod" placeholder="Tiền mặt, chuyển khoản, thẻ..." readOnly={Boolean(sourceExpenseHref)} />
          </label>
          <label>
            Mã đơn hàng
            <input defaultValue={initialValues.orderNumber} maxLength={120} name="orderNumber" readOnly={Boolean(sourceExpenseHref)} />
          </label>
          <label className="full-field">
            Địa chỉ mua
            <textarea defaultValue={initialValues.purchaseAddress} maxLength={500} name="purchaseAddress" readOnly={Boolean(sourceExpenseHref)} rows={3} />
          </label>
        </div>
      </details>

      <details className="form-section">
        <summary>Ghi chú</summary>
        <label className="details-grid">
          Mô tả
          <textarea defaultValue={initialValues.description} maxLength={2000} name="description" rows={5} />
        </label>
      </details>

      {error ? <p className="form-error" role="alert">{error}</p> : null}

      <div className="form-actions">
        <button className="secondary-button" onClick={() => router.back()} type="button">Hủy</button>
        <button className="primary-button" disabled={isSubmitting} type="submit">
          {isSubmitting ? "Đang lưu..." : assetId ? "Lưu thay đổi" : "Lưu tài sản"}
        </button>
      </div>
    </form>
  );
}
