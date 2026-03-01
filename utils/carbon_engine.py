# Base Emission Factors (kg CO2 per kg waste)
emission_factors = {
    "Biodegradable": { "landfill": 4.0, "processing": 0.5 },
    "Recyclable": { "landfill": 6.0, "processing": 2.0 },
    "Hazardous": { "landfill": 8.0, "processing": 3.0 }
}

# 1 tree absorbs approx 21 kg CO2/year
TREE_CO2_ABSORPTION_RATE = 21.0

# Granular overrides based on ImageNet labels (Accuracy Enhancement)
granular_factors = {
    "bottle": { "landfill": 6.5, "processing": 1.2 },
    "can": { "landfill": 9.0, "processing": 0.5 },
    "banana": { "landfill": 3.0, "processing": 0.2 },
    "battery": { "landfill": 12.0, "processing": 2.0 },
    "laptop": { "landfill": 25.0, "processing": 5.0 }
}

def calculate_impact(waste_type: str, weight_kg: float, imagenet_label: str = None) -> dict:
    """
    Calculates carbon footprint reduction and equivalent impact.
    Uses generic category factors or granular item-specific overrides.
    """
    if waste_type not in emission_factors:
        raise ValueError(f"Unknown waste type: {waste_type}")

    factors = emission_factors[waste_type]
    
    # Accuracy Boost: Check for specific material-level emission factors
    if imagenet_label:
        label_lower = imagenet_label.lower()
        for key, val in granular_factors.items():
            if key in label_lower:
                factors = val
                print(f"Accuracy Upgrade: Using granular data for '{key}'")
                break
    
    # Calculate CO2 saved
    co2_saved = (factors["landfill"] - factors["processing"]) * weight_kg
    
    # Calculate equivalent trees saved
    trees_equivalent = co2_saved / TREE_CO2_ABSORPTION_RATE

    # Calculate an impact score (Normalized heuristic)
    # Let's say saving 10kg CO2 gives a score of 100 for a typical 1kg waste.
    # This is a hackathon-friendly gamification score.
    # Max possible savings per kg is Hazardous: 5kg CO2
    max_saving_factor = 5.0 
    
    # Calculate how efficient this specific waste category is
    efficiency_ratio = (factors["landfill"] - factors["processing"]) / max_saving_factor
    
    # Base score on efficiency, scaled up to 100, plus a volume bonus for larger weights
    base_score = efficiency_ratio * 80
    volume_bonus = min(weight_kg * 10, 20)
    
    impact_score = min(max(int(base_score + volume_bonus), 10), 100)

    return {
        "co2_saved": round(co2_saved, 2),
        "trees_equivalent": round(trees_equivalent, 2),
        "impact_score": impact_score
    }
