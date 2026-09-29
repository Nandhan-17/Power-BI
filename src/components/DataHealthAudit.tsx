import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShieldCheck, X, Database } from 'lucide-react';
import type { AuditStats } from '../types';

interface DataHealthAuditProps {
  audit: AuditStats;
  fileName: string;
}

export const DataHealthAudit: React.FC<DataHealthAuditProps> = ({ audit }) => {
  const [isVisible, setIsVisible] = useState(true);

  if (!isVisible) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, height: 0 }}
        className="bg-gradient-to-r from-emerald-900 via-emerald-950 to-slate-900 border-b border-emerald-800/80 px-4 py-3 text-slate-100 shadow-md select-none"
      >
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3 text-xs sm:text-sm">
          <div className="flex items-center gap-2.5 font-medium">
            <div className="w-6 h-6 rounded-full bg-lime-400/20 text-lime-400 flex items-center justify-center shrink-0 border border-lime-400/40">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <span className="text-lime-300 font-bold">Dataset Verified:</span>
            <span className="text-slate-200">
              <span className="font-extrabold text-white">{audit.cleanRowsCount.toLocaleString()}</span> clean rows loaded
            </span>
            <span className="text-slate-500">|</span>
            <span className="text-slate-200">
              <span className="font-extrabold text-amber-400">{audit.duplicatesPurged.toLocaleString()}</span> duplicates purged
            </span>
            <span className="text-slate-500">|</span>
            <span className="text-slate-200">
              <span className="font-extrabold text-cyan-400">{audit.nullValuesResolved.toLocaleString()}</span> null values resolved
            </span>
          </div>

          <div className="flex items-center gap-2">
            <div className="hidden lg:flex items-center gap-1.5 bg-slate-800/90 px-3 py-1 rounded-full border border-slate-700 text-xs text-slate-300">
              <Database className="w-3.5 h-3.5 text-lime-400" />
              <span>Mapped: {audit.columnsDetected.length} core fields</span>
            </div>
            
            <button
              onClick={() => setIsVisible(false)}
              className="p-1 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition"
              title="Dismiss Audit Banner"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};
