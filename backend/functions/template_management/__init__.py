from __future__ import annotations

import json
from http import HTTPStatus

import azure.functions as func

from ...shared import ErrorResponse, list_templates


def _build_response(body: dict, status: HTTPStatus) -> func.HttpResponse:
    return func.HttpResponse(
        body=json.dumps(body),
        status_code=status,
        mimetype="application/json",
    )


async def main(req: func.HttpRequest) -> func.HttpResponse:  # type: ignore[override]
    if req.method == "GET":
        templates = list_templates()
        return _build_response({"templates": templates}, HTTPStatus.OK)

    error = ErrorResponse(error="Method not allowed")
    return _build_response(error.model_dump(), HTTPStatus.METHOD_NOT_ALLOWED)
