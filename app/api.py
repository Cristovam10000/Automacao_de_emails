import logging

from fastapi import APIRouter, UploadFile, File, Form, HTTPException
from pydantic_settings import BaseSettings
from pydantic import Field, BaseModel
from typing import List

from app.providers.gemini_client import classify_and_reply, EmailOut
from app.config import settings
from app.utils.pdf import pdf_to_text
from app.utils.fallback_model import train_from_records, classify_fallback

router = APIRouter()
logger = logging.getLogger(__name__)


class ProcessReq(BaseSettings):
    text: str = Field(..., min_length=3, max_length=settings.MAX_TEXT_CHARS)
    filename: str | None = None


# ---------------------------------------------------------------------------
# Esquemas de treinamento do fallback
# ---------------------------------------------------------------------------

class RegistroTreinamento(BaseModel):
    """Registro individual usado para treinar o modelo de fallback."""

    conteudo: str = Field(..., description="Texto integral do e-mail")
    classificacao: str = Field(..., description="Rotulo gerado (produtivo/improdutivo)")
    confianca: float = Field(1.0, ge=0, le=1, description="Confianca entre 0 e 1")


class DadosTreinamento(BaseModel):
    """Estrutura enviada pelo front-end contendo varios registros."""

    registros: List[RegistroTreinamento]


def _build_response(result: EmailOut, tokens: int, filename: str | None, provider: str) -> dict:
    return {
        "classification": {"label": result.label, "confidence": result.confidence},
        "reply": {
            "subject": result.reply_subject,
            "body": result.reply_body[: settings.MAX_REPLY_CHARS],
        },
        "meta": {"provider": provider, "filename": filename, "tokens": tokens},
    }


def _classify_with_fallback(raw_text: str, filename: str | None = None) -> dict:
    text = (raw_text or "").strip()
    if not text:
        raise HTTPException(400, "Conteudo vazio apos limpeza.")

    provider = "gemini"
    tokens = len(text.split())

    try:
        result = classify_and_reply(text)
    except Exception as error:  # pragma: no cover - dependent on external API
        logger.exception("Gemini classification failed; using fallback.")
        label, confidence, subject, body = classify_fallback(text)
        result = EmailOut(label=label, confidence=confidence, reply_subject=subject, reply_body=body)
        provider = "fallback"

    return _build_response(result, tokens, filename, provider)


@router.get("/health")
def health():
    return {"status": "ok"}


@router.post("/process")
def process(req: ProcessReq):
    return _classify_with_fallback(req.text, req.filename)


@router.post("/upload")
async def upload(file: UploadFile = File(None), text: str = Form(None)):
    if not text and not file:
        raise HTTPException(400, "Por favor envie um arquivo .txt/.pdf ou texto.")

    content, filename = text, None

    if file:
        filename = file.filename
        if filename.lower().endswith(".pdf"):
            content = pdf_to_text(file.file)
        elif filename.lower().endswith(".txt"):
            content = (await file.read()).decode("utf-8", errors="ignore")
        else:
            raise HTTPException(400, "Formato nao suportado. Use .txt ou .pdf.")

    return _classify_with_fallback(content, filename)


@router.post("/retrain")
def retrain(dados: DadosTreinamento):
    """Treina o modelo de fallback usando dados enviados pelo front-end."""

    registros = [
        {
            "content": registro.conteudo,
            "classification": registro.classificacao,
            "confidence": registro.confianca,
        }
        for registro in dados.registros
    ]

    if not registros:
        raise HTTPException(status_code=400, detail="Nenhum registro fornecido para treino.")

    try:
        train_from_records(registros)
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc))

    return {"status": "modelo_treinado", "quantidade": len(registros)}

@router.get("/health/ai")
def health_ai():
    import os, google.generativeai as genai
    api_key = os.getenv("GOOGLE_API_KEY")
    if not api_key:
        return {"ok": False, "error": "GOOGLE_API_KEY not set"}
    try:
        genai.configure(api_key=api_key)
        model = genai.GenerativeModel("gemini-1.5-flash")
        _ = model.generate_content("ping")
        return {"ok": True}
    except Exception as e:
        return {"ok": False, "error": str(e)}
