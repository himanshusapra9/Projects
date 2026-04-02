from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(title="CodeGuardian API", version="1.0.0")
app.add_middleware(CORSMiddleware, allow_origins=["*"], allow_methods=["*"], allow_headers=["*"])

@app.get("/health")
def health():
    return {"status": "ok"}

@app.post("/api/v1/webhooks/github")
async def github_webhook(payload: dict):
    from backend.github_app.webhook_handler import handle_pull_request_event
    result = handle_pull_request_event(payload)
    return result.model_dump()

@app.get("/api/v1/scans/{repo}/latest")
async def get_latest_scan(repo: str):
    return {"repo": repo, "message": "Not implemented"}

@app.get("/api/v1/findings")
async def list_findings():
    return {"findings": []}
