from fastapi import APIRouter
import pandas as pd
import matplotlib
matplotlib.use("Agg")
import matplotlib.pyplot as plt
import seaborn as sns
import io
import base64
import requests
import os
from dotenv import load_dotenv

router = APIRouter(
     tags=["covid"]
)

@router.get("/national/summary")
def get_national_summary():
    url = "https://api.api-ninjas.com/v1/covid19?country=India"
    load_dotenv()
    API_KEY = os.getenv("NATIONAL_API_KEY")
    headers = {"X-Api-Key": API_KEY}  
    response = requests.get(url, headers=headers)

    if response.status_code != 200:
        return {"error": f"Failed to fetch data: {response.status_code}"}

    data = response.json()
    if not data or 'cases' not in data[0]:
        return {"error": "Invalid API data format"}

    # Extract date-wise cases data
    cases = data[0]['cases']
    rows = []
    for date_str, values in cases.items():
        total = values.get("total", 0)
        new = abs(values.get("new", 0))
        rows.append({
            "Date": pd.to_datetime(date_str),
            "Total Cases": total,
            "New Cases": new
        })

    # Convert to DataFrame and sort by Date
    df = pd.DataFrame(rows)
    df = df.sort_values("Date", ascending=False).reset_index(drop=True)
    latest = df.iloc[0]

    return {
        "country": data[0].get("country", "India"),
        "total_cases": int(latest["Total Cases"]),
        "new_cases": int(latest["New Cases"]),
        "active": data[0].get("active_cases", 0),
        "recovered": data[0].get("recovered", 0),
        "deaths": data[0].get("deaths", 0),
        "last_updated": latest["Date"].strftime("%Y-%m-%d")
    }


# fetching api data
def fetch_india_covid_data():
    url = "https://api.api-ninjas.com/v1/covid19?country=India"
    headers = {"X-Api-Key": "kuk994yIHFlDNzO39qCffQ==4tsspAbJbD6OWZB9"}  # api key
    response = requests.get(url, headers=headers)

    if response.status_code == 200:
        cases = response.json()[0]['cases']
        rows = []
        for date_str, values in cases.items():
            rows.append({
                'Date': pd.to_datetime(date_str),
                'Total Cases': values.get('total', 0),
                'New Cases': abs(values.get('new', 0))
            })
        df = pd.DataFrame(rows).sort_values("Date").reset_index(drop=True)
        return df
    else:
        raise Exception(f"Failed to fetch API data: {response.status_code}")

#to convert plot to base64
def fig_to_base64(fig):
    buf = io.BytesIO()
    fig.savefig(buf, format='png', bbox_inches='tight')
    buf.seek(0)
    return base64.b64encode(buf.read()).decode('utf-8')

@router.get("/national/plots")
def get_all_national_plots():
    df = fetch_india_covid_data()
    df_last_30 = df.tail(30)

    plots = {}

    # Plot 1: Bar - New Cases (Last 30 days)
    fig1, ax1 = plt.subplots(figsize=(14, 6))
    ax1.bar(df_last_30["Date"], df_last_30["New Cases"], color='steelblue')
    ax1.set_title("Daily New COVID-19 Cases (Last 30 Days)")
    ax1.set_xlabel("Date")
    ax1.set_ylabel("New Cases")
    ax1.tick_params(axis='x', rotation=45)
    fig1.tight_layout()
    plots["new_cases_bar"] = fig_to_base64(fig1)

    # Plot 2: Total vs New Cases (Dual Y-axis)
    fig2, ax2 = plt.subplots(figsize=(14, 6))
    ax2.plot(df["Date"], df["Total Cases"], color="orange")
    ax2.set_ylabel("Total Cases", color="orange")
    ax2b = ax2.twinx()
    ax2b.plot(df["Date"], df["New Cases"], color="steelblue", alpha=0.6)
    ax2b.set_ylabel("New Cases", color="steelblue")
    fig2.suptitle("COVID-19 Total vs New Cases in India Over Time")
    fig2.tight_layout()
    plots["total_vs_new"] = fig_to_base64(fig2)

    # Plot 3: Line - Total Cases
    fig3, ax3 = plt.subplots(figsize=(14, 6))
    sns.lineplot(data=df, x="Date", y="Total Cases", color="orange", ax=ax3)
    ax3.set_title("Total COVID-19 Cases in India Over Time")
    ax3.set_xlabel("Date")
    ax3.set_ylabel("Total Cases")
    ax3.tick_params(axis='x', rotation=45)
    ax3.grid(True)
    import matplotlib.ticker as ticker
    ax3.yaxis.set_major_formatter(ticker.FuncFormatter(lambda x, _: f'{x*1e-6:.0f}M'))
    fig3.tight_layout()
    plots["total_cases_line"] = fig_to_base64(fig3)

    # Plot 4: Line - New Cases
    fig4, ax4 = plt.subplots(figsize=(14, 6))
    sns.lineplot(data=df, x="Date", y="New Cases", color="steelblue", ax=ax4)
    ax4.set_title("Daily New COVID-19 Cases in India Over Time")
    ax4.set_xlabel("Date")
    ax4.set_ylabel("New Cases")
    ax4.tick_params(axis='x', rotation=45)
    ax4.grid(True)
    fig4.tight_layout()
    plots["new_cases_line"] = fig_to_base64(fig4)

    return plots
