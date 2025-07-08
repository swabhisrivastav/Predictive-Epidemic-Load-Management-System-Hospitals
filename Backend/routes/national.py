from fastapi import APIRouter
import pandas as pd
import matplotlib.pyplot as plt
import seaborn as sns
import io
import base64
import requests

router = APIRouter()

@router.get("/national/summary")
def get_national_summary():
    url = "https://api.api-ninjas.com/v1/covid19?country=India"
    headers = {"X-Api-Key": "kuk994yIHFlDNzO39qCffQ==4tsspAbJbD6OWZB9"}  
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

@router.get("/national/plot1")
def plot_new_cases_bar():
    df = fetch_india_covid_data()
    df_last_30 = df.tail(30)
    fig, ax = plt.subplots(figsize=(14, 6))
    ax.bar(df_last_30["Date"], df_last_30["New Cases"], color='steelblue')
    ax.set_title("Daily New COVID-19 Cases (Last 30 Days)")
    ax.set_xlabel("Date")
    ax.set_ylabel("New Cases")
    ax.tick_params(axis='x', rotation=45)
    plt.tight_layout()
    return {"image_base64": fig_to_base64(fig)}

@router.get("/national/plot2")
def plot_total_vs_new():
    df = fetch_india_covid_data()
    fig, ax1 = plt.subplots(figsize=(14, 6))
    ax1.plot(df["Date"], df["Total Cases"], color="orange")
    ax1.set_ylabel("Total Cases", color="orange")
    ax2 = ax1.twinx()
    ax2.plot(df["Date"], df["New Cases"], color="steelblue", alpha=0.6)
    ax2.set_ylabel("New Cases", color="steelblue")
    fig.suptitle("COVID-19 Total vs New Cases in India Over Time")
    fig.tight_layout()
    return {"image_base64": fig_to_base64(fig)}

@router.get("/national/plot3")
def plot_total_line():
    df = fetch_india_covid_data()
    fig, ax = plt.subplots(figsize=(14, 6))
    sns.lineplot(data=df, x="Date", y="Total Cases", color="orange", ax=ax)
    ax.set_title("Total COVID-19 Cases in India Over Time")
    ax.set_xlabel("Date")
    ax.set_ylabel("Total Cases")
    ax.tick_params(axis='x', rotation=45)
    ax.grid(True)
    import matplotlib.ticker as ticker
    ax.yaxis.set_major_formatter(ticker.FuncFormatter(lambda x, _: f'{x*1e-6:.0f}M'))
    fig.tight_layout()
    return {"image_base64": fig_to_base64(fig)}

@router.get("/national/plot4")
def plot_new_cases_line():
    df = fetch_india_covid_data()
    fig, ax = plt.subplots(figsize=(14, 6))
    sns.lineplot(data=df, x="Date", y="New Cases", color="steelblue", ax=ax)
    ax.set_title("Daily New COVID-19 Cases in India Over Time")
    ax.set_xlabel("Date")
    ax.set_ylabel("New Cases")
    ax.tick_params(axis='x', rotation=45)
    ax.grid(True)
    fig.tight_layout()
    return {"image_base64": fig_to_base64(fig)}

