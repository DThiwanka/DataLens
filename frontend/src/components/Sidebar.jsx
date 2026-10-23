import {
  LayoutDashboard,
  Table2,
  BarChart3,
  Wand2,
  Upload,
  Download,
  X,
} from 'lucide-react';
import { formatNumber, formatBytes } from '../utils/formatters.js';

export default function Sidebar({
  activeTab,
  onTabChange,
  dataset,
  onOpenNewDatasetModal,
  onExportClick,
  isOpen,
  onClose,
}) {
  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'explorer', label: 'Data Explorer', icon: Table2 },
    { id: 'charts', label: 'Chart Builder', icon: BarChart3 },
    { id: 'cleaning', label: 'Cleaning Studio', icon: Wand2 },
  ];

  const hasDataset = Boolean(dataset);

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/25 backdrop-blur-[1px] md:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed inset-y-0 left-0 z-40 flex w-[224px] flex-col border-r border-[#E3E6EB] bg-[#FFFFFF] transition-transform duration-150 ease-out md:static md:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Brand Header */}
        <div className="flex h-14 items-center justify-between border-b border-[#E3E6EB] px-4">
          <div className="flex items-center gap-2">
            {/* Restrained architectural monogram glyph */}
            <div className="flex h-6 w-6 items-center justify-center rounded bg-[#20242C] text-[#F7F8FA] font-medium text-xs tracking-tight">
              DL
            </div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-sm font-semibold tracking-tight text-[#20242C]">
                DataLens
              </span>
              <span className="text-[10px] font-medium text-[#89919F]">
                AI
              </span>
            </div>
          </div>

          {/* Close button for mobile drawer */}
          <button
            onClick={onClose}
            className="rounded p-1 text-[#667085] hover:bg-[#F1F3F5] hover:text-[#20242C] md:hidden"
            aria-label="Close navigation"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Navigation List */}
        <div className="flex-1 overflow-y-auto px-2.5 py-3">
          <div className="mb-1.5 px-2 text-[11px] font-medium text-[#89919F]">
            Workspace
          </div>
          <nav className="space-y-0.5">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    onTabChange(item.id);
                    if (onClose) onClose();
                  }}
                  disabled={!hasDataset && item.id !== 'dashboard'}
                  className={`group relative flex w-full items-center gap-2 rounded-md px-2.5 py-1.5 text-[13px] font-medium transition-colors ${
                    isActive
                      ? 'bg-[#F1F3F5] text-[#20242C]'
                      : !hasDataset && item.id !== 'dashboard'
                      ? 'text-[#89919F]/60 cursor-not-allowed'
                      : 'text-[#667085] hover:bg-[#F7F8FA] hover:text-[#20242C]'
                  }`}
                >
                  {/* Subtle active indicator marker */}
                  {isActive && (
                    <span className="absolute left-0 top-1 bottom-1 w-0.5 rounded-r bg-[#B98220]" />
                  )}
                  <Icon
                    className={`h-4 w-4 shrink-0 transition-colors ${
                      isActive
                        ? 'text-[#B98220]'
                        : !hasDataset && item.id !== 'dashboard'
                        ? 'text-[#89919F]/50'
                        : 'text-[#667085] group-hover:text-[#20242C]'
                    }`}
                  />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>

          {/* Actions */}
          <div className="mt-5 mb-1.5 px-2 text-[11px] font-medium text-[#89919F]">
            Actions
          </div>
          <div className="space-y-0.5">
            <button
              onClick={() => {
                onOpenNewDatasetModal();
                if (onClose) onClose();
              }}
              className="flex w-full items-center gap-2 rounded-md px-2.5 py-1.5 text-[13px] font-medium text-[#667085] hover:bg-[#F7F8FA] hover:text-[#20242C] transition-colors"
            >
              <Upload className="h-4 w-4 shrink-0 text-[#667085]" />
              <span>{hasDataset ? 'Switch dataset' : 'Import dataset'}</span>
            </button>

            {hasDataset && onExportClick && (
              <button
                onClick={() => {
                  onExportClick();
                  if (onClose) onClose();
                }}
                className="flex w-full items-center gap-2 rounded-md px-2.5 py-1.5 text-[13px] font-medium text-[#667085] hover:bg-[#F7F8FA] hover:text-[#20242C] transition-colors"
              >
                <Download className="h-4 w-4 shrink-0 text-[#667085]" />
                <span>Export active data</span>
              </button>
            )}
          </div>
        </div>

        {/* Dataset Context Widget at Bottom */}
        <div className="border-t border-[#E3E6EB] bg-[#F7F8FA] p-3">
          {hasDataset ? (
            <div className="space-y-1.5 rounded border border-[#E3E6EB] bg-[#FFFFFF] p-2.5">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-medium text-[#89919F]">
                  Current dataset
                </span>
                <span className="text-[10px] font-mono text-[#667085]">
                  {dataset.metadata?.delimiter === '\t' ? 'TSV' : 'CSV'}
                </span>
              </div>

              <div
                className="truncate font-medium text-xs text-[#20242C]"
                title={dataset.metadata?.fileName}
              >
                {dataset.metadata?.fileName || 'dataset.csv'}
              </div>

              <div className="flex items-center justify-between text-[11px] font-mono text-[#667085]">
                <span>{formatNumber(dataset.activeData.length, 0)} rows</span>
                <span>{dataset.activeColumns.length} cols</span>
              </div>

              {dataset.metadata?.fileSize && (
                <div className="text-[10px] text-[#89919F]">
                  {formatBytes(dataset.metadata.fileSize)} · in-memory
                </div>
              )}
            </div>
          ) : (
            <div className="rounded border border-dashed border-[#E3E6EB] p-2.5 text-center">
              <span className="block text-xs font-medium text-[#667085]">
                No dataset active
              </span>
              <button
                onClick={onOpenNewDatasetModal}
                className="mt-1 text-[11px] font-medium text-[#B98220] hover:text-[#9D6D17] hover:underline"
              >
                Import CSV / TSV
              </button>
            </div>
          )}

          <div className="mt-2 flex items-center justify-between text-[10px] text-[#89919F]">
            <span>Client-side engine</span>
            <span>No backend</span>
          </div>
        </div>
      </aside>
    </>
  );
}
