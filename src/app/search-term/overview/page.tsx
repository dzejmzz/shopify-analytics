"use client";
import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Card } from "../../../components/ui/Card";
import { Badge } from "../../../components/ui/Badge";
import Link from 'next/link';
import {
  HomeIcon,
  ChartBarIcon,
  CalendarIcon,
  MagnifyingGlassIcon,
  ArrowTrendingUpIcon,
  Squares2X2Icon,
  ChevronDownIcon,
  CheckIcon,
  ChartPieIcon
} from '@heroicons/react/24/outline';

const sidebarItems = [
  { name: "Performance Snapshot", icon: ChartBarIcon, href: "/search-term/overview", active: true },
  { name: "Keyword Trends", icon: ArrowTrendingUpIcon, href: "/search-term/month-to-month" },
  { name: "Geo Keyword Insights", icon: ChartPieIcon, href: "/search-term/country-split" },
  { name: "Keyword by Plan", icon: Squares2X2Icon, href: "/search-term/plan-split" },
  { name: "Keyword by Device", icon: Squares2X2Icon, href: "/search-term/device-split" },
  { name: "Match Type Analysis", icon: ChartBarIcon, href: "/search-term/exact-vs-broad-split" },
  { name: "Broad Match Performance", icon: MagnifyingGlassIcon, href: "/search-term/broad-term-stats" },
];

export default function SearchTermOverview() {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate data loading
    const timer = setTimeout(() => setLoading(false), 1000);
    return () => clearTimeout(timer);
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 flex items-center justify-center">
        <div className="flex items-center gap-3">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-400"></div>
          <span className="text-slate-300 text-lg">Loading keyword analytics...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 flex">
      {/* Sidebar */}
      <motion.aside
        initial={{ x: -300, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 0.6 }}
        className="w-64 bg-slate-800/50 backdrop-blur-sm border-r border-slate-700/50 flex flex-col px-4 py-6"
      >
        <Link href="/" className="flex items-center gap-3 mb-10 mt-2 group">
          <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center font-bold text-xl text-white shadow-lg">
            S
          </div>
          <span className="text-xl font-bold tracking-wide text-white group-hover:text-blue-300 transition-colors">
            Shopify Analytics
          </span>
        </Link>
        
        <nav className="space-y-2">
          {sidebarItems.map((item) => (
            <Link
              key={item.name}
              href={item.href}
              className={`flex items-center gap-3 py-3 px-4 rounded-xl text-sm font-medium transition-all duration-200 ${
                item.active
                  ? 'bg-blue-600/20 text-blue-300 border border-blue-500/30 shadow-lg shadow-blue-500/10'
                  : 'text-slate-300 hover:bg-slate-700/50 hover:text-white'
              }`}
            >
              <item.icon className="w-5 h-5 flex-shrink-0" />
              <span className="truncate">{item.name}</span>
            </Link>
          ))}
        </nav>
      </motion.aside>

      {/* Main Content */}
      <main className="flex-1 overflow-hidden">
        <div className="h-full overflow-y-auto">
          <div className="container mx-auto px-6 py-8">
            {/* Header */}
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="mb-8"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-blue-500/20 rounded-lg">
                  <MagnifyingGlassIcon className="h-8 w-8 text-blue-400" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-white">Keyword Analytics</h1>
                  <p className="text-slate-300 mt-1">Highlights of top keywords, match types, and changes.</p>
                </div>
              </div>
              
              <div className="flex flex-wrap gap-3">
                <Badge variant="secondary" className="bg-blue-500/20 text-blue-300 border-blue-500/30">
                  <ChartBarIcon className="h-4 w-4 mr-1" />
                  Performance Snapshot
                </Badge>
                <Badge variant="secondary" className="bg-green-500/20 text-green-300 border-green-500/30">
                  <CalendarIcon className="h-4 w-4 mr-1" />
                  Keyword Analysis
                </Badge>
                <Badge variant="secondary" className="bg-purple-500/20 text-purple-300 border-purple-500/30">
                  <Squares2X2Icon className="h-4 w-4 mr-1" />
                  Match Types
                </Badge>
              </div>
            </motion.div>

            {/* Content Placeholder */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <Card className="bg-slate-800/50 backdrop-blur-sm border-slate-700/50 p-6">
                <h2 className="text-xl font-semibold text-white mb-4">Keyword Performance Overview</h2>
                <div className="text-slate-300">
                  <p className="mb-4">This page will show highlights of top keywords, match types, and changes.</p>
                  <p className="text-sm text-slate-400">Coming soon: Keyword performance metrics, top performing terms, and match type analysis.</p>
                </div>
              </Card>
            </motion.div>
          </div>
        </div>
      </main>
    </div>
  );
}

