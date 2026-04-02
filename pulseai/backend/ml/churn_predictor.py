from __future__ import annotations
import numpy as np

class ChurnPredictor:
    """Simple churn probability predictor based on engagement + sentiment features."""
    
    def __init__(self):
        # Feature weights (would be trained with LightGBM in production)
        self.weights = np.array([-0.3, -0.5, 0.2, 0.4, -0.01])
        self.bias = 0.3
    
    def predict(self, features: dict) -> float:
        """Predict churn probability from features.
        
        Features: avg_sentiment_30d, sentiment_slope, urgency_max,
                  churn_keyword_count, days_since_last_positive
        """
        x = np.array([
            features.get("avg_sentiment_30d", 0.0),
            features.get("sentiment_slope", 0.0),
            features.get("urgency_max", 0.0),
            features.get("churn_keyword_count", 0),
            features.get("days_since_last_positive", 30),
        ])
        logit = float(np.dot(self.weights, x) + self.bias)
        prob = 1.0 / (1.0 + np.exp(-logit))
        return float(np.clip(prob, 0.0, 1.0))
