import { useState, useMemo, useCallback } from 'react';
import Sidebar from './components/Sidebar';
import Topbar from './components/Topbar';
import EmptyState from './components/EmptyState';
import FileUploader from './components/FileUploader';
import Dashboard from './pages/Dashboard';
import DataExplorer from './pages/DataExplorer';
import CleanStudioPage from './pages/CleanStudioPage';
import ChartPanel from './components/ChartPanel';
import { generateDatasetProfile } from './services/dataProfiler.js';
import { filterDataset } from './services/dataFilters.js';
import { exportToCsv } from './services/csvExporter.js';
import { X, CheckCircle2, AlertCircle, Info } from 'lucide-react';

export default function App() {
  // Navigation State: 'dashboard' | 'explorer' | 'charts' | 'cleaning'
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Dataset State
  const [dataset, setDataset] = useState(null);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);

  // Persistent Explorer Filter & Search State across Tab Navigations
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState([]);

  // Dedicated cleaning workspace state
  const [cleaningState, setCleaningState] = useState({
    cleanedData: [],
    cleanedColumns: [],
    history: [],
  });

  // Chart builder shortcuts from profile
  const [chartSelection, setChartSelection] = useState({
    categoryCol: null,
    measureCol: null,
  });

  // Toast notifications
  const [toast, setToast] = useState(null);

  const showToast = useCallback((message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => {
      setToast(null);
    }, 4000);
  }, []);

  // Handle Initial Dataset Ingestion (File or Sample)
  const handleDataLoaded = useCallback((parsed) => {
    const { data, columns, fileName, fileSize, delimiter } = parsed;

    const initialDataset = {
      originalData: data,
      originalColumns: columns,
      activeData: data,
      activeColumns: columns,
      metadata: {
        fileName,
        fileSize,
        delimiter,
      },
    };

    setDataset(initialDataset);
    setCleaningState({
      cleanedData: data,
      cleanedColumns: columns,
      history: [],
    });
    setSearchQuery('');
    setFilters([]);
    setIsUploadModalOpen(false);
    setActiveTab('dashboard');

    showToast(
      `Loaded "${fileName}" (${data.length.toLocaleString()} rows, ${columns.length} columns)`,
      'success'
    );
  }, [showToast]);

  // Compute profile memoized on active dataset
  const profile = useMemo(() => {
    if (!dataset) return null;
    return generateDatasetProfile(
      dataset.activeData,
      dataset.activeColumns,
      dataset.metadata
    );
  }, [dataset]);

  // Compute filtered dataset across the app
  const filteredData = useMemo(() => {
    if (!dataset) return [];
    return filterDataset(dataset.activeData, dataset.activeColumns, searchQuery, filters);
  }, [dataset, searchQuery, filters]);

  const isFiltered = Boolean(searchQuery.trim() || filters.length > 0);

  // Handle Clean Studio Transformation
  const handleApplyTransformation = useCallback((transformResult) => {
    const { data, columns, action, description } = transformResult;

    setCleaningState((prev) => {
      const stepEntry = {
        action,
        description,
        timestamp: Date.now(),
        previousData: prev.cleanedData,
        previousColumns: prev.cleanedColumns,
      };

      return {
        cleanedData: data,
        cleanedColumns: columns,
        history: [...prev.history, stepEntry],
      };
    });

    showToast(description, 'success');
  }, [showToast]);

  // Undo latest transformation in Clean Studio
  const handleUndoTransformation = useCallback(() => {
    setCleaningState((prev) => {
      if (prev.history.length === 0) return prev;
      const lastStep = prev.history[prev.history.length - 1];
      const newHistory = prev.history.slice(0, -1);

      return {
        cleanedData: lastStep.previousData,
        cleanedColumns: lastStep.previousColumns,
        history: newHistory,
      };
    });

    showToast('Undid latest transformation.', 'info');
  }, [showToast]);

  // Reset Clean Studio state back to immutable original dataset
  const handleResetToOriginal = useCallback(() => {
    if (!dataset) return;
    setCleaningState({
      cleanedData: dataset.originalData,
      cleanedColumns: dataset.originalColumns,
      history: [],
    });

    showToast('Reset cleaning workspace to original data.', 'info');
  }, [dataset, showToast]);

  // Commit Cleaned Data to be the Active Dataset across Dashboard, Explorer, and Charts
  const handleCommitCleanedToActive = useCallback(() => {
    setDataset((prev) => {
      if (!prev) return null;
      return {
        ...prev,
        activeData: cleaningState.cleanedData,
        activeColumns: cleaningState.cleanedColumns,
      };
    });

    showToast(
      `Applied ${cleaningState.cleanedData.length.toLocaleString()} cleaned rows to active dataset.`,
      'success'
    );
    setActiveTab('explorer');
  }, [cleaningState, showToast]);

  // Quick shortcut from column profile to chart
  const handleSelectColumnForChart = useCallback((colName) => {
    setChartSelection({
      categoryCol: null,
      measureCol: colName,
    });
    setActiveTab('charts');
  }, []);

  const handleExportActiveDataset = useCallback(() => {
    if (!dataset) return;
    exportToCsv(dataset.activeData, dataset.activeColumns, 'datalens-analysis-dataset.csv');
  }, [dataset]);

  return (
    <div className="min-h-screen bg-[#F7F8FA] text-[#20242C] flex font-sans antialiased">
      {/* Toast Notification */}
      {toast && (
        <div className="fixed bottom-4 right-4 z-50 flex items-center gap-2 rounded border border-[#E3E6EB] bg-[#FFFFFF] px-3.5 py-2.5 text-xs shadow-md">
          {toast.type === 'success' && <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />}
          {toast.type === 'error' && <AlertCircle className="h-4 w-4 text-red-600 shrink-0" />}
          {toast.type === 'info' && <Info className="h-4 w-4 text-[#B98220] shrink-0" />}
          <span className="text-[#20242C] font-medium">{toast.message}</span>
          <button
            onClick={() => setToast(null)}
            className="ml-2 text-[#89919F] hover:text-[#20242C]"
            aria-label="Dismiss toast"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      )}

      {/* Persistent Left Sidebar */}
      <Sidebar
        activeTab={activeTab}
        onTabChange={setActiveTab}
        dataset={dataset}
        onOpenNewDatasetModal={() => setIsUploadModalOpen(true)}
        onExportClick={dataset ? handleExportActiveDataset : null}
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 min-h-screen overflow-x-hidden">
        {/* Top Navigation Bar */}
        <Topbar
          activeTab={activeTab}
          datasetInfo={dataset?.metadata}
          onOpenNewDatasetModal={() => setIsUploadModalOpen(true)}
          onOpenSidebar={() => setIsSidebarOpen(true)}
          cleanedData={cleaningState.cleanedData}
          originalData={dataset?.originalData || []}
          activeData={dataset?.activeData || []}
          columns={dataset?.activeColumns || []}
        />

        {/* Viewport Canvas */}
        <main className="flex-1 w-full max-w-[1400px] mx-auto px-4 py-5 sm:px-6 lg:px-8">
          {!dataset ? (
            <EmptyState onDataLoaded={handleDataLoaded} />
          ) : (
            <div>
              {activeTab === 'dashboard' && (
                <Dashboard
                  profile={profile}
                  onNavigateToTab={setActiveTab}
                  onSelectColumnForChart={handleSelectColumnForChart}
                />
              )}

              {activeTab === 'explorer' && (
                <DataExplorer
                  data={dataset.activeData}
                  columns={dataset.activeColumns}
                  columnProfiles={profile?.columnProfiles || []}
                  fileName={dataset.metadata.fileName}
                  onNotification={(notif) => showToast(notif.message, notif.type)}
                  searchQuery={searchQuery}
                  onSearchChange={setSearchQuery}
                  filters={filters}
                  onFiltersChange={setFilters}
                />
              )}

              {activeTab === 'charts' && (
                <div className="space-y-4">
                  <div className="border-b border-[#E3E6EB] pb-3">
                    <h2 className="text-lg font-semibold text-[#20242C] tracking-tight">Chart Builder</h2>
                    <p className="mt-0.5 text-xs text-[#667085]">
                      {dataset.metadata?.fileName} · {dataset.activeData.length.toLocaleString()} rows · in-memory aggregation
                    </p>
                  </div>
                  <ChartPanel
                    data={dataset.activeData}
                    filteredData={filteredData}
                    isFiltered={isFiltered}
                    columns={dataset.activeColumns}
                    columnProfiles={profile?.columnProfiles || []}
                    initialCategoryCol={chartSelection.categoryCol}
                    initialMeasureCol={chartSelection.measureCol}
                  />
                </div>
              )}

              {activeTab === 'cleaning' && (
                <CleanStudioPage
                  originalData={dataset.originalData}
                  originalColumns={dataset.originalColumns}
                  cleanedData={cleaningState.cleanedData}
                  cleanedColumns={cleaningState.cleanedColumns}
                  history={cleaningState.history}
                  onApplyTransformation={handleApplyTransformation}
                  onUndoTransformation={handleUndoTransformation}
                  onResetToOriginal={handleResetToOriginal}
                  onCommitCleanedToActive={handleCommitCleanedToActive}
                />
              )}
            </div>
          )}
        </main>

        {/* Minimal SaaS Footer */}
        <footer className="mt-auto border-t border-[#E3E6EB] bg-[#FFFFFF] py-2.5 text-xs text-[#89919F]">
          <div className="mx-auto flex max-w-[1400px] items-center justify-between px-4 sm:px-6 lg:px-8">
            <span className="font-medium text-[#20242C]">DataLens AI</span>
            <span>Client-side engine · No data leaves your browser</span>
          </div>
        </footer>
      </div>

      {/* Modal: Change / Upload Dataset */}
      {isUploadModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-[1px] p-4">
          <div className="relative w-full max-w-xl rounded border border-[#E3E6EB] bg-[#FFFFFF] p-6 shadow-xl">
            <button
              onClick={() => setIsUploadModalOpen(false)}
              className="absolute right-4 top-4 rounded p-1 text-[#89919F] hover:text-[#20242C] transition-colors"
              aria-label="Close modal"
            >
              <X className="h-4 w-4" />
            </button>

            <div className="mb-4">
              <h2 className="text-base font-semibold text-[#20242C]">Import or switch dataset</h2>
              <p className="text-xs text-[#667085] mt-0.5">
                Upload a CSV, TSV, or delimited text file, or choose from our sample datasets.
              </p>
            </div>

            <FileUploader onDataLoaded={handleDataLoaded} />
          </div>
        </div>
      )}
    </div>
  );
}
