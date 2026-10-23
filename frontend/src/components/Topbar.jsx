import { useState, useRef, useEffect } from 'react';
import {
  Menu,
  Upload,
  Download,
  ChevronDown,
  FileSpreadsheet,
} from 'lucide-react';
import { exportToCsv } from '../services/csvExporter';
import { formatNumber } from '../utils/formatters.js';

export default function Topbar({
  activeTab,
  datasetInfo,
  onOpenNewDatasetModal,
  onOpenSidebar,
  cleanedData,
  originalData,
  activeData,
  columns,
  isProcessing = false,
}) {
  const [showExportMenu, setShowExportMenu] = useState(false);
  const dropdownRef = useRef(null);

  const tabLabels = {
    dashboard: 'Dashboard',
    explorer: 'Data Explorer',
    charts: 'Chart Builder',
    cleaning: 'Cleaning Studio',
  };

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowExportMenu(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleExportFull = () => {
    exportToCsv(activeData, columns, 'datalens-analysis-dataset.csv');
    setShowExportMenu(false);
  };

  const handleExportOriginal = () => {
    exportToCsv(originalData, Object.keys(originalData[0] || {}), 'datalens-original-dataset.csv');
    setShowExportMenu(false);
  };

  const handleExportCleaned = () => {
    exportToCsv(cleanedData, Object.keys(cleanedData[0] || {}), 'datalens-cleaned-dataset.csv');
    setShowExportMenu(false);
  };

  const hasDataset = Boolean(datasetInfo);

  return (
    <header className="sticky top-0 z-30 flex h-14 w-full items-center justify-between border-b border-[#E3E6EB] bg-[#FFFFFF] px-4 sm:px-6">
      {/* Left: Mobile Toggle & Page Title */}
      <div className="flex items-center gap-3">
        <button
          onClick={onOpenSidebar}
          className="rounded p-1 text-[#667085] hover:bg-[#F1F3F5] hover:text-[#20242C] md:hidden"
          aria-label="Open navigation sidebar"
        >
          <Menu className="h-4 w-4" />
        </button>

        <div className="flex items-center gap-2">
          <h1 className="text-sm font-semibold tracking-tight text-[#20242C]">
            {tabLabels[activeTab] || 'Workspace'}
          </h1>
          {isProcessing && (
            <span className="flex items-center gap-1.5 rounded bg-[#F1F3F5] px-2 py-0.5 text-[11px] text-[#667085]">
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-[#B98220]" />
              Processing
            </span>
          )}
        </div>
      </div>

      {/* Right: Dataset Context and Actions */}
      <div className="flex items-center gap-2.5">
        {hasDataset && (
          <div className="hidden lg:flex items-center gap-1.5 border-r border-[#E3E6EB] pr-3 text-xs text-[#667085]">
            <span className="font-medium text-[#20242C] max-w-[180px] truncate" title={datasetInfo.fileName}>
              {datasetInfo.fileName}
            </span>
            <span className="text-[#89919F]">·</span>
            <span className="font-mono text-[#667085]">
              {formatNumber(activeData.length, 0)} rows, {columns.length} cols
            </span>
          </div>
        )}

        {/* Switch / Import Dataset */}
        <button
          onClick={onOpenNewDatasetModal}
          className="inline-flex h-8 items-center gap-1.5 rounded border border-[#E3E6EB] bg-[#FFFFFF] px-2.5 text-xs font-medium text-[#20242C] hover:bg-[#F7F8FA] hover:border-[#D1D5DB] transition-colors"
        >
          <Upload className="h-3.5 w-3.5 text-[#667085]" />
          <span className="hidden sm:inline">{hasDataset ? 'Switch dataset' : 'Import'}</span>
        </button>

        {/* Export Dropdown */}
        {hasDataset && (
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setShowExportMenu((prev) => !prev)}
              className="inline-flex h-8 items-center gap-1.5 rounded bg-[#B98220] px-3 text-xs font-medium text-white hover:bg-[#9D6D17] transition-colors shadow-xs"
            >
              <Download className="h-3.5 w-3.5" />
              <span>Export</span>
              <ChevronDown className="h-3 w-3 opacity-80" />
            </button>

            {showExportMenu && (
              <div className="absolute right-0 mt-1.5 w-52 rounded-md border border-[#E3E6EB] bg-[#FFFFFF] p-1 shadow-md z-50 text-xs">
                <div className="px-2.5 py-1 text-[11px] font-medium text-[#89919F] border-b border-[#E3E6EB]">
                  Export CSV
                </div>
                <button
                  onClick={handleExportFull}
                  className="flex w-full items-center justify-between rounded px-2.5 py-1.5 text-left text-[#20242C] hover:bg-[#F7F8FA] transition-colors"
                >
                  <div className="flex items-center gap-2">
                    <FileSpreadsheet className="h-3.5 w-3.5 text-[#667085]" />
                    <span>Active dataset</span>
                  </div>
                  <span className="text-[10px] font-mono text-[#89919F]">CSV</span>
                </button>
                <button
                  onClick={handleExportCleaned}
                  disabled={cleanedData.length === 0}
                  className="flex w-full items-center justify-between rounded px-2.5 py-1.5 text-left text-[#20242C] hover:bg-[#F7F8FA] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                >
                  <div className="flex items-center gap-2">
                    <FileSpreadsheet className="h-3.5 w-3.5 text-[#B98220]" />
                    <span>Cleaned data</span>
                  </div>
                  <span className="text-[10px] font-mono text-[#B98220]">CSV</span>
                </button>
                <button
                  onClick={handleExportOriginal}
                  className="flex w-full items-center justify-between rounded px-2.5 py-1.5 text-left text-[#20242C] hover:bg-[#F7F8FA] transition-colors"
                >
                  <div className="flex items-center gap-2">
                    <FileSpreadsheet className="h-3.5 w-3.5 text-[#667085]" />
                    <span>Original source</span>
                  </div>
                  <span className="text-[10px] font-mono text-[#89919F]">CSV</span>
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </header>
  );
}
