from __future__ import annotations

from collections import defaultdict
from datetime import date, datetime, timedelta

import numpy as np


class CustomerPredictor:
    """Predicts customer arrivals, computes RFM scores, and builds cohorts."""

    def predict_arrivals(self, historical_data: list[dict]) -> dict:
        """
        Time-series forecasting for customer arrivals (next 7 days).

        Input: list of {"date": "YYYY-MM-DD", "count": int}
        """
        if not historical_data:
            today = date.today()
            return {
                "forecast": [
                    {
                        "date": (today + timedelta(days=i)).isoformat(),
                        "predicted_count": 0,
                        "confidence_interval": [0, 0],
                    }
                    for i in range(1, 8)
                ],
                "trend": "stable",
                "peak_day": today.isoformat(),
            }

        counts_by_date: dict[date, int] = {}
        for entry in historical_data:
            d = entry.get("date")
            if isinstance(d, str):
                d = date.fromisoformat(d)
            counts_by_date[d] = entry.get("count", 0)

        sorted_dates = sorted(counts_by_date.keys())
        counts = np.array([counts_by_date[d] for d in sorted_dates], dtype=float)

        window = min(7, len(counts))
        rolling_avg = float(np.mean(counts[-window:]))

        dow_totals = defaultdict(list)
        for d, c in counts_by_date.items():
            dow_totals[d.weekday()].append(c)
        dow_avgs = {}
        for dow, vals in dow_totals.items():
            dow_avgs[dow] = float(np.mean(vals))
        global_avg = float(np.mean(counts)) if len(counts) > 0 else 1.0

        dow_multipliers = {}
        for dow in range(7):
            if dow in dow_avgs and global_avg > 0:
                dow_multipliers[dow] = dow_avgs[dow] / global_avg
            else:
                dow_multipliers[dow] = 1.0

        if len(counts) >= 14:
            first_half = float(np.mean(counts[: len(counts) // 2]))
            second_half = float(np.mean(counts[len(counts) // 2 :]))
            if second_half > first_half * 1.1:
                trend = "growing"
            elif second_half < first_half * 0.9:
                trend = "declining"
            else:
                trend = "stable"
        else:
            trend = "stable"

        last_date = sorted_dates[-1]
        std = float(np.std(counts[-window:])) if window > 1 else rolling_avg * 0.2

        forecast = []
        peak_count = -1
        peak_day = (last_date + timedelta(days=1)).isoformat()

        for i in range(1, 8):
            future_date = last_date + timedelta(days=i)
            multiplier = dow_multipliers.get(future_date.weekday(), 1.0)
            predicted = max(0, int(round(rolling_avg * multiplier)))
            low = max(0, int(round(predicted - 1.96 * std)))
            high = int(round(predicted + 1.96 * std))

            forecast.append(
                {
                    "date": future_date.isoformat(),
                    "predicted_count": predicted,
                    "confidence_interval": [low, high],
                }
            )

            if predicted > peak_count:
                peak_count = predicted
                peak_day = future_date.isoformat()

        return {"forecast": forecast, "trend": trend, "peak_day": peak_day}

    def compute_rfm(self, transactions: list[dict]) -> list[dict]:
        """
        RFM (Recency, Frequency, Monetary) scoring.
        Input: list of {customer_id, amount, timestamp}
        """
        if not transactions:
            return []

        now = datetime.utcnow()
        customer_data: dict[str, dict] = {}

        for txn in transactions:
            cid = txn.get("customer_id", "unknown")
            amount = float(txn.get("amount", 0))
            ts = txn.get("timestamp")
            if isinstance(ts, str):
                ts = datetime.fromisoformat(ts.replace("Z", "+00:00").replace("+00:00", ""))
            elif not isinstance(ts, datetime):
                ts = now

            if cid not in customer_data:
                customer_data[cid] = {"last_txn": ts, "count": 0, "total": 0.0}

            customer_data[cid]["count"] += 1
            customer_data[cid]["total"] += amount
            if ts > customer_data[cid]["last_txn"]:
                customer_data[cid]["last_txn"] = ts

        results = []
        recencies = []
        frequencies = []
        monetaries = []

        for cid, data in customer_data.items():
            r = (now - data["last_txn"]).days
            recencies.append(r)
            frequencies.append(data["count"])
            monetaries.append(data["total"])

        if not recencies:
            return []

        r_arr = np.array(recencies, dtype=float)
        f_arr = np.array(frequencies, dtype=float)
        m_arr = np.array(monetaries, dtype=float)

        def score_quintile(values: np.ndarray, reverse: bool = False) -> np.ndarray:
            if len(values) < 5:
                ranks = np.argsort(np.argsort(values)).astype(float)
                scores = np.clip(np.ceil((ranks + 1) / max(len(values), 1) * 5), 1, 5)
            else:
                percentiles = [np.percentile(values, p) for p in [20, 40, 60, 80]]
                scores = np.ones(len(values))
                for i, v in enumerate(values):
                    if v <= percentiles[0]:
                        scores[i] = 1
                    elif v <= percentiles[1]:
                        scores[i] = 2
                    elif v <= percentiles[2]:
                        scores[i] = 3
                    elif v <= percentiles[3]:
                        scores[i] = 4
                    else:
                        scores[i] = 5
            if reverse:
                scores = 6 - scores
            return scores.astype(int)

        r_scores = score_quintile(r_arr, reverse=True)
        f_scores = score_quintile(f_arr, reverse=False)
        m_scores = score_quintile(m_arr, reverse=False)

        for idx, (cid, data) in enumerate(customer_data.items()):
            composite = int(round((int(r_scores[idx]) + int(f_scores[idx]) + int(m_scores[idx])) / 3))
            composite = max(1, min(5, composite))

            if composite >= 5:
                segment = "champions"
            elif composite >= 4:
                segment = "loyal"
            elif composite >= 3:
                segment = "at_risk"
            elif composite >= 2:
                segment = "lost"
            else:
                segment = "new"

            if data["count"] <= 1 and (now - data["last_txn"]).days < 30:
                segment = "new"

            results.append(
                {
                    "customer_id": cid,
                    "recency_days": int(recencies[idx]),
                    "frequency": int(frequencies[idx]),
                    "monetary_total": round(float(monetaries[idx]), 2),
                    "rfm_score": composite,
                    "segment": segment,
                }
            )

        return results

    def build_cohorts(self, customers: list[dict]) -> list[dict]:
        """
        Cohort analysis by first-seen month.
        Input: list of {customer_id, first_seen: date/str, transactions: [...]}
        """
        if not customers:
            return []

        cohort_groups: dict[str, list[dict]] = defaultdict(list)

        for cust in customers:
            fs = cust.get("first_seen")
            if isinstance(fs, str):
                fs = date.fromisoformat(fs)
            elif isinstance(fs, datetime):
                fs = fs.date()

            cohort_key = fs.strftime("%Y-%m") if fs else "unknown"
            cohort_groups[cohort_key].append(cust)

        results = []
        now = date.today()

        for cohort_month, members in sorted(cohort_groups.items()):
            size = len(members)
            total_txns = 0
            total_revenue = 0.0
            active_by_month: dict[int, set] = defaultdict(set)

            for cust in members:
                cid = cust.get("customer_id", "")
                txns = cust.get("transactions", [])
                total_txns += len(txns)

                for txn in txns:
                    amount = float(txn.get("amount", 0))
                    total_revenue += amount

                    ts = txn.get("timestamp")
                    if isinstance(ts, str):
                        try:
                            ts = datetime.fromisoformat(ts.replace("Z", ""))
                        except ValueError:
                            continue
                    elif not isinstance(ts, datetime):
                        continue

                    try:
                        cohort_start = date.fromisoformat(f"{cohort_month}-01")
                    except ValueError:
                        continue
                    months_since = (ts.year - cohort_start.year) * 12 + (ts.month - cohort_start.month)
                    if months_since > 0:
                        active_by_month[months_since].add(cid)

            retention_rates = {}
            for month_num in [1, 2, 3]:
                active = len(active_by_month.get(month_num, set()))
                retention_rates[str(month_num)] = round(active / max(size, 1) * 100, 1)

            rfm_data = self.compute_rfm(
                [
                    {"customer_id": c["customer_id"], "amount": t.get("amount", 0), "timestamp": t.get("timestamp")}
                    for c in members
                    for t in c.get("transactions", [])
                ]
            )
            segment_counts: dict[str, int] = defaultdict(int)
            for r in rfm_data:
                segment_counts[r["segment"]] += 1
            total_rfm = max(sum(segment_counts.values()), 1)
            behavior_dist = {seg: round(cnt / total_rfm * 100, 1) for seg, cnt in segment_counts.items()}

            results.append(
                {
                    "cohort_month": cohort_month,
                    "size": size,
                    "retention_rates": retention_rates,
                    "avg_transactions": round(total_txns / max(size, 1), 1),
                    "avg_revenue": round(total_revenue / max(size, 1), 2),
                    "behavior_distribution": behavior_dist,
                }
            )

        return results
