"use client";

import React, { PropsWithChildren, useEffect } from "react";
import { QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import "./globals.css";
import Sidebar from "../components/Sidebar";
import { queryClient } from "../lib/queryClient";
import { ErrorBoundary } from "../components/ui/ErrorBoundary";
import { measureWebVitals } from "../lib/performance";

export default function RootLayout({ children }: PropsWithChildren) {
  useEffect(() => {
    // Initialize performance monitoring
    measureWebVitals();
  }, []);

  return (
    <html lang="en">
      <body className="min-h-screen w-full bg-[#0a0a0a] text-[#ededed] font-sans antialiased">
        <ErrorBoundary>
          <QueryClientProvider client={queryClient}>
            <div className="flex min-h-screen w-full">
              <Sidebar />
              <div className="flex-1">{children}</div>
            </div>
            {process.env.NODE_ENV === 'development' && (
              <ReactQueryDevtools initialIsOpen={false} />
            )}
          </QueryClientProvider>
        </ErrorBoundary>
      </body>
    </html>
  );
}
