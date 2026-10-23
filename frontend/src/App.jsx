import { useState, useMemo, useCallback } from 'react';
import Topbar from './components/Topbar';
import EmptyState from './components/EmptyState';
import FileUploader from './components/FileUploader';
import Dashboard from './pages/Dashboard';
import DataExplorer from './pages/DataExplorer';
import CleanStudioPage from './pages/CleanStudioPage';
import ChartPanel from './components/ChartPanel';
import { generateDatasetProfile } from './services/dataProfiler.js';
import { X, CheckCircle2, AlertCircle, Info } from 'lucide-react';

export default function App() {
  // Navigation State: 'dashboard' | 'explorer' | 'charts' | 'cleaning'
  const [activeTab, setActiveTab] = useState('dashboard');

  // Dataset State
  const [dataset, setDataset] = useState(null);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);

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
      `Applied ${cleaningState.cleanedData.length.toLocaleString()} cleaned rows to active explorer.`,
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

  return (
    <div className="min-h-screen bg-[#F7F8FA] text-[#20242C] flex flex-col font-sans">
      {/* Toast Notification */}
      {toast && (
        <div className="fixed bottom-4 right-4 z-50 flex items-center gap-2 rounded-md border border-gray-200 bg-white px-3.5 py-2.5 text-xs shadow-lg">
          {toast.type === 'success' && <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />}
          {toast.type === 'error' && <AlertCircle className="h-4 w-4 text-red-600 shrink-0" />}
          {toast.type === 'info' && <Info className="h-4 w-4 text-blue-600 shrink-0" />}
          <span className="text-gray-800 font-medium">{toast.message}</span>
          <button
            onClick={() => setToast(null)}
            className="ml-2 text-gray-400 hover:text-gray-700"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      )}

      {/* Main Top Navigation */}
      <Topbar
        activeTab={activeTab}
        onTabChange={setActiveTab}
        datasetInfo={dataset?.metadata}
        onOpenNewDatasetModal={() => setIsUploadModalOpen(true)}
        cleanedData={cleaningState.cleanedData}
        originalData={dataset?.originalData || []}
        activeData={dataset?.activeData || []}
        columns={dataset?.activeColumns || []}
      />

      {/* Main Content Area */}
      <main className="flex-1 mx-auto w-full max-w-7xl px-4 py-5 sm:px-6">
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
              />
            )}

            {activeTab === 'charts' && (
              <div className="space-y-4">
                <div className="border-b border-gray-200 pb-3">
                  <h1 className="text-xl font-semibold text-gray-900 tracking-tight">Chart Builder</h1>
                  <p className="mt-0.5 text-xs text-gray-500">
                    Visualize trends, distributions, and aggregates from the active dataset.
                  </p>
                </div>
                <ChartPanel
                  data={dataset.activeData}
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

      {/* Modal: Change / Upload Dataset */}
      {isUploadModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="relative w-full max-w-xl rounded-lg border border-gray-200 bg-white p-5 shadow-xl">
            <button
              onClick={() => setIsUploadModalOpen(false)}
              className="absolute right-3.5 top-3.5 rounded p-1 text-gray-400 hover:text-gray-700"
            >
              <X className="h-4 w-4" />
            </button>

            <div className="mb-4">
              <h2 className="text-base font-semibold text-gray-900">Upload or switch dataset</h2>
              <p className="text-xs text-gray-500">
                Choose a new CSV or TSV file, or select a sample dataset.
              </p>
            </div>

            <FileUploader onDataLoaded={handleDataLoaded} />
          </div>
        </div>
      )}

      {/* Clean Restrained Footer */}
      <footer className="border-t border-gray-200 bg-white py-3 text-xs text-gray-500">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 sm:px-6">
          <span>DataLens • Client-side data analytics</span>
          <span>In-memory processing</span>
        </div>
      </footer>
    </div>
  );
}
