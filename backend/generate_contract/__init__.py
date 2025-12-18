import json
import logging
import os
from typing import Any, Dict

import azure.functions as func
from pydantic import BaseModel, ValidationError


class ContractRequest(BaseModel):
    contract_id: str
    template_values: Dict[str, Any] = {}


async def main(req: func.HttpRequest) -> func.HttpResponse:
    try:
        body = req.get_json()
    except ValueError:
        return func.HttpResponse("Invalid JSON body.", status_code=400)

    try:
        contract_request = ContractRequest(**body)
    except ValidationError as exc:
        return func.HttpResponse(
            exc.json(), status_code=400, mimetype="application/json"
        )

    logging.info("Generating contract %s", contract_request.contract_id)

    template_path = os.getenv("TemplateBlobPath", "")
    contracts_container = os.getenv("ContractsContainer", "contracts")
    blob_connection = os.getenv("ContractsBlobConnection", "")

    response_payload = {
        "status": "accepted",
        "contractId": contract_request.contract_id,
        "templatePath": template_path,
        "contractsContainer": contracts_container,
        "blobConnection": bool(blob_connection),
    }

    return func.HttpResponse(
        json.dumps(response_payload),
        status_code=200,
        mimetype="application/json",
    )
