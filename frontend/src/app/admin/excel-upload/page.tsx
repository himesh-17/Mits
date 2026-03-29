"use client";

import { useMemo, useRef, useState } from "react";
import { FiFileText, FiUpload } from "react-icons/fi";
import * as XLSX from "xlsx";
import { api } from "../../../utils/api";

const MAX_FILE_SIZE = 10 * 1024 * 1024;

type ImportSummary = {
  processed: number;
  usersCreated: number;
  usersUpdated: number;
  applicationsCreated: number;
  applicationsUpdated: number;
  skipped: number;
};

export default function ExcelUploadPage() {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<string[]>([]);
  const [error, setError] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [summary, setSummary] = useState<ImportSummary | null>(null);

  const helperText = useMemo(() => {
    if (selectedFiles.length === 1) return selectedFiles[0];
    if (selectedFiles.length > 1) return `${selectedFiles.length} files selected`;
    return "or click to browse • Max 10MB per file";
  }, [selectedFiles]);

  const processFiles = async (files: File[]) => {
    setError("");
    setSummary(null);

    if (!files.length) return;

    const invalidExtFile = files.find((file) => {
      const lowerName = file.name.toLowerCase();
      return !(lowerName.endsWith(".csv") || lowerName.endsWith(".xlsx") || lowerName.endsWith(".xls"));
    });

    if (invalidExtFile) {
      setError("Only CSV, XLSX, or XLS files are allowed.");
      return;
    }

    const oversizeFile = files.find((file) => file.size > MAX_FILE_SIZE);
    if (oversizeFile) {
      setError(`File too large: ${oversizeFile.name}. Maximum allowed size is 10MB per file.`);
      return;
    }

    setSelectedFiles(files.map((file) => file.name));

    try {
      setIsUploading(true);

      const filePayload: Array<{ fileName: string; rows: Record<string, unknown>[] }> = [];

      for (const file of files) {
        const buffer = await file.arrayBuffer();
        const workbook = XLSX.read(new Uint8Array(buffer), { type: "array" });
        const rows: Record<string, unknown>[] = [];

        for (const sheetName of workbook.SheetNames || []) {
          const sheet = workbook.Sheets[sheetName];
          const parsed = XLSX.utils.sheet_to_json<Record<string, unknown>>(sheet, {
            defval: "",
          });
          rows.push(...parsed);
        }

        filePayload.push({
          fileName: file.name,
          rows,
        });
      }

      const totalRows = filePayload.reduce((count, fileEntry) => count + fileEntry.rows.length, 0);
      if (!totalRows) {
        setError("No usable rows found in uploaded files.");
        return;
      }

      const response = await api.post("/api/admin/bulk-enrollment", {
        files: filePayload,
      });
      const result = response?.data?.data;

      setSummary({
        processed: Number(result?.processed || 0),
        usersCreated: Number(result?.usersCreated || 0),
        usersUpdated: Number(result?.usersUpdated || 0),
        applicationsCreated: Number(result?.applicationsCreated || 0),
        applicationsUpdated: Number(result?.applicationsUpdated || 0),
        skipped: Number(result?.skipped || 0),
      });
    } catch {
      setError("Failed to import file. Please check file headers and try again.");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <section className="w-full max-w-267.5">

      <div className="mb-6 space-y-1">
        <h1 className="font-['Times_New_Roman',Times,serif] text-[36px] leading-10 font-bold text-[#0F1724]">
          Bulk Enrollment
        </h1>
        <p className="text-[14px] leading-5.25 text-[#94A3B8]">
          Import multiple students from a CSV/XLSX file
        </p>
      </div>

      <div className="rounded-lg border border-black/10 bg-white p-6">
        <div className="mb-6 flex items-center gap-3">
          <h2 className="text-[16px] leading-6 font-semibold text-[#0F1724]">Upload File</h2>
        </div>

        <label
          onDragOver={(e) => {
            e.preventDefault();
            setIsDragging(true);
          }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={(e) => {
            e.preventDefault();
            setIsDragging(false);
            const files = Array.from(e.dataTransfer.files || []);
            void processFiles(files);
          }}
          className={`h-63.75 w-full rounded-lg border border-dashed p-8 flex flex-col items-center justify-center gap-4 cursor-pointer transition-colors ${
            isDragging
              ? "border-[#2DA8E1] bg-[#EFF8FF]"
              : "border-[#94A3B8] bg-[#F8FAFC]"
          }`}
        >
          <input
            ref={inputRef}
            type="file"
            accept=".csv,.xlsx,.xls"
            multiple
            hidden
            onChange={(e) => {
              const files = Array.from(e.target.files || []);
              void processFiles(files);
            }}
          />

          <div className="h-12 w-12 rounded-md text-[#CBD5E1] inline-flex items-center justify-center">
            <FiFileText className="text-[40px]" />
          </div>

          <p className="text-[16px] leading-6 font-medium text-[#0F1724] text-center">
            Drag & drop your CSV/XLSX files here
          </p>

          <p className="text-[14px] leading-5.25 text-[#94A3B8] text-center">{helperText}</p>

          {isUploading ? (
            <p className="text-[13px] text-[#0F1724]">Importing data to admin panel...</p>
          ) : null}

          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            className="inline-flex items-center gap-2 text-[13px] text-[#2DA8E1]"
          >
            <FiUpload className="text-[14px]" />
            Browse Files
          </button>
        </label>

        {error ? (
          <p className="mt-3 text-[13px] text-[#B91C1C]">{error}</p>
        ) : null}

        {summary ? (
          <div className="mt-4 rounded-md border border-[#DCFCE7] bg-[#F0FDF4] p-4 text-[13px] text-[#14532D] space-y-1">
            <p className="font-semibold">Import completed successfully.</p>
            <p>Rows processed: {summary.processed}</p>
            <p>Users created: {summary.usersCreated} | Users updated: {summary.usersUpdated}</p>
            <p>
              Applications created: {summary.applicationsCreated} | Applications updated: {summary.applicationsUpdated}
            </p>
            <p>Rows skipped: {summary.skipped}</p>
          </div>
        ) : null}
      </div>
    </section>
  );
}
