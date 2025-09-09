
import "./globals.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Instagram Slide Carousel Creator",
  description: "Paste a story → auto-split into slides → tweak → export PNG/PDF.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-neutral-50">{children}</body>
    </html>
  );
}
