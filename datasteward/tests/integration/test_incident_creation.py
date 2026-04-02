"""Integration test: anomaly injection → incident creation."""
import numpy as np
import pandas as pd
import pytest
from backend.ml.anomaly_detector import AnomalyDetector
from backend.ml.root_cause_analyzer import analyze_root_cause_mock
from backend.models.incident import Incident


def test_row_count_drop_creates_incident():
    detector = AnomalyDetector()
    np.random.seed(42)
    dates = pd.date_range("2024-01-01", periods=90, freq="D")
    values = 10000 + np.random.normal(0, 200, 90)
    detector.fit_baseline("orders", pd.DataFrame({"ds": dates, "y": values}))

    anomaly = detector.detect_row_count_anomaly("orders", 3000)
    assert anomaly["anomaly"] is True

    incident = Incident(
        id="inc_001",
        table_name="orders",
        anomaly_type=anomaly["anomaly_type"],
        severity="P1",
        description=f"Row count dropped to {anomaly['actual']} (expected ~{anomaly['expected']})",
        expected_value=float(anomaly["expected"]),
        actual_value=float(anomaly["actual"]),
        pct_deviation=anomaly["pct_deviation"],
    )

    assert incident.severity == "P1"
    assert incident.anomaly_type == "row_count_drop"
    assert incident.status == "open"

    causes = analyze_root_cause_mock(anomaly)
    assert len(causes) > 0
    assert causes[0]["auto_healable"] is True
    assert causes[0]["auto_heal_action"] == "trigger_dag_rerun"


def test_spike_creates_incident():
    detector = AnomalyDetector()
    np.random.seed(42)
    dates = pd.date_range("2024-01-01", periods=90, freq="D")
    values = 10000 + np.random.normal(0, 200, 90)
    detector.fit_baseline("events", pd.DataFrame({"ds": dates, "y": values}))

    anomaly = detector.detect_row_count_anomaly("events", 25000)
    assert anomaly["anomaly"] is True

    incident = Incident(
        id="inc_002",
        table_name="events",
        anomaly_type=anomaly["anomaly_type"],
        severity="P2",
        description=f"Row count spiked to {anomaly['actual']}",
        expected_value=float(anomaly["expected"]),
        actual_value=float(anomaly["actual"]),
    )
    assert incident.anomaly_type == "row_count_spike"

    causes = analyze_root_cause_mock(anomaly)
    assert causes[0]["auto_heal_action"] == "quarantine_records"
