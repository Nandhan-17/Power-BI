import React from 'react';
import { 
  ShoppingBag, 
  Laptop, 
  Shirt, 
  Store, 
  RotateCcw, 
  FileSpreadsheet,
  Clock,
  Download
} from 'lucide-react';
import type { DatasetMeta } from '../types';

interface HeaderProps {
  meta: DatasetMeta;
  onReset: () => void;
  onExportCsv?: () => void;
}

export const Header: React.FC<HeaderProps> = ({ meta, onReset, onExportCsv }) => {
  const getBrandBadge = () => {
    switch (meta.categoryType) {
      case 'grocery':
        return {
          icon: <ShoppingBag className="w-4 h-4 text-emerald-950" />,
          label: 'Grocery Store Analytics',
          bgColor: 'bg-gradient-to-r from-lime-400 to-emerald-400 text-emerald-950'
        };
      case 'electronics':
        return {
          icon: <Laptop className="w-4 h-4 text-cyan-950" />,
          label: 'Tech & Electronics Analytics',
          bgColor: 'bg-gradient-to-r from-cyan-400 to-blue-400 text-slate-950'
        };
      case 'fashion':
        return {
          icon: <Shirt className="w-4 h-4 text-fuchsia-950" />,
          label: 'Fashion & Apparel Analytics',
          bgColor: 'bg-gradient-to-r from-fuchsia-400 to-pink-400 text-slate-950'
        };
      default:
        return {
          icon: <Store className="w-4 h-4 text-amber-950" />,
          label: 'General E-Commerce Analytics',
          bgColor: 'bg-gradient-to-r from-amber-400 to-orange-400 text-slate-950'
        };
    }
  };

  const badge = getBrandBadge();

  return (
    <header className="bg-white border-b border-slate-200 px-6 py-4 flex flex-wrap items-center justify-between gap-4 sticky top-0 z-20 shadow-xs select-none">
      <div className="flex items-center gap-4 min-w-0">
        <div className={`px-3 py-1.5 rounded-full flex items-center gap-2 font-bold text-xs shadow-xs ${badge.bgColor}`}>
          {badge.icon}
          <span>{badge.label}</span>
        </div>

        <div className="h-6 w-px bg-slate-200 hidden sm:block" />

        <div className="min-w-0">
          <h1 className="text-xl font-bold text-slate-900 truncate tracking-tight">
            {meta.sanitizedTitle}
          </h1>
          <div className="flex items-center gap-3 text-xs text-slate-500 mt-0.5">
            <span className="flex items-center gap-1 font-mono bg-slate-100 px-2 py-0.5 rounded text-slate-600">
              <FileSpreadsheet className="w-3 h-3 text-slate-500" />
              {meta.fileName}
            </span>
            <span className="flex items-center gap-1">
              <Clock className="w-3 h-3 text-slate-400" />
              Uploaded at {meta.uploadedAt}
            </span>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-3">
        {onExportCsv && (
          <button
            onClick={onExportCsv}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs transition border border-slate-200 cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export Cleaned CSV</span>
          </button>
        )}

        <button
          onClick={onReset}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs transition shadow-md hover:shadow-lg active:scale-95 cursor-pointer"
        >
          <RotateCcw className="w-3.5 h-3.5 text-lime-400" />
          <span>Upload New CSV / Reset</span>
        </button>
      </div>
    </header>
  );
};
