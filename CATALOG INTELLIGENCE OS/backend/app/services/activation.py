import json
from datetime import datetime, timezone
from typing import Any

from pydantic import BaseModel


class ActivationPayload(BaseModel):
    product_id: str
    format: str
    data: dict[str, Any]
    generated_at: str
    version: str = "1.0"


class ActivationService:
    SUPPORTED_FORMATS = [
        "google_shopping",
        "meta_catalog",
        "amazon_sp",
        "generic_json",
        "csv",
    ]

    async def generate_feed(
        self,
        product_id: str,
        identity: dict,
        attributes: dict[str, Any],
        taxonomy_path: list[str],
        target_format: str,
    ) -> ActivationPayload:
        if target_format not in self.SUPPORTED_FORMATS:
            raise ValueError(f"Unsupported format: {target_format}. Supported: {self.SUPPORTED_FORMATS}")

        formatter = getattr(self, f"_format_{target_format}", self._format_generic_json)
        data = formatter(identity, attributes, taxonomy_path)

        return ActivationPayload(
            product_id=product_id,
            format=target_format,
            data=data,
            generated_at=datetime.now(timezone.utc).isoformat(),
        )

    def _format_google_shopping(
        self, identity: dict, attributes: dict[str, Any], taxonomy_path: list[str]
    ) -> dict:
        return {
            "id": identity.get("sku") or identity.get("gtin", ""),
            "title": identity.get("title", ""),
            "description": identity.get("description", ""),
            "link": f"https://example.com/products/{identity.get('sku', '')}",
            "image_link": (identity.get("images") or [""])[0] if identity.get("images") else "",
            "availability": "in stock",
            "price": f"{attributes.get('price', '0.00')} USD",
            "brand": attributes.get("brand", identity.get("brand", "")),
            "gtin": identity.get("gtin", ""),
            "condition": "new",
            "google_product_category": " > ".join(taxonomy_path),
            "color": attributes.get("color", ""),
            "size": attributes.get("size", {}).get("value", "") if isinstance(attributes.get("size"), dict) else str(attributes.get("size", "")),
            "material": attributes.get("material", ""),
            "gender": attributes.get("gender", ""),
        }

    def _format_meta_catalog(
        self, identity: dict, attributes: dict[str, Any], taxonomy_path: list[str]
    ) -> dict:
        return {
            "retailer_id": identity.get("sku", ""),
            "name": identity.get("title", ""),
            "description": identity.get("description", ""),
            "url": f"https://example.com/products/{identity.get('sku', '')}",
            "image_url": (identity.get("images") or [""])[0] if identity.get("images") else "",
            "brand": attributes.get("brand", identity.get("brand", "")),
            "category": " > ".join(taxonomy_path),
            "availability": "in stock",
            "price": attributes.get("price", "0.00"),
            "currency": "USD",
            "condition": "new",
            "color": attributes.get("color", ""),
            "size": attributes.get("size", {}).get("value", "") if isinstance(attributes.get("size"), dict) else str(attributes.get("size", "")),
            "gender": attributes.get("gender", ""),
        }

    def _format_amazon_sp(
        self, identity: dict, attributes: dict[str, Any], taxonomy_path: list[str]
    ) -> dict:
        return {
            "sku": identity.get("sku", ""),
            "product-id": identity.get("gtin", ""),
            "product-id-type": "UPC" if identity.get("gtin") else "",
            "item-name": identity.get("title", ""),
            "item-description": identity.get("description", ""),
            "brand-name": attributes.get("brand", identity.get("brand", "")),
            "item-type": taxonomy_path[-1] if taxonomy_path else "",
            "color-name": attributes.get("color", ""),
            "size-name": attributes.get("size", {}).get("value", "") if isinstance(attributes.get("size"), dict) else str(attributes.get("size", "")),
            "material-type": attributes.get("material", ""),
            "department-name": attributes.get("gender", ""),
        }

    def _format_generic_json(
        self, identity: dict, attributes: dict[str, Any], taxonomy_path: list[str]
    ) -> dict:
        return {
            "identity": identity,
            "attributes": attributes,
            "taxonomy": {"path": taxonomy_path, "leaf": taxonomy_path[-1] if taxonomy_path else ""},
        }

    def _format_csv(
        self, identity: dict, attributes: dict[str, Any], taxonomy_path: list[str]
    ) -> dict:
        flat: dict[str, str] = {}
        for k, v in identity.items():
            flat[f"identity_{k}"] = json.dumps(v) if isinstance(v, (dict, list)) else str(v or "")
        for k, v in attributes.items():
            flat[f"attr_{k}"] = json.dumps(v) if isinstance(v, (dict, list)) else str(v or "")
        flat["taxonomy_path"] = " > ".join(taxonomy_path)
        return flat
