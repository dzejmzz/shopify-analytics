"use client";
import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { HomeIcon, ChartBarIcon, BoltIcon, BanknotesIcon, TableCellsIcon } from '@heroicons/react/24/outline';

const sidebarLinks = [
  { name: 'Dashboard', href: '/', icon: HomeIcon },
  { name: 'Analytics', href: '/analytics', icon: ChartBarIcon },
  { name: 'Installs Pace', href: '/installs-pace', icon: BoltIcon },
  { name: 'Budget Analysis', href: '/budget-analysis', icon: BanknotesIcon },
  { name: 'Yesterday vs Day Before', href: '/yesterday-vs-daybefore', icon: TableCellsIcon },
];

export default function Sidebar() {
  const pathname = usePathname();
  return (
    <aside className="hidden md:flex flex-col items-center py-8 px-2 bg-transparent min-w-[80px]">
      {sidebarLinks.map(link => {
        const Icon = link.icon;
        const active = pathname === link.href;
        return (
          <Link
            key={link.href}
            href={link.href}
            className={`w-12 h-12 flex items-center justify-center rounded-2xl mb-4 border border-surface-200 glass cursor-pointer hover:bg-surface-300/60 transition ${active ? 'ring-2 ring-primary-300 border-primary-300' : ''}`}
            aria-label={link.name}
          >
            <Icon className="w-7 h-7" />
          </Link>
        );
      })}
    </aside>
  );
} 