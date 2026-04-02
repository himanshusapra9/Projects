from __future__ import annotations
import numpy as np
import pandas as pd
from sklearn.ensemble import IsolationForest

class AnomalyDetector:
    def __init__(self):
        self.prophet_baselines: dict[str, dict] = {}
        self.iso_forest = IsolationForest(contamination=0.05, random_state=42)
        self.is_fitted = False

    def fit_baseline(self, table_name: str, history: pd.DataFrame) -> None:
        """Store baseline stats from history DataFrame with columns [ds, y]."""
        mean_val = history["y"].mean()
        std_val = history["y"].std()
        self.prophet_baselines[table_name] = {
            "mean": mean_val,
            "std": std_val,
            "lower": mean_val - 2.5 * std_val,
            "upper": mean_val + 2.5 * std_val,
        }

    def detect_row_count_anomaly(self, table_name: str, current_count: int) -> dict:
        if table_name not in self.prophet_baselines:
            return {"anomaly": False, "reason": "no_baseline"}
        baseline = self.prophet_baselines[table_name]
        if current_count < baseline["lower"] or current_count > baseline["upper"]:
            pct_dev = abs(current_count - baseline["mean"]) / max(abs(baseline["mean"]), 1) * 100
            return {
                "anomaly": True,
                "anomaly_type": "row_count_drop" if current_count < baseline["lower"] else "row_count_spike",
                "expected": round(baseline["mean"]),
                "actual": current_count,
                "lower_bound": round(baseline["lower"]),
                "upper_bound": round(baseline["upper"]),
                "pct_deviation": round(pct_dev, 1),
                "confidence": 0.90,
            }
        return {"anomaly": False}

    def fit_isolation_forest(self, metric_history: np.ndarray) -> None:
        self.iso_forest.fit(metric_history)
        self.is_fitted = True

    def detect_multivariate_anomaly(self, current_metrics: dict) -> dict:
        if not self.is_fitted:
            return {"anomaly": False, "reason": "not_fitted"}
        X = np.array([[v for v in current_metrics.values()]])
        score = self.iso_forest.decision_function(X)[0]
        is_anomaly = self.iso_forest.predict(X)[0] == -1
        return {
            "anomaly": bool(is_anomaly),
            "anomaly_score": float(-score),
            "confidence": min(0.99, max(0.5, float(-score) / 0.5)),
        }
