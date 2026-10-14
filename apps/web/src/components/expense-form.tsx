"use client";

import { EXPENSE_CATEGORIES, EXPENSE_STATUSES } from "@qlts/domain";
import { useRouter } from "next/navigation";
import { type FormEvent, useMemo, useState } from "react";

type Item = { id?: string; catalogItemId: string; name: string; category: string; quantity: number; unit: string; unitPrice: number; discountAmount: number; linkedAssetId: string; notes: string };
type CatalogItem = { id: string; name: string; category: string | null; brand: string | null; partNumber: string | null; unit: string | null };
type Values = {
  title: string; occurredAt: string; merchantName: string; merchantAddress: string; merchantPhone: string;
  paymentMethod: string; orderNumber: string; status: string; discountAmount: number; feeAmount: number;
  actualPaidAmount: number; notes: string; items: Item[];
};

const emptyItem: Item = { catalogItemId: "", name: "", category: "Khác", quantity: 1, unit: "", unitPrice: 0, discountAmount: 0, linkedAssetId: "", notes: "" };

export function ExpenseForm({ expenseId, assets, catalogItems, initialValues }: { expenseId?: string; assets: Array<{ id: string; name: string }>; catalogItems: CatalogItem[]; initialValues?: Values }) {
  const router = useRouter();
  const [items, setItems] = useState<Item[]>(initialValues?.items ?? [{ ...emptyItem }]);
  const [discountAmount, setDiscountAmount] = useState(initialValues?.discountAmount ?? 0);
  const [feeAmount, setFeeAmount] = useState(initialValues?.feeAmount ?? 0);
  const [actualPaidAmount, setActualPaidAmount] = useState<number | "">(initialValues?.actualPaidAmount ?? "");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [localNow] = useState(() => {
    const now = new Date();
    return new Date(now.getTime() - now.getTimezoneOffset() * 60_000).toISOString().slice(0, 16);
  });
  const expectedTotal = useMemo(() => Math.max(0, items.reduce((sum, item) => sum + item.quantity * item.unitPrice - item.discountAmount, 0) - discountAmount + feeAmount), [items, discountAmount, feeAmount]);

  function updateItem(index: number, values: Partial<Item>) {
    setItems((current) => current.map((item, itemIndex) => itemIndex === index ? { ...item, ...values } : item));
  }

  function selectCatalogItem(index: number, catalogItemId: string) {
    const catalogItem = catalogItems.find((item) => item.id === catalogItemId);
    updateItem(index, catalogItem ? {
      catalogItemId,
      name: catalogItem.name,
      category: "Linh kiện và vật tư",
      unit: catalogItem.unit ?? "",
    } : { catalogItemId: "" });
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const submitter = (event.nativeEvent as SubmitEvent).submitter as HTMLButtonElement | null;
    const requestedAssetItemIndex = submitter?.name === "createAssetItemIndex"
      ? Number(submitter.value)
      : null;
    setError("");
    setIsSubmitting(true);
    const form = new FormData(event.currentTarget);
    const occurredAt = new Date(String(form.get("occurredAt"))).toISOString();
    const payload = {
      title: String(form.get("title") ?? ""), occurredAt,
      merchantName: String(form.get("merchantName") ?? ""), merchantAddress: String(form.get("merchantAddress") ?? ""),
      merchantPhone: String(form.get("merchantPhone") ?? ""), paymentMethod: String(form.get("paymentMethod") ?? ""),
      orderNumber: String(form.get("orderNumber") ?? ""), status: String(form.get("status") ?? "Hoàn tất"), currency: "VND",
      discountAmount, feeAmount, actualPaidAmount: actualPaidAmount === "" ? expectedTotal : actualPaidAmount,
      notes: String(form.get("notes") ?? ""), items,
    };
    try {
      const response = await fetch(expenseId ? `/api/v1/expenses/${expenseId}` : "/api/v1/expenses", {
        method: expenseId ? "PATCH" : "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload),
      });
      const result = await response.json();
      if (!response.ok) { setError(result.message ?? "Không thể lưu khoản chi."); return; }
      const expenseItemId = requestedAssetItemIndex === null ? undefined : result.data.itemIds?.[requestedAssetItemIndex];
      if (expenseItemId) {
        router.push(`/assets/new?expenseItemId=${expenseItemId}`);
        router.refresh();
        return;
      }
      router.push("/expenses");
      router.refresh();
    } catch { setError("Không thể kết nối tới hệ thống. Nội dung đã nhập vẫn được giữ lại."); }
    finally { setIsSubmitting(false); }
  }

  return (
    <form className="asset-form" onSubmit={handleSubmit}>
      <section className="form-section open-section">
        <div className="form-section-heading"><span>01</span><div><h2>Thông tin khoản chi</h2><p>Ghi nhận thời điểm, nơi mua và cách thanh toán.</p></div></div>
        <div className="form-grid">
          <label className="full-field">Nội dung <strong>*</strong><input defaultValue={initialValues?.title} maxLength={200} name="title" placeholder="Ví dụ: Mua máy lọc không khí" required /></label>
          <label>Thời điểm chi<input defaultValue={initialValues?.occurredAt ?? localNow} name="occurredAt" required type="datetime-local" /></label>
          <label>Trạng thái<select defaultValue={initialValues?.status ?? "Hoàn tất"} name="status">{EXPENSE_STATUSES.map((status) => <option key={status}>{status}</option>)}</select></label>
          <label>Nơi mua<input defaultValue={initialValues?.merchantName} maxLength={200} name="merchantName" /></label>
          <label>Số điện thoại<input defaultValue={initialValues?.merchantPhone} maxLength={30} name="merchantPhone" /></label>
          <label>Hình thức thanh toán<input defaultValue={initialValues?.paymentMethod} maxLength={100} name="paymentMethod" /></label>
          <label>Mã đơn hàng<input defaultValue={initialValues?.orderNumber} maxLength={120} name="orderNumber" /></label>
          <label className="full-field">Địa chỉ mua<textarea defaultValue={initialValues?.merchantAddress} maxLength={500} name="merchantAddress" rows={2} /></label>
        </div>
      </section>

      <section className="form-section open-section">
        <div className="form-section-heading"><span>02</span><div><h2>Mặt hàng và dịch vụ</h2><p>Một lần chi có thể gồm nhiều mục.</p></div></div>
        <div className="space-y-4">
          {items.map((item, index) => (
            <div className="rounded-xl border p-4" key={item.id ?? index}>
              <div className="form-grid">
                <label className="full-field">Danh mục dùng chung<select onChange={(event) => selectCatalogItem(index, event.target.value)} value={item.catalogItemId}><option value="">Nhập tự do, không chọn danh mục</option>{catalogItems.map((catalogItem) => <option key={catalogItem.id} value={catalogItem.id}>{catalogItem.name}{catalogItem.category ? ` — ${catalogItem.category}` : ""}{catalogItem.partNumber ? ` (${catalogItem.partNumber})` : ""}</option>)}</select></label>
                <label className="full-field">Tên mục <strong>*</strong><input maxLength={200} onChange={(event) => updateItem(index, { name: event.target.value })} required value={item.name} /></label>
                <label>Danh mục<select onChange={(event) => updateItem(index, { category: event.target.value })} value={item.category}>{EXPENSE_CATEGORIES.map((category) => <option key={category}>{category}</option>)}</select></label>
                <label>Liên kết tài sản<select disabled={Boolean(item.id && item.linkedAssetId)} onChange={(event) => updateItem(index, { linkedAssetId: event.target.value })} value={item.linkedAssetId}><option value="">Không liên kết</option>{assets.map((asset) => <option key={asset.id} value={asset.id}>{asset.name}</option>)}</select></label>
                <label>Số lượng<input min="0.001" onChange={(event) => updateItem(index, { quantity: Number(event.target.value) })} step="0.001" type="number" value={item.quantity} /></label>
                <label>Đơn vị<input maxLength={30} onChange={(event) => updateItem(index, { unit: event.target.value })} value={item.unit} /></label>
                <label>Đơn giá<input min="0" onChange={(event) => updateItem(index, { unitPrice: Number(event.target.value) })} step="1000" type="number" value={item.unitPrice} /></label>
                <label>Giảm giá mục<input min="0" onChange={(event) => updateItem(index, { discountAmount: Number(event.target.value) })} step="1000" type="number" value={item.discountAmount} /></label>
                <label className="full-field">Ghi chú<input maxLength={500} onChange={(event) => updateItem(index, { notes: event.target.value })} value={item.notes} /></label>
              </div>
              {items.length > 1 && !item.linkedAssetId ? <button className="text-button mt-3" onClick={() => setItems((current) => current.filter((_, itemIndex) => itemIndex !== index))} type="button">Xóa mục</button> : null}
              {item.linkedAssetId ? <button className="text-button mt-3" onClick={() => router.push(`/assets/${item.linkedAssetId}`)} type="button">Xem tài sản</button> : <button className="text-button mt-3" name="createAssetItemIndex" type="submit" value={index}>Lưu khoản chi và tạo tài sản</button>}
              {item.id && item.linkedAssetId ? <small className="text-muted-foreground mt-3 block">Mục đã liên kết với tài sản nên không thể gỡ liên kết hoặc xóa khỏi khoản chi.</small> : null}
            </div>
          ))}
          <button className="secondary-button" onClick={() => setItems((current) => [...current, { ...emptyItem }])} type="button">＋ Thêm mặt hàng hoặc dịch vụ</button>
        </div>
      </section>

      <section className="form-section open-section">
        <div className="form-section-heading"><span>03</span><div><h2>Tổng tiền</h2><p>Báo cáo sử dụng số thực trả.</p></div></div>
        <div className="form-grid">
          <label>Giảm giá chung<input min="0" onChange={(event) => setDiscountAmount(Number(event.target.value))} step="1000" type="number" value={discountAmount} /></label>
          <label>Phụ phí<input min="0" onChange={(event) => setFeeAmount(Number(event.target.value))} step="1000" type="number" value={feeAmount} /></label>
          <label>Tổng dự kiến<input readOnly value={expectedTotal} /></label>
          <label>Thực trả<input min="0" onChange={(event) => setActualPaidAmount(event.target.value === "" ? "" : Number(event.target.value))} placeholder={String(expectedTotal)} step="1000" type="number" value={actualPaidAmount} /></label>
          {actualPaidAmount !== "" && actualPaidAmount !== expectedTotal ? <p className="field-warning full-field">Số thực trả khác tổng dự kiến. Hệ thống vẫn cho lưu và dùng số thực trả trong báo cáo.</p> : null}
          <label className="full-field">Ghi chú<textarea defaultValue={initialValues?.notes} maxLength={2000} name="notes" rows={3} /></label>
        </div>
      </section>
      {error ? <p className="form-error" role="alert">{error}</p> : null}
      <div className="form-actions"><button className="secondary-button" onClick={() => router.back()} type="button">Hủy</button><button className="primary-button" disabled={isSubmitting} type="submit">{isSubmitting ? "Đang lưu..." : expenseId ? "Lưu thay đổi" : "Lưu khoản chi"}</button></div>
    </form>
  );
}
