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
  { name: "Performance Snapshot", icon: ChartBarIcon, href: "/search-term/overview" },
  { name: "Keyword Trends", icon: ArrowTrendingUpIcon, href: "/search-term/month-to-month" },
  { name: "Geo Keyword Insights", icon: ChartPieIcon, href: "/search-term/country-split" },
  { name: "Keyword by Plan", icon: Squares2X2Icon, href: "/search-term/plan-split" },
  { name: "Keyword by Device", icon: Squares2X2Icon, href: "/search-term/device-split" },
  { name: "Match Type Analysis", icon: ChartBarIcon, href: "/search-term/exact-vs-broad-split", active: true },
  { name: "Broad Match Performance", icon: MagnifyingGlassIcon, href: "/search-term/broad-term-stats" },
];

export default function MatchTypeAnalysis() {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 1000);
    return () => clearTimeout(timer);
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 flex items-center justify-center">
        <div className="flex items-center gap-3">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-400"></div>
          <span className="text-slate-300 text-lg">Loading match type analysis...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900">
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
                  <ChartBarIcon className="h-8 w-8 text-blue-400" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-white">Match Type Analysis</h1>
                  <p className="text-slate-300 mt-1">Compare exact vs. broad match keywords.</p>
                </div>
              </div>
              
              <div className="flex flex-wrap gap-3">
                <Badge variant="secondary" className="bg-blue-500/20 text-blue-300 border-blue-500/30">
                  <ChartBarIcon className="h-4 w-4 mr-1" />
                  Match Type Comparison
                </Badge>
                <Badge variant="secondary" className="bg-green-500/20 text-green-300 border-green-500/30">
                  <CalendarIcon className="h-4 w-4 mr-1" />
                  Exact vs Broad
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
                <h2 className="text-xl font-semibold text-white mb-4">Match Type Performance Comparison</h2>
                <div className="text-slate-300">
                  <p className="mb-4">This page will compare exact vs. broad match keywords.</p>
                  <p className="text-sm text-slate-400">Coming soon: Match type performance metrics, conversion rate comparisons, and bidding strategy insights.</p>
                </div>
              </Card>
            </motion.div>
      </div>
    </div>
  );
}
