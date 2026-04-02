from __future__ import annotations
from backend.models.scan_result import ScanResult

def determine_check_status(result: ScanResult) -> dict:
    if result.critical_count > 0:
        return {"state": "failure", "description": f"{result.critical_count} CRITICAL findings"}
    if result.high_count > 3:
        return {"state": "failure", "description": f"{result.high_count} HIGH findings"}
    if result.high_count > 0:
        return {"state": "neutral", "description": f"{result.high_count} HIGH findings (review recommended)"}
    return {"state": "success", "description": "No critical or high findings"}
