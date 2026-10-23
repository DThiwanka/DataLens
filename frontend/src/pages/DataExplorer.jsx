import DataTable from '../components/DataTable';
import { exportToCsv } from '../services/csvExporter.js';

export default function DataExplorer({
  data = [],
  columns = [],
  columnProfiles = [],
  fileName = 'dataset.csv',
  onNotification,
  searchQuery,
  onSearchChange,
  filters,
  onFiltersChange,
}) {
  const handleExportFiltered = (filteredRows, visibleCols) => {
    try {
      exportToCsv(filteredRows, visibleCols, `datalens-filtered-${fileName}`);
      if (onNotification) {
        onNotification({
          type: 'success',
          message: `Exported ${filteredRows.length.toLocaleString()} rows to CSV.`,
        });
      }
    } catch (err) {
      if (onNotification) {
        onNotification({
          type: 'error',
          message: `Export failed: ${err.message}`,
        });
      }
    }
  };

  return (
    <div className="space-y-4">
      {/* Context Header */}
      <div className="border-b border-[#E3E6EB] pb-3">
        <h2 className="text-lg font-semibold tracking-tight text-[#20242C]">
          Data Explorer
        </h2>
        <p className="mt-0.5 text-xs text-[#667085]">
          {fileName} · {data.length.toLocaleString()} rows · {columns.length} columns · in-memory execution
        </p>
      </div>

      {/* Main Table */}
      <DataTable
        data={data}
        columns={columns}
        columnProfiles={columnProfiles}
        onExportFiltered={handleExportFiltered}
        searchQuery={searchQuery}
        onSearchChange={onSearchChange}
        filters={filters}
        onFiltersChange={onFiltersChange}
      />
    </div>
  );
}
