"use client";
import YesterdayVsDayBeforeTable from "../../../components/YesterdayVsDayBeforeTable";
import NavBar from "../../../components/NavBar";
import SubtabNav from "../SubtabNav";

export default function YesterdayVsDayBeforePage() {
  return (
    <main className="min-h-screen bg-gray-50 p-8">
      <NavBar />
      <div className="max-w-screen-lg mx-auto">
        <SubtabNav />
        <YesterdayVsDayBeforeTable />
      </div>
    </main>
  );
} 