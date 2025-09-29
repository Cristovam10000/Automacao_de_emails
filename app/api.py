from fastapi import APIRouter, UploadFile, File, Form, HTTPException
from pydantic_settings import BaseSettings
from pydantic import Field, BaseModel
from typing import List

from app.providers.gemini_client import classify_and_reply
from app.config import settings
from app.utils.pdf import pdf_to_text
from app.utils.fallback_model import train_from_records

router = APIRouter()


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


@router.get("/health")
def health():
    return {"status": "ok"}


@router.post("/process")
def process(req: ProcessReq):
    text = req.text.strip()
    out = classify_and_reply(text)
    return {
        "classification": {"label": out.label, "confidence": out.confidence},
        "reply": {"subject": out.reply_subject, "body": out.reply_body[:settings.MAX_REPLY_CHARS]},
        "meta": {"provider": "gemini", "filename": req.filename, "tokens": len(text.split())},
    }


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

    content = (content or "").strip()
    if not content:
        raise HTTPException(400, "Conteudo vazio apos leitura.")
    out = classify_and_reply(content)
    return {
        "classification": {"label": out.label, "confidence": out.confidence},
        "reply": {"subject": out.reply_subject, "body": out.reply_body[:settings.MAX_REPLY_CHARS]},
        "meta": {"provider": "gemini", "filename": filename, "tokens": len(content.split())},
    }


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