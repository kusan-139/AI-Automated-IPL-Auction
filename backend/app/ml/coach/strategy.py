from typing import Dict, Any, List

def apply_strategy_modifier(base_valuation: float, strategy: str) -> float:
    """
    Apply franchise strategy modifier to valuations.
    """
    if strategy == "aggressive":
        return base_valuation * 1.15
    elif strategy == "conservative":
        return base_valuation * 0.90
    return base_valuation # balanced

def get_strategy_template(strategy_name: str) -> Dict[str, Any]:
    """
    Return predefined strategy templates.
    """
    templates = {
        "aggressive": {"risk_tolerance": 0.8, "star_focus": True},
        "conservative": {"risk_tolerance": 0.3, "star_focus": False},
        "balanced": {"risk_tolerance": 0.5, "star_focus": False}
    }
    return templates.get(strategy_name, templates["balanced"])
