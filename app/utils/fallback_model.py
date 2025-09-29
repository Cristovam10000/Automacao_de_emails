"""Fallback email classifier used when Gemini is unavailable.

The module keeps the optional dependency on scikit-learn isolated so the
application still boots when the library is missing. When scikit-learn (and the
trained model) are absent, simple heuristic rules are used instead of raising
errors.
"""

from __future__ import annotations

import os
import pickle
import unicodedata
from typing import Any, Dict, Iterable, List, Tuple

MODEL_PATH: str = "data/fallback_model.pkl"

try:
    from sklearn.feature_extraction.text import TfidfVectorizer  # type: ignore
    from sklearn.linear_model import LogisticRegression  # type: ignore
except ImportError:  # pragma: no cover - executed only when sklearn is missing
    SKLEARN_AVAILABLE = False
    TfidfVectorizer = None  # type: ignore
    LogisticRegression = None  # type: ignore
else:
    SKLEARN_AVAILABLE = True

vectorizer: Any = None
classifier: Any = None

CANCEL_KEYWORDS: Tuple[str, ...] = (
    "cancel",
    "rescind",
    "encerrar modulo",
    "encerrar assinatura",
    "desativar modulo",
    "mult",
    "aviso previ",
)

SUPPORT_KEYWORDS: Tuple[str, ...] = (
    "erro",
    "falha",
    "nao consigo",
    "problema",
    "acesso",
    "senha",
    "liberar",
)

GREETING_KEYWORDS: Tuple[str, ...] = (
    "obrig",
    "agradec",
    "bom dia",
    "boa tarde",
    "boa noite",
    "feliz",
    "paraben",
)


def _normalize(text: str) -> str:
    if not text:
        return ""
    normalized = unicodedata.normalize("NFKD", text)
    without_accents = "".join(ch for ch in normalized if not unicodedata.combining(ch))
    return without_accents.lower()


def _contains_any(text: str, keywords: Iterable[str]) -> bool:
    return any(keyword in text for keyword in keywords)


def _heuristic_classification(text: str) -> Tuple[str, float, str, str]:
    normalized = _normalize(text)

    if not normalized.strip():
        return (
            "Improdutivo",
            0.1,
            "Re: Mensagem recebida",
            "Recebemos sua mensagem, mas nao identificamos detalhes. Poderia reenviar com mais informacoes?",
        )

    if _contains_any(normalized, CANCEL_KEYWORDS):
        return (
            "Produtivo",
            0.7,
            "Re: Cancelamento de modulo",
            "Entendemos o pedido de cancelamento. Para prosseguir, informe modulo, vigencia e se ha clausula de multa ou aviso previo. Assim conseguimos orientar os proximos passos.",
        )

    if _contains_any(normalized, SUPPORT_KEYWORDS):
        return (
            "Produtivo",
            0.65,
            "Re: Suporte tecnico",
            "Registramos a solicitacao de suporte. Para agilizar o atendimento, informe numero do pedido ou screenshots do erro, se possivel.",
        )

    if _contains_any(normalized, GREETING_KEYWORDS):
        return (
            "Improdutivo",
            0.9,
            "Re: Mensagem recebida",
            "Agradecemos o contato e permanecemos a disposicao caso precise de algo.",
        )

    return (
        "Produtivo",
        0.55,
        "Re: Solicitacao recebida",
        "Recebemos sua mensagem e estamos analisando. Poderia compartilhar mais detalhes (ex.: numero do contrato ou chamado) para direcionar o atendimento?",
    )


def _load_models() -> Tuple[Any, Any]:
    global vectorizer, classifier

    if vectorizer is not None and classifier is not None:
        return vectorizer, classifier

    if not SKLEARN_AVAILABLE:
        return None, None

    if os.path.exists(MODEL_PATH):
        try:
            with open(MODEL_PATH, "rb") as handle:
                vectorizer, classifier = pickle.load(handle)
        except Exception:
            vectorizer, classifier = None, None

    return vectorizer, classifier


def train_from_records(records: List[Dict[str, Any]]) -> None:
    if not SKLEARN_AVAILABLE:
        raise ValueError("Treinamento indisponivel: instale scikit-learn para habilitar o fallback treinavel.")

    textos: List[str] = []
    rotulos: List[str] = []
    pesos: List[float] = []

    for registro in records:
        conteudo = str(registro.get("content", "") or "")
        classificacao = str(registro.get("classification", "") or "").strip().lower()
        confianca = registro.get("confidence", 1.0)

        rotulo = "Produtivo" if classificacao.startswith("p") else "Improdutivo"
        textos.append(conteudo)
        rotulos.append(rotulo)
        try:
            pesos.append(float(confianca))
        except Exception:
            pesos.append(1.0)

    if not textos:
        raise ValueError("Nenhum registro fornecido para treino.")

    if len(set(rotulos)) < 2:
        raise ValueError("Treino requer pelo menos duas classes distintas.")

    vectorizer_local = TfidfVectorizer(max_features=5000)
    matriz = vectorizer_local.fit_transform(textos)
    clf = LogisticRegression(max_iter=1000)

    try:
        clf.fit(matriz, rotulos, sample_weight=pesos)
    except Exception:
        clf.fit(matriz, rotulos)

    os.makedirs(os.path.dirname(MODEL_PATH) or ".", exist_ok=True)
    with open(MODEL_PATH, "wb") as handle:
        pickle.dump((vectorizer_local, clf), handle)

    global vectorizer, classifier
    vectorizer, classifier = vectorizer_local, clf


def train_from_csv(file_path: str) -> None:
    if not SKLEARN_AVAILABLE:
        raise ValueError("Treinamento indisponivel: instale scikit-learn para habilitar o fallback treinavel.")

    import csv

    textos: List[str] = []
    rotulos: List[str] = []
    pesos: List[float] = []

    with open(file_path, newline="", encoding="utf-8") as csvfile:
        for linha in csv.DictReader(csvfile):
            rotulo_bruto = str(linha.get("Classificacao", "") or "").strip().lower()
            rotulo = "Produtivo" if rotulo_bruto.startswith("p") else "Improdutivo"
            textos.append(str(linha.get("Conteudo", "") or ""))
            conf = str(linha.get("Confianca", "") or "").strip().rstrip("%")
            try:
                peso = float(conf) / 100.0 if conf else 1.0
            except Exception:
                peso = 1.0
            pesos.append(peso)
            rotulos.append(rotulo)

    if not textos:
        raise ValueError("Nenhum dado encontrado no arquivo CSV.")

    if len(set(rotulos)) < 2:
        raise ValueError("Treino requer pelo menos duas classes distintas.")

    vectorizer_local = TfidfVectorizer(max_features=5000)
    matriz = vectorizer_local.fit_transform(textos)
    clf = LogisticRegression(max_iter=1000)

    try:
        clf.fit(matriz, rotulos, sample_weight=pesos)
    except Exception:
        clf.fit(matriz, rotulos)

    os.makedirs(os.path.dirname(MODEL_PATH) or ".", exist_ok=True)
    with open(MODEL_PATH, "wb") as handle:
        pickle.dump((vectorizer_local, clf), handle)

    global vectorizer, classifier
    vectorizer, classifier = vectorizer_local, clf


def classify_fallback(texto: str) -> Tuple[str, float, str, str]:
    modelos = _load_models()
    if SKLEARN_AVAILABLE and modelos[0] is not None and modelos[1] is not None:
        vectorizer_local, clf = modelos
        try:
            matriz = vectorizer_local.transform([texto])
            probabilidades = clf.predict_proba(matriz)[0]
            indice = int(probabilidades.argmax())
            rotulo = str(clf.classes_[indice])
            confianca = float(max(0.0, min(1.0, probabilidades[indice])))
        except Exception:
            pass
        else:
            if rotulo == "Produtivo":
                assunto = "Re: Sua solicitacao"
                corpo = (
                    "Recebemos sua mensagem e abrimos um atendimento. Informe numero de contrato ou chamado para acelerar o retorno."
                )
            else:
                assunto = "Re: Mensagem recebida"
                corpo = "Agradecemos o contato. No momento nao ha acao pendente."
            return rotulo, confianca, assunto, corpo

    return _heuristic_classification(texto or "")

