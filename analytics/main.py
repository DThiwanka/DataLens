
from io import BytesIO
import math

import numpy as np
import pandas as pd
from fastapi import FastAPI, File, HTTPException, UploadFile
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(
    title="DataLens AI Analytics API",
    description="CSV profiling and statistical analysis service",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
    ],
    allow_credentials=False,
    allow_methods=["GET", "POST"],
    allow_headers=["*"],
)

MAX_FILE_SIZE = 10 * 1024 * 1024  # 10 MB
MAX_ROWS = 100_000
MAX_COLUMNS = 200
MAX_PREVIEW_ROWS = 10
MAX_CATEGORIES = 10


def clean_number(value):
    """Convert NumPy/Pandas numbers to JSON-safe Python values."""
    if value is None or pd.isna(value):
        return None

    if isinstance(value, (np.integer, int)):
        return int(value)

    if isinstance(value, (np.floating, float)):
        result = float(value)
        return result if math.isfinite(result) else None

    return value


def clean_value(value):
    """Convert a scalar to a JSON-serializable value."""
    if value is None or pd.isna(value):
        return None

    if isinstance(value, (np.integer, np.floating)):
        return clean_number(value)

    if isinstance(value, (pd.Timestamp, np.datetime64)):
        return pd.Timestamp(value).isoformat()

    if isinstance(value, (str, int, float, bool)):
        return clean_number(value) if isinstance(
            value, (int, float)
        ) else value

    return str(value)


def analyze_dataframe(df: pd.DataFrame) -> dict:
    row_count, column_count = df.shape

    missing_by_column = df.isna().sum()
    missing_total = int(missing_by_column.sum())
    duplicate_rows = int(df.duplicated().sum())

    columns = []
    numeric_summary = {}
    categorical_summary = {}
    warnings = []

    for column in df.columns:
        series = df[column]
        missing_count = int(series.isna().sum())
        unique_count = int(series.nunique(dropna=True))

        column_info = {
            "name": str(column),
            "dtype": str(series.dtype),
            "missing_count": missing_count,
            "missing_percent": round(
                missing_count / row_count * 100, 2
            ) if row_count else 0,
            "unique_count": unique_count,
        }

        columns.append(column_info)

        if missing_count:
            warnings.append({
                "type": "missing_values",
                "column": str(column),
                "message": (
                    f"{column} contains {missing_count} missing "
                    f"value(s)."
                ),
                "severity": "warning",
            })

        if pd.api.types.is_numeric_dtype(series):
            valid = series.dropna()

            numeric_summary[str(column)] = {
                "count": int(valid.count()),
                "mean": clean_number(valid.mean()),
                "median": clean_number(valid.median()),
                "std": clean_number(valid.std()),
                "min": clean_number(valid.min()),
                "max": clean_number(valid.max()),
                "sum": clean_number(valid.sum()),
            }

            # Detect statistical outliers using the IQR rule.
            if len(valid) >= 4:
                q1 = valid.quantile(0.25)
                q3 = valid.quantile(0.75)
                iqr = q3 - q1

                if pd.notna(iqr) and iqr > 0:
                    outlier_count = int(
                        ((valid < q1 - 1.5 * iqr) |
                         (valid > q3 + 1.5 * iqr)).sum()
                    )

                    numeric_summary[str(column)][
                        "potential_outliers"
                    ] = outlier_count

                    if outlier_count:
                        warnings.append({
                            "type": "potential_outliers",
                            "column": str(column),
                            "message": (
                                f"{column} contains {outlier_count} "
                                "potential IQR outlier(s)."
                            ),
                            "severity": "info",
                        })

        else:
            # Limit category output to avoid huge API responses.
            counts = series.dropna().astype(str).value_counts()

            categorical_summary[str(column)] = {
                "top_values": [
                    {
                        "value": str(value),
                        "count": int(count),
                    }
                    for value, count in counts.head(
                        MAX_CATEGORIES
                    ).items()
                ],
                "distinct_values": unique_count,
            }

    if duplicate_rows:
        warnings.append({
            "type": "duplicate_rows",
            "column": None,
            "message": (
                f"Found {duplicate_rows} completely duplicated row(s)."
            ),
            "severity": "warning",
        })

    if not row_count:
        warnings.append({
            "type": "empty_dataset",
            "column": None,
            "message": "The dataset contains no data rows.",
            "severity": "error",
        })

    total_cells = row_count * column_count
    missing_percent = (
        missing_total / total_cells * 100
        if total_cells else 0
    )
    duplicate_percent = (
        duplicate_rows / row_count * 100
        if row_count else 0
    )

    # A transparent, simple data-quality indicator, not an
    # industry-standard measure of overall dataset quality.
    quality_score = round(max(
        0,
        100 - missing_percent - duplicate_percent
    ), 1)

    preview = [
        {
            str(key): clean_value(value)
            for key, value in record.items()
        }
        for record in df.head(MAX_PREVIEW_ROWS).to_dict(
            orient="records"
        )
    ]

    return {
        "dataset": {
            "rows": row_count,
            "columns": column_count,
            "total_cells": total_cells,
            "missing_values": missing_total,
            "missing_percent": round(missing_percent, 2),
            "duplicate_rows": duplicate_rows,
            "quality_score": quality_score,
        },
        "columns": columns,
        "numeric_summary": numeric_summary,
        "categorical_summary": categorical_summary,
        "preview": preview,
        "warnings": warnings,
    }


@app.get("/")
def root():
    return {
        "name": "DataLens AI Analytics API",
        "status": "running",
        "docs": "/docs",
    }


@app.get("/health")
def health():
    return {"status": "healthy"}


@app.post("/api/analyze")
async def analyze_csv(file: UploadFile = File(...)):
    filename = file.filename or ""

    if not filename.lower().endswith(".csv"):
        raise HTTPException(
            status_code=400,
            detail="Only .csv files are supported.",
        )

    try:
        content = await file.read(MAX_FILE_SIZE + 1)

        if not content:
            raise HTTPException(
                status_code=400,
                detail="The uploaded file is empty.",
            )

        if len(content) > MAX_FILE_SIZE:
            raise HTTPException(
                status_code=413,
                detail="CSV files must be 10 MB or smaller.",
            )

        try:
            # utf-8-sig also handles UTF-8 CSV files with a BOM.
            df = pd.read_csv(
                BytesIO(content),
                encoding="utf-8-sig",
                sep=None,
                engine="python",
                nrows=MAX_ROWS + 1,
                on_bad_lines="error",
            )
        except UnicodeDecodeError:
            raise HTTPException(
                status_code=400,
                detail=(
                    "Unable to decode this CSV as UTF-8. "
                    "Please save it as UTF-8 and try again."
                ),
            )
        except (pd.errors.ParserError, ValueError) as exc:
            raise HTTPException(
                status_code=400,
                detail=f"Unable to parse CSV: {str(exc)}",
            )

        if len(df) > MAX_ROWS:
            raise HTTPException(
                status_code=413,
                detail=(
                    f"Datasets may contain at most {MAX_ROWS:,} rows."
                ),
            )

        if len(df.columns) > MAX_COLUMNS:
            raise HTTPException(
                status_code=413,
                detail=(
                    f"Datasets may contain at most "
                    f"{MAX_COLUMNS} columns."
                ),
            )

        if len(df.columns) == 0:
            raise HTTPException(
                status_code=400,
                detail="The CSV must contain column headers.",
            )

        # Remove accidental whitespace from headers.
        df.columns = [
            str(column).strip()
            for column in df.columns
        ]

        if any(not column for column in df.columns):
            raise HTTPException(
                status_code=400,
                detail="Column names cannot be empty.",
            )

        if not df.columns.is_unique:
            raise HTTPException(
                status_code=400,
                detail=(
                    "Duplicate column names were found. "
                    "Rename them before uploading."
                ),
            )

        return {
            "filename": filename,
            "analysis": analyze_dataframe(df),
        }

    except HTTPException:
        raise
    except Exception:
        # Avoid returning internal paths or stack traces to clients.
        raise HTTPException(
            status_code=500,
            detail="An unexpected error occurred during analysis.",
        )
    finally:
        await file.close()
