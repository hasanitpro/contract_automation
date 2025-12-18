import io
import json
import logging
import os
import re
from datetime import datetime
from typing import Any, Dict, Iterable, Mapping, Tuple
from uuid import uuid4

import azure.functions as func
from azure.core.exceptions import AzureError, ResourceNotFoundError
from azure.storage.blob import BlobClient, BlobServiceClient
from docx import Document
from pydantic import BaseModel, Field, ValidationError


class GenerateContractRequest(BaseModel):
    maskA: Dict[str, Any] = Field(..., description="Data captured from Mask A")
    maskB: Dict[str, Any] = Field(..., description="Data captured from Mask B")
    templatePath: str = Field(..., min_length=1)
    placeholderMapping: Dict[str, str] = Field(
        ..., description="Mapping of template placeholders to mask fields"
    )

    class Config:
        extra = "allow"


class PlaceholderResolutionError(ValueError):
    pass


class TemplateProcessingError(RuntimeError):
    pass


def _error_response(message: str, status_code: int) -> func.HttpResponse:
    payload = {"message": message}
    return func.HttpResponse(
        json.dumps(payload, ensure_ascii=False),
        status_code=status_code,
        mimetype="application/json",
    )


def _resolve_placeholder_values(
    mapping: Mapping[str, str], mask_a: Mapping[str, Any], mask_b: Mapping[str, Any]
) -> Dict[str, str]:
    sources: Dict[str, Mapping[str, Any]] = {"maskA": mask_a, "maskB": mask_b}
    resolved: Dict[str, str] = {}

    for placeholder, source_path in mapping.items():
        if not isinstance(source_path, str) or not source_path:
            raise PlaceholderResolutionError(
                f"Placeholder '{placeholder}' is missing a valid source path."
            )

        value = None
        path_parts = source_path.split(".")

        if path_parts[0] in sources:
            current: Any = sources[path_parts[0]]
            for part in path_parts[1:]:
                if isinstance(current, Mapping) and part in current:
                    current = current[part]
                else:
                    raise PlaceholderResolutionError(
                        f"Placeholder '{placeholder}' could not be resolved from path '{source_path}'."
                    )
            value = current
        else:
            if source_path in mask_a:
                value = mask_a[source_path]
            elif source_path in mask_b:
                value = mask_b[source_path]
            else:
                raise PlaceholderResolutionError(
                    f"Placeholder '{placeholder}' could not be resolved from path '{source_path}'."
                )

        if value is None:
            raise PlaceholderResolutionError(
                f"Placeholder '{placeholder}' is mapped to an empty value."
            )

        resolved[placeholder] = str(value)

    return resolved


def _get_blob_client(
    connection_string: str, container_name: str, blob_name: str
) -> BlobClient:
    try:
        service_client = BlobServiceClient.from_connection_string(connection_string)
        return service_client.get_blob_client(container=container_name, blob=blob_name)
    except AzureError as exc:
        raise TemplateProcessingError("Failed to initialise Blob client.") from exc


def _load_template(template_path: str, connection_string: str, container: str) -> Tuple[str, bytes]:
    if os.path.exists(template_path):
        with open(template_path, "rb") as template_file:
            return os.path.splitext(template_path)[1].lower(), template_file.read()

    if not connection_string:
        raise TemplateProcessingError("Template storage connection is not configured.")

    blob_name = template_path.lstrip("/")
    container_name = container
    if "/" in blob_name:
        maybe_container, remainder = blob_name.split("/", 1)
        if remainder:
            container_name = maybe_container
            blob_name = remainder

    blob_client = _get_blob_client(connection_string, container_name, blob_name)

    try:
        template_bytes = blob_client.download_blob().readall()
    except ResourceNotFoundError as exc:
        raise TemplateProcessingError("Template not found in storage.") from exc
    except AzureError as exc:
        raise TemplateProcessingError("Failed to download template from storage.") from exc

    extension = os.path.splitext(template_path)[1].lower()
    return extension, template_bytes


def _replace_placeholders_in_text(content: str, placeholders: Mapping[str, str]) -> Tuple[str, Iterable[str]]:
    missing: list[str] = []
    replaced_text = content
    for key, value in placeholders.items():
        marker = f"[{key}]"
        if marker not in replaced_text:
            missing.append(key)
            continue
        replaced_text = replaced_text.replace(marker, value)
    return replaced_text, missing


def _apply_placeholders_to_runs(runs: Iterable[Any], placeholders: Mapping[str, str], used: set[str]) -> None:
    for run in runs:
        for key, value in placeholders.items():
            marker = f"[{key}]"
            if marker in run.text:
                run.text = run.text.replace(marker, value)
                used.add(key)


def _render_docx_template(template_bytes: bytes, placeholders: Mapping[str, str]) -> bytes:
    document = Document(io.BytesIO(template_bytes))
    used_placeholders: set[str] = set()

    for paragraph in document.paragraphs:
        _apply_placeholders_to_runs(paragraph.runs, placeholders, used_placeholders)

    for table in document.tables:
        for row in table.rows:
            for cell in row.cells:
                for paragraph in cell.paragraphs:
                    _apply_placeholders_to_runs(
                        paragraph.runs, placeholders, used_placeholders
                    )

    missing = set(placeholders.keys()) - used_placeholders
    if missing:
        raise PlaceholderResolutionError(
            "Missing placeholders in template: " + ", ".join(sorted(missing))
        )

    output = io.BytesIO()
    document.save(output)
    return output.getvalue()


def _render_html_template(html_bytes: bytes, placeholders: Mapping[str, str]) -> bytes:
    html_content = html_bytes.decode("utf-8", errors="ignore")
    replaced_content, missing = _replace_placeholders_in_text(html_content, placeholders)
    if missing:
        raise PlaceholderResolutionError(
            "Missing placeholders in template: " + ", ".join(sorted(missing))
        )

    text_content = re.sub(r"<[^>]+>", "", replaced_content)
    document = Document()
    for block in filter(None, (part.strip() for part in re.split(r"\n\s*\n", text_content))):
        document.add_paragraph(block)

    output = io.BytesIO()
    document.save(output)
    return output.getvalue()


def _upload_contract(
    contract_bytes: bytes, connection_string: str, container: str
) -> Tuple[str, str]:
    try:
        blob_client = _get_blob_client(
            connection_string, container, f"contract-{datetime.utcnow():%Y%m%d%H%M%S}-{uuid4()}.docx"
        )
        blob_client.upload_blob(contract_bytes, overwrite=True)
    except AzureError as exc:
        raise TemplateProcessingError("Failed to upload generated contract.") from exc

    sas_token = os.getenv("ContractsBlobSasToken", "").lstrip("?")
    download_url = blob_client.url
    if sas_token:
        download_url = f"{download_url}?{sas_token}"

    return blob_client.blob_name, download_url


async def main(req: func.HttpRequest) -> func.HttpResponse:
    try:
        body = req.get_json()
    except ValueError:
        return _error_response("Invalid JSON body.", 400)

    if not isinstance(body, dict):
        return _error_response("Request body must be a JSON object.", 400)

    try:
        payload = GenerateContractRequest(**body)
    except ValidationError as exc:
        logging.warning("Validation failed for contract request: %s", exc)
        return func.HttpResponse(
            exc.json(), status_code=400, mimetype="application/json"
        )

    template_connection = os.getenv("TemplateBlobConnection", "") or os.getenv(
        "ContractsBlobConnection", ""
    )
    template_container = os.getenv("TemplatesContainer", "templates")
    contracts_container = os.getenv("ContractsContainer", "contracts")
    contracts_connection = os.getenv("ContractsBlobConnection", "")

    try:
        placeholders = _resolve_placeholder_values(
            payload.placeholderMapping, payload.maskA, payload.maskB
        )
    except PlaceholderResolutionError as exc:
        return _error_response(str(exc), 400)

    try:
        extension, template_bytes = _load_template(
            payload.templatePath, template_connection, template_container
        )
    except TemplateProcessingError as exc:
        logging.exception("Template load failed: %s", exc)
        return _error_response(str(exc), 400)

    try:
        if extension == ".docx":
            contract_bytes = _render_docx_template(template_bytes, placeholders)
        else:
            contract_bytes = _render_html_template(template_bytes, placeholders)
    except PlaceholderResolutionError as exc:
        logging.warning("Placeholder processing failed: %s", exc)
        return _error_response(str(exc), 400)
    except Exception as exc:  # pylint: disable=broad-except
        logging.exception("Failed to render contract: %s", exc)
        return _error_response("Failed to render contract.", 500)

    if not contracts_connection:
        return _error_response("Contracts storage connection is not configured.", 500)

    try:
        _, download_url = _upload_contract(
            contract_bytes, contracts_connection, contracts_container
        )
    except TemplateProcessingError as exc:
        logging.exception("Contract upload failed: %s", exc)
        return _error_response(str(exc), 500)

    response_payload = {"downloadUrl": download_url}
    return func.HttpResponse(
        json.dumps(response_payload, ensure_ascii=False),
        status_code=200,
        mimetype="application/json",
    )
