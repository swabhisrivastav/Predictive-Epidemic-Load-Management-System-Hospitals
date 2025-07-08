from pydantic import BaseModel
from datetime import datetime

class DistrictCaseResponse(BaseModel):
    date: datetime
    hospitalized: int
    recovered: int
    deceased: int

    class Config:
        orm_mode = True  # Required to work with SQLAlchemy model objects
