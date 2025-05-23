"use client";
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const tabs = [
  { name: 'Pacing', href: '/pacing' },
  { name: 'Yearly Performance', href: '/yearly-performance' },
];

export default function NavBar() {
  const pathname = usePathname();
  return (
    <nav className="w-full flex justify-center items-center mb-2 bg-white shadow-md border-b border-gray-200 h-16 sticky top-0 z-50 -mt-3">
      <div className="flex items-center w-full max-w-screen-lg px-4">
        {/* <img src="/assets/math-mask.png" alt="Math Mask" className="h-9 w-auto mr-2" /> */}
        <span className="text-xl font-bold text-indigo-700 tracking-tight mr-8 select-none">Reklame, Bilje mi</span>
        <div className="flex gap-4">
          {tabs.map(tab => {
            const active = pathname.startsWith(tab.href);
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
      </div>
    </nav>
  );
} 