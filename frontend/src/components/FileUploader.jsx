import { useState, useRef } from 'react';
import {
  Upload,
  AlertCircle,
  Loader2,
  FileText,
} from 'lucide-react';
import { parseDelimitedData } from '../services/fileParser.js';
import { SAMPLE_DATASETS } from '../utils/sampleDatasets.js';

export default function FileUploader({ onDataLoaded, isCompact = false }) {
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);
  const [delimiter, setDelimiter] = useState('');
  const fileInputRef = useRef(null);

  const handleFileProcess = async (file, customDelimiter = delimiter) => {
    if (!file) return;
    setIsProcessing(true);
    setErrorMessage(null);

    try {
      const parsedResult = await parseDelimitedData(file, {
        delimiter: customDelimiter,
      });
      onDataLoaded(parsedResult);
    } catch (err) {
      setErrorMessage(err.message || 'Failed to process file.');
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
    setIsProcessing(true);
    setErrorMessage(null);

    try {
      const parsedResult = await parseDelimitedData(sample.csv, {
        fileName: `${sample.id}.csv`,
      });
      onDataLoaded(parsedResult);
    } catch (err) {
      setErrorMessage(`Failed to load sample dataset: ${err.message}`);
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
          className={`flex cursor-pointer flex-col items-center justify-center rounded-md border border-dashed p-5 text-center transition-colors ${
            isDragging
              ? 'border-amber-600 bg-amber-50/50'
              : 'border-gray-300 bg-gray-50/50 hover:border-gray-400 hover:bg-gray-50'
          }`}
        >
          {isProcessing ? (
            <div className="flex items-center gap-2 text-xs font-medium text-gray-700">
              <Loader2 className="h-4 w-4 animate-spin text-amber-600" />
              <span>Parsing file in browser...</span>
            </div>
          ) : (
            <div className="flex items-center gap-2 text-xs text-gray-600">
              <Upload className="h-4 w-4 text-gray-400" />
              <span className="font-medium text-gray-700">Upload new CSV, TSV or TXT</span>
            </div>
          )}
        </div>

        {errorMessage && (
          <div className="flex items-start gap-2 rounded-md border border-red-200 bg-red-50 p-2.5 text-xs text-red-700">
            <AlertCircle className="mt-0.5 h-3.5 w-3.5 shrink-0 text-red-500" />
            <span>{errorMessage}</span>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="w-full space-y-6">
      {/* Upload Zone */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => !isProcessing && fileInputRef.current?.click()}
        className={`flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed p-8 md:p-10 text-center transition-colors ${
          isDragging
            ? 'border-amber-600 bg-amber-50/40'
            : 'border-gray-300 bg-white hover:border-gray-400 hover:bg-gray-50/30'
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
          <div className="flex flex-col items-center justify-center space-y-2.5 py-4">
            <Loader2 className="h-8 w-8 animate-spin text-amber-600" />
            <p className="text-sm font-medium text-gray-900">Processing dataset in memory...</p>
            <p className="text-xs text-gray-500">Calculating column profiles and data types.</p>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center space-y-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-100 text-gray-600">
              <Upload className="h-5 w-5" />
            </div>

            <div className="space-y-1">
              <p className="text-sm font-medium text-gray-900">
                Drag and drop your dataset here, or{' '}
                <span className="text-[#C58A16] hover:underline">browse files</span>
              </p>
              <p className="text-xs text-gray-500">
                Supports CSV, TSV, or delimited TXT up to 15 MB (maximum 100,000 rows).
              </p>
            </div>

            {/* Delimiter Selection Control */}
            <div
              className="mt-2 flex items-center gap-2 text-xs text-gray-500 pt-1"
              onClick={(e) => e.stopPropagation()}
            >
              <span>Delimiter:</span>
              <select
                value={delimiter}
                onChange={(e) => setDelimiter(e.target.value)}
                className="rounded border border-gray-300 bg-white px-2 py-1 text-xs text-gray-800 focus:border-amber-600 focus:outline-none"
              >
                <option value="">Auto-detect</option>
                <option value=",">Comma (,)</option>
                <option value="&#9;">Tab (\t)</option>
                <option value=";">Semicolon (;)</option>
                <option value="|">Pipe (|)</option>
              </select>
            </div>
          </div>
        )}
      </div>

      {/* Error Message */}
      {errorMessage && (
        <div className="flex items-start gap-2.5 rounded-md border border-red-200 bg-red-50 p-3 text-xs text-red-700">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-red-500" />
          <div>
            <p className="font-semibold text-red-800">Unable to parse file</p>
            <p className="mt-0.5">{errorMessage}</p>
          </div>
        </div>
      )}

      {/* Curated Sample Datasets */}
      <div className="space-y-2 pt-2">
        <p className="text-xs font-medium text-gray-500">Or start with a sample dataset:</p>
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
          {SAMPLE_DATASETS.map((sample) => (
            <button
              key={sample.id}
              onClick={() => handleLoadSample(sample)}
              disabled={isProcessing}
              className="flex flex-col justify-between rounded-md border border-gray-200 bg-white p-3 text-left transition-colors hover:border-gray-300 hover:bg-gray-50 disabled:opacity-50"
            >
              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-medium text-gray-900">{sample.name}</span>
                  <FileText className="h-3.5 w-3.5 text-gray-400" />
                </div>
                <p className="text-[11px] text-gray-500 line-clamp-2 leading-relaxed">
                  {sample.description}
                </p>
              </div>
              <div className="mt-3 flex items-center justify-between border-t border-gray-100 pt-2 text-[11px]">
                <span className="text-gray-400 font-mono">{sample.tags[0]}</span>
                <span className="font-medium text-[#C58A16]">Load dataset →</span>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
