import React, { useState, useMemo } from 'react';
import { Search, ChevronLeft, ChevronRight, Download, Table } from 'lucide-react';
import type { ProcessedRow } from '../types';

interface DataTableProps {
  rows: ProcessedRow[];
  headers: string[];
  onExportCsv: () => void;
}

export const DataTable: React.FC<DataTableProps> = ({ rows, headers, onExportCsv }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 15;

  const filteredRows = useMemo(() => {
    if (!searchTerm.trim()) return rows;
    const term = searchTerm.toLowerCase();

    return rows.filter((row) =>
      headers.some((h) => String(row[h] ?? '').toLowerCase().includes(term))
    );
  }, [rows, headers, searchTerm]);

  const totalPages = Math.ceil(filteredRows.length / pageSize) || 1;

  const pageRows = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredRows.slice(start, start + pageSize);
  }, [filteredRows, currentPage]);

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 space-y-4 select-none">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-emerald-700 uppercase tracking-wider mb-1">
            <Table className="w-3.5 h-3.5" />
            <span>Cleaned Transaction Audit Table</span>
          </div>
          <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">
            Raw & Sanitized Dataset Records
          </h2>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search all records..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              className="pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:ring-2 focus:ring-lime-500 focus:outline-hidden w-64"
            />
          </div>

          <button
            onClick={onExportCsv}
            className="flex items-center gap-2 px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition shadow-xs cursor-pointer"
          >
            <Download className="w-3.5 h-3.5 text-lime-400" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      <div className="overflow-x-auto border border-slate-200 rounded-xl">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-100 border-b border-slate-200 text-slate-700 uppercase font-bold tracking-wider select-none">
            <tr>
              <th className="py-3 px-4 w-12 text-center text-slate-400">#</th>
              {headers.map((header) => (
                <th key={header} className="py-3 px-4 whitespace-nowrap">
                  {header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 font-medium text-slate-800">
            {pageRows.length === 0 ? (
              <tr>
                <td colSpan={headers.length + 1} className="py-8 text-center text-slate-400">
                  No matching records found for "{searchTerm}".
                </td>
              </tr>
            ) : (
              pageRows.map((row, idx) => (
                <tr key={idx} className="hover:bg-slate-50/80 transition">
                  <td className="py-3 px-4 text-center font-mono text-slate-400">
                    {(currentPage - 1) * pageSize + idx + 1}
                  </td>
                  {headers.map((header) => (
                    <td key={header} className="py-3 px-4 whitespace-nowrap">
                      {typeof row[header] === 'number'
                        ? row[header].toLocaleString('en-IN')
                        : String(row[header] ?? '')}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div className="flex items-center justify-between text-xs text-slate-500 pt-2">
        <span>
          Showing <span className="font-bold text-slate-800">{pageRows.length}</span> of{' '}
          <span className="font-bold text-slate-800">{filteredRows.length}</span> total rows
        </span>

        <div className="flex items-center gap-2">
          <button
            disabled={currentPage === 1}
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed transition cursor-pointer"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <span className="font-bold text-slate-700">
            Page {currentPage} of {totalPages}
          </span>
          <button
            disabled={currentPage === totalPages}
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed transition cursor-pointer"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
