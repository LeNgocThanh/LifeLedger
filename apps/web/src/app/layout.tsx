import type { Metadata } from "next";
import type { ReactNode } from "react";
import "./globals.css";
import { Inter } from "next/font/google";
import { AppFrame } from "@/components/app-frame";
import { isAdministrator } from "@/lib/administrator";
import { getCurrentContext } from "@/lib/current-context";
import { cn } from "@/lib/utils";

const inter = Inter({subsets:['latin'],variable:'--font-sans'});

export const metadata: Metadata = {
  title: "Quản lý tài sản",
  description: "Quản lý tài sản cá nhân và hội nhóm",
};

export default async function RootLayout({ children }: { children: ReactNode }) {
  const currentContext = await getCurrentContext();
  const frameContext = currentContext ? {
    spaceName: currentContext.space.name,
    userName: currentContext.session.user.name,
    role: currentContext.role,
    isAdministrator: isAdministrator(currentContext.session.user.email),
  } : null;

  return (
    <html lang="vi" className={cn("font-sans", inter.variable)}>
      <body><AppFrame context={frameContext}>{children}</AppFrame></body>
    </html>
  );
}
