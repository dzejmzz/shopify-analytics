"use client";
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ChartBarIcon, BoltIcon, BanknotesIcon, TableCellsIcon } from '@heroicons/react/24/outline';

const tabs = [
  { name: 'Analytics', href: '/analytics', icon: ChartBarIcon },
  { name: 'Installs Pace', href: '/installs-pace', icon: BoltIcon },
  { name: 'Budget Analysis', href: '/budget-analysis', icon: BanknotesIcon },
  { name: 'Yesterday vs Day Before', href: '/yesterday-vs-daybefore', icon: TableCellsIcon },
];

export default function NavBar() {
  const pathname = usePathname();
  return (
    <nav className="w-full flex justify-center items-center mb-2 bg-white/10 shadow-md border-b border-gray-700 h-16 sticky top-0 z-50 -mt-3">
      <div className="flex items-center w-full max-w-screen-lg px-4">
        {/* <img src="/assets/math-mask.png" alt="Math Mask" className="h-9 w-auto mr-2" /> */}
        <span className="text-xl font-bold text-primary-300 tracking-tight mr-8 select-none">Shopify Analytics</span>
        <div className="flex gap-4">
          {tabs.map(tab => {
            const active = pathname.startsWith(tab.href);
            const Icon = tab.icon;
            return (
              <Link
                key={tab.href}
                href={tab.href}
                className={`flex items-center gap-2 px-4 py-2 rounded font-semibold transition-colors ${active ? 'bg-primary-300 text-black' : 'text-gray-200 hover:bg-surface-400/30'}`}
              >
                <Icon className="w-5 h-5" />
                {tab.name}
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
} 