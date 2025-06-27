import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Metro",
  description: "An unofficial Tyne & Wear Metro timetable",
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
