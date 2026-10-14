import { headers } from "next/headers";
import Link from "next/link";
import { redirect } from "next/navigation";
import {
  ChevronsUpDown,
  LayoutDashboard,
  Package,
  Receipt,
  Layers,
  Share2,
  Trash2,
  ShieldCheck,
  Plus,
  ArrowRight,
  Wallet,
  Boxes,
  Wrench,
  MoreHorizontal,
  type LucideIcon,
} from "lucide-react";

import { SignOutButton } from "@/components/sign-out-button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { auth } from "@/lib/auth";
import { isAdministrator } from "@/lib/administrator";
import { listAssetsForSpace } from "@/lib/assets";
import { listExpensesForSpace } from "@/lib/expenses";
import { ensurePersonalSpace } from "@/lib/personal-space";
import { cn } from "@/lib/utils";

const navItems: { label: string; href: string; icon: LucideIcon }[] = [
  { label: "Tổng quan", href: "/", icon: LayoutDashboard },
  { label: "Tài sản", href: "/assets", icon: Package },
  { label: "Lịch sử dùng tiền", href: "/expenses", icon: Receipt },
  { label: "Không gian", href: "#", icon: Layers },
  { label: "Chia sẻ", href: "#", icon: Share2 },
  { label: "Thùng rác", href: "/expenses?trash=true", icon: Trash2 },
];

function formatCurrency(value: number, currency = "VND") {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(value);
}

function getDateParts(date: Date, timeZone: string) {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(date);
  const value = (type: Intl.DateTimeFormatPartTypes) => Number(parts.find((part) => part.type === type)?.value);
  return { year: value("year"), month: value("month"), day: value("day") };
}

function calendarValue(parts: { year: number; month: number; day: number }) {
  return Date.UTC(parts.year, parts.month - 1, parts.day);
}

function SectionHeading({ eyebrow, title, href, action }: { eyebrow: string; title: string; href: string; action: string }) {
  return (
    <div className="flex items-end justify-between gap-4">
      <div>
        <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">{eyebrow}</p>
        <h2 className="mt-1 text-xl font-semibold tracking-tight">{title}</h2>
      </div>
      <Link
        href={href}
        className="group inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline underline-offset-4"
      >
        {action}
        <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
      </Link>
    </div>
  );
}

function HeroCard({ label, value, note, icon: Icon }: { label: string; value: string; note: string; icon: LucideIcon }) {
  return (
    <Card className="relative overflow-hidden border-0 bg-gradient-to-br from-zinc-900 via-zinc-900 to-zinc-700 text-white shadow-lg">
      <div className="pointer-events-none absolute -right-10 -top-10 size-40 rounded-full bg-white/10 blur-2xl" />
      <CardContent className="relative flex flex-col gap-3 p-6">
        <div className="flex items-center justify-between">
          <p className="text-sm text-white/70">{label}</p>
          <span className="grid size-9 place-items-center rounded-lg bg-white/10">
            <Icon className="size-4" />
          </span>
        </div>
        <strong className="text-3xl font-semibold tracking-tight lg:text-4xl">{value}</strong>
        <span className="text-sm text-white/60">{note}</span>
      </CardContent>
    </Card>
  );
}

function StatCard({
  label,
  value,
  note,
  icon: Icon,
  tone = "default",
}: {
  label: string;
  value: string | number;
  note: string;
  icon?: LucideIcon;
  tone?: "default" | "warning";
}) {
  return (
    <Card className="transition-shadow hover:shadow-md">
      <CardContent className="flex flex-col gap-2 p-5">
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">{label}</p>
          {Icon ? (
            <span
              className={cn(
                "grid size-8 place-items-center rounded-lg",
                tone === "warning" ? "bg-amber-100 text-amber-700" : "bg-muted text-muted-foreground",
              )}
            >
              <Icon className="size-4" />
            </span>
          ) : null}
        </div>
        <strong className="text-2xl font-semibold tracking-tight">{value}</strong>
        <span className="text-xs text-muted-foreground">{note}</span>
      </CardContent>
    </Card>
  );
}

export default async function Home() {
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session) {
    redirect("/login");
  }

  const personalSpace = await ensurePersonalSpace(session.user);
  const [assets, expenses] = await Promise.all([
    listAssetsForSpace(personalSpace.id),
    listExpensesForSpace(personalSpace.id),
  ]);
  const initials = session.user.name
    .split(/\s+/)
    .filter(Boolean)
    .slice(-2)
    .map((part) => part.slice(0, 1).toLocaleUpperCase("vi-VN"))
    .join("");
  const totalValue = assets.reduce(
    (total, asset) => total + (asset.purchasePrice ?? 0),
    0,
  );
  const eligibleExpenses = expenses.filter((expense) => !["refunded", "canceled"].includes(expense.status));
  const totalSpent = eligibleExpenses.reduce((total, expense) => total + Number(expense.actualPaidAmount), 0);
  const now = new Date();
  const currentDate = getDateParts(now, personalSpace.timezone);
  const currentCalendarValue = calendarValue(currentDate);
  const currentDay = new Date(currentCalendarValue).getUTCDay();
  const currentWeekStart = currentCalendarValue - ((currentDay + 6) % 7) * 86_400_000;
  const currentWeekEnd = currentWeekStart + 7 * 86_400_000;
  const currentQuarter = Math.floor((currentDate.month - 1) / 3) + 1;

  function assetPurchaseSpending(predicate: (parts: ReturnType<typeof getDateParts>) => boolean) {
    return eligibleExpenses.reduce((total, expense) => {
      const parts = getDateParts(expense.occurredAt, personalSpace.timezone);
      if (!predicate(parts)) return total;
      return total + expense.items.reduce(
        (itemTotal, item) => itemTotal + (item.linkedAssetId ? Number(item.allocatedAmount) : 0),
        0,
      );
    }, 0);
  }

  const assetSpending = {
    all: assetPurchaseSpending(() => true),
    week: assetPurchaseSpending((parts) => {
      const value = calendarValue(parts);
      return value >= currentWeekStart && value < currentWeekEnd;
    }),
    month: assetPurchaseSpending((parts) => parts.year === currentDate.year && parts.month === currentDate.month),
    quarter: assetPurchaseSpending((parts) => parts.year === currentDate.year && Math.floor((parts.month - 1) / 3) + 1 === currentQuarter),
    year: assetPurchaseSpending((parts) => parts.year === currentDate.year),
  };
  const dateLabel = new Intl.DateTimeFormat("vi-VN", {
    timeZone: personalSpace.timezone,
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(now);

  const maintenanceCount = assets.filter((asset) => asset.status.includes("bảo trì")).length;
  const pricedCount = assets.filter((asset) => asset.purchasePrice !== undefined).length;
  const typeCount = new Set(assets.map((asset) => asset.type)).size;

  const periodCards = [
    { label: "Tuần hiện tại", value: assetSpending.week },
    { label: "Tháng hiện tại", value: assetSpending.month },
    { label: `Quý ${currentQuarter}`, value: assetSpending.quarter },
    { label: `Năm ${currentDate.year}`, value: assetSpending.year },
  ];

  return (
    <main className="min-h-screen bg-muted/40 lg:grid lg:grid-cols-[17rem_1fr]">
      {/* Sidebar (desktop) */}
      <aside className="sticky top-0 hidden h-screen flex-col gap-6 border-r bg-background p-4 lg:flex">
        <div className="flex items-center gap-3 px-2 pt-2">
          <span
            className="grid size-9 place-items-center rounded-xl bg-primary text-base font-bold text-primary-foreground shadow-sm"
            aria-hidden="true"
          >
            G
          </span>
          <span className="text-lg font-semibold tracking-tight">Gia Sản</span>
        </div>

        <button
          type="button"
          className="flex w-full items-center gap-3 rounded-xl border bg-card p-3 text-left shadow-xs transition-colors hover:bg-accent"
        >
          <Avatar className="size-9 rounded-lg">
            <AvatarFallback className="rounded-lg bg-emerald-100 font-semibold text-emerald-700">N</AvatarFallback>
          </Avatar>
          <span className="min-w-0 flex-1">
            <small className="block text-xs text-muted-foreground">Không gian hiện hành</small>
            <strong className="block truncate text-sm font-medium">{personalSpace.name}</strong>
          </span>
          <ChevronsUpDown className="size-4 text-muted-foreground" />
        </button>

        <nav aria-label="Điều hướng chính" className="flex flex-1 flex-col gap-1">
          {navItems.map((item, index) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.label}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                  index === 0
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "text-muted-foreground hover:bg-accent hover:text-accent-foreground",
                )}
              >
                <Icon className="size-4" />
                {item.label}
              </Link>
            );
          })}
          {isAdministrator(session.user.email) ? (
            <Link
              href="/admin/catalog"
              className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
            >
              <ShieldCheck className="size-4" />
              Danh mục chung
            </Link>
          ) : null}
        </nav>

        <div className="flex items-center gap-3 rounded-xl border bg-card p-3">
          <Avatar className="size-9">
            <AvatarFallback className="bg-primary/10 text-sm font-semibold text-primary">{initials}</AvatarFallback>
          </Avatar>
          <div className="min-w-0 flex-1">
            <strong className="block truncate text-sm font-medium">{session.user.name}</strong>
            <span className="block text-xs text-muted-foreground">Chủ không gian</span>
          </div>
          <SignOutButton />
        </div>
      </aside>

      {/* Workspace */}
      <section className="mx-auto w-full max-w-6xl px-4 pb-28 pt-6 sm:px-6 lg:px-10 lg:pb-12 lg:pt-10">
        <header className="mb-8 flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-sm capitalize text-muted-foreground">{dateLabel}</p>
            <h1 className="mt-1 text-3xl font-bold tracking-tight">Tổng quan</h1>
          </div>
          <Button asChild size="lg" className="shadow-sm">
            <Link href="/assets/new">
              <Plus className="size-4" />
              Thêm tài sản
            </Link>
          </Button>
        </header>

        {/* Summary */}
        <div className="grid gap-4 md:grid-cols-3">
          <div className="md:col-span-1">
            <HeroCard
              label="Giá trị tài sản theo giá mua"
              value={formatCurrency(totalValue, personalSpace.defaultCurrency)}
              note={`${pricedCount} tài sản có thông tin giá`}
              icon={Wallet}
            />
          </div>
          <StatCard label="Tổng tài sản" value={assets.length} note={`Thuộc ${typeCount} nhóm tài sản`} icon={Boxes} />
          <StatCard
            label="Cần chú ý"
            value={maintenanceCount}
            note="Đang bảo trì hoặc sửa chữa"
            icon={Wrench}
            tone={maintenanceCount > 0 ? "warning" : "default"}
          />
        </div>

        {/* Cashflow */}
        <section className="mt-12 space-y-5">
          <SectionHeading eyebrow="Dòng tiền" title="Lịch sử đã chi" href="/expenses" action="Xem lịch sử" />

          <div className="grid gap-4 lg:grid-cols-[1.35fr_1fr]">
            <HeroCard
              label="Tổng thực trả từ trước đến nay"
              value={formatCurrency(totalSpent, personalSpace.defaultCurrency)}
              note={`${eligibleExpenses.length} giao dịch, không tính giao dịch đã hoàn tiền hoặc đã hủy`}
              icon={Receipt}
            />
            <StatCard
              label="Tổng chi mua tài sản"
              value={formatCurrency(assetSpending.all, personalSpace.defaultCurrency)}
              note="Chỉ tính dòng chi đã liên kết với tài sản"
              icon={Package}
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {periodCards.map((card) => (
              <StatCard
                key={card.label}
                label={card.label}
                value={formatCurrency(card.value, personalSpace.defaultCurrency)}
                note="Chi mua tài sản"
              />
            ))}
          </div>
        </section>

        {/* Assets */}
        <section className="mt-12 space-y-5">
          <SectionHeading eyebrow="Cập nhật gần đây" title="Tài sản của bạn" href="/assets" action="Xem tất cả" />

          <Card className="overflow-hidden py-0">
            <CardContent className="p-0">
              <ul className="divide-y">
                {assets.slice(0, 5).map((asset) => {
                  const inMaintenance = asset.status.includes("bảo trì");
                  return (
                    <li key={asset.id}>
                      <Link
                        href={`/assets/${asset.id}`}
                        className="group flex items-center gap-4 p-4 transition-colors hover:bg-accent/50"
                      >
                        <div
                          className="grid size-11 shrink-0 place-items-center rounded-xl bg-primary/10 text-base font-semibold uppercase text-primary"
                          aria-hidden="true"
                        >
                          {asset.type.slice(0, 1)}
                        </div>
                        <div className="min-w-0 flex-1">
                          <strong className="block truncate text-sm font-semibold">{asset.name}</strong>
                          <span className="block truncate text-xs text-muted-foreground">
                            {asset.type}
                            {asset.location ? ` · ${asset.location}` : ""}
                          </span>
                        </div>
                        <Badge
                          variant="secondary"
                          className={cn(
                            "hidden sm:inline-flex",
                            inMaintenance && "bg-amber-100 text-amber-800 hover:bg-amber-100",
                          )}
                        >
                          {asset.status}
                        </Badge>
                        <div className="text-right">
                          <strong className="block text-sm font-semibold">
                            {asset.purchasePrice !== undefined
                              ? formatCurrency(asset.purchasePrice, personalSpace.defaultCurrency)
                              : "Chưa có giá"}
                          </strong>
                          <span className="block text-xs text-muted-foreground">
                            Cập nhật {new Date(asset.updatedAt).toLocaleDateString("vi-VN")}
                          </span>
                        </div>
                        <MoreHorizontal
                          className="size-4 text-muted-foreground transition-colors group-hover:text-foreground"
                          aria-label={`Mở ${asset.name}`}
                        />
                      </Link>
                    </li>
                  );
                })}
              </ul>

              {assets.length === 0 ? (
                <div className="flex flex-col items-center gap-3 px-6 py-14 text-center">
                  <span className="grid size-12 place-items-center rounded-full bg-muted">
                    <Package className="size-5 text-muted-foreground" />
                  </span>
                  <p className="text-sm text-muted-foreground">Chưa có tài sản nào trong không gian này.</p>
                  <Button asChild variant="outline" size="sm">
                    <Link href="/assets/new">Thêm tài sản đầu tiên</Link>
                  </Button>
                </div>
              ) : null}
            </CardContent>
          </Card>
        </section>
      </section>

      {/* Mobile nav */}
      <nav
        aria-label="Điều hướng trên điện thoại"
        className="fixed inset-x-0 bottom-0 z-40 border-t bg-background/90 backdrop-blur lg:hidden"
      >
        <div className="mx-auto flex max-w-md items-center justify-around px-2 py-2">
          <a href="#" className="flex flex-1 flex-col items-center gap-1 py-1 text-xs font-medium text-primary">
            <LayoutDashboard className="size-5" />
            Tổng quan
          </a>
          <Link href="/assets" className="flex flex-1 flex-col items-center gap-1 py-1 text-xs text-muted-foreground">
            <Package className="size-5" />
            Tài sản
          </Link>
          <Link
            href="/assets/new"
            aria-label="Thêm tài sản"
            className="-mt-6 grid size-14 place-items-center rounded-full bg-primary text-primary-foreground shadow-lg ring-4 ring-background"
          >
            <Plus className="size-6" />
          </Link>
          <Link href="/expenses" className="flex flex-1 flex-col items-center gap-1 py-1 text-xs text-muted-foreground">
            <Receipt className="size-5" />
            Chi tiêu
          </Link>
          <Link
            href="/expenses?trash=true"
            className="flex flex-1 flex-col items-center gap-1 py-1 text-xs text-muted-foreground"
          >
            <MoreHorizontal className="size-5" />
            Khác
          </Link>
        </div>
      </nav>
    </main>
  );
}
