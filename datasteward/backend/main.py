from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(title="DataSteward API", version="1.0.0")
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/health")
def health():
    return {"status": "ok"}


@app.get("/api/v1/incidents")
async def list_incidents():
    return {"incidents": []}


@app.get("/api/v1/tables/{table_name}/score")
async def get_table_score(table_name: str):
    return {"table_name": table_name, "overall_score": 100.0}


@app.get("/api/v1/tables/{table_name}/profile")
async def get_table_profile(table_name: str):
    return {"table_name": table_name, "message": "Profile not computed yet"}
