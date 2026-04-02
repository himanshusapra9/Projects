# CodeGuardian — Continuous AI Security & Code Quality Agent

> GitHub PR security scanner — detects SQL injection, XSS, secrets, vulnerable dependencies (OSV), and business logic flaws with static analysis + Claude-powered review.

CodeGuardian scans code diffs for security vulnerabilities using regex-based static
analysis and secret detection. It processes GitHub PR webhook events and generates
findings with severity, CWE classification, evidence, and fix suggestions.

## What's Implemented

### Analysis Engines

| Engine | What it does | Algorithm | Status |
|--------|-------------|-----------|--------|
| **Static rules** | Detects SQL injection, XSS, path traversal, eval injection, weak crypto, insecure randomness, hardcoded IPs | 7 regex-based rules with severity and CWE mapping | **Active** — runs on every PR webhook |
| **Secret detector** | Finds hardcoded AWS keys, GitHub tokens, OpenAI keys, Slack tokens, passwords, private keys, bearer tokens | 10 regex patterns + false positive filtering (example/test/placeholder strings) | **Active** — runs on every PR webhook |
| **Dependency scanner** | Queries OSV database for known CVEs in packages | `httpx` POST to api.osv.dev + CVSS-to-severity mapping | **Implemented**, not called from webhook handler; mock version used in tests |
| **Business logic analyzer** | Finds auth bypasses, privilege escalation, IDOR, race conditions | Claude claude-sonnet-4-6 via Anthropic SDK | **Implemented**, not called from webhook handler |
| **Finding aggregator** | Deduplicates findings by (file, line, CWE, title), filters by confidence threshold, sorts by severity | Set-based dedup + severity ordering | **Active** |

### GitHub Integration

| Component | Status |
|-----------|--------|
| **Webhook handler** | **Real** — processes `opened`/`synchronize`/`reopened` PR events, runs static + secret analysis on diff, returns `ScanResult` |
| **PR commenter** | **Implemented** — posts inline findings + summary table to GitHub PR via REST API — not called from `main.py` |
| **Status checker** | **Implemented** — determines pass/fail status based on finding counts — not called from `main.py` |

### Semgrep Rules (static assets, not integrated)

- `owasp-top10.yaml` — SQL injection via f-string, XSS via innerHTML
- `secrets.yaml` — AWS key, private key patterns

These YAML files exist but **no Python code loads or executes semgrep** — they're provided as reference rules.

### API (FastAPI)

- `POST /api/v1/webhooks/github` — Processes PR webhook payload, returns scan results with findings
- `GET /api/v1/scans/{repo}/latest` — Stub (not implemented)
- `GET /api/v1/findings` — Stub (returns empty list)
- `GET /health` — Health check

### Models (Pydantic)

- `Finding` — file, line, severity (CRITICAL/HIGH/MEDIUM/LOW), CWE, title, description, evidence, suggestion, confidence, source type
- `ScanResult` — repo, commit SHA, PR number, findings list, severity counts
- `RepoSecurityScore` — score, finding counts, trend

### What's Not Implemented

- **CodeBERT** vulnerability classifier — mentioned in spec, no code exists
- **AST-based analysis** (tree-sitter GNN) — no implementation
- **Semgrep execution** — rules exist as YAML but are never loaded
- **Database persistence** — no SQLAlchemy models or migrations
- **SOC2/GDPR compliance dashboard** — frontend placeholder only

### Frontend (Next.js 14 placeholder)

- Security score overview, findings explorer, compliance dashboard (static mockup)

### Tests (30 passing)

- Static rules: SQL injection (f-string + percent), XSS, path traversal, eval injection, weak crypto, clean code verification
- Secret detector: AWS key, GitHub token, private key, OpenAI key detected; example/placeholder keys filtered; clean code passes; evidence redacted
- Dependency scanner: CVE flagged with correct severity mapping (CRITICAL/HIGH/MEDIUM), no-CVE returns empty
- Finding aggregator: dedup removes duplicates, keeps different lines, filters low confidence, sorts by severity
- GitHub webhook: PR with SQL injection → findings, PR with secret → critical count, clean PR → no findings, wrong action ignored

## Setup

```bash
cd codeguardian
python -m venv .venv && source .venv/bin/activate
make install
cp .env.example .env
make test
```
