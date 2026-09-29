import React from 'react';

interface CustomTooltipProps {
  active?: boolean;
  payload?: any[];
  label?: string;
  totalSum?: number;
  valueFormatter?: (val: number) => string;
}

export const CustomTooltip: React.FC<CustomTooltipProps> = ({
  active,
  payload,
  label,
  totalSum,
  valueFormatter
}) => {
  if (!active || !payload || !payload.length) return null;

  const dataPoint = payload[0];
  const value = Number(dataPoint.value || 0);
  const color = dataPoint.color || dataPoint.fill || '#84CC16';
  const name = dataPoint.name || label || dataPoint.payload?.name || 'Item';

  const percentage = totalSum && totalSum > 0 ? ((value / totalSum) * 100).toFixed(1) : null;

  const formattedVal = valueFormatter
    ? valueFormatter(value)
    : `₹ ${Math.round(value).toLocaleString('en-IN')}`;

  return (
    <div className="bg-slate-900/95 text-white rounded-xl shadow-2xl p-3.5 border border-slate-700 backdrop-blur-md min-w-[180px] z-50">
      <div className="flex items-center gap-2 mb-2 pb-1.5 border-b border-slate-800">
        <span
          className="w-3 h-3 rounded-full shrink-0 shadow-xs"
          style={{ backgroundColor: color }}
        />
        <span className="text-xs font-bold text-slate-100 truncate">{name}</span>
      </div>

      <div className="space-y-1">
        <div className="flex items-center justify-between gap-4 text-xs">
          <span className="text-slate-400">Total Value:</span>
          <span className="font-extrabold text-white font-mono">{formattedVal}</span>
        </div>

        {percentage && (
          <div className="flex items-center justify-between gap-4 text-xs">
            <span className="text-slate-400">Contribution:</span>
            <span className="font-bold text-lime-400 font-mono">{percentage}%</span>
          </div>
        )}
      </div>
    </div>
  );
};
