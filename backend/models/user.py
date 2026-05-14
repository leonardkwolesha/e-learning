from pydantic import BaseModel, EmailStr
from datetime import datetime
from typing import Literal


class UserRegister(BaseModel):
    email: EmailStr
    password: str
    name: str


class UserLogin(BaseModel):
    email: EmailStr
    password: str


class UserOut(BaseModel):
    id: str
    email: str
    role: Literal["student", "instructor", "admin"] = "student"
    created_at: datetime


class TokenOut(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserOut


class StudentProfileCreate(BaseModel):
    grade_level: str
    education_type: Literal["secondary", "diploma", "undergrad", "postgrad"]
    background_summary: str = ""
    learning_style: Literal["visual", "auditory", "reading", "kinesthetic"]
    subject_interests: list[str]


class StudentProfileOut(StudentProfileCreate):
    id: str
    user_id: str
    created_at: datetime
