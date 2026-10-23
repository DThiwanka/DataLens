import DataTable from '../components/DataTable';
import { Table2 } from 'lucide-react';
import { exportToCsv } from '../services/csvExporter';

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
          message: `Successfully exported ${filteredRows.length.toLocaleString()} filtered rows to CSV!`,
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
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-white/5 pb-3">
        <div>
          <h1 className="text-xl font-bold text-white flex items-center gap-2">
            <Table2 className="h-5 w-5 text-amber-400" />
            Data Explorer
          </h1>
          <p className="text-xs text-slate-400">
            Search, filter, sort, and paginate through records entirely in-memory.
          </p>
        </div>
      </div>

      {/* Main Table Component */}
      <DataTable
        data={data}
        columns={columns}
        columnProfiles={columnProfiles}
        onExportFiltered={handleExportFiltered}
      />
    </div>
  );
}
