import React from 'react';
import { CheckCircle2, AlertCircle, Database } from 'lucide-react';
import type { ParsedDataset } from '../types';

interface DataSchemaAuditViewProps {
  dataset: ParsedDataset;
}

export const DataSchemaAuditView: React.FC<DataSchemaAuditViewProps> = ({ dataset }) => {
  const { audit, mapping } = dataset;

  const schemaItems = [
    { name: 'Revenue / Sales Amount', field: mapping.revenueKey, role: 'Numeric Metric (KPI, Donut, Bar)' },
    { name: 'Order / Transaction ID', field: mapping.orderKey, role: 'Unique ID & Deduplication Key' },
    { name: 'Customer / Buyer ID', field: mapping.customerKey, role: 'Unique Customer Count' },
    { name: 'Date / Timestamp', field: mapping.dateKey, role: 'Timeline Trend Axis' },
    { name: 'Category / Department', field: mapping.categoryKey, role: 'Donut Slice Breakdown' },
    { name: 'Product Name / Title', field: mapping.productKey, role: 'Top Leaderboard Dimension' },
    { name: 'City / Location', field: mapping.locationKey, role: 'Geographic Leaderboard Dimension' },
    { name: 'Quantity / Units', field: mapping.quantityKey, role: 'Total Units Sold Metric' },
  ];

  return (
    <div className="space-y-6 select-none">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
            Raw Input Rows
          </div>
          <div className="text-3xl font-black text-slate-900 font-mono">
            {audit.totalRawRows.toLocaleString()}
          </div>
          <p className="text-xs text-slate-400 mt-1">Total parsed before cleaning</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <div className="text-xs font-bold text-emerald-600 uppercase tracking-wider mb-1">
            Verified Clean Rows
          </div>
          <div className="text-3xl font-black text-emerald-600 font-mono">
            {audit.cleanRowsCount.toLocaleString()}
          </div>
          <p className="text-xs text-slate-400 mt-1">100% verified & in-memory</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <div className="text-xs font-bold text-amber-600 uppercase tracking-wider mb-1">
            Deduplication & Null Purge
          </div>
          <div className="text-3xl font-black text-amber-600 font-mono">
            {(audit.duplicatesPurged + audit.nullValuesResolved).toLocaleString()}
          </div>
          <p className="text-xs text-slate-400 mt-1">
            {audit.duplicatesPurged} duplicates + {audit.nullValuesResolved} null cells resolved
          </p>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6">
        <div className="flex items-center gap-2 text-xs font-bold text-emerald-700 uppercase tracking-wider mb-1">
          <Database className="w-3.5 h-3.5" />
          <span>Fuzzy Column Mapping Matrix</span>
        </div>
        <h3 className="text-xl font-extrabold text-slate-900 tracking-tight mb-4">
          Core Column Auto-Detection Audit
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {schemaItems.map((item) => {
            const isMapped = !!item.field;
            return (
              <div
                key={item.name}
                className={`p-4 rounded-xl border flex items-center justify-between transition ${
                  isMapped
                    ? 'bg-emerald-50/50 border-emerald-200 text-slate-900'
                    : 'bg-slate-50 border-slate-200 text-slate-500 opacity-75'
                }`}
              >
                <div>
                  <div className="text-sm font-bold text-slate-900 flex items-center gap-2">
                    <span>{item.name}</span>
                  </div>
                  <div className="text-xs text-slate-400 mt-0.5">{item.role}</div>
                </div>

                <div className="text-right">
                  {isMapped ? (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-emerald-600 text-white text-xs font-bold shadow-xs font-mono">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      {item.field}
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-slate-200 text-slate-600 text-xs font-semibold">
                      <AlertCircle className="w-3.5 h-3.5 text-slate-400" />
                      Not Detected
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
