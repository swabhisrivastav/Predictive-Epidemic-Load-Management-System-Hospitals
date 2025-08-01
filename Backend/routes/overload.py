from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import JSONResponse
import sqlite3
import pandas as pd
from datetime import datetime, timedelta
from typing import Dict

from routes.resources import get_latest_resources_from_db
from database import get_db
from overload_risk import predict_overload

router = APIRouter(
    prefix="/overload",
    tags=["overload"],
    responses={404: {"description": "Not found"}}
)

def get_overload(
    available_resources: Dict = Depends(get_latest_resources_from_db),
    db: sqlite3.Connection = Depends(get_db)
):
    cursor = db.cursor()

    # Get next week's date (assuming forecasts are by week-end)
    # next_week_date = (datetime.today() + timedelta(weeks=1)).date()
    days_until_sunday = (6 - datetime.today().weekday()) % 7  # Sunday is 6
    next_sunday = datetime.today() + timedelta(days=days_until_sunday or 7)  # If today is Sunday, go to next Sunday

    
    # Query the latest forecast record for that week's prediction
    cursor.execute("""
    SELECT prediction_date, cases_predicted 
    FROM forecasts 
    WHERE DATE(prediction_date) = ? 
    ORDER BY forecast_date DESC 
    LIMIT 1
    """, (next_sunday.strftime("%Y-%m-%d"),))


    row = cursor.fetchone()

    if not row:
        raise HTTPException(status_code=404, detail="Forecast for next week not found")

    predicted_cases = row[1]

    # Filter only the relevant resource fields
    filtered_resources = {
        "icu_beds": available_resources.get("available_icu_beds", 0),
        "ventilators": available_resources.get("available_ventilators", 0),
        "oxygen_cylinders": available_resources.get("available_oxygen_cylinders", 0),
        "doctors": available_resources.get("available_doctors", 0),
        "nurses": available_resources.get("available_nurses", 0)
        }

    # Format for overload logic
    forecast_data = [{"week": next_sunday.isoformat(), "predicted": predicted_cases}]

    # Predict overload
    overload_result = predict_overload(forecast_data, filtered_resources)

    return overload_result

@router.get("/overload_risk")
def get_risk(
    result: Dict = Depends(get_overload)
):
    return result
