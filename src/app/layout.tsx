import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Stillwater · Personalized QT Workbook",
  description:
    "A one-week, Scripture-rooted Quiet Time workbook generated from your real-life concern.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full flex flex-col bg-cream text-ink">
        {children}
      </body>
    </html>
  );
}
