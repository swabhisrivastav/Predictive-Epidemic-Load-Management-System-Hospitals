import pandas as pd
import sqlite3
import os

DATABASE_PATH = "db/dengue.db"
CSV_PATH = "data/hospital_resources_2022_2025.csv"   

def load_hospital_csv_to_db(csv_path=CSV_PATH):
    if not os.path.exists(csv_path):
        print(f"❌ CSV file not found: {csv_path}")
        return

    # Load CSV
    df = pd.read_csv(csv_path)

    # Format column names to match DB schema
    df.columns = [col.strip().lower().replace(" ", "_") for col in df.columns]

    # Ensure date format
    df['date'] = pd.to_datetime(df['date']).dt.strftime('%Y-%m-%d')

    # Insert into SQLite DB
    conn = sqlite3.connect(DATABASE_PATH)
    try:
        df.to_sql("hospital_resource_timeseries", conn, if_exists="replace", index=False)
        print("✅ CSV data loaded successfully into hospital_resource_timeseries.")
    finally:
        conn.close()

if __name__ == "__main__":
    load_hospital_csv_to_db()
