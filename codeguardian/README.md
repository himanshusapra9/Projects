# CodeGuardian — Continuous AI Security & Code Quality Agent

CodeGuardian is a GitHub App that automatically scans every PR for security
vulnerabilities using static analysis, ML-based detection, secret scanning,
dependency vulnerability scanning, and Claude-powered business logic analysis.

## Features

- Static analysis rules for OWASP Top 10 vulnerabilities
- ML-powered vulnerability detection (CodeBERT)
- Secret/credential detection with false positive filtering
- Dependency scanning via OSV database
- Business logic analysis via Claude
- Inline PR comments with evidence and fix suggestions
- Security score tracking per repository

## Setup

```bash
make install
cp .env.example .env
make test
make dev
```
