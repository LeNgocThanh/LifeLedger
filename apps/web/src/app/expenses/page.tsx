import Link from "next/link";
import { redirect } from "next/navigation";

import { ExpenseActions } from "@/components/expense-actions";
import { getCurrentContext } from "@/lib/current-context";
import { listExpensesForSpace } from "@/lib/expenses";

function firstValue(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

function formatCurrency(value: string, currency: string) {
  return new Intl.NumberFormat("vi-VN", { style: "currency", currency, maximumFractionDigits: 0 }).format(Number(value));
}

export default async function ExpensesPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const context = await getCurrentContext();
  if (!context) redirect("/login");
  const params = await searchParams;
  const query = firstValue(params.q)?.trim() ?? "";
  const trash = firstValue(params.trash) === "true";
  const transactions = await listExpensesForSpace(context.space.id, { query: query || undefined, trash });
  const total = transactions.filter((transaction) => !["refunded", "canceled"].includes(transaction.status)).reduce((sum, transaction) => sum + Number(transaction.actualPaidAmount), 0);

  return (
    <main className="mx-auto w-full max-w-5xl space-y-6 px-4 py-6 sm:px-6 sm:py-10">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="space-y-1"><Link className="back-link" href="/">← Tổng quan</Link><p className="eyebrow">{context.space.name}</p><h1 className="text-3xl font-semibold">{trash ? "Thùng rác khoản chi" : "Lịch sử Thu chi"}</h1><p className="text-muted-foreground text-sm">Theo dõi mình đã chi gì, khi nào và ở đâu theo dòng thời gian.</p></div>
        {!trash && context.role !== "viewer" ? <Link className="primary-button button-link" href="/expenses/new">＋ Ghi khoản chi</Link> : null}
      </header>

      <section className="summary-card dark-card"><p>Tổng thực trả trong kết quả</p><strong>{formatCurrency(String(total), context.space.defaultCurrency)}</strong><span>Không tính giao dịch đã hoàn tiền hoặc đã hủy</span></section>

      <form className="flex flex-col gap-3 rounded-xl border p-4 sm:flex-row" method="get">
        {trash ? <input name="trash" type="hidden" value="true" /> : null}
        <input className="min-w-0 flex-1 rounded-md border px-3 py-2" defaultValue={query} name="q" placeholder="Tìm nội dung, nơi mua, mặt hàng hoặc ghi chú" />
        <button className="secondary-button" type="submit">Tìm kiếm</button>
        <Link className="text-button self-center" href={trash ? "/expenses?trash=true" : "/expenses"}>Xóa lọc</Link>
      </form>

      <div className="flex items-center justify-between text-sm"><strong>{transactions.length} khoản chi</strong><Link className="text-button" href={trash ? "/expenses" : "/expenses?trash=true"}>{trash ? "Quay lại lịch sử" : "Mở thùng rác"}</Link></div>

      <section className="space-y-3">
        {transactions.map((transaction) => (
          <article className="rounded-xl border bg-card p-4 shadow-sm" key={transaction.id}>
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div><time className="text-muted-foreground text-xs">{transaction.occurredAt.toLocaleString("vi-VN")}</time><h2 className="text-lg font-semibold">{transaction.title}</h2><p className="text-muted-foreground text-sm">{transaction.merchantName || "Không ghi nơi mua"} · {transaction.statusLabel}</p></div>
              <div className="sm:text-right"><strong className="block text-lg tabular-nums">{formatCurrency(transaction.actualPaidAmount, transaction.currency)}</strong>{Number(transaction.expectedTotal) !== Number(transaction.actualPaidAmount) ? <small className="field-warning">Dự kiến {formatCurrency(transaction.expectedTotal, transaction.currency)}</small> : null}</div>
            </div>
            <details className="mt-3 border-t pt-3"><summary className="cursor-pointer text-sm font-medium">{transaction.items.length} mặt hàng hoặc dịch vụ</summary><ul className="mt-2 space-y-2">{transaction.items.map((item) => <li className="flex flex-wrap items-center justify-between gap-3 text-sm" key={item.id}><span>{item.name} · {Number(item.quantity)} {item.unit}</span><span className="flex items-center gap-3"><span className="text-right"><strong className="block">{formatCurrency(item.lineTotal, transaction.currency)}</strong>{Number(item.allocatedAmount) !== Number(item.lineTotal) ? <small className="text-muted-foreground">Phân bổ thực trả: {formatCurrency(item.allocatedAmount, transaction.currency)}</small> : null}</span>{item.linkedAssetId ? <Link className="text-button" href={`/assets/${item.linkedAssetId}`}>Xem tài sản</Link> : !trash && context.role !== "viewer" ? <Link className="text-button" href={`/assets/new?expenseItemId=${item.id}`}>Tạo tài sản</Link> : null}</span></li>)}</ul>{transaction.notes ? <p className="text-muted-foreground mt-3 text-sm">{transaction.notes}</p> : null}</details>
            <div className="mt-4 flex flex-wrap items-center gap-3">
              {!trash && context.role !== "viewer" ? <Link className="text-button" href={`/expenses/${transaction.id}/edit`}>Sửa</Link> : null}
              <ExpenseActions id={transaction.id} deleted={trash} canDelete={context.role !== "viewer"} canRestore={context.role === "owner"} />
              {trash && transaction.purgeAfter ? <small className="text-muted-foreground">Tự động xóa sau {transaction.purgeAfter.toLocaleString("vi-VN")}</small> : null}
            </div>
          </article>
        ))}
        {transactions.length === 0 ? <div className="dashboard-empty rounded-xl border border-dashed p-10 text-center"><p>{trash ? "Thùng rác đang trống." : query ? "Không tìm thấy khoản chi phù hợp." : "Chưa có khoản chi nào."}</p>{!trash && context.role !== "viewer" ? <Link href="/expenses/new">Ghi khoản chi đầu tiên</Link> : null}</div> : null}
      </section>
    </main>
  );
}
