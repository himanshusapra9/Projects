"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import AppNav from "@/components/AppNav";

const API = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";

interface TableSummary {
  id: string;
  name: string;
  health: string;
}

export default function DuplicatesPage() {
  const [tables, setTables] = useState<TableSummary[]>([]);

  useEffect(() => {
    fetch(`${API}/api/v1/tables`)
      .then((r) => r.json())
      .then((d) => setTables(d.tables || []))
      .catch(() => {});
  }, []);

  return (
    <AppNav>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Duplicate Detection</h1>
      <p className="text-sm text-gray-500 mb-6">
        MinHash LSH-based near-duplicate detection across all monitored tables.
        Select a table to view duplicate clusters.
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {tables.map((t) => (
          <Link key={t.id} href={`/tables/${t.id}?tab=duplicates`}>
            <div className="bg-white border border-gray-200 rounded-lg p-5 hover:shadow-md transition-shadow cursor-pointer">
              <h3 className="font-medium text-gray-900">{t.name}</h3>
              <p className="text-sm text-gray-500 mt-1">View duplicate clusters →</p>
            </div>
          </Link>
        ))}
      </div>
      {tables.length === 0 && (
        <p className="text-gray-400 text-center py-12">No tables registered yet</p>
      )}
    </AppNav>
  );
}
