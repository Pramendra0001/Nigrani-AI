"""Duplicate intelligence and semantic overlap engine."""

import math
import re
from datetime import date, datetime
from typing import Dict, Any, List, Optional, Set


class DuplicateEngine:
    """Identifies duplicate, overlapping, and related projects across administrative divisions."""

    def find_candidates(
        self, project: Dict[str, Any], all_projects: List[Dict[str, Any]], top_k: int = 5
    ) -> List[Dict[str, Any]]:
        """Finds top potential duplicate or overlapping project candidates."""
        proj_id = project.get("project_id") or project.get("id")
        proj_name = str(project.get("project_name") or "")
        proj_desc = str(project.get("description") or "")
        proj_tokens = self._tokenize(f"{proj_name} {proj_desc}")

        candidates = []

        for other in all_projects:
            other_id = other.get("project_id") or other.get("id")
            if other_id == proj_id:
                continue

            other_name = str(other.get("project_name") or "")
            other_desc = str(other.get("description") or "")
            other_tokens = self._tokenize(f"{other_name} {other_desc}")

            # 1. Description / Text Similarity (Jaccard on unigram + bigram shingles)
            desc_sim = self._jaccard_similarity(proj_tokens, other_tokens)

            # Quick pre-filter: Skip projects that share almost no tokens and have different category/state
            cat_match = 1.0 if project.get("category") and project.get("category") == other.get("category") else 0.0
            same_state = project.get("state") == other.get("state")
            same_dist = project.get("district") == other.get("district")

            if desc_sim < 0.15 and not (cat_match and (same_dist or same_state)):
                continue

            # 2. Geographic Proximity via Haversine
            geo_dist = self._haversine(
                project.get("latitude"), project.get("longitude"),
                other.get("latitude"), other.get("longitude"),
            )
            geo_sim = self._distance_to_similarity(geo_dist, same_dist, same_state)

            # 3. Timeline Overlap
            timeline_sim = self._timeline_overlap(project, other)

            # 4. Budget Ratio Similarity
            budget_sim = self._budget_similarity(project.get("budget"), other.get("budget"))

            # Multi-dimensional weighted score:
            # 40% text, 20% geo, 15% category, 15% timeline, 10% budget
            combined = (
                desc_sim * 0.40 +
                geo_sim * 0.20 +
                cat_match * 0.15 +
                timeline_sim * 0.15 +
                budget_sim * 0.10
            )

            # Classification
            if combined >= 0.78:
                classification = "POSSIBLE_DUPLICATE"
            elif combined >= 0.60:
                classification = "POSSIBLE_OVERLAP"
            elif combined >= 0.42:
                classification = "RELATED_PROJECT"
            else:
                classification = "DIFFERENT_PROJECT"

            candidates.append({
                "target_project_id": other.get("id"),
                "target_project_id_str": other.get("project_id"),
                "target_project_name": other.get("project_name"),
                "target_category": other.get("category"),
                "target_district": other.get("district"),
                "target_state": other.get("state"),
                "target_budget": other.get("budget"),
                "description_similarity": round(desc_sim, 3),
                "category_similarity": round(cat_match, 2),
                "geographic_distance_km": round(geo_dist, 1) if geo_dist is not None else None,
                "timeline_overlap": round(timeline_sim, 3),
                "budget_similarity": round(budget_sim, 3),
                "combined_score": round(combined, 3),
                "classification": classification,
                "evidence": {
                    "text_overlap_pct": round(desc_sim * 100, 1),
                    "geo_distance_km": round(geo_dist, 1) if geo_dist is not None else "Unknown",
                    "category_match": bool(cat_match),
                    "timeline_overlap_pct": round(timeline_sim * 100, 1),
                    "budget_similarity_pct": round(budget_sim * 100, 1),
                },
            })

        # Sort highest combined score first
        candidates.sort(key=lambda x: x["combined_score"], reverse=True)
        return candidates[:top_k]

    def calculate_risk_score(self, candidates: List[Dict[str, Any]]) -> float:
        """Derives a duplicate risk score (0-100) from top candidate."""
        if not candidates:
            return 0.0
        top = candidates[0]
        score = top["combined_score"]
        if top["classification"] == "POSSIBLE_DUPLICATE":
            return round(min(100.0, 75.0 + (score - 0.78) * 110.0), 1)
        elif top["classification"] == "POSSIBLE_OVERLAP":
            return round(min(74.0, 45.0 + (score - 0.60) * 160.0), 1)
        elif top["classification"] == "RELATED_PROJECT":
            return round(min(44.0, 15.0 + (score - 0.42) * 160.0), 1)
        return round(score * 20.0, 1)

    def _tokenize(self, text: str) -> Set[str]:
        words = re.findall(r"\b[a-zA-Z0-9]{3,}\b", text.lower())
        stopwords = {
            "the", "and", "for", "with", "this", "under", "scheme", "project", "construction",
            "work", "district", "state", "from", "near", "area", "road", "building", "lakhs", "rs"
        }
        filtered = [w for w in words if w not in stopwords]
        # Unigrams + Bigrams
        tokens = set(filtered)
        for i in range(len(filtered) - 1):
            tokens.add(f"{filtered[i]}_{filtered[i+1]}")
        return tokens

    def _jaccard_similarity(self, a: Set[str], b: Set[str]) -> float:
        if not a or not b:
            return 0.0
        inter = len(a & b)
        union = len(a | b)
        return float(inter) / float(union) if union > 0 else 0.0

    def _haversine(
        self, lat1: Optional[float], lon1: Optional[float],
        lat2: Optional[float], lon2: Optional[float]
    ) -> Optional[float]:
        if any(v is None for v in (lat1, lon1, lat2, lon2)):
            return None
        try:
            r = 6371.0
            dlat = math.radians(float(lat2) - float(lat1))
            dlon = math.radians(float(lon2) - float(lon1))
            a = (math.sin(dlat / 2.0) ** 2 +
                 math.cos(math.radians(float(lat1))) * math.cos(math.radians(float(lat2))) *
                 math.sin(dlon / 2.0) ** 2)
            c = 2.0 * math.atan2(math.sqrt(a), math.sqrt(1.0 - a))
            return r * c
        except Exception:
            return None

    def _distance_to_similarity(self, dist: Optional[float], same_dist: bool, same_state: bool) -> float:
        if dist is not None:
            if dist < 1.0:
                return 1.0
            if dist < 5.0:
                return 0.85
            if dist < 20.0:
                return 0.60
            if dist < 60.0:
                return 0.35
            if dist < 150.0:
                return 0.15
            return 0.0
        # Fallback to administrative hierarchy
        if same_dist:
            return 0.70
        if same_state:
            return 0.30
        return 0.0

    def _timeline_overlap(self, p1: Dict, p2: Dict) -> float:
        s1 = self._parse_date(p1.get("start_date"))
        e1 = self._parse_date(p1.get("expected_end_date"))
        s2 = self._parse_date(p2.get("start_date"))
        e2 = self._parse_date(p2.get("expected_end_date"))

        if not (s1 and e1 and s2 and e2):
            return 0.25

        inter_start = max(s1, s2)
        inter_end = min(e1, e2)
        inter = max(0, (inter_end - inter_start).days)

        union_start = min(s1, s2)
        union_end = max(e1, e2)
        union = max(1, (union_end - union_start).days)

        return float(inter) / float(union)

    def _budget_similarity(self, b1: Optional[float], b2: Optional[float]) -> float:
        if b1 is None or b2 is None or float(b1) <= 0 or float(b2) <= 0:
            return 0.20
        v1, v2 = float(b1), float(b2)
        return max(0.0, 1.0 - abs(v1 - v2) / max(v1, v2))

    def _parse_date(self, val: Any) -> Optional[date]:
        if val is None:
            return None
        if isinstance(val, date):
            return val
        if isinstance(val, datetime):
            return val.date()
        if isinstance(val, str):
            for fmt in ("%Y-%m-%d", "%d-%m-%Y"):
                try:
                    return datetime.strptime(val.strip(), fmt).date()
                except ValueError:
                    pass
        return None
