"use client";

import Link from "next/link";
import { useState } from "react";
import { Check, FileText, Pencil, X } from "lucide-react";
import type { ReviewTask } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import ConfidenceBar from "@/components/shared/ConfidenceBar";
import ExtractionTypeBadge from "@/components/shared/ExtractionTypeBadge";
import ConfidenceBadge from "@/components/review/ConfidenceBadge";
import EvidenceDrawer from "@/components/review/EvidenceDrawer";
import { Input } from "@/components/ui/input";

function summarizeValue(v: Record<string, unknown> | null | undefined) {
  if (!v || typeof v !== "object") return "—";
  if ("raw" in v && v.raw != null) return String(v.raw);
  if ("canonical" in v && v.canonical != null) return JSON.stringify(v.canonical);
  if ("value" in v && v.value != null) return String(v.value);
  return JSON.stringify(v);
}

export default function ReviewCard({
  task,
  selected,
  onSelectChange,
  onAccept,
  onReject,
  onEdit,
  busy,
}: {
  task: ReviewTask;
  selected?: boolean;
  onSelectChange?: (checked: boolean) => void;
  onAccept: () => void;
  onReject: (note?: string) => void;
  onEdit: (corrected: string) => void;
  busy?: boolean;
}) {
  const [note, setNote] = useState("");
  const [editOpen, setEditOpen] = useState(false);
  const [editValue, setEditValue] = useState(summarizeValue(task.suggested_value));
  const [evidenceOpen, setEvidenceOpen] = useState(false);

  const path = task.category_path?.join(" › ") ?? "—";

  return (
    <>
      <Card className={`overflow-hidden border-slate-200/80 shadow-sm transition-shadow ${selected ? "ring-2 ring-indigo-500/40" : ""}`}>
        <CardHeader className="space-y-3 border-b border-slate-100 bg-slate-50/50 p-4 sm:p-5">
          <div className="flex flex-wrap items-start gap-4">
            {onSelectChange && (
              <input
                type="checkbox"
                className="mt-1 h-4 w-4 rounded border-slate-300"
                checked={!!selected}
                onChange={(e) => onSelectChange(e.target.checked)}
                aria-label="Select task"
              />
            )}
            <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-lg bg-slate-200">
              {task.product_image_url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={task.product_image_url} alt="" className="h-full w-full object-cover" />
              ) : (
                <div className="flex h-full items-center justify-center text-xs text-slate-400">No image</div>
              )}
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <Badge variant="secondary" className="font-mono text-[10px] uppercase">
                  {task.task_type.replace(/_/g, " ")}
                </Badge>
                <Badge variant="outline" className="capitalize">
                  {task.priority}
                </Badge>
                <ConfidenceBadge value={task.confidence} />
              </div>
              <h3 className="mt-1 text-base font-semibold text-slate-900">
                <Link href={`/products/${task.product_id}`} className="hover:text-indigo-600 hover:underline">
                  {task.product_title ?? "Untitled product"}
                </Link>
              </h3>
              <p className="text-sm text-slate-500">
                {task.product_brand && <span>{task.product_brand} · </span>}
                {path}
              </p>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4 p-4 sm:p-5">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <p className="text-xs font-medium uppercase text-slate-500">Suggested</p>
              <p className="mt-1 font-mono text-sm text-slate-800">{summarizeValue(task.suggested_value)}</p>
              {task.attribute_key && (
                <p className="mt-1 text-xs text-slate-500">
                  Attribute: <span className="font-medium">{task.attribute_key}</span>
                </p>
              )}
            </div>
            <div>
              <p className="text-xs font-medium uppercase text-slate-500">Current</p>
              <p className="mt-1 font-mono text-sm text-slate-600">{summarizeValue(task.current_value)}</p>
            </div>
          </div>
          <div>
            <div className="mb-1 flex items-center justify-between text-xs text-slate-500">
              <span>Model confidence</span>
            </div>
            <ConfidenceBar value={task.confidence} />
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <ExtractionTypeBadge type={task.extraction_type} />
            <Button type="button" variant="outline" size="sm" onClick={() => setEvidenceOpen(true)}>
              <FileText className="mr-1.5 h-3.5 w-3.5" />
              Evidence
            </Button>
          </div>
          {editOpen && (
            <div className="space-y-2 rounded-lg border border-slate-200 bg-white p-3">
              <label className="text-xs font-medium text-slate-600">Corrected value</label>
              <Input value={editValue} onChange={(e) => setEditValue(e.target.value)} />
              <div className="flex gap-2">
                <Button type="button" size="sm" onClick={() => onEdit(editValue)} disabled={busy}>
                  Save correction
                </Button>
                <Button type="button" variant="ghost" size="sm" onClick={() => setEditOpen(false)}>
                  Cancel
                </Button>
              </div>
            </div>
          )}
          <div>
            <label className="text-xs font-medium text-slate-500">Note (optional)</label>
            <Input className="mt-1" value={note} onChange={(e) => setNote(e.target.value)} placeholder="Reviewer note" />
          </div>
        </CardContent>
        <CardFooter className="flex flex-wrap gap-2 border-t border-slate-100 bg-slate-50/30 px-4 py-3 sm:px-5">
          <Button type="button" size="sm" className="gap-1.5" onClick={onAccept} disabled={busy}>
            <Check className="h-4 w-4" />
            Accept
          </Button>
          <Button type="button" variant="outline" size="sm" className="gap-1.5 text-red-700 hover:bg-red-50" onClick={() => onReject(note)} disabled={busy}>
            <X className="h-4 w-4" />
            Reject
          </Button>
          <Button type="button" variant="ghost" size="sm" className="gap-1.5" onClick={() => setEditOpen(!editOpen)} disabled={busy}>
            <Pencil className="h-4 w-4" />
            Edit
          </Button>
        </CardFooter>
      </Card>

      <EvidenceDrawer open={evidenceOpen} onClose={() => setEvidenceOpen(false)} evidence={task.evidence} title="Task evidence" />
    </>
  );
}
