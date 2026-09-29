import React, { useMemo, useState } from 'react';
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip, Sector } from 'recharts';
import { PieChart as PieIcon } from 'lucide-react';
import type { ProcessedRow, ColumnMapping } from '../../types';
import { MissingColumnPlaceholder } from './MissingColumnPlaceholder';
import { CustomTooltip } from './CustomTooltip';

interface CategoryDonutChartProps {
  rows: ProcessedRow[];
  mapping: ColumnMapping;
}

const DONUT_COLORS = [
  '#22C55E',
  '#0EA5E9',
  '#A855F7',
  '#F59E0B',
  '#EC4899',
  '#14B8A6',
  '#6366F1',
  '#F97316'
];

export const CategoryDonutChart: React.FC<CategoryDonutChartProps> = ({ rows, mapping }) => {
  const [activeIndex, setActiveIndex] = useState<number | undefined>(undefined);

  const categoryKey = mapping.categoryKey;
  const revenueKey = mapping.revenueKey;

  const data = useMemo(() => {
    if (!categoryKey) return [];

    const categoryMap: { [cat: string]: number } = {};

    for (const row of rows) {
      const cat = String(row[categoryKey] || 'Uncategorized').trim();
      const val = revenueKey ? (Number(row[revenueKey]) || 0) : 1;
      categoryMap[cat] = (categoryMap[cat] || 0) + val;
    }

    return Object.entries(categoryMap)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);
  }, [rows, categoryKey, revenueKey]);

  const totalSum = useMemo(() => {
    return data.reduce((acc, curr) => acc + curr.value, 0);
  }, [data]);

  if (!categoryKey) {
    return (
      <MissingColumnPlaceholder
        chartTitle="Category Breakdown"
        requiredColumns={['Category / Department / Segment']}
      />
    );
  }

  if (data.length === 0) {
    return (
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs flex items-center justify-center min-h-[380px] text-slate-400 text-sm">
        No category records available.
      </div>
    );
  }

  const renderActiveShape = (props: any) => {
    const { cx, cy, innerRadius, outerRadius, startAngle, endAngle, fill } = props;
    return (
      <g>
        <Sector
          cx={cx}
          cy={cy}
          innerRadius={innerRadius - 2}
          outerRadius={outerRadius + 8}
          startAngle={startAngle}
          endAngle={endAngle}
          fill={fill}
          style={{ filter: 'drop-shadow(0px 8px 12px rgba(0, 0, 0, 0.15))' }}
        />
      </g>
    );
  };

  const formatTooltipVal = (val: number) => {
    return revenueKey
      ? `₹ ${Math.round(val).toLocaleString('en-IN')}`
      : `${val.toLocaleString()} Items`;
  };

  return (
    <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs flex flex-col justify-between h-[380px] relative overflow-hidden select-none">
      <div className="mb-2">
        <div className="flex items-center gap-2 text-xs font-semibold text-emerald-700 uppercase tracking-wider mb-1">
          <PieIcon className="w-3.5 h-3.5" />
          <span>Category Share</span>
        </div>
        <h3 className="text-lg font-extrabold text-slate-900 tracking-tight">
          {revenueKey ? 'Revenue by Category' : 'Volume by Category'}
        </h3>
      </div>

      <div className="w-full h-56 relative flex items-center justify-center">
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none z-10">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">
            Total {revenueKey ? 'Sales' : 'Count'}
          </span>
          <span className="text-xl font-black text-slate-900 tracking-tight font-mono">
            {revenueKey ? `₹${(totalSum / 1000).toFixed(1)}k` : totalSum.toLocaleString()}
          </span>
        </div>

        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              {...({
                activeIndex,
                activeShape: renderActiveShape,
                data,
                cx: "50%",
                cy: "50%",
                innerRadius: 65,
                outerRadius: 92,
                paddingAngle: 4,
                dataKey: "value",
                startAngle: 0,
                endAngle: 360,
                isAnimationActive: true,
                animationDuration: 1200,
                animationEasing: "ease-out",
                onMouseEnter: (_: any, index: number) => setActiveIndex(index),
                onMouseLeave: () => setActiveIndex(undefined)
              } as any)}
            >
              {data.map((_, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={DONUT_COLORS[index % DONUT_COLORS.length]}
                  stroke="#FFFFFF"
                  strokeWidth={2}
                />
              ))}
            </Pie>
            <Tooltip
              content={
                <CustomTooltip
                  totalSum={totalSum}
                  valueFormatter={formatTooltipVal}
                />
              }
            />
          </PieChart>
        </ResponsiveContainer>
      </div>

      <div className="flex items-center justify-center flex-wrap gap-x-4 gap-y-1 mt-2 text-xs">
        {data.slice(0, 5).map((item, idx) => (
          <div key={item.name} className="flex items-center gap-1.5 text-slate-600 font-medium truncate max-w-[120px]">
            <span
              className="w-2.5 h-2.5 rounded-full shrink-0"
              style={{ backgroundColor: DONUT_COLORS[idx % DONUT_COLORS.length] }}
            />
            <span className="truncate">{item.name}</span>
          </div>
        ))}
        {data.length > 5 && (
          <span className="text-slate-400 text-[11px] font-semibold">
            +{data.length - 5} more
          </span>
        )}
      </div>
    </div>
  );
};
