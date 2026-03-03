import type { Metadata, Viewport } from "next";
import { getSession } from "@/lib/auth";
import Nav from "@/components/Nav";
import "./globals.css";

export const metadata: Metadata = {
  title: "学院会议室预订",
  description: "内部会议室预订系统",
  appleWebApp: { capable: true, title: "会议室预订" },
  icons: { apple: "/icon-192.png" },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  themeColor: "#2563eb",
};

export default async function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const user = await getSession();
  return (
    <html lang="zh-CN">
      <body className="min-h-screen antialiased">
        <Nav name={user?.name ?? null} namespaceName={user?.namespaceName ?? null} />
        <main className="mx-auto max-w-6xl px-4 py-6">{children}</main>
      </body>
    </html>
  );
}
