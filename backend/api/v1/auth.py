from fastapi import APIRouter, HTTPException
from core.database import get_supabase
from core.auth import create_access_token
from models.user import UserRegister, UserLogin, TokenOut, UserOut
from datetime import datetime, timezone

router = APIRouter(prefix="/auth", tags=["auth"])


@router.post("/register", response_model=dict)
async def register(body: UserRegister):
    db = get_supabase()
    resp = db.auth.sign_up({"email": body.email, "password": body.password})
    if resp.user is None:
        raise HTTPException(status_code=400, detail="Registration failed")

    user = resp.user
    token = create_access_token(user.id, user.email)

    return {
        "data": {
            "access_token": token,
            "token_type": "bearer",
            "user": {"id": user.id, "email": user.email, "created_at": user.created_at},
        },
        "error": None,
    }


@router.post("/login", response_model=dict)
async def login(body: UserLogin):
    db = get_supabase()
    resp = db.auth.sign_in_with_password({"email": body.email, "password": body.password})
    if resp.user is None:
        raise HTTPException(status_code=401, detail="Invalid credentials")

    user = resp.user
    token = create_access_token(user.id, user.email)

    return {
        "data": {
            "access_token": token,
            "token_type": "bearer",
            "user": {"id": user.id, "email": user.email, "created_at": user.created_at},
        },
        "error": None,
    }


@router.post("/logout")
async def logout():
    return {"data": {"message": "Logged out"}, "error": None}
