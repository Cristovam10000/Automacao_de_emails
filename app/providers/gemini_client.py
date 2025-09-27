from typing import Literal
from pydantic import BaseModel, Field
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_core.messages import SystemMessage, HumanMessage
from app.config import settings

Label = Literal["Produtivo", "Improdutivo"]

class EmailOut(BaseModel):
    label: Label
    confidence: float = Field(ge=0, le=1)
    reply_subject: str
    reply_body: str

TRIAGEM_PROMPT = (
     "Você é um triador de e-mails de um Service Desk financeiro. "
    "Dada a mensagem, retorne SOMENTE um JSON com os campos: "
    '{"label":"Produtivo|Improdutivo","confidence":0..1,'
    '"reply_subject":"...","reply_body":"..."}.\n'
    "Critérios:\n"
    "- Produtivo: requer ação/resposta específica (status de pedido, suporte, acesso, erro, prazo, dúvida técnica). \n"
    "- Improdutivo: cumprimentos/agradecimentos/feliz natal/sem pedido acionável.\n"
    "Regras de resposta automática:\n"
    "- Se Produtivo: responda educado, neutro e sem prometer prazos específicos; peça dados necessários (ex.: nº do pedido/chamado) e indique próximo passo.\n"
    "- Se Improdutivo: agradeça e encerre cordialmente, sem abrir chamados.\n"
    "Limites: reply_body <= 1200 chars. Responda em PT-BR. JSON puro."
)

_llm = ChatGoogleGenerativeAI(
    model = "gemini-2.5-flash",
    temperatura = 0,
    api_key = settings.GOOGLE_API_KEY
)

_triagem_chain = _llm.with_structured_output(EmailOut)

def classify_and_repy(text: str) -> EmailOut:
    out: EmailOut = _triagem_chain.invoke([
        SystemMessage(content = TRIAGEM_PROMPT),
        HumanMessage(content = text)
    ])
    return out