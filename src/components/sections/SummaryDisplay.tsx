
"use client";
import type React from 'react';
import StatCard from "@/components/custom/StatCard";
import { DollarSign, TrendingUp, AlertCircle } from 'lucide-react';
import { formatCurrency } from "@/lib/utils";
import type { SummaryMetrics } from '@/app/page'; // Assuming type definition in page.tsx or a types file


const SummaryDisplay: React.FC<{ summaryMetrics: SummaryMetrics }> = ({ summaryMetrics }) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      <StatCard
        title="Total Revenue"
        value={formatCurrency(summaryMetrics.totalRevenue)}
        icon={DollarSign}
        iconColor="text-green-500"
        helpText="Across 12 months"
      />
      <StatCard
        title="Total Expenses"
        value={formatCurrency(summaryMetrics.totalExpenses)}
        icon={DollarSign}
        iconColor="text-red-500"
        helpText="Lead & enrollment costs"
      />
      <StatCard
        title="Total Net Profit"
        value={formatCurrency(summaryMetrics.totalProfit)}
        icon={summaryMetrics.totalProfit >= 0 ? TrendingUp : AlertCircle}
        iconColor={summaryMetrics.totalProfit >= 0 ? 'text-green-500' : 'text-red-500'}
        helpText="At end of 12 months"
      />
      <StatCard
        title="Break-Even Point"
        value={summaryMetrics.breakEvenMonth}
        icon={TrendingUp}
        iconColor="text-blue-500"
        helpText="Month cumulative profit turns positive"
      />
      <StatCard
        title="Peak Monthly Profit"
        value={formatCurrency(summaryMetrics.maxProfit)}
        icon={TrendingUp}
        iconColor="text-emerald-500"
        helpText="Highest profit in a single month"
      />
      <StatCard
        title="Largest Monthly Loss"
        value={formatCurrency(summaryMetrics.maxLoss)}
        icon={AlertCircle}
        iconColor="text-amber-500"
        helpText="Lowest profit (loss) in a single month"
      />
    </div>
  );
};

export default SummaryDisplay;
