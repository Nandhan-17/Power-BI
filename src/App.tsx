import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { ParsedDataset } from './types';
import { processCsvContent } from './utils/csvParser';
import { UploadPortal } from './components/UploadPortal';
import { DataHealthAudit } from './components/DataHealthAudit';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { KpiCards } from './components/KpiCards';
import { TimelineChart } from './components/Charts/TimelineChart';
import { CategoryDonutChart } from './components/Charts/CategoryDonutChart';
import { TopRankedBarChart } from './components/Charts/TopRankedBarChart';
import { CustomChartBuilder } from './components/CustomChartBuilder';
import { DataTable } from './components/DataTable';
import { DataSchemaAuditView } from './components/DataSchemaAuditView';
import Papa from 'papaparse';

export function App() {
  const [dataset, setDataset] = useState<ParsedDataset | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'analytics' | 'table' | 'mappings'>('overview');

  const handleFileUpload = async (content: string, fileName: string) => {
    setIsLoading(true);
    try {
      const parsed = await processCsvContent(content, fileName);
      setDataset(parsed);
      setActiveTab('overview');
    } catch (err) {
      console.error('CSV Parsing Error:', err);
      alert('Error parsing CSV file. Please check file format.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    setDataset(null);
    setActiveTab('overview');
  };

  const handleExportCsv = () => {
    if (!dataset) return;
    const csvString = Papa.unparse(dataset.rows);
    const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `Sanitized_${dataset.meta.fileName}`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (!dataset) {
    return <UploadPortal onFileUpload={handleFileUpload} isLoading={isLoading} />;
  }

  return (
    <div className="flex min-h-screen bg-slate-50 font-sans text-slate-900 overflow-x-hidden select-none">
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        categoryType={dataset.meta.categoryType}
        sanitizedTitle={dataset.meta.sanitizedTitle}
        totalRows={dataset.audit.cleanRowsCount}
      />

      <div className="flex-1 flex flex-col min-w-0">
        <DataHealthAudit audit={dataset.audit} fileName={dataset.meta.fileName} />

        <Header
          meta={dataset.meta}
          onReset={handleReset}
          onExportCsv={handleExportCsv}
        />

        <main className="flex-1 p-6 space-y-6 max-w-7xl w-full mx-auto">
          <AnimatePresence mode="wait">
            {activeTab === 'overview' && (
              <motion.div
                key="overview"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.3 }}
                className="space-y-6"
              >
                <KpiCards kpis={dataset.kpis} mapping={dataset.mapping} />

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  <div className="lg:col-span-2">
                    <TimelineChart rows={dataset.rows} mapping={dataset.mapping} />
                  </div>
                  <div>
                    <CategoryDonutChart rows={dataset.rows} mapping={dataset.mapping} />
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-1 gap-6">
                  <TopRankedBarChart rows={dataset.rows} mapping={dataset.mapping} />
                </div>
              </motion.div>
            )}

            {activeTab === 'analytics' && (
              <motion.div
                key="analytics"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.3 }}
              >
                <CustomChartBuilder rows={dataset.rows} headers={dataset.headers} />
              </motion.div>
            )}

            {activeTab === 'table' && (
              <motion.div
                key="table"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.3 }}
              >
                <DataTable
                  rows={dataset.rows}
                  headers={dataset.headers}
                  onExportCsv={handleExportCsv}
                />
              </motion.div>
            )}

            {activeTab === 'mappings' && (
              <motion.div
                key="mappings"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.3 }}
              >
                <DataSchemaAuditView dataset={dataset} />
              </motion.div>
            )}
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
}

export default App;
