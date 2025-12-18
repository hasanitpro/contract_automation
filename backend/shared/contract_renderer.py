from __future__ import annotations

import base64
import os
from pathlib import Path
from typing import Any, Dict, List

from docxtpl import DocxTemplate

from .models import GenerateContractRequest


TEMPLATES_DIR = Path(__file__).parent.parent / "templates"
BASE_TEMPLATE_NAME = "base_contract.docx"
BASE_TEMPLATE_FALLBACK = TEMPLATES_DIR / "base_contract.docx.b64"


def ensure_base_contract_template() -> Path:
    template_path = TEMPLATES_DIR / BASE_TEMPLATE_NAME
    if template_path.exists():
        return template_path

    if not BASE_TEMPLATE_FALLBACK.exists():
        raise FileNotFoundError(
            "Contract template missing and fallback .b64 not found at "
            f"{BASE_TEMPLATE_FALLBACK}"
        )

    TEMPLATES_DIR.mkdir(parents=True, exist_ok=True)
    decoded = base64.b64decode(BASE_TEMPLATE_FALLBACK.read_text())
    template_path.write_bytes(decoded)
    return template_path


def build_contract_context(request: GenerateContractRequest) -> Dict[str, Any]:
    mask_a = request.maskA.model_dump()
    mask_b = request.maskB.model_dump()

    rolle = mask_a.get("rolle", "").lower()
    landlord = {
        "name": mask_a.get("eigeneName", ""),
        "email": mask_a.get("eigeneEmail", ""),
        "phone": mask_a.get("eigeneTelefon", ""),
    }
    tenant = {
        "name": mask_b.get("mieterName") or mask_b.get("tenantName", ""),
        "email": mask_b.get("mieterEmail") or mask_b.get("tenantEmail", ""),
        "phone": mask_b.get("mieterTelefon") or mask_b.get("tenantPhone", ""),
    }

    if "vermieterName" in mask_b:
        landlord["name"] = mask_b.get("vermieterName") or landlord["name"]
    if "vermieterEmail" in mask_b:
        landlord["email"] = mask_b.get("vermieterEmail") or landlord["email"]
    if "vermieterTelefon" in mask_b:
        landlord["phone"] = mask_b.get("vermieterTelefon") or landlord["phone"]

    if rolle == "mieter" and tenant["name"] == "":
        tenant = landlord.copy()
    elif rolle == "vermieter" and landlord["name"] == "":
        landlord = tenant.copy()

    rent_details = {
        "monthly_rent": mask_b.get("kaltmiete")
        or mask_b.get("miete")
        or mask_b.get("rent"),
        "deposit": mask_b.get("kaution") or mask_b.get("deposit"),
        "utilities": mask_b.get("nebenkosten") or mask_b.get("utilities"),
        "payment_due": mask_b.get("zahlungsfaelligkeit")
        or mask_b.get("paymentDue"),
    }

    apartment_details = {
        "address": mask_b.get("adresse")
        or mask_b.get("apartmentAddress")
        or mask_b.get("address"),
        "size": mask_b.get("wohnflaeche") or mask_b.get("size"),
        "rooms": mask_b.get("anzahlZimmer") or mask_b.get("rooms"),
        "build_year": mask_b.get("baujahr") or mask_b.get("buildYear"),
    }

    clauses: List[str] = []
    for key in ("klauseln", "clauses", "juristischeKlauseln"):
        value = mask_b.get(key)
        if isinstance(value, list):
            clauses.extend([str(item) for item in value])
        elif isinstance(value, str):
            clauses.append(value)

    context: Dict[str, Any] = {
        "landlord": landlord,
        "tenant": tenant,
        "rent": rent_details,
        "apartment": apartment_details,
        "clauses": clauses,
        "maskA": mask_a,
        "maskB": mask_b,
    }

    return context


def render_contract_to_docx(context: Dict[str, Any], output_path: os.PathLike[str] | str) -> None:
    template_path = ensure_base_contract_template()
    doc = DocxTemplate(template_path)
    doc.render(context)
    doc.save(output_path)
