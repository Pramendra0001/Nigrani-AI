"""Automated Tests for the 5 Nigrani AI Computational Intelligence Engines."""

import pytest
from app.engines import CostEngine, DelayEngine, DataQualityEngine, DuplicateEngine, RiskEngine


def test_risk_engine():
    """Verify deterministic risk scoring formula and classifications."""
    engine = RiskEngine()

    # Formula: 0.35*cost + 0.30*dup + 0.25*delay + 0.10*dq
    res = engine.calculate(cost_risk=100.0, duplicate_risk=100.0, delay_risk=100.0, dq_risk=100.0)
    assert res["overall_risk_score"] == 100.0
    assert res["risk_level"] == "CRITICAL"

    res_zero = engine.calculate(cost_risk=0.0, duplicate_risk=0.0, delay_risk=0.0, dq_risk=0.0)
    assert res_zero["overall_risk_score"] == 0.0
    assert res_zero["risk_level"] == "LOW"

    # Intermediate score: 0.35*80 + 0.30*50 + 0.25*40 + 0.10*20 = 28 + 15 + 10 + 2 = 55.0 (MEDIUM)
    res_med = engine.calculate(cost_risk=80.0, duplicate_risk=50.0, delay_risk=40.0, dq_risk=20.0)
    assert round(res_med["overall_risk_score"], 1) == 55.0
    assert res_med["risk_level"] == "MEDIUM"


def test_delay_engine():
    """Verify schedule delay calculations and classification."""
    engine = DelayEngine()

    # Completed project
    proj_comp = {
        "start_date": "2025-01-01",
        "expected_end_date": "2026-01-01",
        "completion_percentage": 100.0,
    }
    res_comp = engine.analyze(proj_comp)
    assert res_comp["delay_classification"] == "COMPLETED"
    assert res_comp["risk_score"] == 0.0

    # Stalled/delayed project
    proj_delay = {
        "start_date": "2024-01-01",
        "expected_end_date": "2025-01-01",
        "completion_percentage": 15.0,
    }
    res_delay = engine.analyze(proj_delay)
    assert res_delay["delay_classification"] in ("SIGNIFICANT_DELAY", "AT_RISK")
    assert res_delay["risk_score"] > 50.0


def test_data_quality_engine():
    """Verify 16-point schema integrity audit."""
    engine = DataQualityEngine()

    # Valid project
    valid_proj = {
        "project_id": "PRJ-TEST-001",
        "project_name": "Standard Road Construction",
        "description": "Valid descriptive text",
        "state": "Maharashtra",
        "district": "Pune",
        "category": "Road Construction",
        "budget": 150.0,
        "actual_cost": 120.0,
        "start_date": "2025-01-01",
        "expected_end_date": "2026-06-01",
        "completion_percentage": 50.0,
        "latitude": 18.5204,
        "longitude": 73.8567,
    }
    res_valid = engine.analyze(valid_proj)
    assert res_valid["total_issues"] == 0
    assert res_valid["completeness_score"] == 100.0

    # Invalid project (inverted dates, negative budget, impossible completion)
    invalid_proj = dict(valid_proj)
    invalid_proj["start_date"] = "2026-06-01"
    invalid_proj["expected_end_date"] = "2025-01-01"
    invalid_proj["budget"] = -50.0
    invalid_proj["completion_percentage"] = 150.0

    res_inv = engine.analyze(invalid_proj)
    assert res_inv["total_issues"] >= 3
    assert res_inv["risk_score"] > 50.0


def test_duplicate_engine():
    """Verify multi-factor similarity analysis and Haversine distance."""
    engine = DuplicateEngine()

    # Identical project pair
    p1 = {
        "id": "p1",
        "project_id": "PRJ-001",
        "project_name": "Laying of rural piped drinking water distribution network under Jal Jeevan Mission in Pune",
        "description": "Laying of rural drinking water network across villages in Pune",
        "category": "Water Supply",
        "state": "Maharashtra",
        "district": "Pune",
        "budget": 100.0,
        "start_date": "2025-01-01",
        "expected_end_date": "2026-01-01",
        "latitude": 18.5204,
        "longitude": 73.8567,
    }
    p2 = dict(p1)
    p2["id"] = "p2"
    p2["project_id"] = "PRJ-002"
    p2["budget"] = 102.0

    candidates = engine.find_candidates(p1, [p1, p2], top_k=1)
    assert len(candidates) == 1
    assert candidates[0]["combined_score"] > 0.85
    assert candidates[0]["classification"] == "POSSIBLE_DUPLICATE"
