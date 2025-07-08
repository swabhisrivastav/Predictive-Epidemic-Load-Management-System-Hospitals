# main.py

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routes import national, district

app = FastAPI()

# Allow frontend access
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Change to your frontend URL in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include the national route
app.include_router(national.router, prefix="/api")
app.include_router(district.router, prefix="/api") 

