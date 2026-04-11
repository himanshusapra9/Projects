from __future__ import annotations

from datetime import date, datetime
from typing import Optional

from pydantic import BaseModel


class Transaction(BaseModel):
    amount: float
    timestamp: datetime
    product: str = ""


class CustomerInput(BaseModel):
    customer_id: str
    email: Optional[str] = None
    first_seen: date
    transactions: list[Transaction] = []
    feedback: list[str] = []


class RFMSegment(BaseModel):
    customer_id: str
    recency_days: int
    frequency: int
    monetary_total: float
    rfm_score: int
    segment: str


class CohortResult(BaseModel):
    cohort_month: str
    size: int
    retention_rates: dict[str, float]
    avg_transactions: float
    avg_revenue: float
    behavior_distribution: dict[str, float]


class ArrivalForecast(BaseModel):
    date: date
    predicted_count: int
    confidence_interval: list[float]


class CustomerAnalysisRequest(BaseModel):
    customers: list[CustomerInput]


class CustomerAnalysisResponse(BaseModel):
    cohorts: list[CohortResult]
    rfm_segments: list[RFMSegment]
    arrival_forecast: dict
    behavioral_insights: list[dict]
    at_risk_customers: list[RFMSegment]
    summary: dict
