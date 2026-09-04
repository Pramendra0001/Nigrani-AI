"""Automated test suite for direct-access Nigrani AI platform endpoints."""

import os
import pytest
from httpx import AsyncClient, ASGITransport

# Set test environment
os.environ["ENVIRONMENT"] = "test"
os.environ["DEMO_MODE"] = "true"

from app.main import app
from app.database import init_db


@pytest.mark.asyncio
async def test_root_and_health_endpoints():
    """Verify root metadata and health check endpoints."""
    await init_db()
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        r_root = await client.get("/")
        assert r_root.status_code == 200
        data_root = r_root.json()
        assert data_root["app"] == "Nigrani AI"
        assert data_root["status"] == "healthy"

        r_health = await client.get("/health")
        assert r_health.status_code == 200
        assert r_health.json()["status"] == "ok"


@pytest.mark.asyncio
async def test_dashboard_endpoint():
    """Verify executive dashboard KPIs and distributions."""
    await init_db()
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        r = await client.get("/api/dashboard")
        assert r.status_code == 200
        data = r.json()
        assert "metrics" in data
        assert "risk_distribution" in data
        assert "category_distribution" in data
        assert "state_distribution" in data


@pytest.mark.asyncio
async def test_projects_listing_and_filtering():
    """Verify projects listing, search, parliament type filtering and pagination."""
    await init_db()
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        # 1. Fetch all projects
        r = await client.get("/api/projects?page_size=10")
        assert r.status_code == 200
        data = r.json()
        assert "projects" in data
        assert "total" in data
        assert len(data["projects"]) <= 10

        # 2. Filter by Lok Sabha
        r_ls = await client.get("/api/projects?parliament_type=Lok%20Sabha&page_size=5")
        assert r_ls.status_code == 200
        items_ls = r_ls.json()["projects"]
        for item in items_ls:
            assert item["parliament_type"] == "Lok Sabha"

        # 3. Filter by Rajya Sabha
        r_rs = await client.get("/api/projects?parliament_type=Rajya%20Sabha&page_size=5")
        assert r_rs.status_code == 200
        items_rs = r_rs.json()["projects"]
        for item in items_rs:
            assert item["parliament_type"] == "Rajya Sabha"


@pytest.mark.asyncio
async def test_project_dossier_detailed_blocks():
    """Verify single project investigation dossier returns complete analytical blocks."""
    await init_db()
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        # Fetch first available project ID
        r_list = await client.get("/api/projects?page_size=1")
        assert r_list.status_code == 200
        projects = r_list.json()["projects"]
        if not projects:
            pytest.skip("No projects seeded in database")
        project_id = projects[0]["project_id"]

        r_detail = await client.get(f"/api/projects/{project_id}")
        assert r_detail.status_code == 200
        detail = r_detail.json()

        # Check required analytical blocks
        assert "project" in detail
        assert "financial_lifecycle" in detail
        assert "consistency_analysis" in detail
        assert "payment_analysis" in detail
        assert "fund_utilization_analysis" in detail
        assert "asset_verification" in detail
        assert "provenance" in detail

        # Verify lifecycle metrics structure
        lifecycle = detail["financial_lifecycle"]
        assert "variances" in lifecycle
        assert "lifecycle_flow" in lifecycle
        assert len(lifecycle["lifecycle_flow"]) == 8

        # Verify consistency engine fields
        consistency = detail["consistency_analysis"]
        assert "consistency_score" in consistency
        assert "variance_percentage" in consistency
        assert "pattern_classification" in consistency
        assert "severity" in consistency

        # Verify payment intelligence disclosure
        payment = detail["payment_analysis"]
        assert "disclosure" in payment
        assert "status" in payment

        # Verify provenance data tier
        provenance = detail["provenance"]
        assert "data_source" in provenance
        assert "tier_classification" in provenance


@pytest.mark.asyncio
async def test_review_queue_and_analysis():
    """Verify review queue listing, project analysis, compliance, and geo summary."""
    await init_db()
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        # Review queue listing
        r_rev = await client.get("/api/review-queue")
        assert r_rev.status_code == 200
        reviews = r_rev.json()
        assert "cases" in reviews or isinstance(reviews, list)

        # Single project analysis trigger
        r_p = await client.get("/api/projects?page_size=1")
        projects = r_p.json()["projects"]
        if projects:
            pid = projects[0]["project_id"]
            r_ana = await client.post(f"/api/projects/{pid}/analyze")
            assert r_ana.status_code == 200
            res = r_ana.json()
            assert "overall_risk_score" in res or "risk_score" in res

        # Compliance summary
        r_comp = await client.get("/api/compliance/summary")
        assert r_comp.status_code == 200
        comp_res = r_comp.json()
        assert "rules" in comp_res
        assert "compliance_rate_percent" in comp_res

        # Geo summary
        r_geo = await client.get("/api/geo/summary")
        assert r_geo.status_code == 200
        geo_res = r_geo.json()
        assert "states" in geo_res
        assert "total_states" in geo_res
