"use client";

import React from "react";
import Link from "next/link";
import { motion, type Variants } from "framer-motion";
import { 
  Squares2X2Icon, 
  ArrowTrendingUpIcon, 
  CurrencyDollarIcon, 
  ChartBarIcon,
  ArrowRightIcon
} from '@heroicons/react/24/outline';
import NavBar from "../../components/NavBar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../components/ui/Card";
import { Badge } from "../../components/ui/Badge";
import { cn } from "../../lib/utils";

interface SubTab {
  name: string;
  href: string;
  description: string;
  icon: React.ComponentType<any>;
  color: string;
  badge?: string;
}

const subtabs: SubTab[] = [
  {
    name: "App/Campaign Split",
    href: "/pacing/app-campaign-split",
    description: "Analyze performance metrics split by individual apps and campaigns for detailed insights.",
    icon: Squares2X2Icon,
    color: "from-blue-500 to-cyan-500",
    badge: "Popular"
  },
  {
    name: "Yesterday vs Day Before",
    href: "/pacing/yesterday-vs-day-before",
    description: "Compare yesterday's performance against the previous day to identify trends and anomalies.",
    icon: ArrowTrendingUpIcon,
    color: "from-green-500 to-emerald-500",
  },
  {
    name: "Budget Tracker",
    href: "/pacing/budget-tracker",
    description: "Monitor and manage your advertising spend budgets with real-time tracking and alerts.",
    icon: CurrencyDollarIcon,
    color: "from-yellow-500 to-orange-500",
    badge: "New"
  },
  {
    name: "Install Tracker",
    href: "/pacing/install-tracker",
    description: "Track app installation rates and pacing to optimize your user acquisition strategy.",
    icon: ChartBarIcon,
    color: "from-purple-500 to-pink-500",
  },
];

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2,
    },
  },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
      ease: "easeOut",
    },
  },
};

export default function PacingPage() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      <NavBar />
      
      <div className="container mx-auto px-6 py-12">
        {/* Header Section */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4">
            Pacing Analytics
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            Monitor your app performance with real-time insights and comprehensive analytics tools
          </p>
        </motion.div>

        {/* Cards Grid */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-6xl mx-auto"
        >
          {subtabs.map((tab, index) => {
            const IconComponent = tab.icon;
            
            return (
              <motion.div key={tab.href} variants={itemVariants}>
                <Link href={tab.href} className="block group">
                  <Card className="h-full transition-all duration-300 hover:shadow-2xl hover:scale-[1.02] border-0 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm">
                    <CardHeader className="pb-4">
                      <div className="flex items-start justify-between">
                        <div className={cn(
                          "p-3 rounded-xl bg-gradient-to-r shadow-lg",
                          tab.color
                        )}>
                          <IconComponent className="h-6 w-6 text-white" />
                        </div>
                        {tab.badge && (
                          <Badge 
                            variant={tab.badge === "New" ? "success" : "info"}
                            size="sm"
                          >
                            {tab.badge}
                          </Badge>
                        )}
                      </div>
                      
                      <CardTitle className="text-xl font-bold text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                        {tab.name}
                      </CardTitle>
                    </CardHeader>
                    
                    <CardContent>
                      <CardDescription className="text-gray-600 dark:text-gray-300 leading-relaxed mb-4">
                        {tab.description}
                      </CardDescription>
                      
                      <div className="flex items-center text-blue-600 dark:text-blue-400 font-medium group-hover:translate-x-1 transition-transform">
                        <span>Explore</span>
                        <ArrowRightIcon className="ml-2 h-4 w-4" />
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              </motion.div>
            );
          })}
        </motion.div>

        {/* Quick Stats Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.8 }}
          className="mt-16 text-center"
        >
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            <div className="p-6 bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm rounded-xl border border-gray-200 dark:border-gray-700">
              <div className="text-3xl font-bold text-blue-600 dark:text-blue-400 mb-2">Real-time</div>
              <div className="text-gray-600 dark:text-gray-300">Data Updates</div>
            </div>
            <div className="p-6 bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm rounded-xl border border-gray-200 dark:border-gray-700">
              <div className="text-3xl font-bold text-green-600 dark:text-green-400 mb-2">Advanced</div>
              <div className="text-gray-600 dark:text-gray-300">Analytics</div>
            </div>
            <div className="p-6 bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm rounded-xl border border-gray-200 dark:border-gray-700">
              <div className="text-3xl font-bold text-purple-600 dark:text-purple-400 mb-2">Smart</div>
              <div className="text-gray-600 dark:text-gray-300">Insights</div>
            </div>
          </div>
        </motion.div>
      </div>
    </main>
  );
}
 