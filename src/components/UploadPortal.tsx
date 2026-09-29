import React, { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { 
  Upload, 
  FileSpreadsheet, 
  AlertCircle, 
  Sparkles, 
  ShoppingBag, 
  Laptop, 
  Shirt, 
  FileCheck2
} from 'lucide-react';
import { 
  generateSampleGroceryCsv, 
  generateSampleTechCsv, 
  generateSampleFashionCsv, 
  generateMinimalMissingColumnCsv 
} from '../utils/sampleDataGenerator';

interface UploadPortalProps {
  onFileUpload: (content: string, fileName: string) => void;
  isLoading: boolean;
}

export const UploadPortal: React.FC<UploadPortalProps> = ({ onFileUpload, isLoading }) => {
  const [isDragging, setIsDragging] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  const processFile = (file: File) => {
    setErrorMsg(null);
    if (!file.name.toLowerCase().endsWith('.csv')) {
      setErrorMsg('Invalid file format. Please upload a valid .csv file.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (content) {
        onFileUpload(content, file.name);
      }
    };
    reader.readAsText(file);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  const handleSampleClick = (generator: () => { fileName: string; content: string }) => {
    const sample = generator();
    onFileUpload(sample.content, sample.fileName);
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col items-center justify-center p-6 relative overflow-hidden select-none">
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-emerald-600/15 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-[400px] h-[400px] bg-lime-500/10 rounded-full blur-[120px] pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
        className="w-full max-w-3xl flex flex-col items-center z-10"
      >
        <div className="flex items-center gap-3 mb-6 bg-emerald-950/80 border border-emerald-800/60 px-4 py-2 rounded-full shadow-lg backdrop-blur-md">
          <div className="w-8 h-8 rounded-full bg-lime-400 text-emerald-950 flex items-center justify-center font-bold">
            <ShoppingBag className="w-4 h-4" />
          </div>
          <span className="text-xs font-semibold uppercase tracking-widest text-lime-400">
            Dynamic E-Commerce Analytics Engine
          </span>
        </div>

        <h1 className="text-4xl sm:text-5xl font-extrabold text-center text-white tracking-tight leading-tight mb-4">
          Upload Your Sales CSV & <br />
          <span className="bg-gradient-to-r from-lime-400 via-emerald-300 to-teal-200 bg-clip-text text-transparent">
            Visualize Instantly
          </span>
        </h1>

        <p className="text-slate-400 text-center text-base sm:text-lg max-w-xl mb-8">
          Upload any e-commerce transaction dataset. Our automated pipeline deduplicates, sanitizes, and renders high-precision Power BI visuals on the fly.
        </p>

        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`w-full p-10 rounded-3xl border-2 border-dashed transition-all duration-300 cursor-pointer flex flex-col items-center justify-center relative shadow-2xl backdrop-blur-xl ${
            isDragging
              ? 'border-lime-400 bg-emerald-950/60 scale-[1.01] shadow-emerald-900/40 ring-4 ring-lime-400/20'
              : 'border-emerald-800/80 bg-slate-900/80 hover:border-emerald-500 hover:bg-slate-800/90'
          }`}
        >
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept=".csv"
            className="hidden"
          />

          <div className="w-20 h-20 rounded-2xl bg-gradient-to-tr from-emerald-800 to-lime-500/30 flex items-center justify-center mb-6 text-lime-400 shadow-xl group-hover:scale-110 transition-transform">
            {isLoading ? (
              <div className="w-10 h-10 border-4 border-lime-400 border-t-transparent rounded-full animate-spin" />
            ) : (
              <FileSpreadsheet className="w-10 h-10" />
            )}
          </div>

          <h3 className="text-xl font-bold text-white mb-2">
            {isLoading ? 'Parsing & Cleaning Dataset...' : 'Drop your CSV file here, or browse'}
          </h3>
          <p className="text-slate-400 text-sm mb-6 text-center max-w-md">
            Supports Revenue, Orders, Customers, Product, Category, City, Dates & Quantity columns.
          </p>

          <div className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-lime-500 to-emerald-600 text-emerald-950 font-bold text-sm shadow-lg hover:brightness-110 transition">
            <Upload className="w-4 h-4" />
            Select CSV File
          </div>

          {errorMsg && (
            <div className="mt-4 flex items-center gap-2 text-rose-400 text-sm bg-rose-950/60 border border-rose-800/50 px-4 py-2 rounded-xl">
              <AlertCircle className="w-4 h-4" />
              <span>{errorMsg}</span>
            </div>
          )}
        </div>

        <div className="mt-10 w-full">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2 text-sm text-slate-400 font-semibold uppercase tracking-wider">
              <Sparkles className="w-4 h-4 text-lime-400" />
              <span>Or try instant sample datasets (1-Click Test)</span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            <button
              onClick={() => handleSampleClick(generateSampleGroceryCsv)}
              className="flex items-center gap-3 p-3.5 rounded-2xl bg-slate-800/90 border border-slate-700/70 hover:border-lime-500/60 hover:bg-slate-800 text-left transition group"
            >
              <div className="w-10 h-10 rounded-xl bg-emerald-950 text-lime-400 flex items-center justify-center shrink-0">
                <ShoppingBag className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <div className="text-sm font-semibold text-slate-200 group-hover:text-lime-400 transition truncate">
                  Grocery Dataset
                </div>
                <div className="text-xs text-slate-400 truncate">Blinkit style (8 cols)</div>
              </div>
            </button>

            <button
              onClick={() => handleSampleClick(generateSampleTechCsv)}
              className="flex items-center gap-3 p-3.5 rounded-2xl bg-slate-800/90 border border-slate-700/70 hover:border-cyan-400/60 hover:bg-slate-800 text-left transition group"
            >
              <div className="w-10 h-10 rounded-xl bg-cyan-950 text-cyan-400 flex items-center justify-center shrink-0">
                <Laptop className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <div className="text-sm font-semibold text-slate-200 group-hover:text-cyan-400 transition truncate">
                  Electronics Dataset
                </div>
                <div className="text-xs text-slate-400 truncate">Tech gadgets & laptops</div>
              </div>
            </button>

            <button
              onClick={() => handleSampleClick(generateSampleFashionCsv)}
              className="flex items-center gap-3 p-3.5 rounded-2xl bg-slate-800/90 border border-slate-700/70 hover:border-fuchsia-400/60 hover:bg-slate-800 text-left transition group"
            >
              <div className="w-10 h-10 rounded-xl bg-fuchsia-950 text-fuchsia-400 flex items-center justify-center shrink-0">
                <Shirt className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <div className="text-sm font-semibold text-slate-200 group-hover:text-fuchsia-400 transition truncate">
                  Fashion Dataset
                </div>
                <div className="text-xs text-slate-400 truncate">Apparel & outerwear</div>
              </div>
            </button>

            <button
              onClick={() => handleSampleClick(generateMinimalMissingColumnCsv)}
              className="flex items-center gap-3 p-3.5 rounded-2xl bg-slate-800/90 border border-slate-700/70 hover:border-amber-400/60 hover:bg-slate-800 text-left transition group"
            >
              <div className="w-10 h-10 rounded-xl bg-amber-950 text-amber-400 flex items-center justify-center shrink-0">
                <FileCheck2 className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <div className="text-sm font-semibold text-slate-200 group-hover:text-amber-400 transition truncate">
                  Minimal Dataset
                </div>
                <div className="text-xs text-slate-400 truncate">Tests missing column tiles</div>
              </div>
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};
