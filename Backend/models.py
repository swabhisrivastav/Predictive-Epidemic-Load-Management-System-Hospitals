from pydantic import BaseModel
from datetime import date

class ForecastRequest(BaseModel):
    weeks: int = 4
    refresh: bool = False

class CaseData(BaseModel):
    date: date
    reported_cases: int
    rainfall_mm: float
