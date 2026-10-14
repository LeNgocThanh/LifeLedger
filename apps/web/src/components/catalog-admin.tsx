"use client";

import { FormEvent, useState } from "react";

type CatalogItem = {
  id: string;
  name: string;
  category: string | null;
  brand: string | null;
  partNumber: string | null;
  unit: string | null;
  description: string | null;
  isActive: boolean;
};

export function CatalogAdmin({ initialItems }: { initialItems: CatalogItem[] }) {
  const [items, setItems] = useState(initialItems);
  const [editingItem, setEditingItem] = useState<CatalogItem | null>(null);
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setIsSubmitting(true);

    const form = event.currentTarget;
    const data = new FormData(form);
    const payload = {
      name: String(data.get("name") ?? ""),
      category: String(data.get("category") ?? ""),
      brand: String(data.get("brand") ?? ""),
      partNumber: String(data.get("partNumber") ?? ""),
      unit: String(data.get("unit") ?? ""),
      description: String(data.get("description") ?? ""),
      isActive: data.get("isActive") === "on",
    };

    try {
      const response = await fetch(
        editingItem ? `/api/v1/admin/catalog/${editingItem.id}` : "/api/v1/admin/catalog",
        {
          method: editingItem ? "PATCH" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        },
      );
      const result = await response.json();

      if (!response.ok) {
        setError(result.message ?? "Không thể lưu danh mục.");
        return;
      }

      setItems((current) => editingItem
        ? current.map((item) => item.id === result.data.id ? result.data : item)
        : [...current, result.data].sort((left, right) => left.name.localeCompare(right.name, "vi")));
      setEditingItem(null);
      form.reset();
    } catch {
      setError("Không thể kết nối tới hệ thống.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="catalog-layout">
      <form className="form-section asset-form" key={editingItem?.id ?? "new"} onSubmit={handleSubmit}>
        <div className="form-section-heading">
          <span>01</span>
          <div>
            <h2>{editingItem ? "Chỉnh sửa mục" : "Thêm mục chuẩn"}</h2>
            <p>Danh mục này dùng chung cho toàn bộ người dùng.</p>
          </div>
        </div>
        <div className="form-grid">
          <label className="full-field">Tên <strong>*</strong><input defaultValue={editingItem?.name} maxLength={200} name="name" required /></label>
          <label>Nhóm<input defaultValue={editingItem?.category ?? ""} maxLength={120} name="category" /></label>
          <label>Hãng<input defaultValue={editingItem?.brand ?? ""} maxLength={160} name="brand" /></label>
          <label>Mã linh kiện<input defaultValue={editingItem?.partNumber ?? ""} maxLength={120} name="partNumber" /></label>
          <label>Đơn vị<input defaultValue={editingItem?.unit ?? ""} maxLength={30} name="unit" /></label>
          <label className="full-field">Mô tả<textarea defaultValue={editingItem?.description ?? ""} maxLength={1000} name="description" rows={3} /></label>
          <label className="checkbox-field"><input defaultChecked={editingItem?.isActive ?? true} name="isActive" type="checkbox" /> Đang sử dụng</label>
        </div>
        {error ? <p className="form-error" role="alert">{error}</p> : null}
        <div className="form-actions">
          {editingItem ? <button className="secondary-button" onClick={() => setEditingItem(null)} type="button">Hủy sửa</button> : null}
          <button className="primary-button" disabled={isSubmitting} type="submit">{isSubmitting ? "Đang lưu..." : "Lưu mục"}</button>
        </div>
      </form>

      <section className="records-panel catalog-list">
        <div className="records-toolbar"><strong>{items.length} mục chuẩn</strong></div>
        {items.map((item) => (
          <div className="catalog-row" key={item.id}>
            <div><strong>{item.name}</strong><span>{[item.brand, item.partNumber, item.category].filter(Boolean).join(" · ") || "Chưa có thông tin phụ"}</span></div>
            <span className={item.isActive ? "status" : "status warning"}>{item.isActive ? "Đang dùng" : "Ngừng dùng"}</span>
            <button className="text-button" onClick={() => setEditingItem(item)} type="button">Chỉnh sửa</button>
          </div>
        ))}
      </section>
    </div>
  );
}
