import { useState, useRef, useEffect } from 'react';
import {
  LayoutDashboard,
  Table2,
  BarChart3,
  Wand2,
  Upload,
  Download,
  ChevronDown,
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
  const dropdownRef = useRef(null);

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'explorer', label: 'Data Explorer', icon: Table2 },
    { id: 'charts', label: 'Chart Builder', icon: BarChart3 },
    { id: 'cleaning', label: 'Cleaning Studio', icon: Wand2 },
  ];

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

  return (
    <header className="sticky top-0 z-30 border-b border-gray-200 bg-white">
      <div className="mx-auto flex h-13 max-w-7xl items-center justify-between px-4 sm:px-6">
        {/* Left: Brand and Navigation */}
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2">
            <div className="flex h-6 w-6 items-center justify-center rounded bg-[#C58A16] text-white font-semibold text-xs">
              DL
            </div>
            <span className="text-sm font-semibold tracking-tight text-gray-900">
              DataLens
            </span>
          </div>

          {/* Navigation Links (Desktop) */}
          <nav className="hidden md:flex items-center gap-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => onTabChange(item.id)}
                  className={`flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-xs font-medium transition-colors ${
                    isActive
                      ? 'bg-gray-100 text-gray-900'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  }`}
                >
                  <Icon className="h-3.5 w-3.5" />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Right: Dataset Info and Action Buttons */}
        <div className="flex items-center gap-2.5">
          {datasetInfo && (
            <div className="hidden sm:flex items-center gap-2 text-xs text-gray-500 mr-2 border-r border-gray-200 pr-3">
              <span className="font-medium text-gray-800 max-w-[140px] truncate" title={datasetInfo.fileName}>
                {datasetInfo.fileName}
              </span>
              <span>•</span>
              <span className="font-mono text-gray-600">
                {activeData.length.toLocaleString()} rows, {columns.length} cols
              </span>
            </div>
          )}

          {/* Change Dataset Button */}
          <button
            onClick={onOpenNewDatasetModal}
            className="inline-flex items-center gap-1.5 rounded-md border border-gray-300 bg-white px-2.5 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-50 transition-colors"
          >
            <Upload className="h-3.5 w-3.5 text-gray-500" />
            <span className="hidden sm:inline">Change dataset</span>
          </button>

          {/* Export Dropdown */}
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setShowExportMenu((prev) => !prev)}
              className="inline-flex items-center gap-1 rounded-md bg-[#C58A16] px-3 py-1.5 text-xs font-medium text-white hover:bg-[#B45309] transition-colors"
            >
              <Download className="h-3.5 w-3.5" />
              <span>Export</span>
              <ChevronDown className="h-3 w-3 opacity-80" />
            </button>

            {showExportMenu && (
              <div className="absolute right-0 mt-1.5 w-52 rounded-md border border-gray-200 bg-white p-1 shadow-md z-50 text-xs">
                <button
                  onClick={handleExportFull}
                  className="flex w-full items-center justify-between rounded px-2.5 py-1.5 text-left text-gray-700 hover:bg-gray-50 hover:text-gray-900"
                >
                  <span>Export Active Dataset</span>
                  <span className="text-[10px] text-gray-400 font-mono">CSV</span>
                </button>
                <button
                  onClick={handleExportCleaned}
                  className="flex w-full items-center justify-between rounded px-2.5 py-1.5 text-left text-gray-700 hover:bg-gray-50 hover:text-gray-900"
                >
                  <span>Export Cleaned Dataset</span>
                  <span className="text-[10px] text-gray-400 font-mono">CSV</span>
                </button>
                <button
                  onClick={handleExportOriginal}
                  className="flex w-full items-center justify-between rounded px-2.5 py-1.5 text-left text-gray-700 hover:bg-gray-50 hover:text-gray-900"
                >
                  <span>Export Original Dataset</span>
                  <span className="text-[10px] text-gray-400 font-mono">CSV</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Navigation Tabs (Mobile) */}
      <div className="flex md:hidden overflow-x-auto border-t border-gray-200 px-3 py-1.5 gap-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onTabChange(item.id)}
              className={`flex items-center gap-1.5 whitespace-nowrap rounded px-2.5 py-1 text-xs font-medium transition-colors ${
                isActive
                  ? 'bg-gray-100 text-gray-900'
                  : 'text-gray-600 hover:text-gray-900'
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
