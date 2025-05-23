"use client";
import InstallsPaceTable from "../../../components/InstallsPaceTable";
import NavBar from "../../../components/NavBar";
import SubtabNav from "../SubtabNav";

export default function InstallTrackerPage() {
  return (
    <main className="min-h-screen bg-gray-50 p-8">
      <NavBar />
      <div className="max-w-screen-lg mx-auto">
        <SubtabNav />
        <InstallsPaceTable />
      </div>
    </main>
  );
} 