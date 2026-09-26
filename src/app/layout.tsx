import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "StockSense — Modern Inventory Management",
  description:
    "Manage inventory, warehouses, fulfillment, transfers, and stock movements from one modern operational platform.",
  openGraph: {
    title: "StockSense — Modern Inventory Management",
    description:
      "Manage inventory, warehouses, fulfillment, transfers, and stock movements from one modern operational platform.",
    type: "website",
    siteName: "StockSense",
  },
  twitter: {
    card: "summary_large_image",
    title: "StockSense — Modern Inventory Management",
    description:
      "Manage inventory, warehouses, fulfillment, transfers, and stock movements from one modern operational platform.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body
        suppressHydrationWarning
        className="min-h-full flex flex-col bg-[#F2F2ED] text-[#464B71] selection:bg-[#73D0C3]/30 selection:text-[#464B71]"
      >
        {children}
      </body>
    </html>
  );
}
