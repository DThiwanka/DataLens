import FileUploader from './FileUploader';

export default function EmptyState({ onDataLoaded }) {
  return (
    <div className="mx-auto max-w-xl py-12 px-4 sm:px-6">
      <div className="mb-6 space-y-1.5 text-center">
        <h1 className="text-[26px] font-semibold tracking-tight text-[#20242C]">
          Analyze your data
        </h1>
        <p className="text-sm text-[#667085] max-w-md mx-auto">
          Inspect distributions, filter records, build visualizations, and clean columns locally in your browser.
        </p>
      </div>

      <FileUploader onDataLoaded={onDataLoaded} />
    </div>
  );
}
