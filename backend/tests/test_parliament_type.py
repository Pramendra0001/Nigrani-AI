import os
import pytest
from httpx import AsyncClient, ASGITransport

os.environ["ENVIRONMENT"] = "test"
from app.main import app

@pytest.mark.asyncio
async def test_parliament_filters_endpoint():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
        response = await client.get("/api/projects/filters")
        assert response.status_code == 200
        data = response.json()
        assert "parliament_types" in data
        assert "Lok Sabha" in data["parliament_types"]
        assert "Rajya Sabha" in data["parliament_types"]

@pytest.mark.asyncio
async def test_projects_parliament_type_filtering():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
        # Lok Sabha
        res_ls = await client.get("/api/projects?parliament_type=Lok%20Sabha&page_size=10")
        assert res_ls.status_code == 200
        ls_data = res_ls.json()
        assert ls_data["total"] == 543
        for p in ls_data["projects"]:
            assert p["parliament_type"] == "Lok Sabha"
            assert "Lok Sabha" in p["category"]

        # Rajya Sabha
        res_rs = await client.get("/api/projects?parliament_type=Rajya%20Sabha&page_size=10")
        assert res_rs.status_code == 200
        rs_data = res_rs.json()
        assert rs_data["total"] == 231
        for p in rs_data["projects"]:
            assert p["parliament_type"] == "Rajya Sabha"
            assert "Rajya Sabha" in p["category"]

        # All combined
        res_all = await client.get("/api/projects?page_size=1")
        assert res_all.status_code == 200
        assert res_all.json()["total"] == 774

@pytest.mark.asyncio
async def test_dashboard_parliament_filtering():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
        # Overall All
        res_all = await client.get("/api/dashboard")
        assert res_all.status_code == 200
        all_metrics = res_all.json()
        assert all_metrics["metrics"]["total_projects"] == 774

        # Lok Sabha Only
        res_ls = await client.get("/api/dashboard?parliament_type=Lok%20Sabha")
        assert res_ls.status_code == 200
        ls_metrics = res_ls.json()
        assert ls_metrics["metrics"]["total_projects"] == 543

        # Rajya Sabha Only
        res_rs = await client.get("/api/dashboard?parliament_type=Rajya%20Sabha")
        assert res_rs.status_code == 200
        rs_metrics = res_rs.json()
        assert rs_metrics["metrics"]["total_projects"] == 231

        # Sum of counts matches total
        assert ls_metrics["metrics"]["total_projects"] + rs_metrics["metrics"]["total_projects"] == all_metrics["metrics"]["total_projects"]

        # Verify high priority projects in dashboard have parliament_type
        for p in ls_metrics["high_priority_projects"]:
            assert p["parliament_type"] == "Lok Sabha"
        for p in rs_metrics["high_priority_projects"]:
            assert p["parliament_type"] == "Rajya Sabha"
