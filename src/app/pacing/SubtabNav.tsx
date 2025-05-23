"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";

const subtabs = [
  { name: "App/Campaign Split", href: "/pacing/app-campaign-split" },
  { name: "Yesterday vs Day Before", href: "/pacing/yesterday-vs-day-before" },
  { name: "Budget Tracker", href: "/pacing/budget-tracker" },
  { name: "Install Tracker", href: "/pacing/install-tracker" },
];

export default function SubtabNav() {
  const pathname = usePathname();
  return (
    <div className="flex gap-4 bg-white rounded-lg shadow border px-4 py-2 mb-8 justify-center mt-4">
      {subtabs.map(tab => {
        const active = pathname === tab.href;
        return (
          <Link
            key={tab.href}
            href={tab.href}
            className={`px-4 py-2 rounded font-semibold transition-colors ${active ? "bg-indigo-600 text-white" : "text-gray-800 hover:bg-gray-100"}`}
          >
            {tab.name}
          </Link>
        );
      })}
    </div>
  );
} 