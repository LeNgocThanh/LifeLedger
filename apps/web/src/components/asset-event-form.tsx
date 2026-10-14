"use client";

import { ASSET_EVENT_TYPES } from "@qlts/domain";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";

function optionalNumber(value: FormDataEntryValue | null) {
  const text = String(value ?? "").trim();
  return text ? Number(text) : undefined;
}

function localDate() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

type CatalogOption = {
  id: string;
  name: string;
  brand: string | null;
  partNumber: string | null;
  unit: string | null;
};

type EventFormValues = {
  type: string;
  occurredAt: string;
  title: string;
  description: string;
  serviceProvider: string;
  serviceLocation: string;
  usageValue?: number;
  usageUnit: string;
  laborCost?: number;
  otherCost?: number;
  nextMaintenanceDate: string;
  items: Array<{
    catalogItemId: string;
    name: string;
    partNumber: string;
    quantity: number;
    unit: string;
    unitPrice?: number;
    warrantyUntil: string;
    notes: string;
  }>;
};

type AssetEventFormProps = {
  assetId: string;
  eventId?: string;
  catalogItems: CatalogOption[];
  initialValues?: EventFormValues;
};

export function AssetEventForm({ assetId, eventId, catalogItems, initialValues }: AssetEventFormProps) {
  const router = useRouter();
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [itemIds, setItemIds] = useState<number[]>(
    initialValues?.items.map((_, index) => index + 1) ?? [],
  );
  const [nextItemId, setNextItemId] = useState((initialValues?.items.length ?? 0) + 1);

  function addItem() {
    setItemIds((current) => [...current, nextItemId]);
    setNextItemId((current) => current + 1);
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setIsSubmitting(true);

    const formData = new FormData(event.currentTarget);
    const payload = {
      type: String(formData.get("type") ?? "Ghi chú khác"),
      occurredAt: String(formData.get("occurredAt") ?? ""),
      title: String(formData.get("title") ?? ""),
      description: String(formData.get("description") ?? ""),
      serviceProvider: String(formData.get("serviceProvider") ?? ""),
      serviceLocation: String(formData.get("serviceLocation") ?? ""),
      usageValue: optionalNumber(formData.get("usageValue")),
      usageUnit: String(formData.get("usageUnit") ?? ""),
      laborCost: optionalNumber(formData.get("laborCost")),
      otherCost: optionalNumber(formData.get("otherCost")),
      currency: "VND",
      nextMaintenanceDate: String(formData.get("nextMaintenanceDate") ?? ""),
      items: itemIds.map((itemId) => ({
        catalogItemId: String(formData.get(`catalogItemId-${itemId}`) ?? ""),
        name: String(formData.get(`itemName-${itemId}`) ?? ""),
        partNumber: String(formData.get(`partNumber-${itemId}`) ?? ""),
        quantity: optionalNumber(formData.get(`quantity-${itemId}`)) ?? 1,
        unit: String(formData.get(`unit-${itemId}`) ?? ""),
        unitPrice: optionalNumber(formData.get(`unitPrice-${itemId}`)),
        warrantyUntil: String(formData.get(`warrantyUntil-${itemId}`) ?? ""),
        notes: String(formData.get(`itemNotes-${itemId}`) ?? ""),
      })),
    };

    try {
      const response = await fetch(
        eventId
          ? `/api/v1/assets/${assetId}/events/${eventId}`
          : `/api/v1/assets/${assetId}/events`,
        {
        method: eventId ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
        },
      );
      const result = await response.json();

      if (!response.ok) {
        setError(result.message ?? "Không thể lưu lịch sử.");
        return;
      }

      router.push(`/assets/${assetId}`);
      router.refresh();
    } catch {
      setError("Không thể kết nối tới hệ thống. Nội dung đã nhập vẫn được giữ lại.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form className="asset-form" onSubmit={handleSubmit}>
      <section className="form-section">
        <div className="form-section-heading">
          <span>01</span>
          <div>
            <h2>Sự kiện</h2>
            <p>Loại, ngày và nội dung là thông tin bắt buộc.</p>
          </div>
        </div>
        <div className="form-grid">
          <label>
            Loại lịch sử
            <select defaultValue={initialValues?.type ?? "Bảo trì hoặc bảo dưỡng"} name="type">
              {ASSET_EVENT_TYPES.map((type) => <option key={type}>{type}</option>)}
            </select>
          </label>
          <label>
            Ngày thực hiện
            <input defaultValue={initialValues?.occurredAt ?? localDate()} name="occurredAt" required type="date" />
          </label>
          <label className="full-field">
            Nội dung <strong>*</strong>
            <input defaultValue={initialValues?.title} maxLength={200} name="title" placeholder="Ví dụ: Bảo dưỡng định kỳ 10.000 km" required />
          </label>
          <label>
            Đơn vị thực hiện
            <input defaultValue={initialValues?.serviceProvider} maxLength={200} name="serviceProvider" placeholder="Tên gara, trung tâm hoặc người thực hiện" />
          </label>
          <label>
            Địa điểm
            <input defaultValue={initialValues?.serviceLocation} maxLength={500} name="serviceLocation" />
          </label>
          <label>
            Chỉ số sử dụng
            <input defaultValue={initialValues?.usageValue} min="0" name="usageValue" placeholder="Ví dụ: 10000" step="0.01" type="number" />
          </label>
          <label>
            Đơn vị chỉ số
            <input defaultValue={initialValues?.usageUnit} maxLength={30} name="usageUnit" placeholder="km, giờ, lần..." />
          </label>
          <label>
            Tiền công (VND)
            <input defaultValue={initialValues?.laborCost} min="0" name="laborCost" step="1000" type="number" />
          </label>
          <label>
            Chi phí khác (VND)
            <input defaultValue={initialValues?.otherCost} min="0" name="otherCost" step="1000" type="number" />
          </label>
          <label>
            Lịch bảo trì tiếp theo
            <input defaultValue={initialValues?.nextMaintenanceDate} name="nextMaintenanceDate" type="date" />
          </label>
          <label className="full-field">
            Ghi chú
            <textarea defaultValue={initialValues?.description} maxLength={2000} name="description" rows={4} />
          </label>
        </div>
      </section>

      <section className="form-section">
        <div className="event-items-heading">
          <div>
            <h2>Linh kiện và vật tư</h2>
            <p>Thêm nhiều hạng mục; chi phí được tính theo số lượng và đơn giá.</p>
          </div>
          <button className="secondary-button" onClick={addItem} type="button">＋ Thêm hạng mục</button>
        </div>
        {itemIds.length === 0 ? <p className="document-empty">Chưa có linh kiện hoặc vật tư.</p> : null}
        <div className="event-item-list">
          {itemIds.map((itemId, index) => (
            <fieldset className="event-item" key={itemId}>
              <legend>Hạng mục {index + 1}</legend>
              <button
                className="remove-item-button"
                onClick={() => setItemIds((current) => current.filter((id) => id !== itemId))}
                type="button"
              >
                Xóa
              </button>
              <div className="form-grid">
                <label className="full-field">
                  Chọn từ danh mục chuẩn
                  <select
                    defaultValue={initialValues?.items[index]?.catalogItemId ?? ""}
                    name={`catalogItemId-${itemId}`}
                    onChange={(event) => {
                      const selected = catalogItems.find((item) => item.id === event.currentTarget.value);
                      const fieldset = event.currentTarget.closest("fieldset");
                      if (!selected || !fieldset) return;
                      const setValue = (name: string, value: string) => {
                        const input = fieldset.querySelector<HTMLInputElement>(`[name="${name}-${itemId}"]`);
                        if (input) input.value = value;
                      };
                      setValue("itemName", selected.name);
                      setValue("partNumber", selected.partNumber ?? "");
                      setValue("unit", selected.unit ?? "");
                    }}
                  >
                    <option value="">Tự nhập</option>
                    {catalogItems.map((item) => (
                      <option key={item.id} value={item.id}>
                        {item.name}{item.partNumber ? ` · ${item.partNumber}` : ""}{item.brand ? ` · ${item.brand}` : ""}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="full-field">
                  Tên linh kiện hoặc vật tư <strong>*</strong>
                  <input defaultValue={initialValues?.items[index]?.name} maxLength={200} name={`itemName-${itemId}`} required />
                </label>
                <label>Mã linh kiện<input defaultValue={initialValues?.items[index]?.partNumber} maxLength={120} name={`partNumber-${itemId}`} /></label>
                <label>Số lượng<input defaultValue={initialValues?.items[index]?.quantity ?? 1} min="0.001" name={`quantity-${itemId}`} required step="0.001" type="number" /></label>
                <label>Đơn vị<input defaultValue={initialValues?.items[index]?.unit} maxLength={30} name={`unit-${itemId}`} placeholder="cái, bộ, lít..." /></label>
                <label>Đơn giá (VND)<input defaultValue={initialValues?.items[index]?.unitPrice} min="0" name={`unitPrice-${itemId}`} step="1000" type="number" /></label>
                <label>Bảo hành đến ngày<input defaultValue={initialValues?.items[index]?.warrantyUntil} name={`warrantyUntil-${itemId}`} type="date" /></label>
                <label className="full-field">Ghi chú<input defaultValue={initialValues?.items[index]?.notes} maxLength={500} name={`itemNotes-${itemId}`} /></label>
              </div>
            </fieldset>
          ))}
        </div>
      </section>

      {error ? <p className="form-error" role="alert">{error}</p> : null}
      <div className="form-actions">
        <button className="secondary-button" onClick={() => router.back()} type="button">Hủy</button>
        <button className="primary-button" disabled={isSubmitting} type="submit">
          {isSubmitting ? "Đang lưu..." : eventId ? "Lưu thay đổi" : "Lưu lịch sử"}
        </button>
      </div>
    </form>
  );
}
