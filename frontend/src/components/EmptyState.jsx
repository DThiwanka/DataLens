import FileUploader from './FileUploader';

export default function EmptyState({ onDataLoaded }) {
  return (
    <div className="mx-auto max-w-2xl py-12 px-4 sm:px-6">
      <div className="mb-6 space-y-1 text-center">
        <h1 className="text-xl sm:text-2xl font-semibold tracking-tight text-gray-900">
          Analyze your data
        </h1>
        <p className="text-xs sm:text-sm text-gray-500 max-w-md mx-auto">
          Upload a CSV, TSV, or delimited text file to inspect statistics, build charts, and clean records locally in your browser.
        </p>
      </div>

      <FileUploader onDataLoaded={onDataLoaded} />
    </div>
  );
}
