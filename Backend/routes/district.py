# routes/district.py

from fastapi import APIRouter
import sqlite3
import pandas as pd
import os
import matplotlib
matplotlib.use("Agg")
import matplotlib.pyplot as plt
import io
import base64
from forecasting_covid import CovidForecastModel
import joblib
import numpy as np
import sqlite3
router = APIRouter(
     tags=["covid"]
)

@router.get("/district/bangalore/summary")
def get_bangalore_summary():
    db_path = os.path.join(os.path.dirname(__file__), "../db/covid_data.db")
    conn = sqlite3.connect(db_path)
    df = pd.read_sql_query("SELECT * FROM bangalore_cases ORDER BY date", conn)
    conn.close()

    df["date"] = pd.to_datetime(df["date"])
    df = df.sort_values("date")

    #Get latest row
    latest_row = df.iloc[-1]
    latest_date = latest_row["date"].strftime("%Y-%m-%d")
    hospitalized = int(latest_row["hospitalized"])

    return {
        "date": latest_date,
        "hospitalized": hospitalized
    }
    #  Get earliest (first) row instead of latest
    #first_row = df.iloc[0]
    #first_date = first_row["date"].strftime("%Y-%m-%d")
    #hospitalized = int(first_row["hospitalized"])

    #return {
    #    "date": first_date,
     #   "hospitalized": hospitalized
    #}
    #  Get other row 
    #first_row = df.iloc[62]
    #first_date = first_row["date"].strftime("%Y-%m-%d")
    #hospitalized = int(first_row["hospitalized"])

    #return {
     #   "date": first_date,
     #   "hospitalized": hospitalized
    #}


def fig_to_base64(fig):
    buf = io.BytesIO()
    fig.savefig(buf, format="png", bbox_inches="tight")
    buf.seek(0)
    return base64.b64encode(buf.read()).decode("utf-8")

@router.get("/district/bangalore/plots")
def all_bangalore_plots():
    # Load CSV (cleaned version)
    df = pd.read_csv("data/df_bangalore_urban.csv", parse_dates=["Date.Announced"])
    df = df.sort_values("Date.Announced")

    images = {}

    # 1. Line plot: Hospitalized, Recovered, Deceased
    fig1, ax1 = plt.subplots(figsize=(12, 6))
    ax1.plot(df['Date.Announced'], df['Hospitalized'], label='Hospitalized')
    ax1.plot(df['Date.Announced'], df['Recovered'], label='Recovered')
    ax1.plot(df['Date.Announced'], df['Deceased'], label='Deceased')
    ax1.set_title("COVID Case Trends in Bangalore")
    ax1.set_xlabel("Date")
    ax1.set_ylabel("Count")
    ax1.legend()
    ax1.grid(True)
    fig1.tight_layout()
    images["trend_line"] = fig_to_base64(fig1)

    # 2. Bar plot: Daily Hospitalized
    fig2, ax2 = plt.subplots(figsize=(12, 6))
    ax2.bar(df['Date.Announced'], df['Hospitalized'], color='skyblue')
    ax2.set_title("Daily Hospitalized Cases")
    ax2.set_xlabel("Date")
    ax2.set_ylabel("Hospitalized")
    ax2.grid(True)
    fig2.tight_layout()
    images["hospitalized_bar"] = fig_to_base64(fig2)

    # 3. Stacked Area Plot
    fig3, ax3 = plt.subplots(figsize=(12, 6))
    ax3.stackplot(df['Date.Announced'], df['Hospitalized'], df['Recovered'], df['Deceased'],
                  labels=['Hospitalized', 'Recovered', 'Deceased'], colors=['orange', 'green', 'red'])
    ax3.set_title("Stacked Area: COVID Trends")
    ax3.set_xlabel("Date")
    ax3.set_ylabel("Count")
    ax3.legend(loc='upper left')
    ax3.grid(True)
    fig3.tight_layout()
    images["stacked_area"] = fig_to_base64(fig3)

    return images

@router.get("/predict")
def predict():
    if os.path.exists("covid_forecaster.pkl"):
        forecaster = joblib.load("covid_forecaster.pkl")
        result = forecaster.get_forecast()
        return {
            "status": "success",
            "source": "cache",
            "predictions": result["forecasts"]
        }

    else:
        conn = sqlite3.connect("db/covid_data.db")
        df = pd.read_sql("SELECT date, hospitalized FROM bangalore_cases", conn)
        conn.close()

        forecaster = CovidForecastModel()
        forecaster.run_pipeline(df)
        result = forecaster.get_forecast()  
        forecaster.save_predictions_to_db(result["forecasts"])
        joblib.dump(forecaster, "covid_forecaster.pkl")

        #  Save to DB
        forecaster.save_predictions_to_db(result["forecasts"])

        return {
            "status": "success",
            "source": "fresh_model",
            "predictions": result["forecasts"]
        }

@router.get("/forecast_plot")
def predict_plot():
    if os.path.exists("covid_forecaster.pkl"):
        forecaster = joblib.load("covid_forecaster.pkl")
        base64_img = forecaster.get_covid_forecast_plot()  # returns base64-encoded PNG
        return {"status": "success", "image_base64": base64_img}
    else:
        return {"status": "error", "message": "Forecast not available yet."}

