"use client";
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const tabs = [
  { name: 'Pacing', href: '/pacing/home' },
  { name: 'Yearly Performance', href: '/yearly-performance/home' },
  // Add more buttons here later
];

export default function NavBar() {
  const pathname = usePathname();
  return (
    <nav className="w-full flex justify-center items-center mb-8 bg-gradient-to-b from-[#181C23cc] to-[#23283a99] shadow-lg border-b border-[#23283a] h-20 sticky top-0 z-50 backdrop-blur-md">
      <div className="flex items-center w-full max-w-screen-lg px-4 gap-8">
        <Link href="/" className="text-2xl font-extrabold text-primary-300 tracking-tight select-none hover:underline transition">Shopify Analytics</Link>
        <div className="flex gap-2 ml-4">
          {tabs.map(tab => {
            const active = pathname.startsWith(tab.href);
            return (
              <Link
                key={tab.href}
                href={tab.href}
                className={`px-6 py-2 rounded-full font-semibold transition-all duration-200 text-base
                  ${active
                    ? 'text-white font-bold bg-primary-300/20 shadow-lg'
                    : 'text-white hover:bg-primary-300/10 hover:underline'}
                `}
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