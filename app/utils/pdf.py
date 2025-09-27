from pdfminer.high_level import extract_text

def pdf_to_text(fp) -> str:
    return extract_text(fp)