from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api import router

app = FastAPI(title = "AutoU Mail Assistant (Gemini)")
app.add.middleware(CORSMiddleware, allow_origins = ["*"], allow_headers = ["*"], allow_methods = ["*"])
app.include_router(router, prefix="/api")