/**
 * Staged agent pipeline: separate prompts and schemas per stage (not one monolithic prompt).
 */

import type { LLMProvider } from "../provider.js";
import { renderSystemPrompt } from "../prompts/system.js";
import { renderFitAssessmentPrompt } from "../prompts/fit-assessment.js";
import { renderReturnRiskAssessmentPrompt } from "../prompts/return-risk-assessment.js";
import { renderClarificationPlannerPrompt } from "../prompts/clarification-planner.js";
import { renderAlternativeExplainerPrompt } from "../prompts/alternative-explainer.js";
import { renderEvidenceSummarizerPrompt } from "../prompts/evidence-summarizer.js";

/** Raw PDP / user payload as received by the API layer. */
export interface RawDecisionPayload {
  tenantId: string;
  product: Record<string, unknown>;
  userContext: Record<string, unknown>;
  reviewSummary?: Record<string, unknown>;
  alternatives?: Array<Record<string, unknown>>;
}

export interface ParsedContext {
  tenantId: string;
  productId: string;
  category: string;
  normalized: Record<string, unknown>;
}

export interface FitAssessmentStageOutput {
  fit_alignment_score: number;
  confidence_label: string;
  summary_bullets: string[];
  uncertainty_reasons: Array<{ code: string; severity: string; message: string }>;
}

export interface ReturnRiskStageOutput {
  return_probability: number;
  risk_tier: string;
  top_drivers: Array<{ key: string; weight: number }>;
  is_preventable_primary: boolean;
}

export interface ClarificationStageOutput {
  question_count: number;
  questions: Array<{ id: string; text: string; uncertainty_type: string }>;
  blocking_uncertainties: string[];
}

export interface RankAlternativesStageOutput {
  orderedProductIds: string[];
  scores: Record<string, number>;
}

export interface OrchestratorResult {
  parsed: ParsedContext;
  fit: FitAssessmentStageOutput;
  risk: ReturnRiskStageOutput;
  clarification: ClarificationStageOutput;
  alternatives: RankAlternativesStageOutput;
  explanation: { headline: string; body: string };
  evidenceSummary: { bullets: Array<{ text: string; evidence_class: string }> };
}

function extractJsonObject(text: string): Record<string, unknown> {
  const start = text.indexOf("{");
  const end = text.lastIndexOf("}");
  if (start === -1 || end <= start) throw new Error("No JSON object in model output");
  return JSON.parse(text.slice(start, end + 1)) as Record<string, unknown>;
}

function asStr(v: unknown): string {
  return typeof v === "string" ? v : "";
}

function asNum(v: unknown): number {
  return typeof v === "number" && !Number.isNaN(v) ? v : 0;
}

/**
 * Runs the multi-stage pipeline with distinct prompts per stage.
 */
export class DecisionOrchestrator {
  constructor(private readonly llm: LLMProvider) {}

  /**
   * Execute parse → fit → risk → clarification → alternatives → explanation.
   * @param payload - Incoming JSON-serializable decision request.
   */
  async run(payload: RawDecisionPayload): Promise<OrchestratorResult> {
    const parsed = this.parseStage(payload);
    const system = renderSystemPrompt({
      tenantPolicySummary: "Standard return window; prioritize fit guidance.",
      isoTimestamp: new Date().toISOString(),
    });

    const fit = await this.fitStage(system, parsed, payload);
    const risk = await this.riskStage(system, parsed, payload, fit);
    const clarification = await this.clarificationStage(system, parsed, payload, fit, risk);
    const alternatives = this.rankAlternativesStage(parsed, payload, fit, risk);
    const explanation = await this.explainTopAlternative(system, parsed, payload, alternatives);
    const evidenceSummary = await this.evidenceStage(system, payload, fit, risk);

    return {
      parsed,
      fit,
      risk,
      clarification,
      alternatives,
      explanation,
      evidenceSummary,
    };
  }

  private parseStage(payload: RawDecisionPayload): ParsedContext {
    const product = (payload.product ?? {}) as Record<string, unknown>;
    const productId = asStr(product.productId) || "unknown";
    const category = asStr(product.category) || "unknown";
    return {
      tenantId: payload.tenantId,
      productId,
      category,
      normalized: {
        product,
        userContext: payload.userContext ?? {},
        reviewSummary: payload.reviewSummary ?? {},
      },
    };
  }

  private async fitStage(
    system: string,
    parsed: ParsedContext,
    _payload: RawDecisionPayload,
  ): Promise<FitAssessmentStageOutput> {
    const prompt = renderFitAssessmentPrompt(JSON.stringify(parsed.normalized, null, 2));
    const text = await this.llm.chat({
      messages: [
        { role: "system", content: system },
        { role: "user", content: prompt },
      ],
      temperature: 0.15,
      maxTokens: 900,
    });
    const j = extractJsonObject(text);
    const ur = Array.isArray(j["uncertainty_reasons"])
      ? (j["uncertainty_reasons"] as Array<Record<string, unknown>>)
      : [];
    return {
      fit_alignment_score: asNum(j["fit_alignment_score"]),
      confidence_label: asStr(j["confidence_label"]) || "medium",
      summary_bullets: Array.isArray(j["summary_bullets"])
        ? (j["summary_bullets"] as string[])
        : [],
      uncertainty_reasons: ur.map((r) => ({
        code: asStr(r["code"]),
        severity: asStr(r["severity"]) || "informational",
        message: asStr(r["message"]),
      })),
    };
  }

  private async riskStage(
    system: string,
    parsed: ParsedContext,
    _payload: RawDecisionPayload,
    fit: FitAssessmentStageOutput,
  ): Promise<ReturnRiskStageOutput> {
    const ctx = {
      ...parsed.normalized,
      fit_stage: fit,
    };
    const prompt = renderReturnRiskAssessmentPrompt(JSON.stringify(ctx, null, 2));
    const text = await this.llm.chat({
      messages: [
        { role: "system", content: system },
        { role: "user", content: prompt },
      ],
      temperature: 0.15,
      maxTokens: 700,
    });
    const j = extractJsonObject(text);
    const drivers = Array.isArray(j["top_drivers"])
      ? (j["top_drivers"] as Array<Record<string, unknown>>)
      : [];
    return {
      return_probability: asNum(j["return_probability"]),
      risk_tier: asStr(j["risk_tier"]) || "moderate",
      top_drivers: drivers.map((d) => ({
        key: asStr(d["key"]),
        weight: asNum(d["weight"]),
      })),
      is_preventable_primary: Boolean(j["is_preventable_primary"]),
    };
  }

  private async clarificationStage(
    system: string,
    parsed: ParsedContext,
    _payload: RawDecisionPayload,
    fit: FitAssessmentStageOutput,
    risk: ReturnRiskStageOutput,
  ): Promise<ClarificationStageOutput> {
    const sessionState = {
      category: parsed.category,
      fit,
      risk,
      uncertainty_codes: fit.uncertainty_reasons.map((u) => u.code),
    };
    const prompt = renderClarificationPlannerPrompt(JSON.stringify(sessionState, null, 2));
    const text = await this.llm.chat({
      messages: [
        { role: "system", content: system },
        { role: "user", content: prompt },
      ],
      temperature: 0.1,
      maxTokens: 600,
    });
    const j = extractJsonObject(text);
    const qc = j["question_count"];
    const raw = typeof qc === "number" ? qc : asNum(qc);
    const questionCount = Math.min(3, Math.max(0, Math.round(raw)));
    const questions = Array.isArray(j["questions"])
      ? (j["questions"] as Array<Record<string, unknown>>).map((q) => ({
          id: asStr(q["id"]),
          text: asStr(q["text"]),
          uncertainty_type: asStr(q["uncertainty_type"]),
        }))
      : [];
    const blocking = Array.isArray(j["blocking_uncertainties"])
      ? (j["blocking_uncertainties"] as string[])
      : [];
    return {
      question_count: questionCount,
      questions,
      blocking_uncertainties: blocking,
    };
  }

  /**
   * Deterministic ordering from structured scores; swap with vector retrieval later.
   */
  private rankAlternativesStage(
    _parsed: ParsedContext,
    payload: RawDecisionPayload,
    fit: FitAssessmentStageOutput,
    risk: ReturnRiskStageOutput,
  ): RankAlternativesStageOutput {
    const alts = payload.alternatives ?? [];
    const scored = alts.map((a) => {
      const id = asStr(a["productId"]) || asStr(a["id"]) || "unknown";
      const fitHint = asNum(a["fitScore"]);
      const riskHint = asNum(a["returnRisk"]);
      const utility =
        0.5 * (fitHint || fit.fit_alignment_score) +
        0.35 * (1 - (riskHint || risk.return_probability)) +
        0.15 * (asNum(a["priceAdvantage"]) || 0.5);
      return { id, utility };
    });
    scored.sort((a, b) => b.utility - a.utility);
    const scores: Record<string, number> = {};
    for (const s of scored) scores[s.id] = s.utility;
    return {
      orderedProductIds: scored.map((s) => s.id),
      scores,
    };
  }

  private async explainTopAlternative(
    system: string,
    parsed: ParsedContext,
    payload: RawDecisionPayload,
    alts: RankAlternativesStageOutput,
  ): Promise<{ headline: string; body: string }> {
    const topId = alts.orderedProductIds[0];
    const top = (payload.alternatives ?? []).find(
      (a) => asStr(a["productId"]) === topId || asStr(a["id"]) === topId,
    );
    const ctx = {
      current_product_id: parsed.productId,
      top_alternative: top ?? { productId: topId },
      utility: topId ? alts.scores[topId] : 0,
    };
    const prompt = renderAlternativeExplainerPrompt(JSON.stringify(ctx, null, 2));
    const text = await this.llm.chat({
      messages: [
        { role: "system", content: system },
        { role: "user", content: prompt },
      ],
      temperature: 0.25,
      maxTokens: 400,
    });
    const j = extractJsonObject(text);
    return {
      headline: asStr(j["headline"]) || "Alternative option",
      body: asStr(j["body"]) || "",
    };
  }

  private async evidenceStage(
    system: string,
    payload: RawDecisionPayload,
    fit: FitAssessmentStageOutput,
    risk: ReturnRiskStageOutput,
  ): Promise<{ bullets: Array<{ text: string; evidence_class: string }> }> {
    const bundle = {
      reviewSummary: payload.reviewSummary ?? {},
      fit,
      risk,
    };
    const prompt = renderEvidenceSummarizerPrompt(JSON.stringify(bundle, null, 2));
    const text = await this.llm.chat({
      messages: [
        { role: "system", content: system },
        { role: "user", content: prompt },
      ],
      temperature: 0.2,
      maxTokens: 500,
    });
    const j = extractJsonObject(text);
    const bullets = Array.isArray(j["bullets"])
      ? (j["bullets"] as Array<Record<string, unknown>>).map((b) => ({
          text: asStr(b["text"]),
          evidence_class: asStr(b["evidence_class"]) || "unknown",
        }))
      : [];
    return { bullets };
  }
}
