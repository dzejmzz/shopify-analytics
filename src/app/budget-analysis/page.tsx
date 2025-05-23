"use client";
import React from "react";
import BudgetAnalysisTable from "../../components/BudgetAnalysisTable";

export default function BudgetAnalysisPage() {
  return (
    <div className="w-full flex flex-col items-center justify-center">
      <div className="glass rounded-2xl p-6 w-full max-w-5xl mt-8">
        <h2 className="text-2xl font-bold mb-4">Budget Analysis</h2>
        <BudgetAnalysisTable />
      </div>
    </div>
  );
} 