import { useState } from 'react';
import {
  LayoutDashboard,
  Table2,
  BarChart3,
  Wand2,
  Upload,
  Download,
  ShieldCheck,
  FileSpreadsheet,
  ChevronDown,
  Sparkles,
} from 'lucide-react';
import { exportToCsv } from '../services/csvExporter';

export default function Topbar({
  activeTab,
  onTabChange,
  datasetInfo,
  onOpenNewDatasetModal,
  cleanedData,
  originalData,
  activeData,
  columns,
}) {
  const [showExportMenu, setShowExportMenu] = useState(false);

  const navItems = [
    { id: 'dashboard', label: 'Dashboard & Profiling', icon: LayoutDashboard },
    { id: 'explorer', label: 'Data Explorer', icon: Table2 },
    { id: 'charts', label: 'Chart Builder', icon: BarChart3 },
    { id: 'cleaning', label: 'Cleaning Studio', icon: Wand2 },
  ];

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

  return (
    <header className="sticky top-0 z-30 border-b border-white/8 bg-[#0B0E13]/90 backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6">
        {/* Brand & Logo */}
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-amber-400 to-amber-600 text-black shadow-[0_0_20px_rgba(245,158,11,0.4)]">
              <Sparkles className="h-5 w-5 fill-black stroke-black" />
            </div>
            <div>
              <span className="text-base font-extrabold tracking-tight text-white flex items-center gap-1.5">
                DataLens <span className="text-amber-400 font-mono text-xs font-semibold px-1 py-0.5 rounded bg-amber-500/10 border border-amber-500/20">AI</span>
              </span>
              <span className="block text-[10px] text-slate-400 tracking-wider uppercase font-medium">
                Client-Side Engine
              </span>
            </div>
          </div>

          {/* Navigation Tabs (Desktop) */}
          <nav className="hidden lg:flex items-center gap-1 rounded-xl border border-white/5 bg-[#141820]/80 p-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => onTabChange(item.id)}
                  className={`flex items-center gap-2 rounded-lg px-3 py-1.5 text-xs font-medium transition-all ${
                    isActive
                      ? 'bg-amber-500 text-black font-semibold shadow-sm'
                      : 'text-slate-400 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <Icon className="h-3.5 w-3.5" />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Right Section: Active Dataset Info Pill & Action Buttons */}
        <div className="flex items-center gap-3">
          {datasetInfo && (
            <div className="hidden sm:flex items-center gap-3 rounded-lg border border-white/10 bg-[#141820]/90 px-3 py-1.5 text-xs text-slate-300">
              <div className="flex items-center gap-1.5 font-mono text-slate-200">
                <FileSpreadsheet className="h-3.5 w-3.5 text-amber-400" />
                <span className="max-w-[140px] truncate">{datasetInfo.fileName}</span>
              </div>
              <span className="text-slate-600">|</span>
              <span className="font-mono text-slate-400">
                {activeData.length.toLocaleString()} rows • {columns.length} cols
              </span>
              <span className="text-slate-600">|</span>
              <span className="inline-flex items-center gap-1 text-[11px] text-emerald-400 font-medium">
                <ShieldCheck className="h-3 w-3" />
                Local
              </span>
            </div>
          )}

          {/* Upload New / Change Dataset Button */}
          <button
            onClick={onOpenNewDatasetModal}
            className="inline-flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-medium text-slate-300 transition-all hover:border-amber-500/30 hover:bg-white/10"
            title="Import or Switch Dataset"
          >
            <Upload className="h-3.5 w-3.5 text-amber-400" />
            <span className="hidden sm:inline">Change Dataset</span>
          </button>

          {/* Export Dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowExportMenu((prev) => !prev)}
              className="inline-flex items-center gap-1.5 rounded-lg border border-amber-500/30 bg-amber-500/15 px-3 py-1.5 text-xs font-semibold text-amber-400 shadow-[0_0_15px_rgba(245,158,11,0.15)] transition-all hover:bg-amber-500/25"
            >
              <Download className="h-3.5 w-3.5" />
              <span>Export</span>
              <ChevronDown className="h-3 w-3 opacity-70" />
            </button>

            {showExportMenu && (
              <div
                className="absolute right-0 mt-2 w-56 rounded-xl border border-white/10 bg-[#161c26] p-1.5 shadow-2xl z-50 text-xs"
                onClick={() => setShowExportMenu(false)}
              >
                <button
                  onClick={handleExportFull}
                  className="flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-slate-200 hover:bg-white/5 hover:text-amber-400"
                >
                  <span>Export Active Dataset</span>
                  <span className="text-[10px] text-slate-500 font-mono">CSV</span>
                </button>
                <button
                  onClick={handleExportCleaned}
                  className="flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-slate-200 hover:bg-white/5 hover:text-amber-400"
                >
                  <span>Export Cleaned Dataset</span>
                  <span className="text-[10px] text-slate-500 font-mono">CSV</span>
                </button>
                <button
                  onClick={handleExportOriginal}
                  className="flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-slate-200 hover:bg-white/5 hover:text-amber-400"
                >
                  <span>Export Original Dataset</span>
                  <span className="text-[10px] text-slate-500 font-mono">CSV</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Navigation Tabs (Mobile & Tablet) */}
      <div className="flex lg:hidden overflow-x-auto border-t border-white/5 px-4 py-2 gap-2 scrollbar-none">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onTabChange(item.id)}
              className={`flex items-center gap-1.5 whitespace-nowrap rounded-lg px-3 py-1.5 text-xs font-medium transition-all ${
                isActive
                  ? 'bg-amber-500 text-black font-semibold'
                  : 'text-slate-400 hover:bg-white/5 hover:text-white'
              }`}
            >
              <Icon className="h-3.5 w-3.5" />
              <span>{item.label}</span>
            </button>
          );
        })}
      </div>
    </header>
  );
}
