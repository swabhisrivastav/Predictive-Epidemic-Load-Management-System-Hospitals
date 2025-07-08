# routes/district.py

from fastapi import APIRouter
import sqlite3
import pandas as pd
import os
import matplotlib.pyplot as plt
import io
import base64


router = APIRouter()

@router.get("/district/bangalore")
def get_bangalore_data():
    # Define the database path (adjust if needed)
    db_path = os.path.join(os.path.dirname(__file__), "../db/covid_data.db")
    
    # Connect to SQLite and load data
    conn = sqlite3.connect(db_path)
    df = pd.read_sql_query("SELECT * FROM bangalore_cases ORDER BY date", conn)
    conn.close()
    
    # Convert datetime to string format for JSON serialization
    df["date"] = pd.to_datetime(df["date"]).dt.strftime("%Y-%m-%d")

    # Return as JSON list
    return df.to_dict(orient="records")

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






