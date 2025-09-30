from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api import router

app = FastAPI(title = "AutoU Mail Assistant (Gemini)")
app.add_middleware(CORSMiddleware, allow_origins = ["autômatos-de-emails.vercel.app", "http://localhost:5173", "http://127.0.0.1:5173"], allow_headers = ["*"], allow_methods = ["*"])
app.include_router(router, prefix="/api")