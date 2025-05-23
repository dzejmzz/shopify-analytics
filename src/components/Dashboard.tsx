import React from "react";
import RawDataTable from "./RawDataTable";
import InstallsPaceTable from "./InstallsPaceTable";
import YesterdayVsDayBeforeTable from "./YesterdayVsDayBeforeTable";
import BudgetAnalysisTable from "./BudgetAnalysisTable";
import { HomeIcon, ChartBarIcon, CreditCardIcon, Cog6ToothIcon, UserCircleIcon } from '@heroicons/react/24/outline';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

const sampleChartData = [
  { name: 'Mon', value: 1200 },
  { name: 'Tue', value: 2100 },
  { name: 'Wed', value: 800 },
  { name: 'Thu', value: 1600 },
  { name: 'Fri', value: 900 },
  { name: 'Sat', value: 1700 },
  { name: 'Sun', value: 1400 },
];

const SidebarIcon = ({ children }: { children: React.ReactNode }) => (
  <div className="w-12 h-12 flex items-center justify-center rounded-2xl bg-surface-400/40 mb-4 border border-surface-200 glass cursor-pointer hover:bg-surface-300/60 transition">
    {children}
  </div>
);

const TopBar = () => (
  <div className="glass flex items-center justify-between px-6 py-4 rounded-2xl mb-6 shadow-glass">
    <div className="flex items-center gap-4">
      <span className="text-2xl font-bold">Financial summary</span>
      <span className="text-surface-200 text-sm">Track your monthly activities</span>
    </div>
    <div className="flex items-center gap-4">
      <button className="glass px-4 py-2 rounded-xl text-sm font-semibold border border-surface-200">Today</button>
      <button className="glass px-4 py-2 rounded-xl text-sm font-semibold border border-surface-200">This month</button>
      <button className="glass px-4 py-2 rounded-xl text-sm font-semibold border border-surface-200">Date</button>
      <button className="glass px-3 py-2 rounded-xl border border-surface-200">
        <ChartBarIcon className="w-5 h-5" />
      </button>
      <div className="flex items-center gap-2">
        <img src="https://randomuser.me/api/portraits/men/32.jpg" alt="User" className="w-8 h-8 rounded-full border-2 border-primary-200" />
        <span className="font-bold text-lg">$156,834.42</span>
      </div>
    </div>
  </div>
);

const Dashboard = () => {
  return (
    <div className="flex flex-row gap-8">
      {/* Sidebar */}
      <aside className="flex flex-col items-center py-8 px-2 bg-transparent">
        <SidebarIcon><HomeIcon className="w-7 h-7" /></SidebarIcon>
        <SidebarIcon><ChartBarIcon className="w-7 h-7" /></SidebarIcon>
        <SidebarIcon><CreditCardIcon className="w-7 h-7" /></SidebarIcon>
        <SidebarIcon><UserCircleIcon className="w-7 h-7" /></SidebarIcon>
        <SidebarIcon><Cog6ToothIcon className="w-7 h-7" /></SidebarIcon>
      </aside>
      {/* Main content */}
      <div className="flex-1 flex flex-col">
        <TopBar />
        {/* Main grid for widgets */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="glass rounded-2xl p-6 md:col-span-2 min-h-[320px] flex flex-col justify-between">
            <div className="text-lg font-bold mb-2">Analytics</div>
            <div className="w-full h-48 mb-4">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={sampleChartData}>
                  <XAxis dataKey="name" stroke="#a3d900" />
                  <YAxis stroke="#a3d900" />
                  <Tooltip />
                  <Line type="monotone" dataKey="value" stroke="#a3d900" strokeWidth={3} dot={{ r: 6, fill: '#a3d900' }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
            <RawDataTable />
          </div>
          <div className="glass rounded-2xl p-6 min-h-[320px] flex flex-col justify-between">
            <div className="text-lg font-bold mb-2">Installs Pace</div>
            <InstallsPaceTable />
          </div>
          <div className="glass rounded-2xl p-6 min-h-[180px] flex flex-col justify-between">
            <div className="text-lg font-bold mb-2">Yesterday vs Day Before</div>
            <YesterdayVsDayBeforeTable />
          </div>
          <div className="glass rounded-2xl p-6 min-h-[180px] flex flex-col justify-between">
            <div className="text-lg font-bold mb-2">Budget Analysis</div>
            <BudgetAnalysisTable />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard; 