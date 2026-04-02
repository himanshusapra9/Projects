from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(title="PulseAI API", version="1.0.0")
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/health")
def health():
    return {"status": "ok"}

@app.post("/api/v1/webhooks/{platform}")
async def receive_webhook(platform: str, payload: dict):
    return {"status": "received", "platform": platform}

@app.get("/api/v1/insights")
async def get_insights():
    return {"insights": []}

@app.get("/api/v1/briefing/{date_str}")
async def get_briefing(date_str: str):
    return {"date": date_str, "narrative": "No briefing generated yet."}

@app.get("/api/v1/export/roadmap-csv")
async def export_roadmap():
    return {"status": "not_implemented"}
