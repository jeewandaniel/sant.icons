import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import { BOOT_SCRIPT } from "@/lib/theme";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
  weight: ["400", "500", "600", "700"],
});

const jetbrains = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  weight: ["400", "500", "700"],
});

export const metadata: Metadata = {
  title: "sant.icons — 69,000+ free SVG icons",
  description:
    "Browse, search, and copy from 69,000+ open-source SVG icons across 18 libraries including Lucide, Phosphor, Tabler, Material Design, Fluent UI, Heroicons, and more. Zero login. MCP and CLI for terminal use.",
  metadataBase: new URL("https://icons.sant.co.nz"),
  openGraph: {
    title: "sant.icons",
    description: "69,000+ free SVG icons. Built by Sant.",
    type: "website",
    url: "https://icons.sant.co.nz",
    images: [{ url: "/og/home.png", width: 1200, height: 630, alt: "sant.icons" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "sant.icons",
    description: "69,000+ free SVG icons. Built by Sant.",
    images: ["/og/home.png"],
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${inter.variable} ${jetbrains.variable}`} suppressHydrationWarning>
      <head>
        {/* Set data-theme on <html> before React hydrates so there's no
            flash of the wrong theme on first paint. */}
        <script dangerouslySetInnerHTML={{ __html: BOOT_SCRIPT }} />
      </head>
      <body>{children}</body>
    </html>
  );
}
