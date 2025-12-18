from __future__ import annotations

import os
import tempfile
from http import HTTPStatus
from uuid import uuid4

import azure.functions as func
from azure.storage.blob import ContentSettings

from shared import (
    ErrorResponse,
    GenerateContractResponse,
    build_contract_context,
    get_blob_container_client,
    parse_generate_contract_request,
    render_contract_to_docx,
)


async def main(req: func.HttpRequest) -> func.HttpResponse:  # type: ignore[override]
    try:
        payload = req.get_json()
    except ValueError:
        error = ErrorResponse(error="Invalid JSON payload")
        return func.HttpResponse(
            body=error.model_dump_json(),
            status_code=HTTPStatus.BAD_REQUEST,
            mimetype="application/json",
        )

    try:
        request_model = parse_generate_contract_request(payload)
    except ValueError as exc:
        error = ErrorResponse(error="Invalid request", details=str(exc))
        return func.HttpResponse(
            body=error.model_dump_json(),
            status_code=HTTPStatus.BAD_REQUEST,
            mimetype="application/json",
        )

    try:
        context = build_contract_context(request_model)
    except Exception as exc:  # noqa: BLE001
        error = ErrorResponse(error="Failed to build contract context", details=str(exc))
        return func.HttpResponse(
            body=error.model_dump_json(),
            status_code=HTTPStatus.INTERNAL_SERVER_ERROR,
            mimetype="application/json",
        )

    blob_container = os.getenv("CONTRACTS_CONTAINER", "contracts")
    try:
        container_client = get_blob_container_client(blob_container)
    except Exception as exc:  # noqa: BLE001
        error = ErrorResponse(error="Blob client initialization failed", details=str(exc))
        return func.HttpResponse(
            body=error.model_dump_json(),
            status_code=HTTPStatus.INTERNAL_SERVER_ERROR,
            mimetype="application/json",
        )

    blob_name = f"mietvertrag_{uuid4()}.docx"
    with tempfile.NamedTemporaryFile(suffix=".docx") as temp_file:
        try:
            render_contract_to_docx(context, temp_file.name)
        except Exception as exc:  # noqa: BLE001
            error = ErrorResponse(error="Template rendering failed", details=str(exc))
            return func.HttpResponse(
                body=error.model_dump_json(),
                status_code=HTTPStatus.INTERNAL_SERVER_ERROR,
                mimetype="application/json",
            )

        temp_file.seek(0)
        blob_client = container_client.get_blob_client(blob_name)
        try:
            blob_client.upload_blob(
                temp_file.read(),
                overwrite=True,
                content_settings=ContentSettings(
                    content_type="application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                ),
            )
        except Exception as exc:  # noqa: BLE001
            error = ErrorResponse(error="Failed to upload contract", details=str(exc))
            return func.HttpResponse(
                body=error.model_dump_json(),
                status_code=HTTPStatus.INTERNAL_SERVER_ERROR,
                mimetype="application/json",
            )

    response = GenerateContractResponse(blobName=blob_name, blobUrl=blob_client.url)
    return func.HttpResponse(
        body=response.model_dump_json(),
        status_code=HTTPStatus.OK,
        mimetype="application/json",
    )
