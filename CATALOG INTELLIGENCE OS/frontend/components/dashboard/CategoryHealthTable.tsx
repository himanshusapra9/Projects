"use client";

import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import ConfidenceBar from "@/components/shared/ConfidenceBar";

export interface CategoryHealthRow {
  category_id: string;
  category_name: string;
  product_count: number;
  avg_quality: number;
  completeness: number;
  conformity: number;
}

export default function CategoryHealthTable({ rows }: { rows: CategoryHealthRow[] }) {
  return (
    <Card className="border-slate-200/80 shadow-sm">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <div>
          <CardTitle className="text-base font-semibold">Category health</CardTitle>
          <CardDescription>Product volume and quality signals by category.</CardDescription>
        </div>
        <Link
          href="/taxonomy"
          className="inline-flex h-8 items-center justify-center rounded-md border border-slate-200 bg-white px-3 text-xs font-medium text-slate-900 hover:bg-slate-50"
        >
          Browse taxonomy
        </Link>
      </CardHeader>
      <CardContent className="overflow-x-auto p-0">
        <table className="w-full min-w-[640px] text-left text-sm">
          <thead className="border-b border-slate-100 bg-slate-50/80 text-xs uppercase text-slate-500">
            <tr>
              <th className="px-6 py-3 font-medium">Category</th>
              <th className="px-6 py-3 font-medium">Products</th>
              <th className="px-6 py-3 font-medium">Avg quality</th>
              <th className="px-6 py-3 font-medium">Completeness</th>
              <th className="px-6 py-3 font-medium">Conformity</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {rows.length === 0 && (
              <tr>
                <td colSpan={5} className="px-6 py-10 text-center text-sm text-slate-500">
                  No category breakdown available yet.
                </td>
              </tr>
            )}
            {rows.map((r) => (
              <tr key={r.category_id} className="hover:bg-slate-50/50">
                <td className="px-6 py-3 font-medium text-slate-900">{r.category_name}</td>
                <td className="px-6 py-3 text-slate-600">{r.product_count.toLocaleString()}</td>
                <td className="px-6 py-3">
                  <ConfidenceBar value={r.avg_quality} />
                </td>
                <td className="px-6 py-3">
                  <ConfidenceBar value={r.completeness} />
                </td>
                <td className="px-6 py-3">
                  <ConfidenceBar value={r.conformity} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </CardContent>
    </Card>
  );
}
