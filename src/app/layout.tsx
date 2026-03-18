import type { Metadata } from "next";
import "./globals.css";
import { ReduxProvider } from "@/components/providers/redux-provider";

export const metadata: Metadata = {
  title: "Shoper | Multi-Tenant Ecommerce Platform",
  description:
    "Launch custom ecommerce dashboards and storefronts for jewellery, watches, eyewear, and more.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <ReduxProvider>{children}</ReduxProvider>
      </body>
    </html>
  );
}
