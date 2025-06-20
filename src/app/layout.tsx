import React, { PropsWithChildren } from "react";
import "./globals.css";
import Sidebar from "../components/Sidebar";

export const metadata = {
  title: "Shopify Analytics Dashboard",
  description: "Modern analytics dashboard for Shopify apps",
};

export default function RootLayout({ children }: PropsWithChildren) {
  return (
    <html lang="en">
      <body className="min-h-screen w-full bg-[#0a0a0a] text-[#ededed] font-sans antialiased">
        <div className="flex min-h-screen w-full">
          <Sidebar />
          <div className="flex-1">{children}</div>
        </div>
      </body>
    </html>
  );
}
