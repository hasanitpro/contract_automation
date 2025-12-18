from __future__ import annotations

from http import HTTPStatus

import azure.functions as func


async def main(req: func.HttpRequest) -> func.HttpResponse:  # type: ignore[override]
    return func.HttpResponse(
        body="{\"status\": \"healthy\"}",
        status_code=HTTPStatus.OK,
        mimetype="application/json",
    )
