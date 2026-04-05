"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { motion } from "framer-motion";
import { Loader2 } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { apiGet, apiPost } from "@/lib/api";

const CHANNEL_ORDER = ["AMAZON", "EBAY", "WALMART", "SHOPIFY", "ETSY"] as const;
type Channel = (typeof CHANNEL_ORDER)[number];

const ALL_CHANNELS: Channel[] = [...CHANNEL_ORDER];

interface ValidationRow {
  id: string;
  field: string;
  rule: string;
  severity: string;
  message: string;
  suggestedFix: string | null;
}

interface ListingPackage {
  id: string;
  productId: string;
  channel: Channel;
  status: string;
  title: string | null;
  bulletsJson: unknown;
  description: string | null;
  attributesJson: unknown;
  keywordsJson: unknown;
  imagesJson: unknown;
  qualityScore: number | null;
  validations: ValidationRow[];
}

function channelLabel(c: Channel): string {
  switch (c) {
    case "AMAZON":
      return "Amazon";
    case "EBAY":
      return "eBay";
    case "WALMART":
      return "Walmart";
    case "SHOPIFY":
      return "Shopify";
    case "ETSY":
      return "Etsy";
    default:
      return c;
  }
}

function isChannel(value: string): value is Channel {
  return (CHANNEL_ORDER as readonly string[]).includes(value);
}

function parseStringArray(raw: unknown): string[] {
  if (Array.isArray(raw)) {
    return raw.filter((x): x is string => typeof x === "string");
  }
  if (typeof raw === "string") {
    try {
      const parsed = JSON.parse(raw) as unknown;
      return Array.isArray(parsed)
        ? parsed.filter((x): x is string => typeof x === "string")
        : [];
    } catch {
      return [];
    }
  }
  return [];
}

function parseAttributes(raw: unknown): Record<string, unknown> {
  if (raw && typeof raw === "object" && !Array.isArray(raw)) {
    return raw as Record<string, unknown>;
  }
  if (typeof raw === "string") {
    try {
      const parsed = JSON.parse(raw) as unknown;
      if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) {
        return parsed as Record<string, unknown>;
      }
    } catch {
      return {};
    }
  }
  return {};
}

function formatQuality(score: number | null): string {
  if (score == null || Number.isNaN(score)) {
    return "—";
  }
  if (score <= 1) {
    return `${Math.round(score * 100)}%`;
  }
  return String(score);
}

function severityBorderClass(severity: string): string {
  switch (severity) {
    case "BLOCKING":
      return "border-l-red-500";
    case "ERROR":
      return "border-l-orange-500";
    case "WARNING":
      return "border-l-amber-500";
    case "INFO":
      return "border-l-sky-500";
    default:
      return "border-l-border";
  }
}

export default function ChannelPackagesPage() {
  const params = useParams();
  const productId = typeof params.id === "string" ? params.id : "";

  const [packages, setPackages] = useState<ListingPackage[]>([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [tab, setTab] = useState<Channel>("AMAZON");

  const fetchPackages = useCallback(async () => {
    if (!productId) return;
    try {
      setLoading(true);
      const data = await apiGet<ListingPackage[]>(
        `/listing-packages/product/${productId}`,
      );
      setPackages(
        data.map((p) => ({
          ...p,
          channel: isChannel(p.channel) ? p.channel : ("AMAZON" as Channel),
        })),
      );
      setError(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load listing packages");
      setPackages([]);
    } finally {
      setLoading(false);
    }
  }, [productId]);

  useEffect(() => {
    fetchPackages();
  }, [fetchPackages]);

  const channelsWithPackages = useMemo(() => {
    const set = new Set<Channel>();
    for (const p of packages) {
      if (isChannel(p.channel)) set.add(p.channel);
    }
    return CHANNEL_ORDER.filter((c) => set.has(c));
  }, [packages]);

  const packageByChannel = useMemo(() => {
    const m = new Map<Channel, ListingPackage>();
    for (const p of packages) {
      if (isChannel(p.channel)) m.set(p.channel, p);
    }
    return m;
  }, [packages]);

  useEffect(() => {
    if (channelsWithPackages.length === 0) return;
    if (!channelsWithPackages.includes(tab)) {
      const first = channelsWithPackages[0];
      if (first) setTab(first);
    }
  }, [channelsWithPackages, tab]);

  const handleGenerateAll = async () => {
    if (!productId) return;
    try {
      setGenerating(true);
      await apiPost<unknown, { productId: string; channels: Channel[] }>(
        "/listing-packages/generate",
        { productId, channels: ALL_CHANNELS },
      );
      toast.success("Listing packages generated");
      await fetchPackages();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Generation failed");
    } finally {
      setGenerating(false);
    }
  };

  if (!productId) {
    return (
      <div className="mx-auto max-w-2xl pt-16 text-center">
        <p className="text-foreground-muted">Invalid product</p>
        <Button variant="outline" className="mt-4" asChild>
          <Link href="/products">Back to products</Link>
        </Button>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-accent" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="mx-auto max-w-2xl pt-16 text-center">
        <p className="text-foreground-muted">{error}</p>
        <div className="mt-4 flex justify-center gap-2">
          <Button variant="outline" onClick={() => fetchPackages()}>
            Retry
          </Button>
          <Button variant="outline" asChild>
            <Link href={`/products/${productId}`}>Back to truth record</Link>
          </Button>
        </div>
      </div>
    );
  }

  const hasPackages = channelsWithPackages.length > 0;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.25 }}
      className="mx-auto max-w-6xl space-y-6"
    >
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Channel packages</h1>
          <p className="text-sm text-foreground-muted">
            Product <span className="font-mono">{productId}</span> — preview and validation per
            marketplace.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {hasPackages ? (
            <Button
              variant="default"
              disabled={generating}
              onClick={() => void handleGenerateAll()}
            >
              {generating ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Generating…
                </>
              ) : (
                "Generate All Channel Listings"
              )}
            </Button>
          ) : null}
          <Button variant="outline" asChild>
            <Link href={`/products/${productId}`}>Back to truth record</Link>
          </Button>
        </div>
      </div>

      {!hasPackages ? (
        <div className="rounded-xl border border-border bg-surface p-10 text-center shadow-sm">
          <h2 className="text-lg font-semibold text-foreground">No channel listings yet</h2>
          <p className="mt-2 max-w-md mx-auto text-sm text-foreground-muted">
            Generate optimized drafts for Amazon, eBay, Walmart, Shopify, and Etsy from your truth
            record.
          </p>
          <Button
            className="mt-6"
            size="lg"
            disabled={generating}
            onClick={() => void handleGenerateAll()}
          >
            {generating ? (
              <>
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                Generating listings…
              </>
            ) : (
              "Generate listings"
            )}
          </Button>
        </div>
      ) : (
        <Tabs
          value={tab}
          onValueChange={(v) => {
            if (isChannel(v)) setTab(v);
          }}
          className="space-y-4"
        >
          <TabsList className="flex h-auto flex-wrap gap-1 bg-surface">
            {channelsWithPackages.map((c) => (
              <TabsTrigger key={c} value={c} className="font-mono text-xs">
                {channelLabel(c)}
              </TabsTrigger>
            ))}
          </TabsList>

          {channelsWithPackages.map((c) => {
            const pkg = packageByChannel.get(c);
            if (!pkg) return null;

            const bullets = parseStringArray(pkg.bulletsJson);
            const keywords = parseStringArray(pkg.keywordsJson);
            const attributes = parseAttributes(pkg.attributesJson);

            return (
              <TabsContent key={c} value={c} className="space-y-4">
                <div className="flex flex-wrap items-center gap-2">
                  <Badge variant="outline" className="font-mono text-xs">
                    {pkg.status}
                  </Badge>
                  <span className="text-sm text-foreground-muted">
                    Quality score:{" "}
                    <span className="font-medium text-foreground">{formatQuality(pkg.qualityScore)}</span>
                  </span>
                </div>

                <Card className="border-border bg-surface">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base">Title</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm leading-relaxed text-foreground">
                      {pkg.title?.trim() ? (
                        pkg.title
                      ) : (
                        <span className="text-foreground-muted">—</span>
                      )}
                    </p>
                  </CardContent>
                </Card>

                <Card className="border-border bg-surface">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base">Bullets</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {bullets.length === 0 ? (
                      <p className="text-sm text-foreground-muted">No bullets</p>
                    ) : (
                      <ul className="list-inside list-disc space-y-1 text-sm text-foreground">
                        {bullets.map((b, i) => (
                          <li key={i}>{b}</li>
                        ))}
                      </ul>
                    )}
                  </CardContent>
                </Card>

                <Card className="border-border bg-surface">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base">Description</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="whitespace-pre-wrap text-sm leading-relaxed text-foreground">
                      {pkg.description?.trim() ? (
                        pkg.description
                      ) : (
                        <span className="text-foreground-muted">No description</span>
                      )}
                    </p>
                  </CardContent>
                </Card>

                <Card className="border-border bg-surface">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base">Attributes</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {Object.keys(attributes).length === 0 ? (
                      <p className="text-sm text-foreground-muted">No attributes</p>
                    ) : (
                      <dl className="grid gap-2 sm:grid-cols-2">
                        {Object.entries(attributes).map(([key, val]) => (
                          <div
                            key={key}
                            className="rounded-md border border-border bg-background/40 px-3 py-2"
                          >
                            <dt className="text-xs font-medium text-foreground-muted">{key}</dt>
                            <dd className="mt-0.5 text-sm text-foreground">
                              {val === null || val === undefined
                                ? "—"
                                : typeof val === "object"
                                  ? JSON.stringify(val)
                                  : String(val)}
                            </dd>
                          </div>
                        ))}
                      </dl>
                    )}
                  </CardContent>
                </Card>

                <Card className="border-border bg-surface">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base">Keywords</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {keywords.length === 0 ? (
                      <p className="text-sm text-foreground-muted">No keywords</p>
                    ) : (
                      <div className="flex flex-wrap gap-2">
                        {keywords.map((k, i) => (
                          <span
                            key={`${k}-${i}`}
                            className="rounded-full border border-border bg-background/50 px-2.5 py-0.5 text-xs text-foreground"
                          >
                            {k}
                          </span>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>

                <Card className="border-border bg-surface">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base">Images</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ImagesPreview imagesJson={pkg.imagesJson} />
                  </CardContent>
                </Card>

                <Card className="border-border bg-surface">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base">Validation</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {pkg.validations.length === 0 ? (
                      <p className="text-sm text-foreground-muted">No issues reported</p>
                    ) : (
                      pkg.validations.map((v) => (
                        <div
                          key={v.id}
                          className={`rounded-md border border-border border-l-4 bg-background/40 p-3 ${severityBorderClass(v.severity)}`}
                        >
                          <div className="flex flex-wrap items-center gap-2">
                            <Badge variant="outline" className="font-mono text-[10px] uppercase">
                              {v.severity}
                            </Badge>
                            <span className="font-mono text-xs text-foreground-muted">
                              {v.field}
                            </span>
                            <span className="font-mono text-xs text-foreground-muted">· {v.rule}</span>
                          </div>
                          <p className="mt-2 text-sm text-foreground">{v.message}</p>
                          {v.suggestedFix ? (
                            <p className="mt-2 text-sm text-foreground-muted">
                              <span className="font-medium text-foreground">Suggested fix: </span>
                              {v.suggestedFix}
                            </p>
                          ) : null}
                        </div>
                      ))
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
            );
          })}
        </Tabs>
      )}
    </motion.div>
  );
}

function ImagesPreview({ imagesJson }: { imagesJson: unknown }) {
  const items = useMemo(() => {
    if (Array.isArray(imagesJson)) {
      return imagesJson;
    }
    if (typeof imagesJson === "string") {
      try {
        const p = JSON.parse(imagesJson) as unknown;
        return Array.isArray(p) ? p : [];
      } catch {
        return [];
      }
    }
    return [];
  }, [imagesJson]);

  if (items.length === 0) {
    return <p className="text-sm text-foreground-muted">No images</p>;
  }

  return (
    <div className="flex flex-wrap gap-3">
      {items.map((item, i) => {
        if (item && typeof item === "object" && "url" in item && typeof (item as { url: unknown }).url === "string") {
          const o = item as { url: string; role?: string; order?: number };
          return (
            <div
              key={`${o.url}-${i}`}
              className="flex max-w-[140px] flex-col gap-1 rounded-md border border-border bg-background/40 p-2"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={o.url}
                alt=""
                className="h-24 w-full rounded object-cover"
              />
              {o.role != null ? (
                <span className="text-[10px] font-mono text-foreground-muted">{String(o.role)}</span>
              ) : null}
            </div>
          );
        }
        return (
          <pre
            key={i}
            className="max-h-32 max-w-full overflow-auto rounded-md border border-border bg-background/60 p-2 text-[10px] text-foreground-muted"
          >
            {JSON.stringify(item, null, 2)}
          </pre>
        );
      })}
    </div>
  );
}
