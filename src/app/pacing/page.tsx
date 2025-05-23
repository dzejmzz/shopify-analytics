"use client";
import Link from "next/link";
import NavBar from "../../components/NavBar";

const subtabs = [
  {
    name: "App/Campaign Split",
    href: "/pacing/app-campaign-split",
    description: "See performance split by app and campaign.",
  },
  {
    name: "Yesterday vs Day Before",
    href: "/pacing/yesterday-vs-day-before",
    description: "Compare yesterday's results to the previous day.",
  },
  {
    name: "Budget Tracker",
    href: "/pacing/budget-tracker",
    description: "Track and manage your ad spend budgets.",
  },
  {
    name: "Install Tracker",
    href: "/pacing/install-tracker",
    description: "Monitor app installs and pacing.",
  },
];

export default function PacingPage() {
  return (
    <main className="min-h-screen bg-gray-50 p-8">
      <NavBar />
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full max-w-3xl mt-8">
          {subtabs.map(tab => (
            <Link
              key={tab.href}
              href={tab.href}
              className="block rounded-xl shadow-lg bg-white hover:bg-indigo-50 border border-gray-200 p-8 transition group"
            >
              <div className="text-2xl font-bold text-indigo-700 group-hover:underline mb-2">{tab.name}</div>
              <div className="text-gray-600">{tab.description}</div>
            </Link>
          ))}
        </div>
      </div>
    </main>
  );
}
