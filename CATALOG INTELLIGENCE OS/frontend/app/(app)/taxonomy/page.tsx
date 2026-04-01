"use client";

import { useQuery } from "@tanstack/react-query";
import { ChevronRight, FolderTree, Loader2, Package } from "lucide-react";
import { api } from "@/lib/api";
import type { TaxonomyNode } from "@/lib/types";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

function normalizeNodes(data: unknown): TaxonomyNode[] {
  if (Array.isArray(data)) return data as TaxonomyNode[];
  if (data && typeof data === "object" && "items" in data && Array.isArray((data as { items: unknown }).items)) {
    return (data as { items: TaxonomyNode[] }).items;
  }
  return [];
}

function TreeRows({ nodes, depth = 0 }: { nodes: TaxonomyNode[]; depth?: number }) {
  return (
    <ul className={depth ? "ml-4 border-l border-slate-200 pl-3" : "space-y-1"}>
      {nodes.map((n) => (
        <li key={n.id} className="py-1">
          <div className="flex flex-wrap items-center gap-2 rounded-lg px-2 py-1.5 hover:bg-slate-50">
            <FolderTree className="h-4 w-4 shrink-0 text-indigo-500" />
            <span className="font-medium text-slate-900">{n.name}</span>
            <ChevronRight className="h-3 w-3 text-slate-300" />
            <span className="flex items-center gap-1 text-sm text-slate-500">
              <Package className="h-3.5 w-3.5" />
              {n.product_count.toLocaleString()} products
            </span>
            <span className="text-xs text-slate-400">depth {n.depth}</span>
          </div>
          {n.path.length > 0 && (
            <p className="mt-0.5 pl-7 text-xs text-slate-500">{n.path.join(" › ")}</p>
          )}
        </li>
      ))}
    </ul>
  );
}

export default function TaxonomyPage() {
  const q = useQuery({
    queryKey: ["taxonomy", "root"],
    queryFn: () => api.taxonomy.list(),
  });

  const nodes = normalizeNodes(q.data);

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">Taxonomy</h1>
        <p className="mt-1 text-sm text-slate-500">Category tree with coverage and depth signals.</p>
      </div>

      {q.isLoading && (
        <div className="flex items-center gap-2 text-slate-500">
          <Loader2 className="h-5 w-5 animate-spin" />
          Loading taxonomy…
        </div>
      )}

      {q.isError && !q.isLoading && (
        <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
          Could not load taxonomy. Ensure the API exposes /api/v1/taxonomy.
        </div>
      )}

      {!q.isLoading && nodes.length === 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">No categories yet</CardTitle>
            <CardDescription>Seed taxonomy nodes from the admin API or importer.</CardDescription>
          </CardHeader>
        </Card>
      )}

      {nodes.length > 0 && (
        <Card className="border-slate-200/80 shadow-sm">
          <CardHeader>
            <CardTitle className="text-base font-semibold">Category tree</CardTitle>
            <CardDescription>Nodes returned for the current parent scope (default: root).</CardDescription>
          </CardHeader>
          <CardContent>
            <TreeRows nodes={nodes} />
          </CardContent>
        </Card>
      )}
    </div>
  );
}
