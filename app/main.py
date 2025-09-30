from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api import router

app = FastAPI(title = "AutoU Mail Assistant (Gemini)")
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "https://automacao-de-emails-f1pz.vercel.app",
        "https://automacao-de-emails.vercel.app",
        "http://localhost:5173",
        "http://127.0.0.1:5173",
    ],
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(router, prefix="/api")