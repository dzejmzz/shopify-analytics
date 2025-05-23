"use client";
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import RawDataTable from '../../components/RawDataTable';
import YesterdayVsDayBeforeTable from '../../components/YesterdayVsDayBeforeTable';
import BudgetAnalysisTable from '../../components/BudgetAnalysisTable';
import InstallsPaceTable from '../../components/InstallsPaceTable';
import NavBar from '../../components/NavBar';

const subtabs = [
  { name: 'App/Campaign Split', href: '/pacing', component: RawDataTable },
  { name: 'Yesterday vs Day Before', href: '/pacing/yesterday-vs-daybefore', component: YesterdayVsDayBeforeTable },
  { name: 'Budget Tracker', href: '/pacing/budget-analysis', component: BudgetAnalysisTable },
  { name: 'Install Tracker', href: '/pacing/installs-pace', component: InstallsPaceTable },
];

export default function PacingPage() {
  const pathname = usePathname();
  const currentTab = subtabs.find(tab => pathname === tab.href) || subtabs[0];
  const CurrentComponent = currentTab.component;

  return (
    <main className="min-h-screen bg-gray-50 p-8">
      <div style={{background: '#ff0', color: '#000', padding: 8, marginBottom: 8}}>DEBUG: pathname is {pathname}</div>
      <NavBar />
      <div className="max-w-screen-lg mx-auto">
        <div className="flex gap-4 bg-white rounded-lg shadow border px-4 py-2 mb-8 justify-center mt-4">
          {subtabs.map(tab => {
            const active = pathname === tab.href;
            return (
              <Link
                key={tab.href}
                href={tab.href}
                className={`px-4 py-2 rounded font-semibold transition-colors ${active ? 'bg-indigo-600 text-white' : 'text-gray-800 hover:bg-gray-100'}`}
              >
                {tab.name}
              </Link>
            );
          })}
        </div>
        <CurrentComponent />
      </div>
    </main>
  );
} 