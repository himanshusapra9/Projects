/**
 * Clarification planner: how many questions and which uncertainty to target.
 */

export const CLARIFICATION_PLANNER_PROMPT = `You decide whether to ask clarifying questions before recommending a size or SKU.

Input (JSON):
{{SESSION_STATE_JSON}}

Rules:
- Ask 0 questions if structured signals are sufficient for medium+ confidence.
- Ask 1–3 questions only when a specific missing fact would materially change the recommendation.
- Map each question to an uncertainty_type among:
  measurement_gap, fit_style_intent, use_case_environment, skin_sensitivity, room_dimension,
  foot_morphology, budget_constraint, color_lighting, delivery_constraints.
- Prefer the smallest number of questions that maximizes information gain.

Respond ONLY with valid JSON:
{
  "question_count": 0 | 1 | 2 | 3,
  "rationale": string,
  "questions": Array<{
    "id": string,
    "text": string,
    "uncertainty_type": string,
    "expected_information_gain": "low" | "medium" | "high"
  }>,
  "blocking_uncertainties": string[]
}
`;

export function renderClarificationPlannerPrompt(sessionStateJson: string): string {
  return CLARIFICATION_PLANNER_PROMPT.replace("{{SESSION_STATE_JSON}}", sessionStateJson);
}
