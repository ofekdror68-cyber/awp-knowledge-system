import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "AWP Knowledge — מערכת ידע במות הרמה",
  description: "מערכת אבחון תקלות וניהול תחזוקה לבמות הרמה",
  manifest: "/manifest.json",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  themeColor: "#1d4ed8",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="he" dir="rtl" className="h-full">
      <body className="min-h-full bg-slate-50 text-slate-900">{children}</body>
    </html>
  );
}
