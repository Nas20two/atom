import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "NaSy Hub — AI-powered products",
  description: "NaSy Hub — Atom: The smallest unit of marketing.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
