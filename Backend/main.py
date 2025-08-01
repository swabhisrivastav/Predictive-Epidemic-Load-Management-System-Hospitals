# main.py

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routes import national, district,dengue,resources,overload,recommendations
from database import init_db
from fastapi.staticfiles import StaticFiles  # Add this for graph endpoint
from routes import auth
app = FastAPI()

# Initialize database
init_db()

# Allow frontend access
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Change to your frontend URL in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount static files for graphs (required for /dengue/graph endpoint)
app.mount("/static", StaticFiles(directory="static"), name="static")

# Include the  routes
app.include_router(national.router, prefix="/api")
app.include_router(district.router, prefix="/api")
app.include_router(dengue.router, prefix = "/api")
app.include_router(resources.router, prefix = "/api")
app.include_router(overload.router, prefix = "/api")
app.include_router(recommendations.router, prefix = "/api")
app.include_router(auth.router, prefix="/api")

@app.on_event("startup")
async def startup():
    """Initialize forecasting model"""
    # This will trigger the startup_event in dengue.py
    pass