
import { useState } from "react";
import {
  Activity,
  BarChart3,
  Database,
  FileSpreadsheet,
  LayoutDashboard,
  Upload,
  ShieldCheck,
  Sparkles,
} from "lucide-react";

const navigation = [
  { label: "Overview", icon: LayoutDashboard },
  { label: "Data Explorer", icon: Database },
  { label: "AI Insights", icon: Sparkles },
];

export default function App() {
  const [file, setFile] = useState(null);
  const [error, setError] = useState("");

  function handleFile(event) {
    const selected = event.target.files?.[0];
    setError("");

    if (!selected) return;

    if (!selected.name.toLowerCase().endsWith(".csv")) {
      setFile(null);
      setError("Please select a CSV file.");
      event.target.value = "";
      return;
    }

    setFile(selected);
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 md:flex">
      <aside className="border-b border-slate-200 bg-white p-5 md:min-h-screen md:w-64 md:border-b-0 md:border-r">
        <div className="mb-8 flex items-center gap-3">
          <div className="rounded-xl bg-indigo-600 p-2 text-white">
            <BarChart3 size={24} />
          </div>
          <div>
            <h1 className="text-lg font-bold">DataLens AI</h1>
            <p className="text-xs text-slate-500">CSV Intelligence</p>
          </div>
        </div>

        <nav className="flex gap-2 md:flex-col">
          {navigation.map(({ label, icon: Icon }, index) => (
            <button
              key={label}
              type="button"
              className={`flex items-center gap-3 rounded-lg px-3 py-3 text-left text-sm ${
                index === 0
                  ? "bg-indigo-50 font-semibold text-indigo-700"
                  : "text-slate-600 hover:bg-slate-100"
              }`}
            >
              <Icon size={18} />
              {label}
            </button>
          ))}
        </nav>

        <div className="mt-8 hidden rounded-xl bg-slate-50 p-4 md:block">
          <ShieldCheck className="mb-2 text-emerald-600" size={22} />
          <p className="text-sm font-semibold">Privacy first</p>
          <p className="mt-1 text-xs leading-5 text-slate-500">
            Your analysis will run through your own application services.
          </p>
        </div>
      </aside>

      <main className="min-w-0 flex-1 p-5 md:p-9">
        <header className="mb-8 flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="mb-2 text-sm text-slate-500">
              Workspace / Overview
            </p>
            <h2 className="text-2xl font-bold tracking-tight md:text-3xl">
              Data Analytics Workspace
            </h2>
            <p className="mt-2 text-sm text-slate-500">
              Discover patterns and understand your data.
            </p>
          </div>

          <div className="flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-2 text-sm">
            <span className="h-2 w-2 rounded-full bg-emerald-500" />
            Analytics workspace
          </div>
        </header>

        <section className="mb-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {[
            { label: "Total rows", value: "—", icon: Database },
            { label: "Total columns", value: "—", icon: FileSpreadsheet },
            { label: "Missing values", value: "—", icon: Activity },
            { label: "Data quality", value: "Not analyzed", icon: ShieldCheck },
          ].map(({ label, value, icon: Icon }) => (
            <div
              key={label}
              className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
            >
              <div className="mb-4 flex items-center justify-between">
                <span className="text-sm text-slate-500">{label}</span>
                <Icon size={19} className="text-indigo-600" />
              </div>
              <p className="text-2xl font-bold">{value}</p>
            </div>
          ))}
        </section>

        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm md:p-9">
          <div className="mb-6 flex items-center gap-3">
            <div className="rounded-xl bg-indigo-50 p-3 text-indigo-600">
              <Upload size={24} />
            </div>
            <div>
              <h3 className="text-lg font-bold">Upload your dataset</h3>
              <p className="text-sm text-slate-500">
                Start by selecting a CSV file to analyze.
              </p>
            </div>
          </div>

          <label
            htmlFor="csv-upload"
            className="flex min-h-52 cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-slate-300 bg-slate-50 p-6 text-center transition hover:border-indigo-400 hover:bg-indigo-50/40"
          >
            <FileSpreadsheet size={38} className="mb-4 text-indigo-600" />
            <span className="font-semibold">
              Click to choose a CSV file
            </span>
            <span className="mt-2 text-sm text-slate-500">
              CSV format only
            </span>
            <input
              id="csv-upload"
              type="file"
              accept=".csv,text/csv"
              className="sr-only"
              onChange={handleFile}
            />
          </label>

          {error && (
            <p role="alert" className="mt-4 text-sm text-red-600">
              {error}
            </p>
          )}

          {file && (
            <div className="mt-5 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-indigo-100 bg-indigo-50 p-4">
              <div>
                <p className="font-semibold text-indigo-950">
                  {file.name}
                </p>
                <p className="mt-1 text-sm text-indigo-700">
                  {(file.size / 1024).toFixed(1)} KB · Ready for analysis
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  setFile(null);
                  setError("");
                  document.getElementById("csv-upload").value = "";
                }}
                className="rounded-lg border border-indigo-200 bg-white px-4 py-2 text-sm font-medium text-indigo-700 hover:bg-indigo-100"
              >
                Remove file
              </button>
            </div>
          )}

          <p className="mt-4 text-xs leading-5 text-slate-500">
            This initial version selects a file locally. Upload processing,
            analysis and report generation will be added in the next stages.
          </p>
        </section>

        <footer className="mt-8 flex items-center gap-2 text-xs text-slate-400">
          <ShieldCheck size={15} />
          DataLens AI · Local development edition
        </footer>
      </main>
    </div>
  );
}
