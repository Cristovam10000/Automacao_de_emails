import re
from nltk.stem.snowball import SnowballStemmer

STOP_WORDS_PT = {
      "a", "o", "e", "de", "do", "da", "das", "dos", "em", "por", "para",
    "com", "que", "na", "no", "um", "uma", "uns", "umas", "ao", "à",
    "às", "aos", "como", "também", "mas", "ou", "se", "sem"
}

stemmer = SnowballStemmer("portuguese")

def preprocess_text(text: str) -> str:
    lowered = text.lower()

    tokens = re.findall(r"\b\w+\b", lowered, flags=re.UNICODE)

    cleaned = [stemmer.stem(tok) for tok in tokens if tok not in STOP_WORDS_PT]

    return " ".join(cleaned)