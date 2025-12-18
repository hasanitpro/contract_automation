from __future__ import annotations

import json
import os
from http import HTTPStatus
from uuid import uuid4

import azure.functions as func
from azure.data.tables import UpdateMode

from ..shared import (
    ErrorResponse,
    SaveMaskAResponse,
    get_table_client,
    parse_mask_a_request,
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
        mask_request = parse_mask_a_request(payload)
    except ValueError as exc:
        error = ErrorResponse(error="Invalid request", details=str(exc))
        return func.HttpResponse(
            body=error.model_dump_json(),
            status_code=HTTPStatus.BAD_REQUEST,
            mimetype="application/json",
        )

    table_name = os.getenv("MASKA_TABLE", "MaskAInput")
    try:
        table_client = get_table_client(table_name)
    except Exception as exc:  # noqa: BLE001
        error = ErrorResponse(error="Table client initialization failed", details=str(exc))
        return func.HttpResponse(
            body=error.model_dump_json(),
            status_code=HTTPStatus.INTERNAL_SERVER_ERROR,
            mimetype="application/json",
        )

    row_key = str(uuid4())
    entity = {
        "PartitionKey": "MaskA",
        "RowKey": row_key,
        "payload": json.dumps(mask_request.model_dump()),
        "rolle": mask_request.rolle,
        "eigeneName": mask_request.eigeneName,
        "eigeneEmail": str(mask_request.eigeneEmail),
        "eigeneTelefon": mask_request.eigeneTelefon,
    }

    try:
        table_client.upsert_entity(mode=UpdateMode.REPLACE, entity=entity)
    except Exception as exc:  # noqa: BLE001
        error = ErrorResponse(error="Failed to persist Mask A", details=str(exc))
        return func.HttpResponse(
            body=error.model_dump_json(),
            status_code=HTTPStatus.INTERNAL_SERVER_ERROR,
            mimetype="application/json",
        )

    response = SaveMaskAResponse(id=row_key, table=table_name)
    return func.HttpResponse(
        body=response.model_dump_json(),
        status_code=HTTPStatus.CREATED,
        mimetype="application/json",
    )
