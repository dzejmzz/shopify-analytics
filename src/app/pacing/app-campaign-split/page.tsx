"use client";
import RawDataTable from "../../../components/RawDataTable";
import NavBar from "../../../components/NavBar";
import SubtabNav from "../SubtabNav";

export default function AppCampaignSplitPage() {
  return (
    <main className="min-h-screen bg-gray-50 p-8">
      <NavBar />
      <div className="max-w-screen-lg mx-auto">
        <SubtabNav />
        <RawDataTable />
      </div>
    </main>
  );
} 