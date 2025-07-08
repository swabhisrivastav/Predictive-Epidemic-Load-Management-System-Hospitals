from sqlalchemy import Column, Integer, Date
from .database import Base

class DistrictCase(Base):
    __tablename__ = "bangalore_cases"

    date = Column(Date,primary_key=True, index=True)
    hospitalized = Column(Integer)
    recovered = Column(Integer)
    deceased = Column(Integer)
