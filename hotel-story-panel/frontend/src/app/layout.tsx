import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";

const estedad = localFont({
  src: [
    {
      path: "../../public/fonts/Estedad-Thin.woff2",
      weight: "100",
      style: "normal",
    },
    {
      path: "../../public/fonts/Estedad-ExtraLight.woff2",
      weight: "200",
      style: "normal",
    },
    {
      path: "../../public/fonts/Estedad-Light.woff2",
      weight: "300",
      style: "normal",
    },
    {
      path: "../../public/fonts/Estedad-Regular.woff2",
      weight: "400",
      style: "normal",
    },
    {
      path: "../../public/fonts/Estedad-Medium.woff2",
      weight: "500",
      style: "normal",
    },
    {
      path: "../../public/fonts/Estedad-SemiBold.woff2",
      weight: "600",
      style: "normal",
    },
    {
      path: "../../public/fonts/Estedad-Bold.woff2",
      weight: "700",
      style: "normal",
    },
    {
      path: "../../public/fonts/Estedad-ExtraBold.woff2",
      weight: "800",
      style: "normal",
    },
    {
      path: "../../public/fonts/Estedad-Black.woff2",
      weight: "900",
      style: "normal",
    },
  ],
  variable: "--font-estedad",
  display: "swap",
});

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
    <html lang="fa" dir="rtl" suppressHydrationWarning className={`${estedad.variable}`}>
      <body
        className="antialiased font-sans bg-gray-50 text-gray-900"
      >
        {children}
      </body>
    </html>
  );
}
