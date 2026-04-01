"use client";

import { Check, X } from "lucide-react";
import type { AttributeRecord } from "@/lib/types";
import ConfidenceBar from "@/components/shared/ConfidenceBar";
import ExtractionTypeBadge from "@/components/shared/ExtractionTypeBadge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

function displayValue(v: AttributeRecord["value"]) {
  if (v.canonical != null) return typeof v.canonical === "object" ? JSON.stringify(v.canonical) : String(v.canonical);
  if (v.value != null) return String(v.value);
  if (v.raw != null) return v.raw;
  return "—";
}

export default function AttributeTable({ attributes }: { attributes: AttributeRecord[] }) {
  return (
    <Card className="border-slate-200/80 shadow-sm">
      <CardHeader>
        <CardTitle className="text-base font-semibold">Attributes</CardTitle>
        <CardDescription>Enriched fields with confidence and provenance.</CardDescription>
      </CardHeader>
      <CardContent className="overflow-x-auto p-0">
        <table className="w-full min-w-[720px] text-left text-sm">
          <thead className="border-b border-slate-100 bg-slate-50/80 text-xs uppercase text-slate-500">
            <tr>
              <th className="px-6 py-3 font-medium">Key</th>
              <th className="px-6 py-3 font-medium">Value</th>
              <th className="px-6 py-3 font-medium">Confidence</th>
              <th className="px-6 py-3 font-medium">Type</th>
              <th className="px-6 py-3 font-medium">Approved</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {attributes.map((a) => (
              <tr key={a.id} className="hover:bg-slate-50/40">
                <td className="px-6 py-3 font-mono text-xs font-medium text-slate-800">{a.attribute_key}</td>
                <td className="max-w-xs truncate px-6 py-3 text-slate-700" title={displayValue(a.value)}>
                  {displayValue(a.value)}
                </td>
                <td className="px-6 py-3">
                  <div className="max-w-[140px]">
                    <ConfidenceBar value={a.confidence} />
                  </div>
                </td>
                <td className="px-6 py-3">
                  <ExtractionTypeBadge type={a.extraction_type} />
                </td>
                <td className="px-6 py-3">
                  {a.is_approved ? (
                    <span className="inline-flex items-center gap-1 text-emerald-600">
                      <Check className="h-4 w-4" /> Yes
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-slate-400">
                      <X className="h-4 w-4" /> No
                    </span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </CardContent>
    </Card>
  );
}
