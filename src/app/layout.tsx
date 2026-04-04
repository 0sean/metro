import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Metro",
  description: "An unofficial Tyne & Wear Metro timetable",
  manifest: "/manifest.json",
};

export const viewport: Viewport = {
  themeColor: "#0a0a0a",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className="bg-gradient-to-b from-neutral-800 to-neutral-950 h-full text-neutral-50 overflow-hidden"
    >
      <body className={`${inter.className} h-full p-4`}>{children}</body>
    </html>
  );
}
