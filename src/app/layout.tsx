import React from "react";
import "./globals.css";
import Sidebar from "../components/Sidebar";

export const metadata = {
  title: "Shopify Analytics Dashboard",
  description: "Modern analytics dashboard for Shopify apps",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="min-h-screen w-full bg-[#0a0a0a] text-[#ededed] font-sans antialiased flex items-center justify-center">
        {/* Sidebar - fixed and vertically centered */}
        <div className="fixed left-0 top-1/2 -translate-y-1/2 z-50">
          <Sidebar />
        </div>
        {/* Main content - centered, with left margin to avoid sidebar overlap */}
        <div className="glass w-full max-w-7xl min-h-[85vh] rounded-2xl p-4 md:p-8 flex flex-col gap-8 items-center ml-0 md:ml-32">
          {children}
        </div>
      </body>
    </html>
  );
}
