"""Demo dataset generator and database seeder for Nigrani AI."""

import random
from datetime import date, timedelta, datetime
from typing import List, Dict, Any
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func

from app.models.models import Project


class DemoDataGenerator:
    """Generates ~500 realistic Indian public infrastructure projects with benchmark anomalies."""

    STATES_DISTRICTS = {
        "Maharashtra": {
            "districts": ["Pune", "Nagpur", "Nashik", "Aurangabad", "Thane", "Solapur"],
            "coords": (19.7, 75.7),
            "code": "MH",
        },
        "Uttar Pradesh": {
            "districts": ["Lucknow", "Varanasi", "Kanpur", "Agra", "Prayagraj", "Gorakhpur"],
            "coords": (26.8, 80.9),
            "code": "UP",
        },
        "Karnataka": {
            "districts": ["Bengaluru Urban", "Mysuru", "Hubballi-Dharwad", "Belagavi", "Mangaluru", "Ballari"],
            "coords": (15.3, 75.7),
            "code": "KA",
        },
        "Tamil Nadu": {
            "districts": ["Chennai", "Coimbatore", "Madurai", "Tiruchirappalli", "Salem", "Tirunelveli"],
            "coords": (11.1, 78.6),
            "code": "TN",
        },
        "Rajasthan": {
            "districts": ["Jaipur", "Jodhpur", "Udaipur", "Kota", "Ajmer", "Bikaner"],
            "coords": (26.9, 75.8),
            "code": "RJ",
        },
        "Gujarat": {
            "districts": ["Ahmedabad", "Surat", "Vadodara", "Rajkot", "Gandhinagar", "Bhavnagar"],
            "coords": (23.0, 72.5),
            "code": "GJ",
        },
        "Madhya Pradesh": {
            "districts": ["Bhopal", "Indore", "Jabalpur", "Gwalior", "Ujjain", "Sagar"],
            "coords": (23.2, 77.4),
            "code": "MP",
        },
        "Odisha": {
            "districts": ["Khordha", "Cuttack", "Sundargarh", "Ganjam", "Sambalpur", "Balasore"],
            "coords": (20.9, 85.1),
            "code": "OD",
        },
        "Bihar": {
            "districts": ["Patna", "Gaya", "Muzaffarpur", "Bhagalpur", "Darbhanga", "Purnia"],
            "coords": (25.6, 85.1),
            "code": "BR",
        },
        "West Bengal": {
            "districts": ["Kolkata", "Howrah", "North 24 Parganas", "Darjeeling", "Paschim Bardhaman", "Murshidabad"],
            "coords": (22.5, 88.3),
            "code": "WB",
        },
    }

    CATEGORIES = {
        "Road Construction": {"min": 25.0, "max": 450.0, "median": 85.0},
        "Bridge Construction": {"min": 80.0, "max": 1800.0, "median": 350.0},
        "School Building": {"min": 20.0, "max": 220.0, "median": 70.0},
        "Hospital/Health Center": {"min": 40.0, "max": 650.0, "median": 140.0},
        "Water Supply": {"min": 15.0, "max": 380.0, "median": 65.0},
        "Sanitation": {"min": 10.0, "max": 180.0, "median": 45.0},
        "Housing": {"min": 35.0, "max": 500.0, "median": 120.0},
        "Electrification": {"min": 15.0, "max": 280.0, "median": 55.0},
        "Community Center": {"min": 15.0, "max": 160.0, "median": 50.0},
        "Irrigation": {"min": 30.0, "max": 750.0, "median": 160.0},
    }

    WORK_NAMES = {
        "Road Construction": [
            "Widening and resurfacing of MDR connector road in {district}",
            "Upgradation of rural link road under PMGSY between Block A and {district} market",
            "Construction of bituminous bypass corridor around {district} town center",
            "Strengthening of arterial road with paved shoulders in {district}",
        ],
        "Bridge Construction": [
            "Construction of 4-span high-level RCC bridge over seasonal nullah near {district}",
            "Reconstruction of distressed river bridge on major district road, {district}",
            "Construction of pedestrian and light vehicular overpass in {district}",
        ],
        "School Building": [
            "Construction of 8-classroom secondary school building with digital labs in {district}",
            "Infrastructure modernization and STEM lab block at Govt High School, {district}",
            "Comprehensive upgradation of primary education facility in rural {district}",
        ],
        "Hospital/Health Center": [
            "Construction of 30-bed Community Health Centre (CHC) in {district}",
            "Establishment of maternal child healthcare wing at sub-district hospital, {district}",
            "Civil construction and diagnostic block for Primary Health Centre in {district}",
        ],
        "Water Supply": [
            "Laying of rural piped drinking water distribution network under Jal Jeevan Mission in {district}",
            "Construction of 500 KL elevated storage reservoir (ESR) and pump house in {district}",
            "Comprehensive multi-village surface water treatment and supply scheme, {district}",
        ],
        "Sanitation": [
            "Construction of decentralized faecal sludge treatment plant in {district}",
            "Development of solid-liquid resource management and community sanitation hub, {district}",
            "Underground drainage interceptor and treatment trench network in {district}",
        ],
        "Housing": [
            "Construction of 120 G+2 affordable housing units under PMAY in {district}",
            "EWS rehabilitation housing cluster with civic amenities in {district}",
        ],
        "Electrification": [
            "High voltage distribution system (HVDS) separation and feeder metering in {district}",
            "Installation of solar mini-grid network for remote tribal hamlets in {district}",
        ],
        "Community Center": [
            "Construction of multi-purpose Panchayat Bhawan and citizen service center in {district}",
            "Development of community welfare hall and vocational training center in {district}",
        ],
        "Irrigation": [
            "Construction of concrete lined minor canal distributary network in {district}",
            "Renovation of traditional water harvest check dam and sluice gates in {district}",
        ],
    }

    def generate_all(self, seed: int = 101) -> List[Dict[str, Any]]:
        rng = random.Random(seed)
        projects: List[Dict[str, Any]] = []
        counters: Dict[str, int] = {v["code"]: 0 for v in self.STATES_DISTRICTS.values()}

        # 1. Normal standard projects (~375)
        for _ in range(375):
            projects.append(self._make_project(rng, counters, anomaly=None))

        # 2. Cost Anomalies (~30)
        for _ in range(12):
            projects.append(self._make_project(rng, counters, anomaly="cost_spike_huge"))  # 3x-5x
        for _ in range(10):
            projects.append(self._make_project(rng, counters, anomaly="cost_spike_mod"))   # 2x-3x
        for _ in range(8):
            projects.append(self._make_project(rng, counters, anomaly="cost_overrun"))     # actual > 2x budget

        # 3. Duplicate / Overlapping pairs (~20 projects = 10 pairs)
        for _ in range(5):
            p1, p2 = self._make_duplicate_pair(rng, counters, kind="possible_duplicate")
            projects.extend([p1, p2])
        for _ in range(3):
            p1, p2 = self._make_duplicate_pair(rng, counters, kind="possible_overlap")
            projects.extend([p1, p2])
        for _ in range(2):
            p1, p2 = self._make_duplicate_pair(rng, counters, kind="related")
            projects.extend([p1, p2])

        # 4. Schedule Delays (~30)
        for _ in range(18):
            projects.append(self._make_project(rng, counters, anomaly="severe_delay"))
        for _ in range(12):
            projects.append(self._make_project(rng, counters, anomaly="moderate_delay"))

        # 5. Data Quality issues (~25)
        for _ in range(5):
            projects.append(self._make_project(rng, counters, anomaly="dq_invalid_dates"))
        for _ in range(5):
            projects.append(self._make_project(rng, counters, anomaly="dq_invalid_coords"))
        for _ in range(5):
            projects.append(self._make_project(rng, counters, anomaly="dq_impossible_completion"))
        for _ in range(5):
            projects.append(self._make_project(rng, counters, anomaly="dq_missing_desc"))
        for _ in range(5):
            projects.append(self._make_project(rng, counters, anomaly="dq_negative_budget"))

        # 6. Compound / Multi-flag priority projects (~20)
        for _ in range(10):
            projects.append(self._make_project(rng, counters, anomaly="compound_cost_delay"))
        for _ in range(10):
            projects.append(self._make_project(rng, counters, anomaly="compound_cost_dq"))

        return projects

    def _make_project(self, rng: random.Random, counters: Dict[str, int], anomaly: str = None) -> Dict[str, Any]:
        state = rng.choice(list(self.STATES_DISTRICTS.keys()))
        s_info = self.STATES_DISTRICTS[state]
        code = s_info["code"]
        district = rng.choice(s_info["districts"])
        category = rng.choice(list(self.CATEGORIES.keys()))
        cat_info = self.CATEGORIES[category]

        counters[code] += 1
        p_id = f"PRJ-{code}-{counters[code]:03d}"

        # Standard coordinates with jitter
        lat = round(s_info["coords"][0] + rng.uniform(-0.4, 0.4), 4)
        lng = round(s_info["coords"][1] + rng.uniform(-0.4, 0.4), 4)

        # Baseline budget
        budget = round(rng.gauss(cat_info["median"], cat_info["median"] * 0.20), 2)
        budget = max(cat_info["min"], min(cat_info["max"], budget))

        # Baseline dates (between 2022 and 2025)
        days_offset = rng.randint(0, 750)
        start = date(2023, 1, 1) + timedelta(days=days_offset)
        duration = rng.randint(180, 730)
        end = start + timedelta(days=duration)

        # Progress
        today = date.today()
        if today < start:
            comp = 0.0
            status = "NOT_STARTED"
            actual_cost = None
        else:
            elapsed_days = (today - start).days
            expected_p = min(100.0, (elapsed_days / duration) * 100.0) if duration > 0 else 50.0
            comp = round(max(0.0, min(100.0, rng.gauss(expected_p, 8.0))), 1)
            status = "COMPLETED" if comp >= 100.0 else "ONGOING"
            actual_cost = round(budget * (comp / 100.0) * rng.uniform(0.9, 1.1), 2) if comp > 10 else None

        name_tmpl = rng.choice(self.WORK_NAMES[category])
        name = name_tmpl.format(district=district)
        desc = (
            f"Administrative approval for {name.lower()} in {district}, {state}. "
            f"Estimated budget sanctioned is ₹{budget:.2f} Lakh under state development funds. "
            f"The public infrastructure initiative is projected to directly benefit an estimated "
            f"{rng.randint(2500, 45000):,} citizens across neighboring gram panchayats."
        )

        # Inject intentional anomalies
        if anomaly == "cost_spike_huge":
            budget = round(cat_info["median"] * rng.uniform(3.2, 4.8), 2)
            actual_cost = round(budget * rng.uniform(0.95, 1.15), 2)
            desc += " [Special foundation and heavy structural reinforcement item rates approved]."

        elif anomaly == "cost_spike_mod":
            budget = round(cat_info["median"] * rng.uniform(2.1, 2.9), 2)
            actual_cost = round(budget * rng.uniform(0.9, 1.05), 2)

        elif anomaly == "cost_overrun":
            actual_cost = round(budget * rng.uniform(1.8, 2.6), 2)
            comp = round(rng.uniform(70.0, 95.0), 1)
            status = "ONGOING"

        elif anomaly == "severe_delay":
            start = date(2022, 3, 1) + timedelta(days=rng.randint(0, 180))
            end = start + timedelta(days=rng.randint(240, 400))  # should already be ended
            comp = round(rng.uniform(8.0, 24.0), 1)  # only ~15% done
            status = "DELAYED"

        elif anomaly == "moderate_delay":
            start = date(2023, 1, 15) + timedelta(days=rng.randint(0, 180))
            end = start + timedelta(days=rng.randint(300, 500))
            comp = round(rng.uniform(20.0, 40.0), 1)
            status = "DELAYED"

        elif anomaly == "dq_invalid_dates":
            start, end = end, start  # Start after End!

        elif anomaly == "dq_invalid_coords":
            lat = round(rng.uniform(-25.0, 2.0), 4)  # Latitude outside India
            lng = round(rng.uniform(110.0, 140.0), 4)

        elif anomaly == "dq_impossible_completion":
            comp = round(rng.uniform(130.0, 240.0), 1)

        elif anomaly == "dq_missing_desc":
            desc = ""

        elif anomaly == "dq_negative_budget":
            budget = -round(rng.uniform(15.0, 150.0), 2)

        elif anomaly == "compound_cost_delay":
            budget = round(cat_info["median"] * rng.uniform(2.8, 4.0), 2)
            start = date(2022, 5, 1) + timedelta(days=rng.randint(0, 120))
            end = start + timedelta(days=rng.randint(250, 400))
            comp = round(rng.uniform(10.0, 25.0), 1)
            status = "DELAYED"

        elif anomaly == "compound_cost_dq":
            budget = round(cat_info["median"] * rng.uniform(2.4, 3.5), 2)
            lat = -5.5
            lng = 45.2
            desc = ""

        return {
            "project_id": p_id,
            "project_name": name,
            "description": desc,
            "state": state,
            "district": district,
            "category": category,
            "budget": budget,
            "actual_cost": actual_cost,
            "start_date": start.isoformat() if start else None,
            "expected_end_date": end.isoformat() if end else None,
            "completion_percentage": comp,
            "status": status,
            "latitude": lat,
            "longitude": lng,
        }

    def _make_duplicate_pair(self, rng: random.Random, counters: Dict[str, int], kind: str) -> tuple:
        p1 = self._make_project(rng, counters, anomaly=None)
        p2 = dict(p1)

        state = p1["state"]
        code = self.STATES_DISTRICTS[state]["code"]
        counters[code] += 1
        p2["project_id"] = f"PRJ-{code}-{counters[code]:03d}"

        if kind == "possible_duplicate":
            # Nearly identical name, identical district, close coordinates
            p2["project_name"] = p1["project_name"].replace("Construction", "Const.").replace("Upgradation", "Upgr.")
            p2["budget"] = round(p1["budget"] * rng.uniform(0.96, 1.04), 2)
            p2["latitude"] = round(p1["latitude"] + rng.uniform(-0.005, 0.005), 4)
            p2["longitude"] = round(p1["longitude"] + rng.uniform(-0.005, 0.005), 4)
            p2["description"] = (
                f"Civil execution for {p2['project_name']} in {p1['district']}, {p1['state']}. "
                f"Approved grant under district infrastructure scheme of ₹{p2['budget']:.2f} Lakh."
            )
        elif kind == "possible_overlap":
            p2["project_name"] = f"Phase-II extension of {p1['project_name']}"
            p2["budget"] = round(p1["budget"] * rng.uniform(0.7, 1.25), 2)
            p2["latitude"] = round(p1["latitude"] + rng.uniform(-0.02, 0.02), 4)
            p2["longitude"] = round(p1["longitude"] + rng.uniform(-0.02, 0.02), 4)
        else:  # related
            dists = self.STATES_DISTRICTS[state]["districts"]
            other_dist = rng.choice([d for d in dists if d != p1["district"]] or [p1["district"]])
            p2["district"] = other_dist
            p2["project_name"] = p1["project_name"].replace(p1["district"], other_dist)

        return p1, p2


async def seed_demo_database(db: AsyncSession) -> int:
    """Populates database with 500 benchmark projects if currently unseeded."""
    count = (await db.execute(select(func.count()).select_from(Project))).scalar() or 0
    if count > 0:
        return count

    gen = DemoDataGenerator()
    projects = gen.generate_all(seed=101)

    for p in projects:
        start_d = None
        end_d = None
        if p["start_date"]:
            try:
                start_d = datetime.strptime(p["start_date"], "%Y-%m-%d").date()
            except Exception:
                pass
        if p["expected_end_date"]:
            try:
                end_d = datetime.strptime(p["expected_end_date"], "%Y-%m-%d").date()
            except Exception:
                pass

        proj = Project(
            project_id=p["project_id"],
            project_name=p["project_name"],
            description=p["description"],
            state=p["state"],
            district=p["district"],
            category=p["category"],
            budget=p["budget"],
            actual_cost=p["actual_cost"],
            start_date=start_d,
            expected_end_date=end_d,
            completion_percentage=p["completion_percentage"],
            status=p["status"],
            latitude=p["latitude"],
            longitude=p["longitude"],
        )
        db.add(proj)

    await db.flush()
    await db.commit()
    return len(projects)
