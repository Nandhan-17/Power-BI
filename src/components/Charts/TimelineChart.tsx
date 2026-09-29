import React, { useMemo, useState } from 'react';
import { 
  ResponsiveContainer, 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  Tooltip, 
  CartesianGrid 
} from 'recharts';
import { TrendingUp } from 'lucide-react';
import type { ProcessedRow, ColumnMapping } from '../../types';
import { MissingColumnPlaceholder } from './MissingColumnPlaceholder';
import { CustomTooltip } from './CustomTooltip';

interface TimelineChartProps {
  rows: ProcessedRow[];
  mapping: ColumnMapping;
}

export const TimelineChart: React.FC<TimelineChartProps> = ({ rows, mapping }) => {
  const [metricMode, setMetricMode] = useState<'revenue' | 'orders'>('revenue');

  const dateKey = mapping.dateKey;
  const revenueKey = mapping.revenueKey;

  const data = useMemo(() => {
    if (!dateKey) return [];

    const dateMap: { [date: string]: { revenue: number; orders: number } } = {};

    for (const row of rows) {
      const d = String(row[dateKey] || '').trim();
      if (!d) continue;

      if (!dateMap[d]) {
        dateMap[d] = { revenue: 0, orders: 0 };
      }
      dateMap[d].orders += 1;
      if (revenueKey) {
        dateMap[d].revenue += Number(row[revenueKey]) || 0;
      }
    }

    return Object.entries(dateMap)
      .map(([date, vals]) => ({
        name: date,
        value: metricMode === 'revenue' ? vals.revenue : vals.orders,
        revenue: vals.revenue,
        orders: vals.orders
      }))
      .sort((a, b) => new Date(a.name).getTime() - new Date(b.name).getTime());
  }, [rows, dateKey, revenueKey, metricMode]);

  const totalSum = useMemo(() => {
    return data.reduce((acc, curr) => acc + curr.value, 0);
  }, [data]);

  if (!dateKey) {
    return (
      <MissingColumnPlaceholder
        chartTitle="Timeline Trend"
        requiredColumns={['Date / Timestamp']}
      />
    );
  }

  if (data.length === 0) {
    return (
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs flex items-center justify-center min-h-[320px] text-slate-400 text-sm">
        No valid date records found in dataset.
      </div>
    );
  }

  const formatYAxis = (val: number) => {
    if (metricMode === 'revenue') {
      if (val >= 1000000) return `₹ ${(val / 1000000).toFixed(1)}M`;
      if (val >= 1000) return `₹ ${(val / 1000).toFixed(0)}k`;
      return `₹ ${val}`;
    }
    return String(val);
  };

  const formatTooltipVal = (val: number) => {
    return metricMode === 'revenue'
      ? `₹ ${Math.round(val).toLocaleString('en-IN')}`
      : `${val.toLocaleString()} Orders`;
  };

  return (
    <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs flex flex-col justify-between h-[380px] select-none">
      <div className="flex items-center justify-between mb-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-emerald-700 uppercase tracking-wider mb-1">
            <TrendingUp className="w-3.5 h-3.5" />
            <span>Power BI Timeline Trend</span>
          </div>
          <h3 className="text-lg font-extrabold text-slate-900 tracking-tight">
            {metricMode === 'revenue' ? 'Sales Revenue Over Time' : 'Order Volume Over Time'}
          </h3>
        </div>

        {revenueKey && (
          <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200 text-xs font-bold">
            <button
              onClick={() => setMetricMode('revenue')}
              className={`px-3 py-1.5 rounded-lg transition cursor-pointer ${
                metricMode === 'revenue'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Revenue
            </button>
            <button
              onClick={() => setMetricMode('orders')}
              className={`px-3 py-1.5 rounded-lg transition cursor-pointer ${
                metricMode === 'orders'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Orders
            </button>
          </div>
        )}
      </div>

      <div className="w-full h-64">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
            <defs>
              <linearGradient id="colorArea" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#22C55E" stopOpacity={0.4} />
                <stop offset="95%" stopColor="#84CC16" stopOpacity={0.0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
            <XAxis
              dataKey="name"
              stroke="#64748B"
              fontSize={11}
              tickLine={false}
              axisLine={{ stroke: '#E2E8F0' }}
            />
            <YAxis
              stroke="#64748B"
              fontSize={11}
              tickLine={false}
              axisLine={{ stroke: '#E2E8F0' }}
              tickFormatter={formatYAxis}
            />
            <Tooltip
              content={
                <CustomTooltip
                  totalSum={totalSum}
                  valueFormatter={formatTooltipVal}
                />
              }
            />
            <Area
              type="monotone"
              dataKey="value"
              stroke="#16A34A"
              strokeWidth={3}
              fillOpacity={1}
              fill="url(#colorArea)"
              isAnimationActive={true}
              animationDuration={1200}
              animationEasing="ease-out"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
