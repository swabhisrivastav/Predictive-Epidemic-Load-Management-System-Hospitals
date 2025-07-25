from fastapi import APIRouter, Depends
from typing import Dict,List
import sqlite3
from datetime import datetime
from database import get_db 

router = APIRouter(
    prefix="/resources",
    tags=["resources"],
    responses={404: {"description": "Not found"}}
)

@router.get("/hospital-resources/latest", response_model=Dict)
def get_latest_resources(conn: sqlite3.Connection = Depends(get_db)):
    cursor = conn.cursor()
    cursor.execute("""
        SELECT * FROM hospital_resource_timeseries
        ORDER BY date DESC LIMIT 1
    """)
    row = cursor.fetchone()
    if row is None:
        return {}

    columns = [description[0] for description in cursor.description]
    return dict(zip(columns, row))

@router.get("/hospital-resources/trend", response_model=List[Dict])
def get_trend_data(conn: sqlite3.Connection = Depends(get_db)):
    cursor = conn.cursor()
    cursor.execute("""
        SELECT * FROM hospital_resource_timeseries
        WHERE date >= DATE('now', '-30 days')
        ORDER BY date ASC
    """)
    rows = cursor.fetchall()
    columns = [description[0] for description in cursor.description]

    return [dict(zip(columns, row)) for row in rows]
