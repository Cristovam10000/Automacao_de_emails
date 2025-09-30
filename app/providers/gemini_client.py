from typing import Literal

from pydantic import BaseModel, Field
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_core.messages import HumanMessage, SystemMessage

from app.config import settings
from app.utils.fallback_model import classify_fallback

Label = Literal["Produtivo", "Improdutivo"]


class EmailOut(BaseModel):
    label: Label
    confidence: float = Field(ge=0, le=1)
    reply_subject: str
    reply_body: str = Field(max_length=settings.MAX_REPLY_CHARS)


TRIAGEM_PROMPT = (
    "Voce e um triador de e-mails de um Service Desk financeiro. "
    "Dada a mensagem, retorne SOMENTE um JSON com os campos: "
    '{"label":"Produtivo|Improdutivo","confidence":0..1,'
    '"reply_subject":"...","reply_body":"..."}.\n'
    "Criterios:\n"
    "- Produtivo: requer acao/resposta especifica (status de pedido, suporte, acesso, erro, prazo, duvida tecnica). \n"
    "- Improdutivo: cumprimentos/agradecimentos/feliz natal/sem pedido acionavel.\n"
    "Regras de resposta automatica:\n"
    "- Se Produtivo: responda educado, neutro e sem prometer prazos especificos; peca dados necessarios (ex.: numero do pedido/chamado) e indique proximo passo.\n"
    "- Se Improdutivo: agradeca e encerre cordialmente, sem abrir chamados.\n"
    "Responda em PT-BR. JSON puro."
)


def classify_and_reply(text: str) -> EmailOut:
    """Classifica utilizando o Gemini e aplica fallback em caso de erro."""

    try:
        llm = ChatGoogleGenerativeAI(
            # model="gemini-2.5-flash",
           
            temperature=0,
            google_api_key=settings.GOOGLE_API_KEY or None,
        )
        chain = llm.with_structured_output(EmailOut)
        return chain.invoke(
            [
                SystemMessage(content=TRIAGEM_PROMPT),
                HumanMessage(content=text),
            ]
        )
    except Exception:
        label, confidence, subject, body = classify_fallback(text)
        return EmailOut(
            label=label,
            confidence=confidence,
            reply_subject=subject,
            reply_body=body,
        )