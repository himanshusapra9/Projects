"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Select } from "@/components/ui/select";

export type ReviewFilterValues = {
  task_type: string;
  priority: string;
  confidence_band: string;
};

const TASK_TYPES = ["", "attribute_suggestion", "taxonomy", "duplicate", "compliance"];
const PRIORITIES = ["", "critical", "high", "medium", "low"];
const CONFIDENCE = ["", "high", "medium", "low"];

export default function ReviewFilters({
  value,
  onChange,
}: {
  value: ReviewFilterValues;
  onChange: (next: ReviewFilterValues) => void;
}) {
  return (
    <Card className="border-slate-200/80 shadow-sm">
      <CardContent className="flex flex-col gap-4 p-4 sm:flex-row sm:items-end">
        <div className="grid flex-1 gap-4 sm:grid-cols-3">
          <label className="space-y-1.5">
            <span className="text-xs font-medium text-slate-500">Task type</span>
            <Select
              value={value.task_type}
              onChange={(e) => onChange({ ...value, task_type: e.target.value })}
              aria-label="Filter by task type"
            >
              <option value="">All types</option>
              {TASK_TYPES.filter(Boolean).map((t) => (
                <option key={t} value={t}>
                  {t.replace(/_/g, " ")}
                </option>
              ))}
            </Select>
          </label>
          <label className="space-y-1.5">
            <span className="text-xs font-medium text-slate-500">Priority</span>
            <Select
              value={value.priority}
              onChange={(e) => onChange({ ...value, priority: e.target.value })}
              aria-label="Filter by priority"
            >
              <option value="">All priorities</option>
              {PRIORITIES.filter(Boolean).map((p) => (
                <option key={p} value={p}>
                  {p}
                </option>
              ))}
            </Select>
          </label>
          <label className="space-y-1.5">
            <span className="text-xs font-medium text-slate-500">Confidence</span>
            <Select
              value={value.confidence_band}
              onChange={(e) => onChange({ ...value, confidence_band: e.target.value })}
              aria-label="Filter by confidence band"
            >
              <option value="">All bands</option>
              {CONFIDENCE.filter(Boolean).map((c) => (
                <option key={c} value={c}>
                  {c.charAt(0).toUpperCase() + c.slice(1)}
                </option>
              ))}
            </Select>
          </label>
        </div>
      </CardContent>
    </Card>
  );
}
