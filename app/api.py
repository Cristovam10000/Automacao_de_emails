from fastapi import APIRouter, UploadFile, File, Form, HTTPException
from pydantic_settings import BaseSettings
from pydantic import Field
from app.providers.gemini_client import classify_and_reply
from app.config import settings
from app.utils.pdf import pdf_to_text
from app.utils.nlp import preprocess_text

router = APIRouter()

class ProcessReq(BaseSettings):
    text: str = Field(..., min_length = 3, max_length = settings.MAX_TEXT_CHARS)
    filename: str | None = None

@router.get("/health")
def health():
    return {"status": "ok"}

@router.post("/process")
def process(req: ProcessReq):
    clean = preprocess_text(req.text)
    out = classify_and_reply(clean)
    return {
        "classification": {"label": out.label, "confidence": out.confidence},
        "reply": {"subject": out.reply_subject, "body": out.reply_body[:settings.MAX_REPLY_CHARS]},
        "meta": {"provider": "gemini", "filename": req.filename, "tokens": len(req.text.split())}
    }

@router.post("/upload")
async def upload(file: UploadFile = File(None), text: str = Form(None)):
    if not text and not file:
        raise HTTPException(400, " Por favor envie um arquivo .txt/.pdf ou se possivel texto")
    
    content, filename = text, None
    
    if file:
        filename = file.filename
        if filename.lower().endswith(".pdf"):
            content = pdf_to_text(file.file)
        elif filename.lower().endswith(".txt"):
            content = (await file.read()).decode("utf-8", errors = "ignore")
        else:
            raise HTTPException(400, "Formato não suportado use .txt ou .pdf")
    
    out = classify_and_reply(content)
    return{
        "classification": {"label": out.label, "confidence": out.confidence},
        "reply": {"subject": out.reply_subject, "body": out.reply_body[:settings.MAX_REPLY_CHARS]},
        "meta": {"provider": "gemini", "filename": filename, "tokens": len(content.split())}
    }
