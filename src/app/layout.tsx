import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Salio Desk",
  description: "A clear, reliable desk for tracking client loans and repayments.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
