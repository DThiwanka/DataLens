import CleanStudio from '../components/CleanStudio';

export default function CleanStudioPage({
  originalData,
  originalColumns,
  cleanedData,
  cleanedColumns,
  history,
  onApplyTransformation,
  onUndoTransformation,
  onResetToOriginal,
  onCommitCleanedToActive,
}) {
  return (
    <div className="space-y-4">
      <CleanStudio
        originalData={originalData}
        originalColumns={originalColumns}
        cleanedData={cleanedData}
        cleanedColumns={cleanedColumns}
        history={history}
        onApplyTransformation={onApplyTransformation}
        onUndoTransformation={onUndoTransformation}
        onResetToOriginal={onResetToOriginal}
        onCommitCleanedToActive={onCommitCleanedToActive}
      />
    </div>
  );
}
