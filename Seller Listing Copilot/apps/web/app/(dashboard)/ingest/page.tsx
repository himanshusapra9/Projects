"use client";

import { motion } from "framer-motion";
import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  AlertCircle,
  ArrowRight,
  CheckCircle2,
  ExternalLink,
  Loader2,
  Trash2,
  Upload,
} from "lucide-react";
import { DropZone } from "@/components/ingestion/DropZone";
import { IngestionProgress } from "@/components/ingestion/IngestionProgress";
import { IngestionSourceCard } from "@/components/ingestion/IngestionSourceCard";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { apiGet, apiPostMultipart } from "@/lib/api";

interface IngestionAsset {
  id: string;
  originalFilename: string;
  mimeType: string | null;
  type: string;
  sizeBytes: number | null;
}

interface IngestionProduct {
  id: string;
  title: string | null;
  status: string;
  reviewStatus: string;
  completeness: number;
}

interface IngestionJob {
  id: string;
  status: string;
  errorMessage: string | null;
  createdAt: string;
  updatedAt: string;
  assets?: IngestionAsset[];
  products?: IngestionProduct[];
  _count?: { assets: number };
}

type IngestionStatus =
  | "PENDING"
  | "PROCESSING"
  | "EXTRACTING"
  | "BUILDING"
  | "COMPLETE"
  | "FAILED";

function statusToStageIndex(status: IngestionStatus): number {
  switch (status) {
    case "PENDING":
      return 0;
    case "PROCESSING":
      return 1;
    case "EXTRACTING":
      return 2;
    case "BUILDING":
      return 3;
    case "COMPLETE":
      return 4;
    case "FAILED":
      return -1;
    default:
      return 0;
  }
}

function statusToProgress(status: IngestionStatus): number {
  switch (status) {
    case "PENDING":
      return 10;
    case "PROCESSING":
      return 35;
    case "EXTRACTING":
      return 60;
    case "BUILDING":
      return 85;
    case "COMPLETE":
      return 100;
    case "FAILED":
      return 0;
    default:
      return 0;
  }
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export default function IngestPage() {
  const router = useRouter();
  const [uploading, setUploading] = useState(false);
  const [stagedFiles, setStagedFiles] = useState<File[]>([]);
  const [job, setJob] = useState<IngestionJob | null>(null);
  const [error, setError] = useState<string | null>(null);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const stopPolling = useCallback(() => {
    if (pollRef.current) {
      clearInterval(pollRef.current);
      pollRef.current = null;
    }
  }, []);

  useEffect(() => {
    return () => stopPolling();
  }, [stopPolling]);

  const pollJob = useCallback(
    (jobId: string) => {
      stopPolling();
      pollRef.current = setInterval(async () => {
        try {
          const data = await apiGet<IngestionJob>(`/ingestions/${jobId}`);
          setJob(data);
          if (data.status === "COMPLETE" || data.status === "FAILED") {
            stopPolling();
            if (data.status === "FAILED") {
              setError(data.errorMessage ?? "Ingestion failed");
            }
          }
        } catch {
          stopPolling();
          setError("Failed to check ingestion status");
        }
      }, 1500);
    },
    [stopPolling],
  );

  const handleFilesDropped = useCallback((files: File[]) => {
    setStagedFiles((prev) => [...prev, ...files]);
    setError(null);
  }, []);

  const removeFile = useCallback((index: number) => {
    setStagedFiles((prev) => prev.filter((_, i) => i !== index));
  }, []);

  const startIngestion = useCallback(async () => {
    if (stagedFiles.length === 0) return;

    setUploading(true);
    setError(null);
    setJob(null);

    try {
      const formData = new FormData();
      for (const f of stagedFiles) {
        formData.append("files", f);
      }
      const data = await apiPostMultipart<IngestionJob>(
        "/ingestions",
        formData,
      );
      setJob(data);
      setUploading(false);
      pollJob(data.id);
    } catch (e: unknown) {
      setUploading(false);
      const msg =
        e instanceof Error ? e.message : "Upload failed";
      if (msg.includes("401") || msg.includes("Unauthorized")) {
        setError("Not logged in. Please log in first, then try again.");
      } else {
        setError(msg);
      }
    }
  }, [stagedFiles, pollJob]);

  const resetAll = useCallback(() => {
    stopPolling();
    setJob(null);
    setStagedFiles([]);
    setError(null);
    setUploading(false);
  }, [stopPolling]);

  const status = (job?.status ?? "PENDING") as IngestionStatus;
  const stageIndex = uploading ? 0 : statusToStageIndex(status);
  const isActive =
    uploading || (job != null && status !== "COMPLETE" && status !== "FAILED");
  const isComplete = job != null && status === "COMPLETE";
  const isFailed = job != null && status === "FAILED";
  const hasJobStarted = uploading || job != null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.25 }}
      className="mx-auto max-w-5xl space-y-8"
    >
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Ingest</h1>
        <p className="mt-1 text-sm text-foreground-muted">
          Drop product photos — AI will extract structured attributes
          automatically.
        </p>
      </div>

      {error && !hasJobStarted && (
        <div className="flex items-start gap-2 rounded-lg border border-error/30 bg-error/10 p-3">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-error" />
          <p className="text-sm text-error">{error}</p>
        </div>
      )}

      {!hasJobStarted && (
        <Card className="border-border bg-surface">
          <CardHeader>
            <CardTitle className="text-base">New ingestion</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <DropZone
              onFiles={handleFilesDropped}
              disabled={uploading}
            />

            {stagedFiles.length > 0 && (
              <div className="space-y-3">
                <p className="text-xs font-semibold uppercase tracking-wide text-foreground-muted">
                  Files ready ({stagedFiles.length})
                </p>
                <div className="grid gap-2 sm:grid-cols-2">
                  {stagedFiles.map((f, i) => (
                    <div
                      key={`${f.name}-${i}`}
                      className="flex items-center gap-3 rounded-lg border border-border bg-background/60 p-3"
                    >
                      <div className="min-w-0 flex-1">
                        <p className="truncate font-mono text-sm text-foreground">
                          {f.name}
                        </p>
                        <p className="text-xs text-foreground-muted">
                          {f.type || "unknown"} · {formatFileSize(f.size)}
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeFile(i)}
                        className="shrink-0 rounded p-1 text-foreground-muted hover:bg-error/10 hover:text-error"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>
                <div className="flex gap-3">
                  <Button
                    type="button"
                    size="lg"
                    className="gap-2"
                    onClick={startIngestion}
                    disabled={uploading}
                  >
                    <Upload className="h-4 w-4" />
                    Start ingestion
                  </Button>
                  <Button
                    type="button"
                    size="lg"
                    variant="outline"
                    onClick={() => setStagedFiles([])}
                  >
                    Clear all
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {hasJobStarted && (
        <Card className="border-border bg-surface">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-base">
                {isComplete
                  ? "Ingestion complete"
                  : isFailed
                    ? "Ingestion failed"
                    : uploading
                      ? "Uploading..."
                      : "Processing..."}
              </CardTitle>
              {job && (
                <Badge
                  variant={
                    isComplete
                      ? "success"
                      : isFailed
                        ? "error"
                        : "warning"
                  }
                >
                  {job.status}
                </Badge>
              )}
            </div>
            {stagedFiles.length > 0 && (
              <p className="text-xs text-foreground-muted">
                {stagedFiles.map((f) => f.name).join(" · ")}
              </p>
            )}
          </CardHeader>
          <CardContent className="space-y-4">
            {!isFailed && (
              <IngestionProgress activeIndex={stageIndex} />
            )}

            {error && (
              <div className="flex items-start gap-2 rounded-lg border border-error/30 bg-error/10 p-3">
                <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-error" />
                <p className="text-sm text-error">{error}</p>
              </div>
            )}

            <div className="grid gap-3 sm:grid-cols-2">
              {(job?.assets ?? stagedFiles).map((item, i) => {
                const isAsset = "originalFilename" in item;
                const filename = isAsset
                  ? (item as IngestionAsset).originalFilename
                  : (item as File).name;
                const mimeType = isAsset
                  ? ((item as IngestionAsset).mimeType ??
                    "application/octet-stream")
                  : (item as File).type;

                return (
                  <IngestionSourceCard
                    key={
                      isAsset
                        ? (item as IngestionAsset).id
                        : `file-${i}`
                    }
                    filename={filename}
                    mimeType={mimeType}
                    status={
                      uploading
                        ? "UPLOADING"
                        : (job?.status ?? "PENDING")
                    }
                    progress={
                      uploading ? 30 : statusToProgress(status)
                    }
                  />
                );
              })}
            </div>

            {isActive && (
              <div className="flex items-center justify-center gap-2 py-2 text-sm text-foreground-muted">
                <Loader2 className="h-4 w-4 animate-spin" />
                {uploading
                  ? "Uploading files..."
                  : status === "EXTRACTING"
                    ? "AI is analyzing your images..."
                    : "Processing..."}
              </div>
            )}

            {isComplete &&
              job?.products &&
              job.products.length > 0 && (
                <div className="space-y-3">
                  <h3 className="text-sm font-semibold uppercase tracking-wide text-foreground-muted">
                    Extracted products
                  </h3>
                  {job.products.map((product) => (
                    <div
                      key={product.id}
                      className="flex items-center justify-between rounded-lg border border-border bg-background/60 p-4"
                    >
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <CheckCircle2 className="h-4 w-4 shrink-0 text-success" />
                          <span className="font-medium text-foreground">
                            {product.title ?? "Untitled Product"}
                          </span>
                        </div>
                        <p className="mt-1 text-xs text-foreground-muted">
                          Status: {product.status} · Review:{" "}
                          {product.reviewStatus}
                        </p>
                      </div>
                      <Button
                        size="sm"
                        onClick={() =>
                          router.push(`/products/${product.id}`)
                        }
                        className="gap-1"
                      >
                        View
                        <ArrowRight className="h-3 w-3" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}

            {(isComplete || isFailed) && (
              <div className="flex gap-3 pt-2">
                <Button variant="outline" onClick={resetAll}>
                  Ingest another
                </Button>
                {isComplete && job?.products?.[0] && (
                  <Button
                    onClick={() =>
                      router.push(
                        `/products/${job.products![0].id}`,
                      )
                    }
                    className="gap-1"
                  >
                    View product
                    <ExternalLink className="h-3 w-3" />
                  </Button>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </motion.div>
  );
}
