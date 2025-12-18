import json
import logging
from typing import Any, Dict

import azure.functions as func
from pydantic import BaseModel, ValidationError


class MaskARecord(BaseModel):
    id: str
    payload: Dict[str, Any]


async def main(req: func.HttpRequest) -> func.HttpResponse:
    try:
        body = req.get_json()
    except ValueError:
        return func.HttpResponse("Invalid JSON body.", status_code=400)

    try:
        record = MaskARecord(**body)
    except ValidationError as exc:
        return func.HttpResponse(
            exc.json(), status_code=400, mimetype="application/json"
        )

    logging.info("Received mask A record: %s", record.id)
    return func.HttpResponse(
        json.dumps({"status": "received", "id": record.id}),
        status_code=200,
        mimetype="application/json",
    )
