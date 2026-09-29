import React, { useState, useMemo } from 'react';
import { 
  BarChart, 
  Bar, 
  LineChart, 
  Line, 
  PieChart, 
  Pie, 
  Cell, 
  XAxis, 
  YAxis, 
  Tooltip, 
  ResponsiveContainer, 
  CartesianGrid 
} from 'recharts';
import { BarChart3, LineChart as LineIcon, PieChart as PieIcon, Sparkles } from 'lucide-react';
import type { ProcessedRow } from '../types';
import { CustomTooltip } from './Charts/CustomTooltip';

interface CustomChartBuilderProps {
  rows: ProcessedRow[];
  headers: string[];
}

const PALETTE = ['#22C55E', '#0EA5E9', '#A855F7', '#F59E0B', '#EC4899', '#14B8A6', '#6366F1'];

export const CustomChartBuilder: React.FC<CustomChartBuilderProps> = ({ rows, headers }) => {
  const [chartType, setChartType] = useState<'bar' | 'line' | 'pie'>('bar');
  const [xAxisKey, setXAxisKey] = useState<string>(headers[0] || '');
  const [yAxisKey, setYAxisKey] = useState<string>(headers[1] || headers[0] || '');
  const [aggregation, setAggregation] = useState<'sum' | 'avg' | 'count'>('sum');

  const chartData = useMemo(() => {
    if (!xAxisKey) return [];

    const map: { [key: string]: { sum: number; count: number } } = {};

    for (const row of rows) {
      const xVal = String(row[xAxisKey] ?? 'Uncategorized').trim();
      const rawY = Number(row[yAxisKey]);
      const yVal = isNaN(rawY) ? 1 : rawY;

      if (!map[xVal]) {
        map[xVal] = { sum: 0, count: 0 };
      }
      map[xVal].sum += yVal;
      map[xVal].count += 1;
    }

    return Object.entries(map)
      .map(([name, stat]) => {
        let val = stat.sum;
        if (aggregation === 'avg') val = stat.count > 0 ? stat.sum / stat.count : 0;
        if (aggregation === 'count') val = stat.count;

        return { name, value: Math.round(val * 100) / 100 };
      })
      .sort((a, b) => b.value - a.value)
      .slice(0, 15);
  }, [rows, xAxisKey, yAxisKey, aggregation]);

  const totalSum = useMemo(() => {
    return chartData.reduce((acc, curr) => acc + curr.value, 0);
  }, [chartData]);

  return (
    <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-6 select-none">
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 pb-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-lime-600 uppercase tracking-wider mb-1">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Interactive Dynamic Pivot & Chart Builder</span>
          </div>
          <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">
            Custom Visual Analysis Engine
          </h2>
        </div>

        <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200 text-xs font-bold">
          <button
            onClick={() => setChartType('bar')}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg transition cursor-pointer ${
              chartType === 'bar' ? 'bg-slate-900 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <BarChart3 className="w-3.5 h-3.5" />
            <span>Bar Chart</span>
          </button>
          <button
            onClick={() => setChartType('line')}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg transition cursor-pointer ${
              chartType === 'line' ? 'bg-slate-900 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <LineIcon className="w-3.5 h-3.5" />
            <span>Line Chart</span>
          </button>
          <button
            onClick={() => setChartType('pie')}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg transition cursor-pointer ${
              chartType === 'pie' ? 'bg-slate-900 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <PieIcon className="w-3.5 h-3.5" />
            <span>Donut Chart</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 bg-slate-50 p-4 rounded-xl border border-slate-200">
        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1">
            Grouping Dimension (X-Axis):
          </label>
          <select
            value={xAxisKey}
            onChange={(e) => setXAxisKey(e.target.value)}
            className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-xs font-semibold text-slate-800 focus:ring-2 focus:ring-lime-500 focus:outline-hidden"
          >
            {headers.map((h) => (
              <option key={h} value={h}>
                {h}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1">
            Metric Measure (Y-Axis):
          </label>
          <select
            value={yAxisKey}
            onChange={(e) => setYAxisKey(e.target.value)}
            className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-xs font-semibold text-slate-800 focus:ring-2 focus:ring-lime-500 focus:outline-hidden"
          >
            {headers.map((h) => (
              <option key={h} value={h}>
                {h}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1">
            Aggregation Method:
          </label>
          <select
            value={aggregation}
            onChange={(e) => setAggregation(e.target.value as any)}
            className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-xs font-semibold text-slate-800 focus:ring-2 focus:ring-lime-500 focus:outline-hidden"
          >
            <option value="sum">Sum (Total)</option>
            <option value="avg">Average (Mean)</option>
            <option value="count">Count (Frequency)</option>
          </select>
        </div>
      </div>

      <div className="w-full h-80">
        {chartData.length === 0 ? (
          <div className="w-full h-full flex items-center justify-center text-slate-400 text-sm">
            Select X and Y axes to generate custom chart.
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            {chartType === 'bar' ? (
              <BarChart data={chartData} margin={{ top: 10, right: 20, left: 10, bottom: 40 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                <XAxis
                  dataKey="name"
                  stroke="#64748B"
                  fontSize={11}
                  angle={-25}
                  textAnchor="end"
                  tickLine={false}
                />
                <YAxis stroke="#64748B" fontSize={11} tickLine={false} />
                <Tooltip
                  content={
                    <CustomTooltip
                      totalSum={totalSum}
                      valueFormatter={(v) => `${v.toLocaleString()}`}
                    />
                  }
                />
                <Bar dataKey="value" fill="#22C55E" radius={[6, 6, 0, 0]} />
              </BarChart>
            ) : chartType === 'line' ? (
              <LineChart data={chartData} margin={{ top: 10, right: 20, left: 10, bottom: 40 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                <XAxis
                  dataKey="name"
                  stroke="#64748B"
                  fontSize={11}
                  angle={-25}
                  textAnchor="end"
                  tickLine={false}
                />
                <YAxis stroke="#64748B" fontSize={11} tickLine={false} />
                <Tooltip
                  content={
                    <CustomTooltip
                      totalSum={totalSum}
                      valueFormatter={(v) => `${v.toLocaleString()}`}
                    />
                  }
                />
                <Line type="monotone" dataKey="value" stroke="#0EA5E9" strokeWidth={3} dot={{ r: 4 }} />
              </LineChart>
            ) : (
              <PieChart>
                <Pie
                  data={chartData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={110}
                  innerRadius={55}
                  paddingAngle={3}
                >
                  {chartData.map((_, idx) => (
                    <Cell key={idx} fill={PALETTE[idx % PALETTE.length]} />
                  ))}
                </Pie>
                <Tooltip
                  content={
                    <CustomTooltip
                      totalSum={totalSum}
                      valueFormatter={(v) => `${v.toLocaleString()}`}
                    />
                  }
                />
              </PieChart>
            )}
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
};
