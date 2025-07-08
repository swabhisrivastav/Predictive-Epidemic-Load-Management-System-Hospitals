import sys
import os

# Add parent directory of 'db' to Python path
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from db.database import engine
from db.models import Base

Base.metadata.create_all(bind=engine)

