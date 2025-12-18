import json
import logging
import os
from datetime import datetime
from typing import Any, Dict
from uuid import uuid4

import azure.functions as func
from azure.core.exceptions import HttpResponseError
from azure.data.tables import TableServiceClient
from pydantic import BaseModel, Field, ValidationError


class MaskAClientPayload(BaseModel):
    rolle: str = Field(..., min_length=1)
    eigene_name: str = Field(..., min_length=1)
    eigene_anschrift: str = Field(..., min_length=1)
    eigene_email: str = Field(..., min_length=1)
    eigene_telefon: str = Field(..., min_length=1)
    eigene_iban: str = Field(..., min_length=1)
    gegenpartei_bekannt: str = Field(..., min_length=1)
    gegenpartei_name: str = Field(..., min_length=1)
    gegenpartei_anschrift: str = Field(..., min_length=1)
    objektadresse: str = Field(..., min_length=1)
    wohnungsart: str = Field(..., min_length=1)
    wohnflaeche: str = Field(..., min_length=1)
    bezugsfertig: str = Field(..., min_length=1)
    mietbeginn: str = Field(..., min_length=1)
    vertragsart: str = Field(..., min_length=1)
    grundmiete: str = Field(..., min_length=1)
    kaution: str = Field(..., min_length=1)
    kaution_zahlweise: str = Field(..., min_length=1)

    class Config:
        extra = "allow"


def _get_table_client() -> TableServiceClient:
    connection_string = os.getenv("MaskAInput")
    if not connection_string:
        raise RuntimeError("MaskAInput connection string is not configured.")

    return TableServiceClient.from_connection_string(connection_string)


async def main(req: func.HttpRequest) -> func.HttpResponse:
    try:
        body = req.get_json()
    except ValueError:
        return func.HttpResponse("Invalid JSON body.", status_code=400)

    if not isinstance(body, dict):
        return func.HttpResponse(
            "Request body must be a JSON object.", status_code=400
        )

    try:
        payload = MaskAClientPayload(**body)
    except ValidationError as exc:
        logging.warning("Validation failed for Mask A payload: %s", exc)
        return func.HttpResponse(
            exc.json(), status_code=400, mimetype="application/json"
        )

    sanitized_payload: Dict[str, Any] = payload.dict(exclude_none=True)

    partition_key = datetime.utcnow().strftime("%Y-%m-%d")
    row_key = str(uuid4())

    try:
        table_service = _get_table_client()
        table_service.create_table_if_not_exists(table_name="MaskAInput")
        table_client = table_service.get_table_client(table_name="MaskAInput")

        table_client.create_entity(
            {
                "PartitionKey": partition_key,
                "RowKey": row_key,
                "payload": json.dumps(sanitized_payload, ensure_ascii=False),
            }
        )
    except (HttpResponseError, RuntimeError) as exc:
        logging.exception("Failed to store Mask A payload: %s", exc)
        return func.HttpResponse(
            "Failed to persist payload.", status_code=500
        )

    response_body = {
        "status": "stored",
        "partitionKey": partition_key,
        "rowKey": row_key,
        "payload": sanitized_payload,
    }

    return func.HttpResponse(
        json.dumps(response_body, ensure_ascii=False),
        status_code=201,
        mimetype="application/json",
    )
