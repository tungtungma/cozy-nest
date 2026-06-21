import type { Metadata } from "next";
import { Playfair_Display, Inter } from "next/font/google";
import { Providers } from "@/components/Providers";
import "./globals.css";

const playfair = Playfair_Display({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-serif",
  display: "swap",
});

const inter = Inter({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
  variable: "--font-sans",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Cozy Nest — Korean Organic Skincare",
  description:
    "Cozy Nest: gentle Korean organic skincare crafted with natural botanicals and essential oils.",
  keywords: [
    "Korean skincare",
    "organic skincare",
    "natural cosmetics",
    "botanical",
    "essential oils",
    "Cozy Nest",
  ],
  openGraph: {
    title: "Cozy Nest — Korean Organic Skincare",
    description:
      "Gentle Korean organic skincare crafted with natural botanicals and essential oils.",
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
      className={`${playfair.variable} ${inter.variable}`}
      suppressHydrationWarning
    >
      <body className="antialiased min-h-screen flex flex-col">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
