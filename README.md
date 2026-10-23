# DataLens AI — Browser-Native Data Analysis & Cleaning Platform

**DataLens AI** is a professional, client-side data analytics, profiling, visualization, and cleaning application built entirely from scratch. **100% of dataset processing occurs in the user's browser in-memory** — no data ever leaves the local machine.

---

## ⚡ Key Highlights & Core Capabilities

- **100% Browser-Only Processing**: No Python, no FastAPI, no database, no Axios or backend API requests, and zero cloud uploads. Complete data privacy.
- **Robust Dataset Import**:
  - Ingests `.csv`, `.tsv`, and delimited `.txt` files with drag-and-drop or file selection.
  - Automatic delimiter detection (comma `,`, tab `\t`, semicolon `;`, pipe `|`).
  - Handles complex quoted fields, escaped quotes, newlines within cells, and Unicode text.
  - Automatic column header deduplication (e.g. `['Name', 'Name']` ➔ `['Name', 'Name_2']`).
  - Validates file size limits (250 MB), row limits (1,500,000), and column limits (500) with streaming chunk processing.
  - Built-in curated sample datasets for instant 1-click exploration.
- **Deep Statistical Profiling & Dashboard**:
  - Total rows, columns, cells, and file size footprint.
  - Inferred schema data types (Numeric, Categorical/Text, Date, Boolean).
  - Missing and empty cell counts, percentages, and data health quality score (0–100).
  - Duplicate row detection and rate calculation.
  - Column-level breakdown: unique counts, uniqueness percentage, top frequent values with distributions.
  - Full numeric summary: minimum, maximum, mean, median, standard deviation, zeroes, and negatives.
  - Date ranges, earliest/latest dates, and timespans for temporal columns.
- **Interactive Data Explorer**:
  - Global substring search across all columns.
  - Simultaneous multi-column filtering with 12 operators (`contains`, `not_contains`, `equals`, `not_equals`, `starts_with`, `ends_with`, `>`, `≥`, `<`, `≤`, `between`, `is_empty`, `is_not_empty`).
  - Natural sorting (ascending/descending) for numbers, dates, and strings.
  - Column visibility toggle manager (select all, reset, per-column toggle).
  - Client-side pagination with configurable page sizes (10, 25, 50, 100, 250).
  - Instant CSV export of filtered and sorted views.
- **Interactive Chart Builder (Recharts)**:
  - Chart types: Bar, Line, Area, and Donut / Pie charts.
  - Flexible dimension (X-axis) and metric (Y-axis) selection.
  - Real-time aggregations: Sum, Average (Mean), Count of Rows, Minimum, and Maximum.
  - Top category limiting (Top 5, 10, 15, 25, or All) to prevent visual cluttering.
  - Custom color palettes (Amber Gold, Cyber Cyan, Emerald, Sunset).
  - Chart data export to CSV.
- **Data Cleaning Studio**:
  - Original vs. Cleaned side-by-side inspection metrics.
  - Row cleaning: Remove duplicate rows, remove blank rows.
  - Column cleaning: Remove empty columns, drop selected columns, reorder columns.
  - Text & value transformations: Trim whitespace, find & replace (exact or substring), convert text casing (UPPERCASE, lowercase, Title Case).
  - Missing value imputation: Fill with custom string, zero, "Unknown", or column mean / median.
  - Explicit numeric string normalization (cleans currency symbols `$`, `€`, commas, and percentages `%`).
  - Transformation audit log with reversible step history (Undo) and Reset-to-Original.
  - Commit cleaned data directly to the active Explorer and Chart Builder.
- **Export & Download**:
  - Browser-native download using `Blob`, `URL.createObjectURL`, and UTF-8 BOM (`\uFEFF`) for Microsoft Excel & Google Sheets compatibility.
  - Export active dataset, filtered view, cleaned dataset, or pristine original.

---

## 🛠️ Technology Stack

- **Framework**: React 19 (JavaScript & JSX)
- **Bundler & Tooling**: Vite 8
- **Styling**: Tailwind CSS v4 (Deep charcoal `#0B0E13`, elevated cards `#141820`, golden amber `#F59E0B` highlights)
- **Data Visualization**: Recharts 3
- **Icons**: Lucide React
- **CSV & Tabular Engine**: Papa Parse

---

## 🚀 Getting Started

From the `frontend` directory:

### 1. Install Dependencies
```bash
npm install
```

### 2. Start Local Development Server
```bash
npm run dev
```
Open [http://localhost:5173](http://localhost:5173) in your browser.

### 3. Run Automated Workflow Verification Tests
```bash
npm test
```
Executes 36 browser-free unit and workflow verification tests covering parsing, profiling, filtering, sorting, and cleaning.

### 4. Build for Production
```bash
npm run build
```

### 5. Preview Production Build
```bash
npm run preview
```
