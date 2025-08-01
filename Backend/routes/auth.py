# routes/auth.py

from fastapi import APIRouter, HTTPException, status, Depends
from pydantic import BaseModel, EmailStr, validator
import sqlite3
import bcrypt
import re

DATABASE_PATH = "db/covid_data.db"
router = APIRouter(tags=["auth"])

# Pydantic Models

class SignupRequest(BaseModel):
    hospital_name: str
    hospital_code: str
    password: str
    location: str
    email: EmailStr

    @validator('password')
    def validate_password(cls, v):
        # Require at least 8 characters, one uppercase, one lowercase, one digit, and one special character
        if len(v) < 8:
            raise ValueError('Password must be at least 8 characters long.')
        if not re.search(r'[A-Z]', v):
            raise ValueError('Password must contain at least one uppercase letter.')
        if not re.search(r'[a-z]', v):
            raise ValueError('Password must contain at least one lowercase letter.')
        if not re.search(r'\d', v):
            raise ValueError('Password must contain at least one digit.')
        if not re.search(r'[!@#$%^&*(),.?":{}|<>]', v):
            raise ValueError('Password must contain at least one special character.')
        return v

class LoginRequest(BaseModel):
    login_id: str  # hospital_code or email
    password: str

# DB Connection Helper

def get_db():
    conn = sqlite3.connect(DATABASE_PATH)
    conn.row_factory = sqlite3.Row
    return conn

# Signup Endpoint

@router.post("/signup")
def signup(request: SignupRequest):
    hashed_pw = bcrypt.hashpw(request.password.encode('utf-8'), bcrypt.gensalt())

    conn = get_db()
    try:
        cursor = conn.cursor()
        cursor.execute("""
            INSERT INTO user (hospital_name, hospital_code, password, location, email)
            VALUES (?, ?, ?, ?, ?)
        """, (
            request.hospital_name,
            request.hospital_code,
            hashed_pw.decode('utf-8'),
            request.location,
            request.email
        ))
        conn.commit()
        return {"message": " Signup successful"}
    except sqlite3.IntegrityError as e:
        raise HTTPException(status_code=400, detail="Hospital code or email already exists")
    finally:
        conn.close()


# Login Endpoint

@router.post("/login")
def login(request: LoginRequest):
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("""
        SELECT * FROM user WHERE hospital_code = ? OR email = ?
    """, (request.login_id, request.login_id))

    user = cursor.fetchone()
    conn.close()

    if user and bcrypt.checkpw(request.password.encode('utf-8'), user["password"].encode('utf-8')):
        return {"message": " Login successful", "hospital_id": user["hospital_id"]}
    else:
        raise HTTPException(status_code=401, detail=" Invalid credentials")
