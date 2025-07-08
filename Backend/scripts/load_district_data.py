import pandas as pd
import sqlite3
import os

# Paths
base_dir = os.path.dirname(__file__)
csv_path = os.path.join(base_dir, "../data/df_bangalore_urban.csv")
db_path = os.path.join(base_dir, "../db/covid_data.db")

# Load CSV
df = pd.read_csv(csv_path)

# Parse and clean date column
df['date'] = pd.to_datetime(df['Date.Announced'], errors='coerce')

# Keep only needed columns
df = df[['date', 'Hospitalized', 'Recovered', 'Deceased']]
df.columns = ['date', 'hospitalized', 'recovered', 'deceased']

# Drop rows with invalid dates
df = df.dropna(subset=['date'])

# Save to SQLite
conn = sqlite3.connect(db_path)
df.to_sql("bangalore_cases", conn, if_exists="replace", index=False)
conn.close()

print(" Bangalore Urban data loaded successfully.")
