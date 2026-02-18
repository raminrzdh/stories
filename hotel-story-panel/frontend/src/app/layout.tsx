import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "پنل استوری هتل",
  description: "سیستم مدیریت و نمایش استوری هتل",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fa" dir="rtl" suppressHydrationWarning>
      <body
        className="antialiased font-sans bg-gray-50"
      >
        {children}
      </body>
    </html>
  );
}
