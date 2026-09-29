import React from 'react';
import { AlertTriangle, FileX2 } from 'lucide-react';

interface MissingColumnPlaceholderProps {
  chartTitle: string;
  requiredColumns: string[];
}

export const MissingColumnPlaceholder: React.FC<MissingColumnPlaceholderProps> = ({
  chartTitle,
  requiredColumns
}) => {
  return (
    <div className="bg-white rounded-2xl p-6 border border-slate-200 border-dashed shadow-xs flex flex-col items-center justify-center min-h-[320px] text-center relative overflow-hidden group">
      <div className="w-14 h-14 rounded-2xl bg-amber-50 text-amber-500 flex items-center justify-center mb-4 border border-amber-200 group-hover:scale-105 transition-transform">
        <FileX2 className="w-7 h-7" />
      </div>

      <h4 className="text-base font-bold text-slate-800 mb-1">{chartTitle} Visual Unavailable</h4>

      <div className="flex items-center gap-1.5 text-amber-700 bg-amber-50/90 border border-amber-200 px-3.5 py-1.5 rounded-xl text-xs font-semibold my-2">
        <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
        <span>
          Data Not Found: Required column {requiredColumns.map(c => `'${c}'`).join(' or ')} is missing in the uploaded CSV.
        </span>
      </div>

      <p className="text-xs text-slate-400 max-w-sm mt-1">
        This visual card is disabled per strict Zero Hardcoding enforcement. Upload a dataset containing {requiredColumns.join(', ')} to render this Power BI chart automatically.
      </p>
    </div>
  );
};
