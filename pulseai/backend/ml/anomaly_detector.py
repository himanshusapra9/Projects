from __future__ import annotations

import numpy as np
from sklearn.ensemble import IsolationForest


class FeedbackAnomalyDetector:
    def __init__(self, contamination: float = 0.05):
        self.model = IsolationForest(contamination=contamination, random_state=42)
        self.is_fitted = False

    def fit(self, daily_metrics: np.ndarray) -> None:
        """Fit on historical daily metrics: [volume, avg_sentiment, urgency_mean]."""
        self.model.fit(daily_metrics)
        self.is_fitted = True

    def detect(self, current_metrics: np.ndarray) -> dict:
        if not self.is_fitted:
            return {"anomaly": False, "reason": "not_fitted"}
        score = self.model.decision_function(current_metrics.reshape(1, -1))[0]
        is_anomaly = self.model.predict(current_metrics.reshape(1, -1))[0] == -1
        return {
            "anomaly": bool(is_anomaly),
            "anomaly_score": float(-score),
            "confidence": min(0.99, max(0.5, float(-score) / 0.5)),
        }
