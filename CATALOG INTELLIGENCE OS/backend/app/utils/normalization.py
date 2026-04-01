import re
import unicodedata


def normalize_text(text: str) -> str:
    text = unicodedata.normalize("NFKD", text)
    text = re.sub(r"\s+", " ", text).strip()
    return text


def normalize_brand(brand: str) -> str:
    brand = normalize_text(brand)
    brand = re.sub(r"[™®©]", "", brand)
    return brand.strip()


def normalize_color(color: str) -> str:
    return color.lower().strip()


def normalize_sku(sku: str) -> str:
    return re.sub(r"[^a-zA-Z0-9-]", "", sku).upper()


def normalize_gtin(gtin: str) -> str:
    digits = re.sub(r"\D", "", gtin)
    if len(digits) < 8:
        return ""
    return digits.zfill(14)
