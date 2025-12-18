import asyncio
import json
import sys
from datetime import datetime
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
if str(ROOT) not in sys.path:
    sys.path.insert(0, str(ROOT))

from azure.core.exceptions import HttpResponseError

from backend.save_mask_a import main


VALID_PAYLOAD = {
    "rolle": "Mieter",
    "eigene_name": "Max Mustermann",
    "eigene_anschrift": "Musterstraße 1",
    "eigene_email": "max@example.com",
    "eigene_telefon": "+49123456789",
    "eigene_iban": "DE00123456789000000000",
    "gegenpartei_bekannt": "Ja",
    "gegenpartei_name": "Erika Musterfrau",
    "gegenpartei_anschrift": "Anderestr. 2",
    "gegenpartei_email": "erika@example.com",
    "gegenpartei_telefon": "987654321",
    "objektadresse": "Objektweg 3",
    "wohnungsart": "Wohnung",
    "wohnflaeche": "80",
    "bezugsfertig": "2024-01-01",
    "mietbeginn": "2024-02-01",
    "vertragsart": "Unbefristet",
    "grundmiete": "1200",
    "kaution": "3",
}


class DummyRequest:
    def __init__(self, body, headers=None):
        self._body = body
        self.headers = headers or {}

    def get_json(self):
        return self._body


class FakeTableClient:
    def __init__(self):
        self.entities = []

    def create_entity(self, entity):
        self.entities.append(entity)


class FakeTableService:
    def __init__(self, client):
        self.client = client
        self.created_tables = []

    def create_table_if_not_exists(self, table_name):
        self.created_tables.append(table_name)

    def get_table_client(self, table_name):
        assert table_name in self.created_tables
        return self.client


def test_successful_write(monkeypatch):
    table_client = FakeTableClient()
    table_service = FakeTableService(table_client)
    monkeypatch.setattr("backend.save_mask_a._get_table_client", lambda: table_service)

    headers = {
        "x-forwarded-for": "203.0.113.1",
        "user-agent": "pytest-agent",
    }
    request = DummyRequest({**VALID_PAYLOAD, "wohnung_bez": None}, headers=headers)

    response = asyncio.run(main(request))

    assert response.status_code == 201
    response_body = json.loads(response.get_body().decode())
    datetime.fromisoformat(response_body["payload"]["created_at"])
    datetime.fromisoformat(response_body["payload"]["updated_at"])
    assert response_body["payload"]["caller_metadata"]["source_ip"] == "203.0.113.1"
    assert table_client.entities, "Entity should be written"

    stored_payload = json.loads(table_client.entities[0]["payload"])
    assert stored_payload["created_at"] == response_body["payload"]["created_at"]
    assert stored_payload["caller_metadata"]["user_agent"] == "pytest-agent"


def test_rejects_unexpected_fields(monkeypatch):
    table_service = FakeTableService(FakeTableClient())
    monkeypatch.setattr("backend.save_mask_a._get_table_client", lambda: table_service)

    request = DummyRequest({**VALID_PAYLOAD, "unexpected": "value"})
    response = asyncio.run(main(request))

    assert response.status_code == 400
    assert b"Extra inputs are not permitted" in response.get_body()


def test_handles_storage_errors(monkeypatch):
    class FailingClient(FakeTableClient):
        def create_entity(self, entity):
            raise HttpResponseError(message="boom")

    failing_service = FakeTableService(FailingClient())
    monkeypatch.setattr("backend.save_mask_a._get_table_client", lambda: failing_service)

    request = DummyRequest(VALID_PAYLOAD)
    response = asyncio.run(main(request))

    assert response.status_code == 500
    assert b"Failed to persist payload" in response.get_body()
