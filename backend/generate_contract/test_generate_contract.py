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


def test_missing_template_container_returns_specific_message(monkeypatch):
    class FakeContainerClient:
        def __init__(self):
            self._exists_calls = 0

        def exists(self):
            self._exists_calls += 1
            return False

    class FakeServiceClient:
        def __init__(self):
            self.captured_container = None

        def get_container_client(self, container_name):
            self.captured_container = container_name
            return FakeContainerClient()

    monkeypatch.setenv("TemplateBlobConnection", "UseDevelopmentStorage=true")
    monkeypatch.setenv("ContractsBlobConnection", "UseDevelopmentStorage=true")
    monkeypatch.setenv("TemplateBlobPath", "")

    monkeypatch.setattr(
        gc.BlobServiceClient, "from_connection_string", lambda conn: FakeServiceClient()
    )

    with pytest.raises(gc.TemplateProcessingError) as excinfo:
        gc._load_template("templates/template.docx", "UseDevelopmentStorage=true", "templates")

    message = str(excinfo.value)
    assert "container 'templates' not found" in message
    assert "templates/template.docx" in message
    assert "environment values" in message


def test_missing_template_blob_returns_specific_message(monkeypatch):
    class FakeBlobClient:
        def __init__(self, blob_name):
            self.blob_name = blob_name

        def exists(self):
            return False

        def download_blob(self):
            raise AssertionError("download_blob should not be called when blob is missing")

    class FakeContainerClient:
        def __init__(self, blob_name):
            self.blob_name = blob_name

        def exists(self):
            return True

        def get_blob_client(self, blob_name):
            assert blob_name == self.blob_name
            return FakeBlobClient(blob_name)

    class FakeServiceClient:
        def __init__(self, blob_name):
            self.blob_name = blob_name

        def get_container_client(self, container_name):
            self.container_name = container_name
            return FakeContainerClient(self.blob_name)

    monkeypatch.setattr(
        gc.BlobServiceClient,
        "from_connection_string",
        lambda conn: FakeServiceClient("template.docx"),
    )

    with pytest.raises(gc.TemplateProcessingError) as excinfo:
        gc._load_template("templates/template.docx", "UseDevelopmentStorage=true", "templates")

    message = str(excinfo.value)
    assert "Template blob 'template.docx'" in message
    assert "container 'templates'" in message
    assert "environment values" in message


def test_bad_connection_returns_specific_message(monkeypatch):
    class FakeAzureError(gc.AzureError):
        pass

    def bad_connection_string(_conn):
        raise FakeAzureError("bad connection")

    monkeypatch.setattr(
        gc.BlobServiceClient, "from_connection_string", bad_connection_string
    )

    with pytest.raises(gc.TemplateProcessingError) as excinfo:
        gc._load_template("templates/template.docx", "UseDevelopmentStorage=true", "templates")

    message = str(excinfo.value)
    assert "Failed to initialise template storage connection" in message
    assert "templates/template.docx" in message
    assert "environment values" in message
