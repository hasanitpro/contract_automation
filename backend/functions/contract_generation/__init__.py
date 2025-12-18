from __future__ import annotations

from http import HTTPStatus

import azure.functions as func

from ...shared import (
    ContractResponse,
    ErrorResponse,
    parse_contract_request,
    render_contract,
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
        request_model = parse_contract_request(payload)
    except ValueError as exc:
        error = ErrorResponse(error="Invalid request", details=str(exc))
        return func.HttpResponse(
            body=error.model_dump_json(),
            status_code=HTTPStatus.BAD_REQUEST,
            mimetype="application/json",
        )

    try:
        rendered = render_contract(request_model)
    except Exception as exc:  # noqa: BLE001
        error = ErrorResponse(error="Template rendering failed", details=str(exc))
        return func.HttpResponse(
            body=error.model_dump_json(),
            status_code=HTTPStatus.INTERNAL_SERVER_ERROR,
            mimetype="application/json",
        )

    response = ContractResponse(
        document=rendered,
        template_id=request_model.template_id,
        parties=request_model.parties,
    )
    return func.HttpResponse(
        body=response.model_dump_json(),
        status_code=HTTPStatus.OK,
        mimetype="application/json",
    )
