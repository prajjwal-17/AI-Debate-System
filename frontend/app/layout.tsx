import type { Metadata } from "next";
import "./globals.css"

export const metadata: Metadata = {
  title: "DebateForge",
  description: "Two AIs argue. You intervene.",
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