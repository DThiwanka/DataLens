import { useState, useRef } from 'react';
import {
  Upload,
  AlertCircle,
  Loader2,
  FileText,
} from 'lucide-react';
import { parseDelimitedData } from '../services/fileParser.js';
import { SAMPLE_DATASETS } from '../utils/sampleDatasets.js';
import { formatBytes } from '../utils/formatters.js';

export default function FileUploader({ onDataLoaded, isCompact = false }) {
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [selectedFileMeta, setSelectedFileMeta] = useState(null);
  const [errorMessage, setErrorMessage] = useState(null);
  const [delimiter, setDelimiter] = useState('');
  const fileInputRef = useRef(null);

  const handleFileProcess = async (file, customDelimiter = delimiter) => {
    if (!file) return;
    setSelectedFileMeta({
      name: file.name,
      size: file.size,
    });
    setIsProcessing(true);
    setErrorMessage(null);

    try {
      const parsedResult = await parseDelimitedData(file, {
        delimiter: customDelimiter,
      });
      onDataLoaded(parsedResult);
    } catch (err) {
      setErrorMessage(err.message || 'Failed to process file.');
      setSelectedFileMeta(null);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      handleFileProcess(files[0]);
    }
  };

  const handleFileInputChange = (e) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleFileProcess(files[0]);
    }
  };

  const handleLoadSample = async (sample) => {
    setSelectedFileMeta({
      name: `${sample.id}.csv`,
      size: sample.csv.length,
    });
    setIsProcessing(true);
    setErrorMessage(null);

    try {
      const parsedResult = await parseDelimitedData(sample.csv, {
        fileName: `${sample.id}.csv`,
      });
      onDataLoaded(parsedResult);
    } catch (err) {
      setErrorMessage(`Failed to load sample dataset: ${err.message}`);
      setSelectedFileMeta(null);
    } finally {
      setIsProcessing(false);
    }
  };

  if (isCompact) {
    return (
      <div className="flex flex-col gap-2.5">
        <input
          ref={fileInputRef}
          type="file"
          accept=".csv,.tsv,.txt,text/csv,text/tab-separated-values,text/plain"
          className="hidden"
          onChange={handleFileInputChange}
        />
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`flex cursor-pointer flex-col items-center justify-center rounded border border-dashed p-4 text-center transition-colors ${
            isDragging
              ? 'border-[#B98220] bg-amber-50/30'
              : 'border-[#E3E6EB] bg-[#F7F8FA] hover:border-[#D1D5DB] hover:bg-[#F1F3F5]'
          }`}
        >
          {isProcessing ? (
            <div className="flex items-center gap-2 text-xs font-medium text-[#20242C]">
              <Loader2 className="h-3.5 w-3.5 animate-spin text-[#B98220]" />
              <span>Parsing dataset in browser...</span>
            </div>
          ) : (
            <div className="flex items-center gap-2 text-xs text-[#667085]">
              <Upload className="h-3.5 w-3.5 text-[#89919F]" />
              <span className="font-medium text-[#20242C]">Select or drop file</span>
            </div>
          )}
        </div>

        {errorMessage && (
          <div className="flex items-start gap-2 rounded border border-red-200 bg-red-50 p-2 text-xs text-red-700">
            <AlertCircle className="mt-0.5 h-3.5 w-3.5 shrink-0 text-red-500" />
            <span>{errorMessage}</span>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="w-full space-y-5">
      {/* Upload Zone */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => !isProcessing && fileInputRef.current?.click()}
        className={`flex cursor-pointer flex-col items-center justify-center rounded border border-dashed p-8 text-center transition-colors ${
          isDragging
            ? 'border-[#B98220] bg-amber-50/20'
            : 'border-[#E3E6EB] bg-[#FFFFFF] hover:border-[#D1D5DB] hover:bg-[#F7F8FA]'
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept=".csv,.tsv,.txt,text/csv,text/tab-separated-values,text/plain"
          className="hidden"
          onChange={handleFileInputChange}
          disabled={isProcessing}
        />

        {isProcessing ? (
          <div className="flex flex-col items-center justify-center space-y-2 py-3">
            <Loader2 className="h-5 w-5 animate-spin text-[#B98220]" />
            <p className="text-sm font-medium text-[#20242C]">
              Parsing {selectedFileMeta?.name || 'dataset'}...
            </p>
            <p className="text-xs text-[#89919F]">
              Evaluating data types, missing rates, and distributions in memory.
            </p>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center space-y-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#F1F3F5] text-[#667085]">
              <Upload className="h-4 w-4" />
            </div>

            <div className="space-y-1">
              <p className="text-sm font-medium text-[#20242C]">
                Drop your file here, or{' '}
                <span className="font-semibold text-[#B98220] hover:text-[#9D6D17] hover:underline">
                  browse files
                </span>
              </p>
              <p className="text-xs text-[#89919F]">
                Supports CSV, TSV, or delimited TXT up to 15 MB (maximum 100,000 rows).
              </p>
            </div>

            {/* Delimiter Selection Control */}
            <div
              className="mt-1 flex items-center gap-1.5 text-xs text-[#667085] pt-1"
              onClick={(e) => e.stopPropagation()}
            >
              <span className="text-[11px] text-[#89919F]">Delimiter:</span>
              <select
                value={delimiter}
                onChange={(e) => setDelimiter(e.target.value)}
                className="h-7 rounded border border-[#E3E6EB] bg-[#FFFFFF] px-2 text-xs text-[#20242C] focus:border-[#B98220] focus:outline-none"
              >
                <option value="">Auto-detect</option>
                <option value=",">Comma (,)</option>
                <option value={"\t"}>Tab (\t)</option>
                <option value=";">Semicolon (;)</option>
                <option value="|">Pipe (|)</option>
              </select>
            </div>
          </div>
        )}
      </div>

      {/* Selected file row preview during/after processing */}
      {selectedFileMeta && isProcessing && (
        <div className="flex items-center justify-between rounded border border-[#E3E6EB] bg-[#FFFFFF] px-3 py-2 text-xs">
          <div className="flex items-center gap-2 truncate">
            <FileText className="h-4 w-4 text-[#89919F] shrink-0" />
            <span className="font-medium text-[#20242C] truncate">{selectedFileMeta.name}</span>
            <span className="text-[11px] text-[#89919F]">
              ({formatBytes(selectedFileMeta.size)})
            </span>
          </div>
          <span className="text-[11px] font-mono text-[#B98220]">Validating...</span>
        </div>
      )}

      {/* Error Message */}
      {errorMessage && (
        <div className="flex items-start gap-2 rounded border border-red-200 bg-red-50 p-3 text-xs text-red-700">
          <AlertCircle className="mt-0.5 h-3.5 w-3.5 shrink-0 text-red-500" />
          <div>
            <p className="font-semibold text-red-800">Unable to parse file</p>
            <p className="mt-0.5 text-red-700">{errorMessage}</p>
          </div>
        </div>
      )}

      {/* Understated Sample Datasets Section */}
      <div className="space-y-2 pt-1">
        <p className="text-xs font-medium text-[#89919F]">Or explore with a sample dataset:</p>
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
          {SAMPLE_DATASETS.map((sample) => (
            <button
              key={sample.id}
              onClick={() => handleLoadSample(sample)}
              disabled={isProcessing}
              className="group flex flex-col justify-between rounded border border-[#E3E6EB] bg-[#FFFFFF] p-3 text-left transition-colors hover:border-[#D1D5DB] hover:bg-[#F7F8FA] disabled:opacity-40"
            >
              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-semibold text-[#20242C] group-hover:text-[#B98220] transition-colors">
                    {sample.name}
                  </span>
                  <FileText className="h-3.5 w-3.5 text-[#89919F]" />
                </div>
                <p className="text-[11px] text-[#667085] line-clamp-2 leading-relaxed">
                  {sample.description}
                </p>
              </div>
              <div className="mt-2.5 flex items-center justify-between border-t border-[#E3E6EB] pt-2 text-[11px]">
                <span className="text-[#89919F] font-mono">{sample.tags[0]}</span>
                <span className="font-medium text-[#B98220] group-hover:underline">Load →</span>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
