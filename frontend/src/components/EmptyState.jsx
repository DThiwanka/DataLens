import {
  Sparkles,
  ShieldCheck,
  Zap,
  BarChart3,
  Wand2,
} from 'lucide-react';
import FileUploader from './FileUploader';

export default function EmptyState({ onDataLoaded }) {
  const highlights = [
    {
      icon: ShieldCheck,
      title: '100% Client-Side Privacy',
      description: 'Your dataset never touches a remote server. All profiling, parsing, and cleaning executes locally in memory.',
    },
    {
      icon: Zap,
      title: 'Instant Data Profiling',
      description: 'Automatic type inference, completeness scoring, distinct counts, distributions, and numerical statistics in milliseconds.',
    },
    {
      icon: BarChart3,
      title: 'Interactive Visualizations',
      description: 'Dynamic charts with Recharts: Bar, Line, Area, and Pie charts with flexible multi-measure aggregations.',
    },
    {
      icon: Wand2,
      title: 'Data Cleaning Studio',
      description: 'Deduplicate rows, handle missing values, normalize headers, find & replace, and transform columns with full undo history.',
    },
  ];

  return (
    <div className="relative min-h-[calc(100vh-140px)] flex flex-col justify-center px-4 py-8 md:py-16">
      {/* Background radial gradients for subtle glow */}
      <div className="pointer-events-none absolute left-1/2 top-10 -translate-x-1/2 -z-10 h-96 w-96 rounded-full bg-amber-500/10 blur-[120px]" />
      <div className="pointer-events-none absolute right-1/4 top-1/3 -z-10 h-72 w-72 rounded-full bg-amber-600/5 blur-[100px]" />

      <div className="mx-auto w-full max-w-4xl text-center space-y-4 mb-8 md:mb-12">
        <div className="inline-flex items-center gap-2 rounded-full border border-amber-500/30 bg-amber-500/10 px-3.5 py-1 text-xs font-semibold text-amber-400 shadow-[0_0_15px_rgba(245,158,11,0.2)]">
          <Sparkles className="h-3.5 w-3.5" />
          <span>Browser-Native Tabular Analytics & Data Cleaning</span>
        </div>

        <h1 className="text-3xl sm:text-5xl md:text-6xl font-extrabold tracking-tight text-white leading-tight">
          Inspect, Clean & Visualize Data <br />
          <span className="bg-gradient-to-r from-amber-400 via-amber-200 to-amber-500 bg-clip-text text-transparent">
            Without Leaving Your Browser
          </span>
        </h1>

        <p className="mx-auto max-w-2xl text-sm sm:text-base text-slate-400 leading-relaxed">
          Upload any CSV, TSV, or delimited text file to unlock deep statistical profiling,
          multi-column querying, interactive charts, and an in-memory data cleaning studio.
        </p>
      </div>

      {/* Uploader Section */}
      <div className="mb-12 md:mb-16">
        <FileUploader onDataLoaded={onDataLoaded} />
      </div>

      {/* Highlights Grid */}
      <div className="mx-auto w-full max-w-5xl">
        <div className="border-t border-white/5 pt-10">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {highlights.map((item, idx) => {
              const Icon = item.icon;
              return (
                <div
                  key={idx}
                  className="rounded-xl border border-white/5 bg-[#141820]/60 p-4 transition-all hover:border-amber-500/20 hover:bg-[#161c26]"
                >
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-amber-500/20 bg-amber-500/10 text-amber-400 mb-3">
                    <Icon className="h-5 w-5" />
                  </div>
                  <h3 className="text-sm font-semibold text-white mb-1">{item.title}</h3>
                  <p className="text-xs text-slate-400 leading-relaxed">{item.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
