import type { Metadata } from "next";
import "./globals.css";
import ClientProviders from "./client-providers";

export const metadata: Metadata = {
  title: "Arc",
  description: "Arc",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <ClientProviders>{children}</ClientProviders>
      </body>
    </html>
  );
}
