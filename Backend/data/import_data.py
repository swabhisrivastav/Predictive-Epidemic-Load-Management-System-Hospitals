# import_data.py
import sqlite3
import pandas as pd
from pathlib import Path

def import_csv_to_sqlite():
    # Ensure data directory exists
    Path("data").mkdir(exist_ok=True)
    
    # Step 1: Read CSV
    df = pd.read_csv('data/dengue_data.csv')
    
    # Step 2: Clean/validate data
    df['date'] = pd.to_datetime(df['date']).dt.strftime('%Y-%m-%d')
    df = df.dropna(subset=['date', 'reported_cases'])
    
    # Step 3: Import to SQLite
    with sqlite3.connect('data/dengue.db') as conn:
        df.to_sql('dengue_data', conn, if_exists='replace', index=False)
        
        # Verify
        print("First 5 rows in database:")
        print(pd.read_sql("SELECT * FROM dengue_data LIMIT 5", conn))
    
    print(f"\n Successfully imported {len(df)} records")

if __name__ == "__main__":
    import_csv_to_sqlite()