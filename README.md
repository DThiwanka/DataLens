# DataLens AI

**A minimalist, browser-based workspace for exploring, analyzing, and cleaning tabular data.**

DataLens AI helps you inspect datasets, understand data quality, explore records, create visualizations, and prepare cleaned data for export. Data processing is designed to happen locally in your browser, without requiring a separate application backend or an external AI API.

> **Project status:** Update this README as features are implemented and verified. The file limits and commands below should match the current application configuration.

## Features

- **Import data** — Load CSV, TSV, and delimited TXT files using a file picker or drag and drop.
- **Dataset overview** — Inspect row and column counts, data types, missing values, distinct values, and supported column statistics.
- **Data exploration** — Search, filter, sort, paginate, and inspect records.
- **Visualizations** — Build charts from dataset columns and supported aggregation options.
- **Data cleaning** — Remove duplicate or empty rows, handle missing values, normalize text, rename or remove columns, and preview transformations where supported.
- **Export** — Download data as CSV, including cleaned or filtered results where supported.
- **Responsive interface** — Use a focused workspace across desktop, tablet, and mobile screens.
- **Browser-based processing** — Dataset contents are processed locally by the frontend; no backend is required for the intended workflow.

## Supported files and limits

| Setting | Support |
|---|---|
| File formats | `.csv`, `.tsv`, and delimited `.txt` |
| Maximum file size | 15 MB |
| Maximum data rows | 100,000 |
| Maximum columns | 200, if enforced by the current parser |
| Processing | In the browser |

The actual limits are controlled by the application code. Keep the upload helper text, parser configuration, and validation rules synchronized. A text file must contain consistently delimited tabular data to be imported as a dataset.

## Technology stack

- **React** — UI components and application state
- **Vite** — Development server and production build
- **JavaScript / JSX** — Application implementation
- **Tailwind CSS v4** — Styling and layout
- **Papa Parse** — CSV parsing and generation, if used by the project
- **Recharts** — Data visualizations
- **Lucide React** — Icons

See `package.json` for the exact dependencies installed in your copy of the project.

## Getting started

### Prerequisites

- Node.js and npm installed on your computer
- A modern browser

### 1. Open the frontend directory

If your repository contains only a `frontend` folder, open a terminal in that folder:

```bash
cd frontend
```

If your terminal is already inside `frontend`, skip this step.

### 2. Install dependencies

```bash
npm install
```

### 3. Start the development server

```bash
npm run dev
```

Open the local URL printed by Vite in your terminal. It is commonly `http://localhost:5173`.

### 4. Create a production build

```bash
npm run build
```

Vite normally writes the production output to `dist/`. To preview that build locally, use:

```bash
npm run preview
```

The available commands depend on the scripts defined in `package.json`.

## Typical workflow

1. Open DataLens AI in your browser.
2. Choose a supported file or drag it into the upload area.
3. Review the dataset overview and column profiles.
4. Search, filter, sort, and explore records.
5. Configure a chart using the available columns and aggregations.
6. Open Cleaning Studio to apply the transformations you need.
7. Review the result and export the required data as CSV.

Keep a copy of the original file before performing destructive cleaning operations.

## Privacy and data handling

DataLens AI is intended to process datasets in the browser. In a correctly configured frontend-only build, uploaded file contents are not sent to an application backend or an external data-processing API.

This statement depends on the actual implementation. Review network requests and third-party scripts before using sensitive or confidential data. Browser memory is temporary; reloading or closing the page may discard the current dataset unless an explicit persistence feature has been implemented.

## Project structure

The exact layout may vary, but a typical frontend-only implementation can be organized as follows:

```text
frontend/
├── public/
├── src/
│   ├── components/   # Shared UI components
│   ├── pages/        # Dashboard, explorer, and cleaning views
│   ├── services/     # Parsing, profiling, filtering, cleaning, export
│   ├── utils/        # Formatting and data helpers
│   ├── App.jsx
│   ├── main.jsx
│   └── index.css
├── index.html
├── package.json
├── vite.config.js
└── README.md
```

This is an example structure, not a requirement. Keep the README aligned with the actual files in the repository.

## Troubleshooting

### `npm` is not recognized

Install Node.js, reopen your terminal, and check:

```bash
node --version
npm --version
```

### Dependencies fail to install

Confirm you are in the directory containing `package.json`, then try:

```bash
npm install
```

### The development server does not start

Check the terminal output for missing dependencies, syntax errors, or a port conflict. Use the local URL Vite reports instead of assuming a fixed port.

### A file is rejected

Check that the file uses a supported extension and valid delimited tabular data, and is within the configured size, row, and column limits.

### The page is blank or a feature fails

Check the browser developer console and the Vite terminal for errors. Confirm that all imported components and dependencies exist and that the application builds successfully.

## Development guidelines

- Keep data processing separate from presentation components.
- Preserve the original dataset when applying cleaning transformations.
- Never silently discard rows or columns.
- Handle malformed input and missing values explicitly.
- Keep validation limits and interface copy synchronized.
- Do not introduce backend or external API dependencies into the browser-only workflow without a deliberate architectural decision.
- Verify the production build after changing shared components or data-processing utilities.

## Contributing

For local development, create a branch, make a focused change, and verify the application before submitting it. Add or update tests for important parsing, profiling, filtering, transformation, and export behavior whenever a test setup is available.

## License

No license has been specified yet. Add a `LICENSE` file and update this section before distributing the project publicly. Until then, do not assume that the project is open-source or available for unrestricted reuse.
