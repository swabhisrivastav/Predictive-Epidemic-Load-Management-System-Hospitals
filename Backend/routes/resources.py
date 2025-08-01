from fastapi import APIRouter, Depends
from typing import Dict,List
import sqlite3
from datetime import datetime
from database import get_db 
from pydantic import BaseModel,Field
from decimal import Decimal
from datetime import date

router = APIRouter(
    prefix="/resources",
    tags=["resources"],
    responses={404: {"description": "Not found"}}
)

class FullResourceData(BaseModel):
    date: date
    total_beds: int
    available_beds: int
    occupied_beds: int
    icu_beds: int
    available_icu_beds: int
    occupied_icu_beds: int
    total_ventilators: int
    available_ventilators: int
    used_ventilators: int
    total_oxygen_cylinders: int
    available_oxygen_cylinders: int
    used_oxygen_cylinders: int
    total_doctors: int
    available_doctors: int
    total_nurses: int
    available_nurses: int
    total_icu_nurses: int
    available_icu_nurses: int
    staff_reduction_factor: Decimal = Field(..., gt=0, lt=2)


def get_latest_resources_from_db(conn: sqlite3.Connection = Depends(get_db)) -> dict:
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


@router.get("/hospital-resources/latest", response_model=Dict)
def get_latest_resources(conn: sqlite3.Connection = Depends(get_db)):
    return get_latest_resources_from_db(conn)


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



@router.post("/hospital-resources/add")
def add_resource_data(data: FullResourceData, conn: sqlite3.Connection = Depends(get_db)):
    cursor = conn.cursor()
    cursor.execute("""
        INSERT INTO hospital_resource_timeseries (
            date,
            total_beds, available_beds, occupied_beds,
            icu_beds, available_icu_beds, occupied_icu_beds,
            total_ventilators, available_ventilators, used_ventilators,
            total_oxygen_cylinders, available_oxygen_cylinders, used_oxygen_cylinders,
            total_doctors, available_doctors,
            total_nurses, available_nurses,
            total_icu_nurses, available_icu_nurses,
            staff_reduction_factor
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    """, (
        data.date,
        data.total_beds, data.available_beds, data.occupied_beds,
        data.icu_beds, data.available_icu_beds, data.occupied_icu_beds,
        data.total_ventilators, data.available_ventilators, data.used_ventilators,
        data.total_oxygen_cylinders, data.available_oxygen_cylinders, data.used_oxygen_cylinders,
        data.total_doctors, data.available_doctors,
        data.total_nurses, data.available_nurses,
        data.total_icu_nurses, data.available_icu_nurses,
        float(data.staff_reduction_factor)  # Needed if using Decimal
    ))

    conn.commit()
    return {"message": "Resource data added successfully"}

