import asyncio
import json
import sys
from pathlib import Path

import azure.functions as func
import pytest

ROOT = Path(__file__).resolve().parents[1]
if str(ROOT) not in sys.path:
    sys.path.insert(0, str(ROOT))

import generate_contract as gc  # noqa: E402


def _build_request(body: dict) -> func.HttpRequest:
    return func.HttpRequest(
        method="POST",
        url="/api/generate_contract",
        headers={},
        params={},
        body=json.dumps(body).encode(),
    )


def test_template_path_required_when_no_default(monkeypatch):
    monkeypatch.delenv("TemplateBlobPath", raising=False)
    body = {
        "maskA": {"name": "Alice"},
        "maskB": {},
        "placeholderMapping": {"Name": "maskA.name"},
    }

    request = _build_request(body)
    response = asyncio.run(gc.main(request))

    assert response.status_code == 400
    assert "Template path must be provided" in response.get_body().decode()


def test_default_template_path_used(monkeypatch):
    default_path = "templates/from-env.docx"
    monkeypatch.setenv("TemplateBlobPath", default_path)
    monkeypatch.setenv("TemplateBlobConnection", "UseDevelopmentStorage=true")
    monkeypatch.setenv("ContractsBlobConnection", "UseDevelopmentStorage=true")

    captured = {}

    def fake_load(template_path, connection_string, container):
        captured["path"] = template_path
        captured["connection"] = connection_string
        captured["container"] = container
        return ".docx", b"template"

    monkeypatch.setattr(gc, "_load_template", fake_load)
    monkeypatch.setattr(gc, "_render_docx_template", lambda t, p: b"contract-bytes")
    monkeypatch.setattr(
        gc, "_upload_contract", lambda c, conn, cont: ("contract.docx", "http://test")
    )

    body = {
        "maskA": {"name": "Alice"},
        "maskB": {},
        "templatePath": " ",
        "placeholderMapping": {"Name": "maskA.name"},
    }

    request = _build_request(body)
    response = asyncio.run(gc.main(request))

    assert response.status_code == 200
    assert captured["path"] == default_path
    assert response.get_body()
