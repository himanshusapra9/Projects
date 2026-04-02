from __future__ import annotations
import numpy as np
from scipy import stats

class DriftDetector:
    def detect_distribution_drift(
        self,
        baseline: np.ndarray,
        current: np.ndarray,
        alpha: float = 0.05,
    ) -> dict:
        """Use Kolmogorov-Smirnov test to detect distribution drift."""
        if len(baseline) < 10 or len(current) < 10:
            return {"drift_detected": False, "reason": "insufficient_data"}
        
        statistic, p_value = stats.ks_2samp(baseline, current)
        
        return {
            "drift_detected": bool(p_value < alpha),
            "ks_statistic": round(float(statistic), 4),
            "p_value": round(float(p_value), 6),
            "alpha": alpha,
            "baseline_mean": round(float(np.mean(baseline)), 4),
            "current_mean": round(float(np.mean(current)), 4),
            "baseline_std": round(float(np.std(baseline)), 4),
            "current_std": round(float(np.std(current)), 4),
        }
