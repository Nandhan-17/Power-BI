import React, { useState, useMemo, useCallback } from 'react';
import Papa from 'papaparse';
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
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import {
  Upload,
  FileText,
  TrendingUp,
  BarChart2,
  PieChart as PieIcon,
  LineChart as LineIcon,
  Table as TableIcon,
  Search,
  ArrowUpDown,
  ChevronUp,
  ChevronDown,
  Trash2,
  Download,
  Sparkles,
  RefreshCw,
  AlertCircle,
  Layers,
  CheckCircle2,
  Sliders,
  Hash,
  FileSpreadsheet,
} from 'lucide-react';

// Type definitions
type ColumnType = 'numeric' | 'date' | 'categorical';

interface ColumnMeta {
  name: string;
  type: ColumnType;
  sum: number;
  avg: number;
  min: number;
  max: number;
}

interface ParsedFileInfo {
  name: string;
  size: number;
  rowCount: number;
  colCount: number;
}

const CHART_COLORS = [
  '#6366f1', // Indigo
  '#8b5cf6', // Violet
  '#ec4899', // Pink
  '#06b6d4', // Cyan
  '#10b981', // Emerald
  '#f59e0b', // Amber
  '#ef4444', // Red
  '#3b82f6', // Blue
];

// Sample CSV dataset for instant preview
const SAMPLE_CSV_DATA = [
  { Date: '2026-01-05', Region: 'North America', Category: 'Cloud Hosting', Rep: 'Sarah Jenkins', Units: 45, Revenue: 13500, Profit: 4050, CSAT: 4.8 },
  { Date: '2026-01-12', Region: 'Europe', Category: 'Enterprise SaaS', Rep: 'Mark Vance', Units: 28, Revenue: 22400, Profit: 8960, CSAT: 4.5 },
  { Date: '2026-01-18', Region: 'Asia Pacific', Category: 'Cloud Hosting', Rep: 'Aria Chen', Units: 62, Revenue: 18600, Profit: 5580, CSAT: 4.9 },
  { Date: '2026-01-25', Region: 'North America', Category: 'Security Suite', Rep: 'Sarah Jenkins', Units: 34, Revenue: 27200, Profit: 9520, CSAT: 4.7 },
  { Date: '2026-02-02', Region: 'Latin America', Category: 'Analytics Pro', Rep: 'Diego Torres', Units: 19, Revenue: 9500, Profit: 2850, CSAT: 4.2 },
  { Date: '2026-02-09', Region: 'Europe', Category: 'Security Suite', Rep: 'Emma Watson', Units: 51, Revenue: 40800, Profit: 14280, CSAT: 4.6 },
  { Date: '2026-02-15', Region: 'Asia Pacific', Category: 'Enterprise SaaS', Rep: 'Aria Chen', Units: 40, Revenue: 32000, Profit: 12800, CSAT: 4.8 },
  { Date: '2026-02-22', Region: 'North America', Category: 'Analytics Pro', Rep: 'Alex Rivera', Units: 73, Revenue: 36500, Profit: 10950, CSAT: 4.4 },
  { Date: '2026-03-01', Region: 'Europe', Category: 'Cloud Hosting', Rep: 'Mark Vance', Units: 38, Revenue: 11400, Profit: 3420, CSAT: 4.3 },
  { Date: '2026-03-08', Region: 'Latin America', Category: 'Enterprise SaaS', Rep: 'Diego Torres', Units: 22, Revenue: 17600, Profit: 7040, CSAT: 4.1 },
  { Date: '2026-03-15', Region: 'North America', Category: 'Security Suite', Rep: 'Alex Rivera', Units: 58, Revenue: 46400, Profit: 16240, CSAT: 4.9 },
  { Date: '2026-03-22', Region: 'Asia Pacific', Category: 'Analytics Pro', Rep: 'Aria Chen', Units: 85, Revenue: 42500, Profit: 12750, CSAT: 4.7 },
  { Date: '2026-03-29', Region: 'Europe', Category: 'Cloud Hosting', Rep: 'Emma Watson', Units: 44, Revenue: 13200, Profit: 3960, CSAT: 4.6 },
  { Date: '2026-04-05', Region: 'North America', Category: 'Enterprise SaaS', Rep: 'Sarah Jenkins', Units: 39, Revenue: 31200, Profit: 12480, CSAT: 4.8 },
  { Date: '2026-04-12', Region: 'Asia Pacific', Category: 'Security Suite', Rep: 'Aria Chen', Units: 67, Revenue: 53600, Profit: 18760, CSAT: 4.9 },
];

export default function App() {
  const [data, setData] = useState<Record<string, any>[]>([]);
  const [fileInfo, setFileInfo] = useState<ParsedFileInfo | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isDragOver, setIsDragOver] = useState<boolean>(false);

  // Visualization state
  const [xAxisKey, setXAxisKey] = useState<string>('');
  const [yAxisKey, setYAxisKey] = useState<string>('');
  const [aggregation, setAggregation] = useState<'sum' | 'avg' | 'count'>('sum');

  // Table state
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [sortColumn, setSortColumn] = useState<string | null>(null);
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(10);

  // Clean raw cell string to numeric value
  const parseNumericValue = (val: any): number => {
    if (typeof val === 'number') return val;
    if (!val) return 0;
    const str = String(val).replace(/[\$,]/g, '').trim();
    const num = parseFloat(str);
    return isNaN(num) ? 0 : num;
  };

  // Inspect dataset columns and infer dynamic types & metrics
  const columnsMeta = useMemo<ColumnMeta[]>(() => {
    if (!data || data.length === 0) return [];
    const keys = Object.keys(data[0]);

    return keys.map((key) => {
      const values = data.map((row) => row[key]).filter((v) => v !== null && v !== undefined && v !== '');
      let numericCount = 0;
      let dateCount = 0;
      const sampleSize = Math.min(values.length, 100);

      let sum = 0;
      let min = Infinity;
      let max = -Infinity;

      values.forEach((v) => {
        const str = String(v).trim();
        const num = parseNumericValue(v);

        if (!isNaN(num) && str !== '') {
          numericCount++;
          sum += num;
          if (num < min) min = num;
          if (num > max) max = num;
        }

        if (str.length >= 6 && !isNaN(Date.parse(str)) && isNaN(Number(str))) {
          dateCount++;
        }
      });

      let type: ColumnType = 'categorical';
      if (sampleSize > 0 && numericCount / sampleSize >= 0.7) {
        type = 'numeric';
      } else if (sampleSize > 0 && dateCount / sampleSize >= 0.7) {
        type = 'date';
      }

      const count = values.length || 1;
      return {
        name: key,
        type,
        sum: type === 'numeric' ? sum : 0,
        avg: type === 'numeric' ? sum / count : 0,
        min: type === 'numeric' && min !== Infinity ? min : 0,
        max: type === 'numeric' && max !== -Infinity ? max : 0,
      };
    });
  }, [data]);

  const numericColumns = useMemo(
    () => columnsMeta.filter((c) => c.type === 'numeric'),
    [columnsMeta]
  );
  const categoricalColumns = useMemo(
    () => columnsMeta.filter((c) => c.type === 'categorical' || c.type === 'date'),
    [columnsMeta]
  );

  // Auto-select initial chart dimensions when new dataset is parsed
  const initializeChartDefaults = useCallback((parsedData: Record<string, any>[]) => {
    if (!parsedData || parsedData.length === 0) return;
    const keys = Object.keys(parsedData[0]);
    if (keys.length === 0) return;

    let firstCat = keys[0];
    let firstNum = keys[keys.length - 1];

    keys.forEach((key) => {
      const sampleVal = parsedData[0][key];
      const num = parseFloat(String(sampleVal).replace(/[\$,]/g, ''));
      if (isNaN(num) && !firstCat) firstCat = key;
      if (!isNaN(num)) firstNum = key;
    });

    setXAxisKey(firstCat || keys[0]);
    setYAxisKey(firstNum || keys[0]);
  }, []);

  // Process uploaded CSV file via PapaParse
  const processCSVFile = (file: File) => {
    setIsLoading(true);
    setError(null);

    Papa.parse(file, {
      header: true,
      skipEmptyLines: 'greedy',
      dynamicTyping: true,
      complete: (results) => {
        setIsLoading(false);
        if (results.errors.length > 0 && results.data.length === 0) {
          setError(`CSV Parsing Error: ${results.errors[0].message}`);
          return;
        }

        const parsedData = results.data as Record<string, any>[];
        if (!parsedData || parsedData.length === 0) {
          setError('The uploaded CSV file is empty or contains no valid rows.');
          return;
        }

        const keys = Object.keys(parsedData[0] || {});
        if (keys.length === 0) {
          setError('Could not detect column headers in the CSV file.');
          return;
        }

        setData(parsedData);
        setFileInfo({
          name: file.name,
          size: file.size,
          rowCount: parsedData.length,
          colCount: keys.length,
        });

        initializeChartDefaults(parsedData);
        setCurrentPage(1);
      },
      error: (err) => {
        setIsLoading(false);
        setError(`Failed to read file: ${err.message}`);
      },
    });
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(false);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const droppedFile = e.dataTransfer.files[0];
      if (!droppedFile.name.endsWith('.csv')) {
        setError('Invalid file format. Please upload a standard .csv file.');
        return;
      }
      processCSVFile(droppedFile);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      processCSVFile(e.target.files[0]);
    }
  };

  const loadSampleDataset = () => {
    setError(null);
    setIsLoading(true);
    setTimeout(() => {
      setData(SAMPLE_CSV_DATA);
      setFileInfo({
        name: 'sample_tech_sales_q1.csv',
        size: 2048,
        rowCount: SAMPLE_CSV_DATA.length,
        colCount: Object.keys(SAMPLE_CSV_DATA[0]).length,
      });
      initializeChartDefaults(SAMPLE_CSV_DATA);
      setCurrentPage(1);
      setIsLoading(false);
    }, 300);
  };

  const resetData = () => {
    setData([]);
    setFileInfo(null);
    setError(null);
    setSearchTerm('');
    setSortColumn(null);
    setCurrentPage(1);
  };

  // Aggregation logic for Recharts visualizations
  const chartData = useMemo(() => {
    if (!data.length || !xAxisKey || !yAxisKey) return [];

    const map = new Map<string, { sum: number; count: number }>();

    data.forEach((row) => {
      const rawX = row[xAxisKey];
      const xKey = rawX !== undefined && rawX !== null && rawX !== '' ? String(rawX) : '(Blank)';
      const yVal = parseNumericValue(row[yAxisKey]);

      const existing = map.get(xKey) || { sum: 0, count: 0 };
      map.set(xKey, {
        sum: existing.sum + yVal,
        count: existing.count + 1,
      });
    });

    const result: { name: string; value: number; count: number }[] = [];
    map.forEach((val, key) => {
      let finalVal = val.sum;
      if (aggregation === 'avg') {
        finalVal = val.count > 0 ? val.sum / val.count : 0;
      } else if (aggregation === 'count') {
        finalVal = val.count;
      }

      result.push({
        name: key,
        value: Number(finalVal.toFixed(2)),
        count: val.count,
      });
    });

    // Limit to top 15 categories for clean visual display
    if (result.length > 15) {
      result.sort((a, b) => b.value - a.value);
      const top = result.slice(0, 14);
      const rest = result.slice(14);
      const otherSum = rest.reduce((acc, curr) => acc + curr.value, 0);
      top.push({ name: 'Other Categories', value: Number(otherSum.toFixed(2)), count: rest.length });
      return top;
    }

    return result;
  }, [data, xAxisKey, yAxisKey, aggregation]);

  // Filtered & Sorted Data Table Computation
  const filteredData = useMemo(() => {
    if (!data.length) return [];
    let result = [...data];

    if (searchTerm.trim()) {
      const lowerSearch = searchTerm.toLowerCase();
      result = result.filter((row) =>
        Object.values(row).some((val) =>
          String(val ?? '')
            .toLowerCase()
            .includes(lowerSearch)
        )
      );
    }

    if (sortColumn) {
      result.sort((a, b) => {
        const valA = a[sortColumn];
        const valB = b[sortColumn];

        const numA = parseNumericValue(valA);
        const numB = parseNumericValue(valB);

        let comparison = 0;
        if (typeof valA === 'number' || typeof valB === 'number' || (!isNaN(numA) && !isNaN(numB))) {
          comparison = numA - numB;
        } else {
          comparison = String(valA ?? '').localeCompare(String(valB ?? ''));
        }

        return sortDirection === 'asc' ? comparison : -comparison;
      });
    }

    return result;
  }, [data, searchTerm, sortColumn, sortDirection]);

  // Pagination bounds
  const totalPages = Math.ceil(filteredData.length / pageSize) || 1;
  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredData.slice(start, start + pageSize);
  }, [filteredData, currentPage, pageSize]);

  const handleSort = (colName: string) => {
    if (sortColumn === colName) {
      if (sortDirection === 'asc') {
        setSortDirection('desc');
      } else {
        setSortColumn(null);
        setSortDirection('asc');
      }
    } else {
      setSortColumn(colName);
      setSortDirection('asc');
    }
  };

  const exportFilteredCSV = () => {
    if (!filteredData.length) return;
    const csvContent = Papa.unparse(filteredData);
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `filtered_analytics_${fileInfo?.name || 'export.csv'}`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-indigo-500 selection:text-white">
      {/* Top Bar Header */}
      <header className="border-b border-slate-800/80 bg-slate-900/60 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-500 text-white shadow-lg shadow-indigo-500/20">
              <BarChart2 className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-lg font-bold tracking-tight text-white flex items-center gap-2">
                CSV Analytics Studio
                <span className="text-xs px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 font-medium">
                  Pro v2.4
                </span>
              </h1>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            {data.length > 0 ? (
              <>
                <button
                  onClick={exportFilteredCSV}
                  className="flex items-center space-x-2 px-3.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-sm font-medium transition-all shadow-sm active:scale-95"
                >
                  <Download className="w-4 h-4 text-emerald-400" />
                  <span>Export CSV</span>
                </button>

                <button
                  onClick={resetData}
                  className="flex items-center space-x-2 px-3.5 py-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/20 text-sm font-medium transition-all active:scale-95"
                >
                  <Trash2 className="w-4 h-4" />
                  <span>Clear Data</span>
                </button>
              </>
            ) : (
              <button
                onClick={loadSampleDataset}
                className="flex items-center space-x-2 px-4 py-2 rounded-lg bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white text-sm font-semibold shadow-md shadow-indigo-500/25 transition-all active:scale-95"
              >
                <Sparkles className="w-4 h-4" />
                <span>Load Demo Dataset</span>
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Error Alert Banner */}
        {error && (
          <div className="p-4 rounded-xl bg-rose-950/60 border border-rose-800/80 text-rose-200 flex items-start space-x-3 shadow-lg">
            <AlertCircle className="w-5 h-5 text-rose-400 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <h3 className="font-semibold text-rose-100">Upload / Parsing Error</h3>
              <p className="text-sm text-rose-300 mt-1">{error}</p>
            </div>
            <button
              onClick={() => setError(null)}
              className="text-rose-400 hover:text-rose-200 text-sm font-bold px-2 py-1"
            >
              ✕
            </button>
          </div>
        )}

        {/* State 1: Upload Dropzone (When no CSV loaded) */}
        {data.length === 0 && (
          <div className="max-w-3xl mx-auto py-8">
            <div
              onDragOver={(e) => {
                e.preventDefault();
                setIsDragOver(true);
              }}
              onDragLeave={() => setIsDragOver(false)}
              onDrop={handleDrop}
              className={`relative border-2 border-dashed rounded-2xl p-12 text-center transition-all duration-200 ${
                isDragOver
                  ? 'border-indigo-500 bg-indigo-500/10 scale-[1.01]'
                  : 'border-slate-800 bg-slate-900/40 hover:border-slate-700 hover:bg-slate-900/60'
              }`}
            >
              <input
                type="file"
                accept=".csv"
                onChange={handleFileSelect}
                id="csv-file-input"
                className="hidden"
              />

              <div className="w-16 h-16 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center mx-auto mb-5 shadow-inner">
                {isLoading ? (
                  <RefreshCw className="w-8 h-8 animate-spin text-indigo-400" />
                ) : (
                  <Upload className="w-8 h-8 text-indigo-400" />
                )}
              </div>

              <h2 className="text-xl font-bold text-white mb-2">Upload your CSV Data File</h2>
              <p className="text-slate-400 text-sm max-w-md mx-auto mb-6">
                Drag and drop your spreadsheet file here, or click to browse. Automatic header recognition & dynamic type detection.
              </p>

              <div className="flex items-center justify-center space-x-4">
                <label
                  htmlFor="csv-file-input"
                  className="cursor-pointer inline-flex items-center space-x-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-sm shadow-lg shadow-indigo-600/30 transition-all active:scale-95"
                >
                  <FileSpreadsheet className="w-4 h-4" />
                  <span>Choose CSV File</span>
                </label>

                <button
                  onClick={loadSampleDataset}
                  className="inline-flex items-center space-x-2 px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-sm border border-slate-700 transition-all active:scale-95"
                >
                  <Sparkles className="w-4 h-4 text-violet-400" />
                  <span>Try Demo CSV</span>
                </button>
              </div>

              <div className="mt-8 pt-6 border-t border-slate-800/60 flex items-center justify-center space-x-6 text-xs text-slate-500">
                <span className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> Client-Side Privacy
                </span>
                <span className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> Dynamic Recharts
                </span>
                <span className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> Instant Aggregations
                </span>
              </div>
            </div>
          </div>
        )}

        {/* State 2: Active Dashboard View */}
        {data.length > 0 && (
          <>
            {/* File Overview Summary Bar */}
            {fileInfo && (
              <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4 flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center space-x-3">
                  <div className="p-2.5 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                    <FileText className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="font-semibold text-white text-sm">{fileInfo.name}</h2>
                    <p className="text-xs text-slate-400">
                      {(fileInfo.size / 1024).toFixed(1)} KB • Uploaded & Parsed Successfully
                    </p>
                  </div>
                </div>

                <div className="flex items-center space-x-4 text-xs font-mono">
                  <div className="px-3 py-1.5 rounded-lg bg-slate-800/80 border border-slate-700 text-slate-300 flex items-center space-x-2">
                    <Layers className="w-3.5 h-3.5 text-indigo-400" />
                    <span>{fileInfo.rowCount.toLocaleString()} Rows</span>
                  </div>
                  <div className="px-3 py-1.5 rounded-lg bg-slate-800/80 border border-slate-700 text-slate-300 flex items-center space-x-2">
                    <Hash className="w-3.5 h-3.5 text-violet-400" />
                    <span>{fileInfo.colCount} Columns</span>
                  </div>
                </div>
              </div>
            )}

            {/* KPI Summary Metric Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Metric 1: Total Records */}
              <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5 hover:border-slate-700 transition-all">
                <div className="flex items-center justify-between text-slate-400 mb-2">
                  <span className="text-xs font-medium uppercase tracking-wider">Total Records</span>
                  <div className="p-2 rounded-lg bg-indigo-500/10 text-indigo-400">
                    <Layers className="w-4 h-4" />
                  </div>
                </div>
                <div className="text-2xl font-extrabold text-white tracking-tight">
                  {data.length.toLocaleString()}
                </div>
                <p className="text-xs text-slate-400 mt-1 flex items-center gap-1">
                  <TrendingUp className="w-3 h-3 text-emerald-400" />
                  <span>100% valid parsed data</span>
                </p>
              </div>

              {/* Metric 2: Column Breakdown */}
              <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5 hover:border-slate-700 transition-all">
                <div className="flex items-center justify-between text-slate-400 mb-2">
                  <span className="text-xs font-medium uppercase tracking-wider">Data Structure</span>
                  <div className="p-2 rounded-lg bg-violet-500/10 text-violet-400">
                    <Hash className="w-4 h-4" />
                  </div>
                </div>
                <div className="text-2xl font-extrabold text-white tracking-tight">
                  {columnsMeta.length}{' '}
                  <span className="text-xs font-normal text-slate-400">cols</span>
                </div>
                <p className="text-xs text-slate-400 mt-1">
                  {numericColumns.length} Numeric • {categoricalColumns.length} Categorical
                </p>
              </div>

              {/* Metric 3: Primary Numeric Sum */}
              {numericColumns[0] && (
                <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5 hover:border-slate-700 transition-all">
                  <div className="flex items-center justify-between text-slate-400 mb-2">
                    <span className="text-xs font-medium uppercase tracking-wider truncate max-w-[150px]">
                      Total {numericColumns[0].name}
                    </span>
                    <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400">
                      <TrendingUp className="w-4 h-4" />
                    </div>
                  </div>
                  <div className="text-2xl font-extrabold text-emerald-400 tracking-tight">
                    {numericColumns[0].sum > 10000
                      ? numericColumns[0].sum.toLocaleString(undefined, { maximumFractionDigits: 0 })
                      : numericColumns[0].sum.toFixed(2)}
                  </div>
                  <p className="text-xs text-slate-400 mt-1">
                    Avg: {numericColumns[0].avg.toFixed(2)} / record
                  </p>
                </div>
              )}

              {/* Metric 4: Secondary Numeric Sum or Max */}
              {numericColumns[1] ? (
                <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5 hover:border-slate-700 transition-all">
                  <div className="flex items-center justify-between text-slate-400 mb-2">
                    <span className="text-xs font-medium uppercase tracking-wider truncate max-w-[150px]">
                      Total {numericColumns[1].name}
                    </span>
                    <div className="p-2 rounded-lg bg-cyan-500/10 text-cyan-400">
                      <BarChart2 className="w-4 h-4" />
                    </div>
                  </div>
                  <div className="text-2xl font-extrabold text-cyan-400 tracking-tight">
                    {numericColumns[1].sum > 10000
                      ? numericColumns[1].sum.toLocaleString(undefined, { maximumFractionDigits: 0 })
                      : numericColumns[1].sum.toFixed(2)}
                  </div>
                  <p className="text-xs text-slate-400 mt-1">
                    Avg: {numericColumns[1].avg.toFixed(2)} / record
                  </p>
                </div>
              ) : (
                <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5 hover:border-slate-700 transition-all">
                  <div className="flex items-center justify-between text-slate-400 mb-2">
                    <span className="text-xs font-medium uppercase tracking-wider">Top Field Range</span>
                    <div className="p-2 rounded-lg bg-amber-500/10 text-amber-400">
                      <Sliders className="w-4 h-4" />
                    </div>
                  </div>
                  <div className="text-xl font-extrabold text-amber-400 tracking-tight">
                    {numericColumns[0] ? `${numericColumns[0].min} - ${numericColumns[0].max}` : 'N/A'}
                  </div>
                  <p className="text-xs text-slate-400 mt-1">Min / Max value bounds</p>
                </div>
              )}
            </div>

            {/* Dynamic Visualization Studio Section */}
            <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 space-y-6">
              {/* Studio Header & Axis Selector Controls */}
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-5">
                <div>
                  <h2 className="text-base font-bold text-white flex items-center gap-2">
                    <BarChart2 className="w-5 h-5 text-indigo-400" />
                    Visualization Studio
                  </h2>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Dynamically configure dimensions and metrics to build interactive charts
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-3">
                  {/* X-Axis Select */}
                  <div className="flex items-center space-x-2">
                    <label className="text-xs text-slate-400 font-medium">X-Axis:</label>
                    <select
                      value={xAxisKey}
                      onChange={(e) => setXAxisKey(e.target.value)}
                      className="bg-slate-800 border border-slate-700 text-slate-200 text-xs rounded-lg px-3 py-1.5 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                    >
                      {columnsMeta.map((col) => (
                        <option key={col.name} value={col.name}>
                          {col.name} ({col.type})
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Y-Axis Select */}
                  <div className="flex items-center space-x-2">
                    <label className="text-xs text-slate-400 font-medium">Y-Axis Metric:</label>
                    <select
                      value={yAxisKey}
                      onChange={(e) => setYAxisKey(e.target.value)}
                      className="bg-slate-800 border border-slate-700 text-slate-200 text-xs rounded-lg px-3 py-1.5 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                    >
                      {columnsMeta.map((col) => (
                        <option key={col.name} value={col.name}>
                          {col.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Aggregation Mode */}
                  <div className="flex items-center space-x-2">
                    <label className="text-xs text-slate-400 font-medium">Calc:</label>
                    <select
                      value={aggregation}
                      onChange={(e) => setAggregation(e.target.value as any)}
                      className="bg-slate-800 border border-slate-700 text-slate-200 text-xs rounded-lg px-3 py-1.5 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                    >
                      <option value="sum">Sum</option>
                      <option value="avg">Average</option>
                      <option value="count">Count Rows</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Chart Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* 1. Bar Chart */}
                <div className="bg-slate-950/40 border border-slate-800/80 rounded-xl p-5">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-sm font-semibold text-slate-200 flex items-center gap-2">
                      <BarChart2 className="w-4 h-4 text-indigo-400" />
                      Distribution Bar Chart ({aggregation.toUpperCase()} of {yAxisKey} by {xAxisKey})
                    </h3>
                  </div>
                  <div className="h-64 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={chartData} margin={{ top: 10, right: 10, left: -10, bottom: 20 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                        <XAxis
                          dataKey="name"
                          stroke="#64748b"
                          fontSize={11}
                          tickLine={false}
                          angle={-25}
                          textAnchor="end"
                        />
                        <YAxis stroke="#64748b" fontSize={11} tickLine={false} />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: '#0f172a',
                            borderColor: '#334155',
                            borderRadius: '8px',
                            color: '#f8fafc',
                            fontSize: '12px',
                          }}
                        />
                        <Bar dataKey="value" fill="#6366f1" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* 2. Line Chart */}
                <div className="bg-slate-950/40 border border-slate-800/80 rounded-xl p-5">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-sm font-semibold text-slate-200 flex items-center gap-2">
                      <LineIcon className="w-4 h-4 text-cyan-400" />
                      Trend Line Chart ({xAxisKey} vs {yAxisKey})
                    </h3>
                  </div>
                  <div className="h-64 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={chartData} margin={{ top: 10, right: 10, left: -10, bottom: 20 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                        <XAxis
                          dataKey="name"
                          stroke="#64748b"
                          fontSize={11}
                          tickLine={false}
                          angle={-25}
                          textAnchor="end"
                        />
                        <YAxis stroke="#64748b" fontSize={11} tickLine={false} />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: '#0f172a',
                            borderColor: '#334155',
                            borderRadius: '8px',
                            color: '#f8fafc',
                            fontSize: '12px',
                          }}
                        />
                        <Line
                          type="monotone"
                          dataKey="value"
                          stroke="#06b6d4"
                          strokeWidth={2.5}
                          dot={{ fill: '#06b6d4', r: 4 }}
                          activeDot={{ r: 6 }}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* 3. Donut / Pie Breakdown Chart */}
                <div className="bg-slate-950/40 border border-slate-800/80 rounded-xl p-5 lg:col-span-2">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-sm font-semibold text-slate-200 flex items-center gap-2">
                      <PieIcon className="w-4 h-4 text-violet-400" />
                      Proportional Category Share ({xAxisKey})
                    </h3>
                  </div>
                  <div className="h-64 w-full flex items-center justify-center">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={chartData}
                          dataKey="value"
                          nameKey="name"
                          cx="50%"
                          cy="50%"
                          innerRadius={55}
                          outerRadius={85}
                          paddingAngle={3}
                          label={({ name, percent }: { name?: string; percent?: number }) =>
                            `${name ?? ''} (${((percent ?? 0) * 100).toFixed(0)}%)`
                          }
                          labelLine={false}
                        >
                          {chartData.map((_, index) => (
                            <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip
                          contentStyle={{
                            backgroundColor: '#0f172a',
                            borderColor: '#334155',
                            borderRadius: '8px',
                            color: '#f8fafc',
                            fontSize: '12px',
                          }}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>
            </div>

            {/* Interactive Data Table Section */}
            <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h2 className="text-base font-bold text-white flex items-center gap-2">
                    <TableIcon className="w-5 h-5 text-emerald-400" />
                    Data Explorer Table
                  </h2>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Showing {filteredData.length} of {data.length} records
                  </p>
                </div>

                <div className="flex items-center space-x-3">
                  {/* Global Search Input */}
                  <div className="relative">
                    <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      placeholder="Search rows..."
                      value={searchTerm}
                      onChange={(e) => {
                        setSearchTerm(e.target.value);
                        setCurrentPage(1);
                      }}
                      className="bg-slate-800 border border-slate-700 text-slate-200 text-xs rounded-xl pl-9 pr-3 py-2 w-48 sm:w-64 focus:ring-2 focus:ring-indigo-500 focus:outline-none placeholder:text-slate-500"
                    />
                  </div>

                  {/* Page Size Selector */}
                  <select
                    value={pageSize}
                    onChange={(e) => {
                      setPageSize(Number(e.target.value));
                      setCurrentPage(1);
                    }}
                    className="bg-slate-800 border border-slate-700 text-slate-200 text-xs rounded-xl px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  >
                    <option value={10}>10 / page</option>
                    <option value={25}>25 / page</option>
                    <option value={50}>50 / page</option>
                    <option value={100}>100 / page</option>
                  </select>
                </div>
              </div>

              {/* Table Render */}
              <div className="overflow-x-auto rounded-xl border border-slate-800">
                <table className="w-full text-left text-xs text-slate-300">
                  <thead className="bg-slate-800/80 text-slate-400 uppercase text-[10px] font-bold tracking-wider border-b border-slate-700">
                    <tr>
                      {columnsMeta.map((col) => (
                        <th
                          key={col.name}
                          onClick={() => handleSort(col.name)}
                          className="px-4 py-3 cursor-pointer hover:bg-slate-800 transition-colors select-none"
                        >
                          <div className="flex items-center space-x-1.5">
                            <span>{col.name}</span>
                            <span className="text-[9px] px-1 py-0.5 rounded bg-slate-700 text-slate-300 font-normal">
                              {col.type === 'numeric' ? '#' : col.type === 'date' ? '📅' : 'Aa'}
                            </span>
                            {sortColumn === col.name ? (
                              sortDirection === 'asc' ? (
                                <ChevronUp className="w-3.5 h-3.5 text-indigo-400" />
                              ) : (
                                <ChevronDown className="w-3.5 h-3.5 text-indigo-400" />
                              )
                            ) : (
                              <ArrowUpDown className="w-3 h-3 text-slate-500 opacity-50" />
                            )}
                          </div>
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60 bg-slate-950/20">
                    {paginatedData.length > 0 ? (
                      paginatedData.map((row, idx) => (
                        <tr key={idx} className="hover:bg-slate-800/40 transition-colors">
                          {columnsMeta.map((col) => (
                            <td key={col.name} className="px-4 py-3 whitespace-nowrap text-slate-300">
                              {row[col.name] !== undefined && row[col.name] !== null
                                ? String(row[col.name])
                                : '-'}
                            </td>
                          ))}
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td
                          colSpan={columnsMeta.length || 1}
                          className="px-4 py-8 text-center text-slate-500"
                        >
                          No matching records found. Try adjusting your search query.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              {/* Table Pagination Footer */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2">
                <div className="text-xs text-slate-400">
                  Showing Page <span className="font-semibold text-white">{currentPage}</span> of{' '}
                  <span className="font-semibold text-white">{totalPages}</span>
                </div>

                <div className="flex items-center space-x-2">
                  <button
                    disabled={currentPage === 1}
                    onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
                    className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 disabled:opacity-40 disabled:cursor-not-allowed border border-slate-700 text-xs text-slate-300 transition-all"
                  >
                    Previous
                  </button>

                  <button
                    disabled={currentPage >= totalPages}
                    onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
                    className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 disabled:opacity-40 disabled:cursor-not-allowed border border-slate-700 text-xs text-slate-300 transition-all"
                  >
                    Next
                  </button>
                </div>
              </div>
            </div>
          </>
        )}
      </main>
    </div>
  );
}
