from __future__ import annotations
import httpx
from backend.models.finding import Finding

async def post_pr_findings(
    owner: str, repo: str, pr_number: int,
    commit_sha: str, findings: list[Finding],
    github_token: str,
) -> None:
    headers = {
        "Authorization": f"Bearer {github_token}",
        "Accept": "application/vnd.github+json",
        "X-GitHub-Api-Version": "2022-11-28",
    }
    
    async with httpx.AsyncClient(timeout=30) as client:
        for finding in findings:
            severity_icon = "🔴" if finding.severity == "CRITICAL" else "🟡"
            comment_body = (
                f"### {severity_icon} [{finding.severity}] {finding.title}\n\n"
                f"**CWE:** {finding.cwe}\n\n"
                f"{finding.description}\n\n"
                f"**Evidence:**\n```\n{finding.evidence}\n```\n\n"
                f"**Suggested Fix:**\n{finding.suggestion}\n\n"
                f"*Confidence: {finding.confidence:.0%} | CodeGuardian v1.0*"
            )
            await client.post(
                f"https://api.github.com/repos/{owner}/{repo}/pulls/{pr_number}/comments",
                headers=headers,
                json={
                    "body": comment_body,
                    "commit_id": commit_sha,
                    "path": finding.file,
                    "line": finding.line,
                    "side": "RIGHT",
                },
            )
        
        critical = [f for f in findings if f.severity == "CRITICAL"]
        high = [f for f in findings if f.severity == "HIGH"]
        summary = (
            f"## CodeGuardian Security Scan\n\n"
            f"| Severity | Count |\n|----------|-------|\n"
            f"| Critical | {len(critical)} |\n"
            f"| High | {len(high)} |\n"
            f"| Medium | {len([f for f in findings if f.severity == 'MEDIUM'])} |\n"
            f"| Low | {len([f for f in findings if f.severity == 'LOW'])} |\n\n"
        )
        if critical:
            summary += "**Merge blocked: CRITICAL findings require resolution.**\n"
        await client.post(
            f"https://api.github.com/repos/{owner}/{repo}/issues/{pr_number}/comments",
            headers=headers,
            json={"body": summary},
        )
