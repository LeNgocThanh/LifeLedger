import Link from "next/link";
import { notFound, redirect } from "next/navigation";

import { CatalogAdmin } from "@/components/catalog-admin";
import { isAdministrator } from "@/lib/administrator";
import { listCatalogItems } from "@/lib/catalog";
import { getCurrentContext } from "@/lib/current-context";

export default async function CatalogAdminPage() {
  const context = await getCurrentContext();

  if (!context) {
    redirect("/login");
  }

  if (!isAdministrator(context.session.user.email)) {
    notFound();
  }

  return (
    <main className="content-page">
      <header className="content-header">
        <div>
          <Link className="back-link" href="/">Tổng quan</Link>
          <p className="eyebrow">Administrator</p>
          <h1>Danh mục linh kiện và vật tư</h1>
          <p className="content-description">Thiết lập danh mục chuẩn dùng chung cho toàn bộ người dùng.</p>
        </div>
      </header>
      <CatalogAdmin initialItems={await listCatalogItems(true)} />
    </main>
  );
}
