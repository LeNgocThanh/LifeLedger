"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";

import { SignOutButton } from "@/components/sign-out-button";

const navItems = [
  { label: "Tổng quan", href: "/" },
  { label: "Tài sản", href: "/assets" },
  { label: "Lịch sử chi", href: "/expenses" },
  { label: "Không gian", href: "#" },
  { label: "Chia sẻ", href: "#" },
  { label: "Thùng rác", href: "/expenses?trash=true" },
];

type AppFrameProps = {
  children: ReactNode;
  context: {
    spaceName: string;
    userName: string;
    role: "owner" | "manager" | "viewer";
    isAdministrator: boolean;
  } | null;
};

const roleLabels = {
  owner: "Chủ không gian",
  manager: "Quản lý",
  viewer: "Người xem",
} as const;

export function AppFrame({ children, context }: AppFrameProps) {
  const pathname = usePathname();

  if (!context || pathname === "/") {
    return children;
  }

  const initials = context.userName
    .split(/\s+/)
    .filter(Boolean)
    .slice(-2)
    .map((part) => part.slice(0, 1).toLocaleUpperCase("vi-VN"))
    .join("");

  function isActive(href: string) {
    if (href === "/" || href.includes("?") || href === "#") return false;
    return pathname === href || pathname.startsWith(`${href}/`);
  }

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <Link className="brand" href="/">
          <span className="brand-mark" aria-hidden="true">G</span>
          <span>Tài Sản</span>
        </Link>

        <button className="space-switcher" type="button">
          <span className="space-avatar" aria-hidden="true">N</span>
          <span>
            <small>Không gian hiện hành</small>
            <strong>{context.spaceName}</strong>
          </span>
          <span aria-hidden="true">⌄</span>
        </button>

        <nav aria-label="Điều hướng chính">
          {navItems.map((item) => (
            <Link className={isActive(item.href) ? "nav-item active" : "nav-item"} href={item.href} key={item.label}>
              <span className="nav-dot" aria-hidden="true" />
              {item.label}
            </Link>
          ))}
          {context.isAdministrator ? (
            <Link className={isActive("/admin") ? "nav-item active" : "nav-item"} href="/admin/catalog">
              <span className="nav-dot" aria-hidden="true" />
              Danh mục chung
            </Link>
          ) : null}
        </nav>

        <div className="sidebar-footer">
          <div className="user-avatar" aria-hidden="true">{initials}</div>
          <div>
            <strong>{context.userName}</strong>
            <span>{roleLabels[context.role]}</span>
          </div>
          <SignOutButton />
        </div>
      </aside>

      <section className="subpage-workspace">
        {children}
        <nav className="mobile-nav" aria-label="Điều hướng trên điện thoại">
          <Link className={pathname === "/" ? "active" : ""} href="/">Tổng quan</Link>
          <Link className={pathname.startsWith("/assets") ? "active" : ""} href="/assets">Tài sản</Link>
          <Link aria-label="Thêm tài sản" className="mobile-add-link" href="/assets/new">＋</Link>
          <Link className={pathname.startsWith("/expenses") ? "active" : ""} href="/expenses">Chi tiêu</Link>
          <Link href="/expenses?trash=true">Khác</Link>
        </nav>
      </section>
    </div>
  );
}
