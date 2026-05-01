import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "אופק גיזום — מערכת ידע",
  description: "מערכת אבחון תקלות וניהול תחזוקה לבמות הרמה",
  icons: {
    icon: '/favicon.png',
    apple: '/apple-icon.png',
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  themeColor: "#F0F4F8",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="he" dir="rtl" className="h-full">
      <body className="min-h-full" style={{ background: '#F0F4F8', color: '#1E293B' }}>
        {children}
      </body>
    </html>
  );
}
