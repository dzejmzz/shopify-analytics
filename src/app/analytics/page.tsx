"use client";
import React from "react";
import RawDataTable from "../../components/RawDataTable";

export default function AnalyticsPage() {
  return (
    <div className="w-full flex flex-col items-center justify-center">
      <div className="glass rounded-2xl p-6 w-full max-w-5xl mt-8">
        <h2 className="text-2xl font-bold mb-4">Analytics Table</h2>
        <RawDataTable />
      </div>
    </div>
  );
} 