import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "אופק גיזום — מערכת ידע",
  description: "מערכת אבחון תקלות וניהול תחזוקה לבמות הרמה",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  themeColor: "#0F172A",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="he" dir="rtl" className="h-full">
      <body className="min-h-full" style={{ background: '#0F172A', color: '#F1F5F9' }}>
        {children}
      </body>
    </html>
  );
}
