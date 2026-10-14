"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export function ExpenseActions({ id, deleted, canRestore, canDelete }: { id: string; deleted: boolean; canRestore: boolean; canDelete: boolean }) {
  const router = useRouter();
  const [error, setError] = useState("");

  async function run(url: string, method: "POST" | "DELETE", confirmation?: string) {
    if (confirmation && !window.confirm(confirmation)) return;
    setError("");
    const response = await fetch(url, { method });
    const result = await response.json();
    if (!response.ok) {
      setError(result.message ?? "Không thể thực hiện thao tác.");
      return;
    }
    router.refresh();
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      {!deleted && canDelete ? (
        <button className="secondary-button" onClick={() => run(`/api/v1/expenses/${id}`, "DELETE", "Chuyển khoản chi này vào thùng rác trong 7 ngày?")} type="button">Đưa vào thùng rác</button>
      ) : null}
      {deleted && canRestore ? (
        <button className="secondary-button" onClick={() => run(`/api/v1/expenses/${id}/restore`, "POST")} type="button">Khôi phục</button>
      ) : null}
      {deleted && canRestore ? (
        <button className="secondary-button" onClick={() => run(`/api/v1/expenses/${id}/permanent`, "DELETE", "Xóa vĩnh viễn khoản chi này? Thao tác không thể hoàn tác.")} type="button">Xóa vĩnh viễn</button>
      ) : null}
      {error ? <small className="form-error" role="alert">{error}</small> : null}
    </div>
  );
}
