
def estimate_demand(predicted_cases: int, usage: dict):
    return {
        "icu_beds": predicted_cases * usage["icu_rate"],
        "ventilators": predicted_cases * usage["ventilator_rate"],
        "doctors": predicted_cases * usage["doctor_rate"],
        "nurses": predicted_cases * usage["nurse_rate"],
        "oxygen_cylinders": predicted_cases * usage["oxygen_rate"],

    }

def check_overload(demand: dict, available: dict) -> list:
    overloaded = []
    for key in demand:
        if demand[key] > available.get(key, 0):
            overloaded.append(key)
    return overloaded


def predict_overload(forecast_weeks, available_resources):
    RESOURCE_USAGE = {
        "icu_rate": 0.15,
        "ventilator_rate": 0.08,
        "doctor_rate": 0.05,
        "nurse_rate": 0.10,
        "oxygen_rate": 0.07

        # gets low risk 
        # "icu_rate": 0.1,
        # "ventilator_rate": 0.05,
        # "doctor_rate": 0.02,
        # "nurse_rate": 0.04,
        # "oxygen_rate": 0.05 
       }

    # Use next week's forecast
    next_week = forecast_weeks[0]
    demand = estimate_demand(next_week["predicted"], RESOURCE_USAGE)
    overloaded = check_overload(demand, available_resources)

    if overloaded:
        return {
            "risk": "High" if len(overloaded) > 2 else "Moderate",
            "critical_resources": overloaded,
            "days_to_overload": 7  # always 1 week
        }

    return {
        "risk": "Low",
        "critical_resources": [],
        "days_to_overload": None
    }
