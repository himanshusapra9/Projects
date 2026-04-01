"use client";

import { useMemo, useState } from "react";
import { Loader2 } from "lucide-react";
import { useBulkAccept, useReviewTasks, useAcceptTask, useRejectTask, useEditTask } from "@/hooks/useReviewTasks";
import ReviewFilters, { type ReviewFilterValues } from "@/components/review/ReviewFilters";
import ReviewCard from "@/components/review/ReviewCard";
import BulkActionBar from "@/components/review/BulkActionBar";
import { Button } from "@/components/ui/button";
import type { ReviewTask } from "@/lib/types";

const REVIEWER_ID = "demo-reviewer";
const PAGE_SIZE = 6;

function normalizeTasks(data: unknown): ReviewTask[] {
  if (Array.isArray(data)) return data as ReviewTask[];
  if (data && typeof data === "object" && "items" in data && Array.isArray((data as { items: unknown }).items)) {
    return (data as { items: ReviewTask[] }).items;
  }
  return [];
}

function matchesConfidenceBand(task: ReviewTask, band: string): boolean {
  if (!band) return true;
  const c = task.confidence;
  if (band === "high") return c >= 0.85;
  if (band === "medium") return c >= 0.7 && c < 0.85;
  if (band === "low") return c < 0.7;
  return true;
}

export default function ReviewPage() {
  const [filters, setFilters] = useState<ReviewFilterValues>({ task_type: "", priority: "", confidence_band: "" });
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState<Set<string>>(new Set());

  const params = useMemo(() => {
    const p: Record<string, string> = { limit: String(PAGE_SIZE), offset: String((page - 1) * PAGE_SIZE) };
    if (filters.task_type) p.task_type = filters.task_type;
    if (filters.priority) p.priority = filters.priority;
    if (filters.confidence_band) p.confidence_band = filters.confidence_band;
    return p;
  }, [filters, page]);

  const query = useReviewTasks(params);
  const acceptMutation = useAcceptTask();
  const rejectMutation = useRejectTask();
  const editMutation = useEditTask();
  const bulkMutation = useBulkAccept();

  const rawTasks = normalizeTasks(query.data);
  const tasks = useMemo(
    () => rawTasks.filter((t) => matchesConfidenceBand(t, filters.confidence_band)),
    [rawTasks, filters.confidence_band]
  );

  const busy = acceptMutation.isPending || rejectMutation.isPending || editMutation.isPending || bulkMutation.isPending;

  const toggleSelect = (id: string, checked: boolean) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (checked) next.add(id);
      else next.delete(id);
      return next;
    });
  };

  const handleBulkAccept = async () => {
    const ids = Array.from(selected);
    if (ids.length === 0) return;
    await bulkMutation.mutateAsync({ taskIds: ids, reviewerId: REVIEWER_ID });
    setSelected(new Set());
  };

  return (
    <div className="mx-auto max-w-5xl space-y-6 pb-24">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">Review queue</h1>
        <p className="mt-1 text-sm text-slate-500">Accept, reject, or correct suggested catalog changes.</p>
      </div>

      <ReviewFilters
        value={filters}
        onChange={(v) => {
          setFilters(v);
          setPage(1);
        }}
      />

      {query.isLoading && (
        <div className="flex items-center gap-2 text-slate-500">
          <Loader2 className="h-5 w-5 animate-spin" />
          Loading tasks…
        </div>
      )}

      {query.isError && !query.isLoading && (
        <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
          Unable to load review tasks. Ensure the API is running and reachable.
        </div>
      )}

      {!query.isLoading && tasks.length === 0 && (
        <div className="rounded-xl border border-dashed border-slate-200 bg-white px-6 py-16 text-center">
          <p className="font-medium text-slate-800">No tasks match your filters</p>
          <p className="mt-2 text-sm text-slate-500">Adjust filters or check back when new items are enqueued.</p>
        </div>
      )}

      <div className="space-y-4">
        {tasks.map((task) => (
          <ReviewCard
            key={task.id}
            task={task}
            selected={selected.has(task.id)}
            onSelectChange={(c) => toggleSelect(task.id, c)}
            busy={busy}
            onAccept={() => acceptMutation.mutateAsync({ taskId: task.id, reviewerId: REVIEWER_ID })}
            onReject={(note) => rejectMutation.mutateAsync({ taskId: task.id, reviewerId: REVIEWER_ID, note })}
            onEdit={(corrected) =>
              editMutation.mutateAsync({
                taskId: task.id,
                reviewerId: REVIEWER_ID,
                correctedValue: { value: corrected },
              })
            }
          />
        ))}
      </div>

      {tasks.length > 0 && (
        <div className="flex items-center justify-between border-t border-slate-100 pt-4">
          <p className="text-sm text-slate-500">Page {page}</p>
          <div className="flex gap-2">
            <Button type="button" variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage((p) => Math.max(1, p - 1))}>
              Previous
            </Button>
            <Button type="button" variant="outline" size="sm" disabled={tasks.length < PAGE_SIZE} onClick={() => setPage((p) => p + 1)}>
              Next
            </Button>
          </div>
        </div>
      )}

      <BulkActionBar
        count={selected.size}
        onAccept={handleBulkAccept}
        onClear={() => setSelected(new Set())}
        accepting={bulkMutation.isPending}
      />
    </div>
  );
}
