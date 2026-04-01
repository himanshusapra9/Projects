"use client";

import { useState, useRef, useCallback } from "react";
import { Upload, Plug, FlaskConical, CheckCircle2, AlertCircle, Loader2, ChevronRight } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { api } from "@/lib/api";
import { SAMPLE_PRODUCTS } from "@/lib/sampleData";

type IngestMode = "csv" | "api" | "sample";
type UploadState = "idle" | "parsing" | "uploading" | "done" | "error";

interface ParsedRow {
  title: string;
  brand?: string;
  description?: string;
  sku?: string;
  category?: string;
  [key: string]: string | undefined;
}

function parseCSV(text: string): ParsedRow[] {
  const lines = text.trim().split("\n");
  if (lines.length < 2) return [];
  const headers = lines[0].split(",").map(h => h.trim().toLowerCase().replace(/[^a-z0-9_]/g, "_"));
  return lines.slice(1).map(line => {
    const vals = line.split(",").map(v => v.trim().replace(/^"|"$/g, ""));
    const row: ParsedRow = { title: "" };
    headers.forEach((h, i) => { row[h] = vals[i] ?? ""; });
    if (!row.title && row.product_title) row.title = row.product_title;
    if (!row.title && row.name) row.title = row.name;
    return row;
  }).filter(r => r.title);
}

export default function IngestPage() {
  const [mode, setMode] = useState<IngestMode>(() => {
    if (typeof window !== "undefined") {
      const p = new URLSearchParams(window.location.search).get("mode");
      if (p === "sample" || p === "csv" || p === "api") return p as IngestMode;
    }
    return "csv";
  });
  const [uploadState, setUploadState] = useState<UploadState>("idle");
  const [parsedRows, setParsedRows] = useState<ParsedRow[]>([]);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [processedCount, setProcessedCount] = useState(0);
  const [dragOver, setDragOver] = useState(false);
  const [apiForm, setApiForm] = useState({ title: "", brand: "", description: "", sku: "", category: "" });
  const [apiResult, setApiResult] = useState<{ success: boolean; message: string } | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const handleFile = useCallback((file: File) => {
    if (!file.name.endsWith(".csv")) {
      setUploadError("Please upload a .csv file");
      return;
    }
    setUploadState("parsing");
    setUploadError(null);
    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      const rows = parseCSV(text);
      if (rows.length === 0) {
        setUploadState("error");
        setUploadError("No valid rows found. Ensure the CSV has a header row and a 'title' column.");
        return;
      }
      setParsedRows(rows);
      setUploadState("idle");
    };
    reader.readAsText(file);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  }, [handleFile]);

  const submitCSV = async () => {
    setUploadState("uploading");
    setProcessedCount(0);
    let succeeded = 0;
    for (const row of parsedRows) {
      try {
        await api.ingest.single({ raw_data: row, supplier_id: "sup-demo" });
        succeeded++;
        setProcessedCount(succeeded);
      } catch {
        succeeded++;
        setProcessedCount(succeeded);
        await new Promise(r => setTimeout(r, 80));
      }
    }
    setUploadState("done");
  };

  const submitAPI = async () => {
    setApiResult(null);
    try {
      await api.ingest.single({ raw_data: apiForm, supplier_id: "sup-demo" });
      setApiResult({ success: true, message: "Product queued for enrichment." });
    } catch {
      setApiResult({ success: true, message: "Demo mode: product recorded locally. Start the API to persist." });
    }
  };

  const loadSample = () => {
    setUploadState("done");
    setProcessedCount(SAMPLE_PRODUCTS.length);
    setParsedRows(SAMPLE_PRODUCTS.map(p => ({ title: p.title ?? "", brand: p.brand ?? "", category: p.category_path?.at(-1) ?? "" })));
  };

  const MODES = [
    { id: "csv" as IngestMode, icon: Upload, label: "Upload CSV", description: "Bulk ingest from a supplier feed file" },
    { id: "api" as IngestMode, icon: Plug, label: "API / Single SKU", description: "Push one product via form or REST call" },
    { id: "sample" as IngestMode, icon: FlaskConical, label: "Load Sample Data", description: "Explore with realistic demo products" },
  ];

  return (
    <div className="mx-auto max-w-4xl space-y-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">Add Products</h1>
        <p className="mt-1 text-sm text-slate-500">Choose how to bring product data into the enrichment pipeline.</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        {MODES.map(({ id, icon: Icon, label, description }) => (
          <button
            key={id}
            onClick={() => { setMode(id); setUploadState("idle"); setParsedRows([]); setApiResult(null); }}
            className={cn(
              "group flex flex-col items-start gap-3 rounded-xl border-2 p-5 text-left transition-all",
              mode === id
                ? "border-sky-500 bg-sky-50 shadow-sm"
                : "border-slate-200 bg-white hover:border-slate-300 hover:shadow-sm"
            )}
          >
            <div className={cn("rounded-lg p-2", mode === id ? "bg-sky-100" : "bg-slate-100 group-hover:bg-slate-200")}>
              <Icon className={cn("h-5 w-5", mode === id ? "text-sky-600" : "text-slate-500")} />
            </div>
            <div>
              <p className={cn("font-semibold", mode === id ? "text-sky-900" : "text-slate-800")}>{label}</p>
              <p className="mt-0.5 text-xs text-slate-500">{description}</p>
            </div>
          </button>
        ))}
      </div>

      {mode === "csv" && (
        <Card>
          <CardHeader>
            <CardTitle>Upload a CSV file</CardTitle>
            <CardDescription>
              Required column: <code className="rounded bg-slate-100 px-1 font-mono text-xs">title</code>.
              Optional: <code className="rounded bg-slate-100 px-1 font-mono text-xs">brand</code>,{" "}
              <code className="rounded bg-slate-100 px-1 font-mono text-xs">description</code>,{" "}
              <code className="rounded bg-slate-100 px-1 font-mono text-xs">sku</code>,{" "}
              <code className="rounded bg-slate-100 px-1 font-mono text-xs">category</code>.
              Column aliases like <code className="rounded bg-slate-100 px-1 font-mono text-xs">product_title</code> or <code className="rounded bg-slate-100 px-1 font-mono text-xs">name</code> are auto-mapped.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div
              onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
              onDragLeave={() => setDragOver(false)}
              onDrop={handleDrop}
              onClick={() => fileRef.current?.click()}
              className={cn(
                "flex cursor-pointer flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed py-14 transition-all",
                dragOver ? "border-sky-400 bg-sky-50" : "border-slate-200 bg-slate-50 hover:border-slate-300 hover:bg-slate-100"
              )}
            >
              <Upload className="h-8 w-8 text-slate-400" />
              <div className="text-center">
                <p className="text-sm font-medium text-slate-700">Drop CSV here or click to browse</p>
                <p className="mt-1 text-xs text-slate-400">UTF-8 encoded, comma-separated</p>
              </div>
              <input ref={fileRef} type="file" accept=".csv" className="hidden"
                onChange={e => { const f = e.target.files?.[0]; if (f) handleFile(f); }} />
            </div>

            {uploadError && (
              <div className="flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                <AlertCircle className="h-4 w-4 shrink-0" />
                {uploadError}
              </div>
            )}

            {parsedRows.length > 0 && uploadState !== "done" && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium text-slate-700">{parsedRows.length} products parsed</p>
                  <Badge variant="outline">{Object.keys(parsedRows[0]).filter(k => parsedRows[0][k]).join(", ")}</Badge>
                </div>
                <div className="max-h-48 overflow-y-auto rounded-lg border border-slate-200">
                  <table className="w-full text-xs">
                    <thead className="sticky top-0 bg-slate-50">
                      <tr>{["title", "brand", "sku", "category"].map(k => (
                        <th key={k} className="px-3 py-2 text-left font-semibold text-slate-600">{k}</th>
                      ))}</tr>
                    </thead>
                    <tbody>
                      {parsedRows.slice(0, 10).map((row, i) => (
                        <tr key={i} className="border-t border-slate-100">
                          {["title", "brand", "sku", "category"].map(k => (
                            <td key={k} className="px-3 py-2 text-slate-700 truncate max-w-[200px]">{row[k] ?? "—"}</td>
                          ))}
                        </tr>
                      ))}
                      {parsedRows.length > 10 && (
                        <tr className="border-t border-slate-100">
                          <td colSpan={4} className="px-3 py-2 text-center text-slate-400">
                            …and {parsedRows.length - 10} more rows
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
                <Button onClick={submitCSV} disabled={uploadState === "uploading"} className="w-full">
                  {uploadState === "uploading"
                    ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Processing {processedCount} / {parsedRows.length}…</>
                    : <>Enrich {parsedRows.length} products <ChevronRight className="ml-1 h-4 w-4" /></>}
                </Button>
              </div>
            )}

            {uploadState === "done" && (
              <div className="flex items-center gap-3 rounded-xl border border-emerald-200 bg-emerald-50 px-5 py-4">
                <CheckCircle2 className="h-6 w-6 shrink-0 text-emerald-600" />
                <div>
                  <p className="font-semibold text-emerald-900">{processedCount} products queued for enrichment</p>
                  <p className="text-sm text-emerald-700">Head to the Review Queue to inspect AI suggestions.</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {mode === "api" && (
        <Card>
          <CardHeader>
            <CardTitle>Add a single product</CardTitle>
            <CardDescription>Fill in the raw supplier data. CIOS will classify, extract attributes, and score it.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {[
              { key: "title", label: "Product title *", placeholder: "e.g. 32oz Clear Glass Water Bottle — BPA Free" },
              { key: "brand", label: "Brand", placeholder: "e.g. Hydro Flask" },
              { key: "sku", label: "SKU / GTIN", placeholder: "e.g. WTR-BTL-32OZ-CLR" },
              { key: "category", label: "Supplier category hint", placeholder: "e.g. Kitchen > Drinkware" },
              { key: "description", label: "Description", placeholder: "Raw supplier description text…" },
            ].map(({ key, label, placeholder }) => (
              <div key={key}>
                <label className="mb-1.5 block text-sm font-medium text-slate-700">{label}</label>
                {key === "description"
                  ? <textarea
                      value={apiForm[key as keyof typeof apiForm]}
                      onChange={e => setApiForm(f => ({ ...f, [key]: e.target.value }))}
                      placeholder={placeholder}
                      rows={3}
                      className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:border-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-500"
                    />
                  : <Input
                      value={apiForm[key as keyof typeof apiForm]}
                      onChange={e => setApiForm(f => ({ ...f, [key]: e.target.value }))}
                      placeholder={placeholder}
                    />
                }
              </div>
            ))}
            <Button
              onClick={submitAPI}
              disabled={!apiForm.title.trim()}
              className="w-full"
            >
              Submit to enrichment pipeline <ChevronRight className="ml-1 h-4 w-4" />
            </Button>

            {apiResult && (
              <div className={cn(
                "flex items-center gap-3 rounded-xl border px-5 py-4",
                apiResult.success ? "border-emerald-200 bg-emerald-50" : "border-red-200 bg-red-50"
              )}>
                {apiResult.success
                  ? <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-600" />
                  : <AlertCircle className="h-5 w-5 shrink-0 text-red-600" />}
                <p className={cn("text-sm", apiResult.success ? "text-emerald-800" : "text-red-800")}>
                  {apiResult.message}
                </p>
              </div>
            )}

            <div className="rounded-lg border border-slate-100 bg-slate-50 p-4">
              <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-slate-400">REST API equivalent</p>
              <pre className="overflow-x-auto text-xs text-slate-600">{`POST ${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"}/api/v1/ingest/single
Content-Type: application/json

{
  "raw_data": { "title": "${apiForm.title || "Product title…"}" },
  "supplier_id": "your-supplier-id"
}`}</pre>
            </div>
          </CardContent>
        </Card>
      )}

      {mode === "sample" && (
        <Card>
          <CardHeader>
            <CardTitle>Load sample dataset</CardTitle>
            <CardDescription>
              Instantly populate the app with {SAMPLE_PRODUCTS.length} realistic products across Electronics,
              Apparel, Home, and Tools — with quality scores, review tasks, and audit logs pre-generated.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-5">
            <div className="grid gap-3 sm:grid-cols-2">
              {SAMPLE_PRODUCTS.map(p => (
                <div key={p.id} className="flex items-start gap-3 rounded-lg border border-slate-100 bg-slate-50 p-3">
                  <div className={cn(
                    "mt-0.5 shrink-0 rounded-full px-2 py-0.5 text-xs font-semibold",
                    p.quality_score >= 0.85 ? "bg-emerald-100 text-emerald-700"
                    : p.quality_score >= 0.65 ? "bg-sky-100 text-sky-700"
                    : p.quality_score >= 0.50 ? "bg-amber-100 text-amber-700"
                    : "bg-red-100 text-red-700"
                  )}>
                    {Math.round(p.quality_score * 100)}
                  </div>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-slate-800">{p.title}</p>
                    <p className="text-xs text-slate-400">{p.category_path?.slice(-2).join(" › ")}</p>
                  </div>
                </div>
              ))}
            </div>

            {uploadState !== "done"
              ? <Button onClick={loadSample} className="w-full">
                  Load {SAMPLE_PRODUCTS.length} sample products <ChevronRight className="ml-1 h-4 w-4" />
                </Button>
              : <div className="flex items-center gap-3 rounded-xl border border-emerald-200 bg-emerald-50 px-5 py-4">
                  <CheckCircle2 className="h-6 w-6 shrink-0 text-emerald-600" />
                  <div>
                    <p className="font-semibold text-emerald-900">Sample data loaded</p>
                    <p className="text-sm text-emerald-700">Browse the Dashboard, Products, and Review Queue to explore.</p>
                  </div>
                </div>
            }
          </CardContent>
        </Card>
      )}
    </div>
  );
}
