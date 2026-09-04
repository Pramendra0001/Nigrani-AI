'''Physical vs Financial Consistency Analysis Engine.'''

from typing import Dict, Any, List


class ConsistencyEngine:
    '''
    Detects discrepancies between reported physical progress and booked financial utilization.
    Evaluates execution patterns to identify expenditure leading progress, unfinalized completions,
    and progress stagnation.
    '''

    def analyze(self, project: Dict[str, Any]) -> Dict[str, Any]:
        budget = float(project.get('budget') or 0.0)
        actual_cost = float(project.get('actual_cost') or 0.0)
        physical_pct = float(project.get('completion_percentage') or 0.0)

        # Calculate financial utilization percentage
        financial_pct = round((actual_cost / budget * 100), 1) if budget > 0 else 0.0
        variance = round(financial_pct - physical_pct, 1)
        abs_variance = abs(variance)

        # Baseline Consistency Score (100 is perfectly balanced)
        consistency_score = max(5.0, min(100.0, round(100.0 - (abs_variance * 1.3), 1)))

        patterns: List[str] = []
        recommendations: List[str] = []
        severity = 'LOW'

        # Pattern 1: High expenditure + low completion
        if financial_pct >= 50.0 and physical_pct <= 25.0:
            patterns.append('HIGH_EXPENDITURE_LOW_PHYSICAL_PROGRESS')
            severity = 'CRITICAL' if financial_pct >= 80.0 else 'HIGH'
            recommendations.append(
                f'Mandate immediate field site inspection: {financial_pct}% funds drawn against only {physical_pct}% physical execution.'
            )
            recommendations.append('Examine intermediate measurement book (MB) entries and engineer verification certificates.')

        # Pattern 2: 100% expenditure + incomplete work
        elif financial_pct >= 95.0 and physical_pct < 85.0:
            patterns.append('EXPENDITURE_EXHAUSTED_BEFORE_WORK_COMPLETION')
            severity = 'CRITICAL'
            recommendations.append(
                'Full sanctioned allocation disbursed while physical asset remains incomplete; assess contractor liability and milestone default.'
            )

        # Pattern 3: Work reported complete + incomplete financial closure
        elif physical_pct >= 100.0 and financial_pct < 80.0:
            patterns.append('PHYSICAL_COMPLETION_PENDING_FINAL_ACCOUNTS')
            severity = 'MEDIUM'
            recommendations.append(
                'Verify whether final contractor bill is under audit, retention money withheld, or utilization certificate (UC) pending submission.'
            )

        # Pattern 4: Low expenditure + high completion
        elif physical_pct >= 70.0 and financial_pct <= 20.0:
            patterns.append('PHYSICAL_PROGRESS_PRECEDING_DISBURSEMENT')
            severity = 'MEDIUM'
            recommendations.append(
                'Check for unbooked vendor liabilities or delayed treasury release against reported physical milestones.'
            )

        # Pattern 5: Balanced progress
        elif abs_variance <= 15.0:
            patterns.append('BALANCED_PHYSICAL_FINANCIAL_EXECUTION')
            severity = 'LOW'
            recommendations.append('Continue standard quarterly progress monitoring and routine photographic verification.')

        else:
            patterns.append('MODERATE_EXECUTION_DIVERGENCE')
            severity = 'MEDIUM'
            recommendations.append('Request updated stage-wise physical progress report from the implementing agency.')

        primary_pattern = patterns[0]

        narrative = (
            f'Physical completion stands at {physical_pct}%, while financial absorption has reached '
            f'{financial_pct}% of the sanctioned allocation (₹{actual_cost}L of ₹{budget}L). '
            f'This yields an execution divergence gap of {abs_variance} percentage points. '
        )
        if 'HIGH_EXPENDITURE_LOW_PHYSICAL_PROGRESS' in patterns:
            narrative += 'Expenditure has significantly outpaced on-ground asset delivery, signaling potential execution risk or milestone misreporting.'
        elif 'EXPENDITURE_EXHAUSTED_BEFORE_WORK_COMPLETION' in patterns:
            narrative += 'Critical risk: Financial resources have been virtually exhausted before the infrastructure asset is fully delivered.'
        elif 'BALANCED_PHYSICAL_FINANCIAL_EXECUTION' in patterns:
            narrative += 'Financial disbursements and physical progress demonstrate healthy linear alignment under GFR norms.'

        return {
            'physical_progress_percentage': physical_pct,
            'financial_utilization_percentage': financial_pct,
            'variance_percentage': variance,
            'absolute_variance': abs_variance,
            'consistency_score': consistency_score,
            'pattern_classification': primary_pattern,
            'patterns': patterns,
            'severity': severity,
            'narrative': narrative,
            'recommendations': recommendations,
            'status': 'VERIFIED_BALANCED' if severity == 'LOW' else 'INSPECTION_RECOMMENDED' if severity == 'MEDIUM' else 'HIGH_VARIANCE_FLAGGED',
        }
