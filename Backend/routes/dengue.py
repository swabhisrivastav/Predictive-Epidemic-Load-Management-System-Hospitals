from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import JSONResponse, FileResponse, StreamingResponse
import pandas as pd
import sqlite3
import matplotlib.pyplot as plt
import io
from datetime import datetime
from typing import Optional

from database import get_db
from forecasting import DengueForecastingSystem

router = APIRouter(
    prefix="/dengue",
    tags=["dengue"],
    responses={404: {"description": "Not found"}}
)

# Initialize forecaster when the router starts
forecaster = None

@router.on_event("startup")
async def startup_event():
    global forecaster
    conn = sqlite3.connect('db/dengue.db')
    df = pd.read_sql("SELECT * FROM dengue_data", conn)
    conn.close()
    
    forecaster = DengueForecastingSystem(df=df)
    forecaster.run_pipeline()

@router.get("/current")
async def get_current_cases(
    weeks: int = 4,
    db: sqlite3.Connection = Depends(get_db)  # This now gets the live connection
):
    """Get latest case counts"""
    try:
        # Safest approach - let pandas handle the connection
        query = """
        SELECT date, reported_cases 
        FROM dengue_data 
        ORDER BY date DESC 
        LIMIT ?
        """
        data = pd.read_sql(query, db, params=(weeks,))
        
        # Convert dates to strings for JSON serialization
        if not data.empty:
            data['date'] = pd.to_datetime(data['date'])
            data['date'] = data['date'].dt.strftime('%Y-%m-%d')
            
        return JSONResponse(data.to_dict(orient="records"))
        
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to fetch current cases: {str(e)}"
        )

@router.get("/predict")
async def predict_cases(
    weeks: int = 4,
    db: sqlite3.Connection = Depends(get_db)
):

    if forecaster is None:
        raise HTTPException(status_code=503, detail="Model not initialized")
    
    forecast = forecaster.forecast(weeks=weeks)
    print("Forecast columns:", forecast.columns.tolist())

    # Save to database
    forecast = forecast.rename(columns={
            'date': 'prediction_date',
        })
    forecast['forecast_date'] = datetime.now().strftime('%Y-%m-%d')

    #  Remove duplicates for today
    today = forecast['forecast_date'].iloc[0]
    db.execute("DELETE FROM forecasts WHERE forecast_date = ?", (today,))

    forecast.to_sql('forecasts', db, if_exists='append', index=False)
    
    #  Convert dates to strings for JSON
    forecast['forecast_date'] = pd.to_datetime(forecast['forecast_date']).dt.strftime('%Y-%m-%d')
    forecast['prediction_date'] = pd.to_datetime(forecast['prediction_date']).dt.strftime('%Y-%m-%d')

    return JSONResponse(forecast.to_dict(orient="records"))

@router.get("/plot_base64")
async def get_forecast_plot_base64(weeks: int = 12):
    if forecaster is None:
        raise HTTPException(status_code=503, detail="Model not initialized")

    image_base64 = forecaster.get_forecast_plot(weeks=weeks)
    return {"image": image_base64}



@router.post("/refresh")
async def refresh_model(db: sqlite3.Connection = Depends(get_db)):
    # Retrain model with latest data
    global forecaster
    df = pd.read_sql("SELECT * FROM dengue_data", db)
    
    forecaster = DengueForecastingSystem(df=df)
    forecaster.run_complete_analysis()
    return {"status": "model retrained"}