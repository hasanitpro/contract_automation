import io
import json
import logging
import os
import re
from datetime import datetime
from typing import Any, Dict, Iterable, Optional, Tuple
from uuid import uuid4

import azure.functions as func
from azure.core.exceptions import AzureError, ResourceNotFoundError
from azure.storage.blob import BlobClient, BlobServiceClient
from docx import Document
from pydantic import BaseModel, Field, ValidationError

from domain.contract_context import build_contract_context, ContractContextError


# ============================================================
# Storage Resolution (CRITICAL FIX)
# ============================================================

def _get_storage_connection() -> str:
    """
    Resolve storage connection string reliably.
    Empty env vars are ignored.
    """

    def clean(value: Optional[str]) -> Optional[str]:
        if value and value.strip():
            return value.strip()
        return None

    # 1. Explicit contract storage
    conn = clean(os.getenv("ContractsBlobConnection"))
    if conn:
        return conn

    # 2. Azure Functions default
    conn = clean(os.getenv("AzureWebJobsStorage"))
    if conn:
        return conn

    # 3. Local Azurite fallback
    return "UseDevelopmentStorage=true"


# ============================================================
# Request Model
# ============================================================

class GenerateContractRequest(BaseModel):
    maskA: Dict[str, Any]
    maskB: Dict[str, Any]
    templatePath: Optional[str] = None

    class Config:
        extra = "forbid"


# ============================================================
# Errors
# ============================================================

class TemplateProcessingError(RuntimeError):
    pass


# ============================================================
# Helpers
# ============================================================

def _error_response(message: str, status_code: int) -> func.HttpResponse:
    return func.HttpResponse(
        json.dumps({"message": message}, ensure_ascii=False),
        status_code=status_code,
        mimetype="application/json",
    )


def _load_template(
    template_path: str, connection_string: str, container: str
) -> Tuple[str, bytes]:
    # Local file
    if os.path.exists(template_path):
        with open(template_path, "rb") as f:
            return os.path.splitext(template_path)[1].lower(), f.read()

    # Blob
    if not connection_string:
        raise TemplateProcessingError("Template storage connection not configured.")

    blob_name = template_path.lstrip("/")
    container_name = container

    if "/" in blob_name:
        maybe_container, remainder = blob_name.split("/", 1)
        if remainder:
            container_name = maybe_container
            blob_name = remainder

    try:
        service = BlobServiceClient.from_connection_string(connection_string)
        container_client = service.get_container_client(container_name)

        if not container_client.exists():
            raise TemplateProcessingError(f"Template container '{container_name}' not found.")

        blob_client = container_client.get_blob_client(blob_name)

        if not blob_client.exists():
            raise TemplateProcessingError(f"Template blob '{blob_name}' not found.")

        data = blob_client.download_blob().readall()

    except AzureError as exc:
        raise TemplateProcessingError("Failed to load template.") from exc

    return os.path.splitext(template_path)[1].lower(), data


def _apply_placeholders_to_runs(
    runs: Iterable[Any], placeholders: Dict[str, str], used: set[str]
) -> None:
    for run in runs:
        for key, value in placeholders.items():
            marker = f"[{key}]"
            if marker in run.text:
                run.text = run.text.replace(marker, value)
                used.add(key)


def _render_docx_template(template_bytes: bytes, context: Dict[str, str]) -> bytes:
    document = Document(io.BytesIO(template_bytes))
    used: set[str] = set()

    for p in document.paragraphs:
        _apply_placeholders_to_runs(p.runs, context, used)

    for table in document.tables:
        for row in table.rows:
            for cell in row.cells:
                for p in cell.paragraphs:
                    _apply_placeholders_to_runs(p.runs, context, used)

    missing = set(context.keys()) - used
    if missing:
        raise TemplateProcessingError(
            "Unreplaced placeholders in template: " + ", ".join(sorted(missing))
        )

    out = io.BytesIO()
    document.save(out)
    return out.getvalue()


def _render_html_template(html_bytes: bytes, context: Dict[str, str]) -> bytes:
    html = html_bytes.decode("utf-8", errors="ignore")

    for key, value in context.items():
        html = html.replace(f"[{key}]", value)

    unresolved = re.findall(r"\[[A-Z0-9_]+\]", html)
    if unresolved:
        raise TemplateProcessingError(
            "Unreplaced placeholders in template: " + ", ".join(sorted(set(unresolved)))
        )

    text = re.sub(r"<[^>]+>", "", html)

    document = Document()
    for block in filter(None, (b.strip() for b in text.split("\n\n"))):
        document.add_paragraph(block)

    out = io.BytesIO()
    document.save(out)
    return out.getvalue()


def _upload_contract(contract_bytes: bytes, container: str) -> Tuple[str, str]:
    try:
        conn = _get_storage_connection()
        service = BlobServiceClient.from_connection_string(conn)
        container_client = service.get_container_client(container)

        if not container_client.exists():
            container_client.create_container()

        blob_name = f"contract-{datetime.utcnow():%Y%m%d%H%M%S}-{uuid4()}.docx"
        blob_client = container_client.get_blob_client(blob_name)

        blob_client.upload_blob(
            contract_bytes,
            overwrite=True,
            content_type="application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        )

        return blob_name, blob_client.url

    except AzureError as exc:
        logging.exception("Blob upload failed")
        raise TemplateProcessingError(f"Failed to upload generated contract: {exc}") from exc


# ============================================================
# Azure Function Entry Point
# ============================================================

async def main(req: func.HttpRequest) -> func.HttpResponse:
    try:
        body = req.get_json()
    except ValueError:
        return _error_response("Invalid JSON body.", 400)

    try:
        payload = GenerateContractRequest(**body)
    except ValidationError as exc:
        return func.HttpResponse(exc.json(), status_code=400, mimetype="application/json")

    # Build contract context
    try:
        context = build_contract_context(payload.maskA, payload.maskB)
    except ContractContextError as exc:
        return _error_response(str(exc), 400)

    # Load template
    template_path = payload.templatePath or os.getenv("TemplateBlobPath", "").strip()
    if not template_path:
        return _error_response("Template path not provided.", 400)

    template_connection = (
        os.getenv("TemplateBlobConnection")
        or os.getenv("ContractsBlobConnection")
        or os.getenv("AzureWebJobsStorage")
    )
    template_container = os.getenv("TemplatesContainer", "templates")

    try:
        extension, template_bytes = _load_template(
            template_path, template_connection, template_container
        )
    except TemplateProcessingError as exc:
        return _error_response(str(exc), 400)

    # Render contract
    try:
        if extension == ".docx":
            contract_bytes = _render_docx_template(template_bytes, context)
        else:
            contract_bytes = _render_html_template(template_bytes, context)
    except TemplateProcessingError as exc:
        return _error_response(str(exc), 400)

    # Upload
    contracts_container = os.getenv("ContractsContainer", "contracts")

    try:
        _, download_url = _upload_contract(contract_bytes, contracts_container)
    except TemplateProcessingError as exc:
        return _error_response(str(exc), 500)

    return func.HttpResponse(
        json.dumps({"downloadUrl": download_url}, ensure_ascii=False),
        status_code=200,
        mimetype="application/json",
    )
