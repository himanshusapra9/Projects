from __future__ import annotations

import json
import re
from pathlib import Path
from typing import Optional

import anthropic

from models.research_plan import ResearchPlan

SYSTEM_PROMPT = """You are a precise research plan parser.
Extract a structured JSON research plan from the provided program.md content.
Return ONLY valid JSON matching this schema:
{
  "research_goal": "string",
  "baseline": {"val_loss": float, "training_time_minutes": float, "model_description": "string"},
  "constraints": {"max_gpu_memory_gb": int, "max_experiment_minutes": int,
                   "max_total_hours": int, "forbidden_files": ["string"],
                   "allowed_files": ["string"]},
  "hypotheses": [{"id": "string", "description": "string", "priority": int}],
  "success_criteria": [{"metric": "string", "target": float, "type": "primary|secondary"}],
  "strategy": "bayesian_adaptive|grid|random",
  "parallelism": int,
  "checkpoint_frequency": "every_improvement|every_n|never"
}"""


class ProgramInterpreter:
    def __init__(self, program_path: str = "program.md"):
        self.program_path = Path(program_path)
        self.client: Optional[anthropic.Anthropic] = None

    def _get_client(self) -> anthropic.Anthropic:
        if self.client is None:
            self.client = anthropic.Anthropic()
        return self.client

    def parse(self) -> ResearchPlan:
        content = self.program_path.read_text()
        client = self._get_client()
        response = client.messages.create(
            model="claude-sonnet-4-6",
            max_tokens=2048,
            system=SYSTEM_PROMPT,
            messages=[{"role": "user", "content": f"Parse this program.md:\n\n{content}"}],
        )
        raw_text = response.content[0].text
        json_match = re.search(r"\{.*\}", raw_text, re.DOTALL)
        if json_match:
            raw_text = json_match.group(0)
        return ResearchPlan(**json.loads(raw_text))

    def parse_from_string(self, content: str) -> ResearchPlan:
        """Parse directly from a string (useful for testing)."""
        client = self._get_client()
        response = client.messages.create(
            model="claude-sonnet-4-6",
            max_tokens=2048,
            system=SYSTEM_PROMPT,
            messages=[{"role": "user", "content": f"Parse this program.md:\n\n{content}"}],
        )
        raw_text = response.content[0].text
        json_match = re.search(r"\{.*\}", raw_text, re.DOTALL)
        if json_match:
            raw_text = json_match.group(0)
        return ResearchPlan(**json.loads(raw_text))
