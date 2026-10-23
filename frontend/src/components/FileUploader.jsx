import { useState, useRef } from 'react';
import {
  Upload,
  FileSpreadsheet,
  AlertCircle,
  Loader2,
  Sparkles,
  ShieldCheck,
  FileType,
  ArrowRight,
} from 'lucide-react';
import { parseDelimitedData } from '../services/fileParser';
import { SAMPLE_DATASETS } from '../utils/sampleDatasets';

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
      <div className="flex flex-col gap-3">
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
          className={`flex cursor-pointer flex-col items-center justify-center rounded-xl border border-dashed p-6 text-center transition-all ${
            isDragging
              ? 'border-amber-500 bg-amber-500/10'
              : 'border-white/10 bg-[#141820]/80 hover:border-amber-500/40 hover:bg-[#161c26]'
          }`}
        >
          {isProcessing ? (
            <div className="flex items-center gap-3 text-amber-400">
              <Loader2 className="h-5 w-5 animate-spin" />
              <span className="text-sm font-medium">Parsing dataset locally...</span>
            </div>
          ) : (
            <div className="flex items-center gap-3 text-slate-300">
              <Upload className="h-5 w-5 text-amber-400" />
              <span className="text-sm font-medium">Upload new CSV / TSV file</span>
            </div>
          )}
        </div>

        {errorMessage && (
          <div className="flex items-start gap-2 rounded-lg border border-rose-500/20 bg-rose-500/10 p-3 text-xs text-rose-300">
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-rose-400" />
            <span>{errorMessage}</span>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-4xl space-y-6">
      {/* Upload Box */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => !isProcessing && fileInputRef.current?.click()}
        className={`group relative flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed p-8 md:p-12 text-center transition-all duration-300 ${
          isDragging
            ? 'scale-[1.01] border-amber-500 bg-amber-500/10 shadow-[0_0_30px_rgba(245,158,11,0.2)]'
            : 'border-white/10 bg-[#141820]/70 hover:border-amber-500/50 hover:bg-[#161c26] hover:shadow-[0_0_25px_rgba(245,158,11,0.1)]'
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

        {/* Ambient Glow */}
        <div className="pointer-events-none absolute inset-0 -z-10 rounded-2xl bg-gradient-to-b from-amber-500/5 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

        {isProcessing ? (
          <div className="flex flex-col items-center justify-center space-y-3 py-6">
            <div className="relative">
              <Loader2 className="h-12 w-12 animate-spin text-amber-400" />
              <div className="absolute inset-0 h-12 w-12 rounded-full blur-md bg-amber-500/20" />
            </div>
            <h3 className="text-lg font-semibold text-white">Analyzing & Profiling Data</h3>
            <p className="text-sm text-slate-400">
              Parsing tabular structure, inferring column types, and calculating metrics in your browser...
            </p>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center space-y-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl border border-amber-500/20 bg-amber-500/10 text-amber-400 shadow-[0_0_20px_rgba(245,158,11,0.2)] transition-transform duration-300 group-hover:scale-110">
              <Upload className="h-8 w-8" />
            </div>

            <div className="space-y-1.5">
              <h3 className="text-lg md:text-xl font-semibold text-white">
                Drag and drop your dataset here, or{' '}
                <span className="text-amber-400 underline decoration-amber-400/50 underline-offset-4 group-hover:decoration-amber-400">
                  browse files
                </span>
              </h3>
              <p className="text-sm text-slate-400 max-w-md mx-auto">
                Supports <span className="text-slate-200 font-mono">.csv</span>,{' '}
                <span className="text-slate-200 font-mono">.tsv</span>, and delimited{' '}
                <span className="text-slate-200 font-mono">.txt</span> files up to 15 MB.
              </p>
            </div>

            {/* Delimiter & Parsing Preference Pill */}
            <div
              className="mt-2 flex flex-wrap items-center justify-center gap-2 text-xs text-slate-400"
              onClick={(e) => e.stopPropagation()}
            >
              <span className="flex items-center gap-1.5 rounded-lg border border-white/5 bg-white/[0.03] px-3 py-1.5">
                <FileType className="h-3.5 w-3.5 text-amber-400" />
                Delimiter:
                <select
                  value={delimiter}
                  onChange={(e) => setDelimiter(e.target.value)}
                  className="ml-1 rounded border border-white/10 bg-[#0B0E13] px-2 py-0.5 text-xs text-white focus:border-amber-500 focus:outline-none"
                >
                  <option value="">Auto-Detect</option>
                  <option value=",">Comma (,)</option>
                  <option value="&#9;">Tab (\t)</option>
                  <option value=";">Semicolon (;)</option>
                  <option value="|">Pipe (|)</option>
                </select>
              </span>

              <span className="flex items-center gap-1.5 rounded-lg border border-emerald-500/20 bg-emerald-500/5 px-3 py-1.5 text-emerald-400">
                <ShieldCheck className="h-3.5 w-3.5" />
                100% In-Browser & Private
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Error Message Display */}
      {errorMessage && (
        <div className="flex items-start gap-3 rounded-xl border border-rose-500/30 bg-rose-500/10 p-4 text-sm text-rose-200 shadow-lg">
          <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-rose-400" />
          <div className="space-y-1">
            <p className="font-semibold text-rose-300">File Processing Error</p>
            <p className="text-xs text-rose-200/90 leading-relaxed">{errorMessage}</p>
          </div>
        </div>
      )}

      {/* Sample Datasets Section */}
      <div className="space-y-3 pt-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-amber-400" />
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-300">
              Or Try A Curated Sample Dataset
            </span>
          </div>
          <span className="text-xs text-slate-500">Instant 1-Click Load</span>
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          {SAMPLE_DATASETS.map((sample) => (
            <button
              key={sample.id}
              onClick={() => handleLoadSample(sample)}
              disabled={isProcessing}
              className="group flex flex-col justify-between rounded-xl border border-white/8 bg-[#141820]/90 p-4 text-left transition-all duration-200 hover:border-amber-500/40 hover:bg-[#161c26] hover:shadow-lg disabled:opacity-50"
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="rounded border border-amber-500/20 bg-amber-500/10 px-2 py-0.5 text-[10px] font-semibold text-amber-400 uppercase tracking-wide">
                    {sample.badge}
                  </span>
                  <FileSpreadsheet className="h-4 w-4 text-slate-500 group-hover:text-amber-400 transition-colors" />
                </div>
                <h4 className="text-sm font-semibold text-white group-hover:text-amber-300 transition-colors">
                  {sample.name}
                </h4>
                <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
                  {sample.description}
                </p>
              </div>

              <div className="mt-4 flex items-center justify-between border-t border-white/5 pt-3">
                <div className="flex gap-1.5">
                  {sample.tags.slice(0, 2).map((t) => (
                    <span
                      key={t}
                      className="rounded bg-white/5 px-1.5 py-0.5 text-[10px] text-slate-400 font-mono"
                    >
                      {t}
                    </span>
                  ))}
                </div>
                <span className="inline-flex items-center text-xs font-medium text-amber-400 group-hover:translate-x-0.5 transition-transform">
                  Load <ArrowRight className="ml-1 h-3 w-3" />
                </span>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
