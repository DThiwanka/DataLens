import { useState, useMemo, useCallback } from 'react';
import Topbar from './components/Topbar';
import EmptyState from './components/EmptyState';
import FileUploader from './components/FileUploader';
import Dashboard from './pages/Dashboard';
import DataExplorer from './pages/DataExplorer';
import CleanStudioPage from './pages/CleanStudioPage';
import ChartPanel from './components/ChartPanel';
import { generateDatasetProfile } from './services/dataProfiler';
import { X, CheckCircle2, AlertCircle, Info } from 'lucide-react';

export default function App() {
  // Navigation State: 'dashboard' | 'explorer' | 'charts' | 'cleaning'
  const [activeTab, setActiveTab] = useState('dashboard');

  // Dataset State
  const [dataset, setDataset] = useState(null);
  // Modal to switch / upload another dataset
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
      `Loaded "${fileName}" (${data.length.toLocaleString()} rows, ${columns.length} columns) successfully!`,
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

    showToast('Undid latest cleaning transformation.', 'info');
  }, [showToast]);

  // Reset Clean Studio state back to immutable original dataset
  const handleResetToOriginal = useCallback(() => {
    if (!dataset) return;
    setCleaningState({
      cleanedData: dataset.originalData,
      cleanedColumns: dataset.originalColumns,
      history: [],
    });

    showToast('Reset cleaning workspace to original imported dataset.', 'info');
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
      `Applied cleaned data (${cleaningState.cleanedData.length.toLocaleString()} rows) to active Explorer & Charts!`,
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
    <div className="min-h-screen bg-[#0B0E13] text-slate-100 flex flex-col font-sans selection:bg-amber-500/30 selection:text-white">
      {/* Toast Notification */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2.5 rounded-xl border border-white/10 bg-[#161c26]/95 px-4 py-3 text-xs shadow-2xl backdrop-blur-md animate-in fade-in slide-in-from-bottom-3">
          {toast.type === 'success' && <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />}
          {toast.type === 'error' && <AlertCircle className="h-4 w-4 text-rose-400 shrink-0" />}
          {toast.type === 'info' && <Info className="h-4 w-4 text-amber-400 shrink-0" />}
          <span className="text-slate-200">{toast.message}</span>
          <button
            onClick={() => setToast(null)}
            className="ml-2 text-slate-400 hover:text-white"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      )}

      {/* Main Persistent Top Navigation Bar */}
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

      {/* Main Workspace Body */}
      <main className="flex-1 mx-auto w-full max-w-7xl px-4 py-6 sm:px-6">
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
                <div className="border-b border-white/5 pb-3">
                  <h1 className="text-xl font-bold text-white">Interactive Chart Builder</h1>
                  <p className="text-xs text-slate-400">
                    Aggregate and visualize the active dataset with customizable Recharts views.
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

      {/* Modal: Switch / Upload New Dataset */}
      {isUploadModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm animate-in fade-in">
          <div className="relative w-full max-w-2xl rounded-2xl border border-white/10 bg-[#141820] p-6 shadow-2xl">
            <button
              onClick={() => setIsUploadModalOpen(false)}
              className="absolute right-4 top-4 rounded-lg p-1 text-slate-400 hover:bg-white/5 hover:text-white"
            >
              <X className="h-5 w-5" />
            </button>

            <div className="mb-4">
              <h2 className="text-lg font-bold text-white">Upload or Switch Dataset</h2>
              <p className="text-xs text-slate-400">
                Load a new CSV or TSV file, or select a sample dataset. All operations run in your browser.
              </p>
            </div>

            <FileUploader onDataLoaded={handleDataLoaded} />
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="border-t border-white/5 bg-[#0B0E13] py-4 text-center text-xs text-slate-500">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 sm:px-6">
          <p>© {new Date().getFullYear()} DataLens AI • Client-Side Browser In-Memory Architecture</p>
          <div className="flex items-center gap-4 text-slate-400">
            <span>Zero Server Latency</span>
            <span>•</span>
            <span className="text-emerald-400">Private by Design</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
