from __future__ import annotations
import numpy as np

class FreshnessPredictor:
    def __init__(self):
        self.history: list[float] = []
    
    def add_completion_time(self, seconds: float) -> None:
        self.history.append(seconds)
    
    def predict_next(self) -> dict:
        if len(self.history) < 3:
            return {"predicted_seconds": 0, "confidence": 0}
        recent = self.history[-7:]
        mean_time = np.mean(recent)
        std_time = np.std(recent)
        return {
            "predicted_seconds": round(float(mean_time), 1),
            "std_seconds": round(float(std_time), 1),
            "confidence": min(0.95, max(0.5, 1.0 - std_time / max(mean_time, 1))),
        }
    
    def is_late(self, elapsed_seconds: float, threshold_sigma: float = 2.0) -> bool:
        if len(self.history) < 3:
            return False
        recent = self.history[-7:]
        mean_time = np.mean(recent)
        std_time = np.std(recent)
        return bool(elapsed_seconds > mean_time + threshold_sigma * std_time)
