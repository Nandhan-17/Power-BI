import React, { useMemo, useState } from 'react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Cell, CartesianGrid } from 'recharts';
import { Award, MapPin, Package } from 'lucide-react';
import type { ProcessedRow, ColumnMapping } from '../../types';
import { MissingColumnPlaceholder } from './MissingColumnPlaceholder';
import { CustomTooltip } from './CustomTooltip';

interface TopRankedBarChartProps {
  rows: ProcessedRow[];
  mapping: ColumnMapping;
}

export const TopRankedBarChart: React.FC<TopRankedBarChartProps> = ({ rows, mapping }) => {
  const productKey = mapping.productKey;
  const locationKey = mapping.locationKey;
  const revenueKey = mapping.revenueKey;

  const [activeDimension, setActiveDimension] = useState<'product' | 'location'>(
    productKey ? 'product' : 'location'
  );
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  const dimensionKey = activeDimension === 'product' ? productKey : locationKey;

  const data = useMemo(() => {
    if (!dimensionKey) return [];

    const entityMap: { [entity: string]: number } = {};

    for (const row of rows) {
      const entity = String(row[dimensionKey] || 'Unknown').trim();
      const val = revenueKey ? (Number(row[revenueKey]) || 0) : 1;
      entityMap[entity] = (entityMap[entity] || 0) + val;
    }

    return Object.entries(entityMap)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 7);
  }, [rows, dimensionKey, revenueKey]);

  const totalSum = useMemo(() => {
    return data.reduce((acc, curr) => acc + curr.value, 0);
  }, [data]);

  if (!productKey && !locationKey) {
    return (
      <MissingColumnPlaceholder
        chartTitle="Top Ranked Entities"
        requiredColumns={['Product Name / SKU', 'City / Location']}
      />
    );
  }

  if (data.length === 0) {
    return (
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs flex items-center justify-center min-h-[380px] text-slate-400 text-sm">
        No ranked entity data available.
      </div>
    );
  }

  const formatTooltipVal = (val: number) => {
    return revenueKey
      ? `₹ ${Math.round(val).toLocaleString('en-IN')}`
      : `${val.toLocaleString()} Orders`;
  };

  const formatXAxis = (val: number) => {
    if (revenueKey) {
      if (val >= 1000000) return `₹${(val / 1000000).toFixed(1)}M`;
      if (val >= 1000) return `₹${(val / 1000).toFixed(0)}k`;
      return `₹${val}`;
    }
    return String(val);
  };

  return (
    <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs flex flex-col justify-between h-[380px] select-none">
      <div className="flex items-center justify-between mb-2">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-emerald-700 uppercase tracking-wider mb-1">
            <Award className="w-3.5 h-3.5" />
            <span>Power BI Leaderboard</span>
          </div>
          <h3 className="text-lg font-extrabold text-slate-900 tracking-tight">
            Top Ranked {activeDimension === 'product' ? 'Products' : 'Cities'}
          </h3>
        </div>

        {productKey && locationKey && (
          <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200 text-xs font-bold">
            <button
              onClick={() => setActiveDimension('product')}
              className={`flex items-center gap-1 px-3 py-1.5 rounded-lg transition cursor-pointer ${
                activeDimension === 'product'
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Package className="w-3 h-3" />
              <span>Products</span>
            </button>
            <button
              onClick={() => setActiveDimension('location')}
              className={`flex items-center gap-1 px-3 py-1.5 rounded-lg transition cursor-pointer ${
                activeDimension === 'location'
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <MapPin className="w-3 h-3" />
              <span>Cities</span>
            </button>
          </div>
        )}
      </div>

      <div className="w-full h-64">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={data}
            layout="vertical"
            margin={{ top: 5, right: 20, left: 30, bottom: 5 }}
            onMouseMove={(state: any) => {
              if (state && typeof state.activeTooltipIndex === 'number') {
                setHoveredIndex(state.activeTooltipIndex);
              }
            }}
            onMouseLeave={() => setHoveredIndex(null)}
          >
            <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#E2E8F0" />
            <XAxis
              type="number"
              stroke="#64748B"
              fontSize={11}
              tickLine={false}
              axisLine={{ stroke: '#E2E8F0' }}
              tickFormatter={formatXAxis}
            />
            <YAxis
              type="category"
              dataKey="name"
              stroke="#0F172A"
              fontSize={11}
              fontWeight={600}
              tickLine={false}
              axisLine={{ stroke: '#E2E8F0' }}
              width={110}
              tickFormatter={(val) => (val.length > 14 ? `${val.slice(0, 12)}...` : val)}
            />
            <Tooltip
              content={
                <CustomTooltip
                  totalSum={totalSum}
                  valueFormatter={formatTooltipVal}
                />
              }
            />
            <Bar
              dataKey="value"
              radius={[0, 8, 8, 0]}
              barSize={18}
              isAnimationActive={true}
              animationDuration={1000}
              animationEasing="ease-out"
            >
              {data.map((_, index) => {
                const isHovered = hoveredIndex === index;
                const isAnyHovered = hoveredIndex !== null;
                const opacity = isAnyHovered ? (isHovered ? 1 : 0.45) : 1;
                return (
                  <Cell
                    key={`cell-${index}`}
                    fill={isHovered ? '#84CC16' : '#15803D'}
                    opacity={opacity}
                    style={{ transition: 'opacity 0.2s ease, fill 0.2s ease' }}
                  />
                );
              })}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
