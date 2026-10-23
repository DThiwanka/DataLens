import DataTable from '../components/DataTable';
import { exportToCsv } from '../services/csvExporter.js';

export default function DataExplorer({
  data = [],
  columns = [],
  columnProfiles = [],
  fileName = 'dataset.csv',
  onNotification,
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
      {/* Page Header */}
      <div className="border-b border-gray-200 pb-3">
        <h1 className="text-xl font-semibold text-gray-900 tracking-tight">
          Data Explorer
        </h1>
        <p className="mt-0.5 text-xs text-gray-500">
          Query, filter, and inspect {data.length.toLocaleString()} rows with in-memory execution.
        </p>
      </div>

      {/* Main Table */}
      <DataTable
        data={data}
        columns={columns}
        columnProfiles={columnProfiles}
        onExportFiltered={handleExportFiltered}
      />
    </div>
  );
}
