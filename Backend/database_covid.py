import sqlite3
from contextlib import contextmanager
from fastapi import HTTPException

DATABASE_PATH = "db/covid_data.db"

def get_db_covid():
    conn = sqlite3.connect(DATABASE_PATH,check_same_thread=False)
    try:
        yield conn
    finally:
        conn.close()

def init_db_covid():
    db_gen = get_db_covid()           
    conn = next(db_gen)       
    try:
        conn.execute("""
        CREATE TABLE IF NOT EXISTS forecast_covid (
            forecast_date DATE PRIMARY KEY,
            predicted_cases INTEGER
        )
        """)
        
        conn.execute("""
        CREATE TABLE IF NOT EXISTS user (
            hospital_id INTEGER PRIMARY KEY AUTOINCREMENT,
            hospital_name TEXT ,
            hospital_code TEXT UNIQUE,
            password TEXT NOT NULL,
            location TEXT,
            email TEXT
            )
        """)
        conn.commit()
    finally:
        conn.close()
