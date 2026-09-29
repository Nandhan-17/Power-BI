import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { 
  IndianRupee, 
  ShoppingBag, 
  Users, 
  TrendingUp, 
  Package, 
  AlertCircle
} from 'lucide-react';
import type { KpiMetrics, ColumnMapping } from '../types';

interface KpiCardsProps {
  kpis: KpiMetrics;
  mapping: ColumnMapping;
}

const AnimatedNumber: React.FC<{ value: number; isCurrency?: boolean }> = ({ value, isCurrency = false }) => {
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    let start = 0;
    const duration = 1000;
    const startTime = performance.now();

    const updateNumber = (now: number) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const easedProgress = 1 - Math.pow(1 - progress, 3);
      const current = start + (value - start) * easedProgress;

      setDisplayValue(current);

      if (progress < 1) {
        requestAnimationFrame(updateNumber);
      }
    };

    requestAnimationFrame(updateNumber);
  }, [value]);

  const formatted = isCurrency
    ? `₹ ${Math.round(displayValue).toLocaleString('en-IN')}`
    : Math.round(displayValue).toLocaleString('en-IN');

  return <span>{formatted}</span>;
};

export const KpiCards: React.FC<KpiCardsProps> = ({ kpis, mapping }) => {
  const cards = [];

  if (mapping.revenueKey && kpis.totalRevenue !== undefined) {
    cards.push({
      id: 'revenue',
      title: 'Total Revenue',
      value: kpis.totalRevenue,
      isCurrency: true,
      fieldName: mapping.revenueKey,
      icon: IndianRupee,
      accentColor: 'from-emerald-500 to-lime-500',
      iconBg: 'bg-emerald-100 text-emerald-700',
    });
  }

  if (kpis.totalOrders !== undefined) {
    cards.push({
      id: 'orders',
      title: 'Total Orders',
      value: kpis.totalOrders,
      isCurrency: false,
      fieldName: mapping.orderKey || 'Row Count',
      icon: ShoppingBag,
      accentColor: 'from-blue-500 to-indigo-500',
      iconBg: 'bg-blue-100 text-blue-700',
    });
  }

  if (mapping.customerKey && kpis.totalCustomers !== undefined) {
    cards.push({
      id: 'customers',
      title: 'Total Unique Customers',
      value: kpis.totalCustomers,
      isCurrency: false,
      fieldName: mapping.customerKey,
      icon: Users,
      accentColor: 'from-purple-500 to-pink-500',
      iconBg: 'bg-purple-100 text-purple-700',
    });
  }

  if (mapping.revenueKey && kpis.averageOrderValue !== undefined) {
    cards.push({
      id: 'aov',
      title: 'Average Order Value (AOV)',
      value: kpis.averageOrderValue,
      isCurrency: true,
      fieldName: `${mapping.revenueKey} / Total Orders`,
      icon: TrendingUp,
      accentColor: 'from-amber-500 to-orange-500',
      iconBg: 'bg-amber-100 text-amber-700',
    });
  }

  if (mapping.quantityKey && kpis.totalUnitsSold !== undefined) {
    cards.push({
      id: 'units',
      title: 'Total Units Sold',
      value: kpis.totalUnitsSold,
      isCurrency: false,
      fieldName: mapping.quantityKey,
      icon: Package,
      accentColor: 'from-teal-500 to-cyan-500',
      iconBg: 'bg-teal-100 text-teal-700',
    });
  }

  if (cards.length === 0) {
    return (
      <div className="bg-amber-50 border border-amber-200 rounded-2xl p-6 text-amber-800 flex items-center gap-3">
        <AlertCircle className="w-5 h-5 text-amber-600 shrink-0" />
        <span className="text-sm font-semibold">
          No KPI fields could be mapped from the uploaded CSV headers.
        </span>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4 select-none">
      {cards.map((card, idx) => {
        const Icon = card.icon;
        return (
          <motion.div
            key={card.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: idx * 0.08, ease: [0.16, 1, 0.3, 1] }}
            className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs hover:shadow-md transition-shadow relative overflow-hidden group"
          >
            <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${card.accentColor}`} />

            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                {card.title}
              </span>
              <div className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold ${card.iconBg}`}>
                <Icon className="w-4 h-4" />
              </div>
            </div>

            <div className="text-2xl font-black text-slate-900 tracking-tight mb-2 font-mono">
              <AnimatedNumber value={card.value} isCurrency={card.isCurrency} />
            </div>

            <div className="text-[11px] text-slate-400 font-mono truncate">
              Mapped to: <span className="text-slate-600 font-semibold">{card.fieldName}</span>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
};
