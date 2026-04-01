"use client";

import { useState } from "react";
import { Key, Sliders, Zap } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/select";

export default function SettingsPage() {
  const [apiKey, setApiKey] = useState("");
  const [qualityThreshold, setQualityThreshold] = useState("0.85");
  const [autoApprove, setAutoApprove] = useState("off");

  return (
    <div className="mx-auto max-w-3xl space-y-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">Settings</h1>
        <p className="mt-1 text-sm text-slate-500">Workspace configuration for CIOS. Values are local-only in this demo UI.</p>
      </div>

      <Card className="border-slate-200/80 shadow-sm">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Key className="h-5 w-5 text-indigo-600" />
            <div>
              <CardTitle className="text-base">API access</CardTitle>
              <CardDescription>Store a client key for secured ingest and export routes (handled by your auth layer).</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          <label className="space-y-1.5">
            <span className="text-sm font-medium text-slate-700">API key</span>
            <Input type="password" autoComplete="off" value={apiKey} onChange={(e) => setApiKey(e.target.value)} placeholder="••••••••" />
          </label>
          <p className="text-xs text-slate-500">Set NEXT_PUBLIC_API_URL in deployment; keys should not be committed to source control.</p>
        </CardContent>
      </Card>

      <Card className="border-slate-200/80 shadow-sm">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Sliders className="h-5 w-5 text-indigo-600" />
            <div>
              <CardTitle className="text-base">Quality thresholds</CardTitle>
              <CardDescription>Minimum score for auto-routing to published or in-review states.</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <label className="space-y-1.5">
            <span className="text-sm font-medium text-slate-700">Publish threshold (0–1)</span>
            <Input type="number" step="0.01" min={0} max={1} value={qualityThreshold} onChange={(e) => setQualityThreshold(e.target.value)} />
          </label>
        </CardContent>
      </Card>

      <Card className="border-slate-200/80 shadow-sm">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Zap className="h-5 w-5 text-indigo-600" />
            <div>
              <CardTitle className="text-base">Auto-approve</CardTitle>
              <CardDescription>Automatically accept high-confidence review tasks under policy.</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <label className="space-y-1.5">
            <span className="text-sm font-medium text-slate-700">Mode</span>
            <Select value={autoApprove} onChange={(e) => setAutoApprove(e.target.value)} aria-label="Auto-approve mode">
              <option value="off">Off</option>
              <option value="high_confidence">High confidence only (&gt;= 0.92)</option>
              <option value="trusted_suppliers">Trusted suppliers only</option>
            </Select>
          </label>
          <Button type="button">Save preferences</Button>
        </CardContent>
      </Card>
    </div>
  );
}
