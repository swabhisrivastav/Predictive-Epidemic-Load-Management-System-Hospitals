import sqlite3
from contextlib import contextmanager
from fastapi import HTTPException

DATABASE_PATH = "db/dengue.db"


def get_db():
    conn = sqlite3.connect(DATABASE_PATH,check_same_thread=False)
    try:
        yield conn
    finally:
        conn.close()

def init_db():
    db_gen = get_db()           
    conn = next(db_gen)       
    try:
        conn.execute("""
        CREATE TABLE IF NOT EXISTS dengue_data (
            date TEXT PRIMARY KEY,
            reported_cases INTEGER,
            rainfall_mm REAL
        )
        """)
        
        conn.execute("""
        CREATE TABLE IF NOT EXISTS forecasts (
            forecast_date TEXT,
            prediction_date TEXT,
            cases_predicted REAL,
            lower_ci REAL,
            upper_ci REAL,
            PRIMARY KEY (forecast_date, prediction_date)
        )
        """)
        conn.execute("""
        CREATE TABLE IF NOT EXISTS hospital_resource_timeseries (
            date TEXT PRIMARY KEY,
            total_beds INTEGER,
            available_beds INTEGER,
            occupied_beds INTEGER,
            icu_beds INTEGER,
            available_icu_beds INTEGER,
            occupied_icu_beds INTEGER,
            total_ventilators INTEGER,
            available_ventilators INTEGER,
            used_ventilators INTEGER,
            total_oxygen_cylinders INTEGER,
            available_oxygen_cylinders INTEGER,
            used_oxygen_cylinders INTEGER,
            total_doctors INTEGER,
            available_doctors INTEGER,
            total_nurses INTEGER,
            available_nurses INTEGER,
            total_icu_nurses INTEGER,
            available_icu_nurses INTEGER,
            staff_reduction_factors REAL
        )
        """)
        conn.commit()
    finally:
        conn.close()
