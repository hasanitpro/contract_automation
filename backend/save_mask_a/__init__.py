import json
import logging
import os
from datetime import UTC, datetime
from typing import Any, Dict, List, Optional
from uuid import uuid4

import azure.functions as func
from azure.core.exceptions import HttpResponseError
from azure.data.tables import TableServiceClient
from pydantic import BaseModel, ConfigDict, Field, ValidationError


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
    gegenpartei_email: str = Field(..., min_length=1)
    gegenpartei_telefon: str = Field(..., min_length=1)
    objektadresse: str = Field(..., min_length=1)
    wohnungsart: str = Field(..., min_length=1)
    wohnflaeche: str = Field(..., min_length=1)
    bezugsfertig: str = Field(..., min_length=1)
    mietbeginn: str = Field(..., min_length=1)
    vertragsart: str = Field(..., min_length=1)
    grundmiete: str = Field(..., min_length=1)
    kaution: str = Field(..., min_length=1)

    wird_vertreten: Optional[str] = None
    vertreten_durch: Optional[str] = None
    vollmacht_vorhanden: Optional[str] = None
    ust_id: Optional[str] = None
    steuernummer: Optional[str] = None
    wohnung_bez: Optional[str] = None
    aussenbereich: List[str] = Field(default_factory=list)
    nebenraeume: List[str] = Field(default_factory=list)
    stellplatz: Optional[str] = None
    stellplatz_nr: Optional[str] = None
    ausstattung: Optional[Any] = None
    weg: Optional[str] = None
    mea: Optional[str] = None
    grundriss_datei: Optional[str] = None
    weg_dokument: Optional[str] = None
    zustand: Optional[str] = None
    uebergabeprotokoll: Optional[Any] = None
    laerm: Optional[str] = None
    schluessel_arten: List[str] = Field(default_factory=list)
    schluessel_anzahl: Optional[str] = None
    mietende: Optional[str] = None
    befristungsgrund: Optional[str] = None
    befristungsgrund_text: Optional[str] = None
    zuschlag_moeblierung: Optional[str] = None
    zuschlag_teilgewerbe: Optional[str] = None
    zuschlag_unterverm: Optional[str] = None
    vz_heizung: Optional[str] = None
    vz_bk: Optional[str] = None
    stellplatzmiete: Optional[str] = None
    zahlungsart: Optional[str] = None
    zahler_iban: Optional[str] = None
    bk_modell: Optional[str] = None
    abrz: Optional[str] = None
    bk_weg: Optional[str] = None
    nutzung: Optional[str] = None
    unterverm: Optional[str] = None
    tiere: Optional[str] = None
    tiere_details: Optional[str] = None
    kaution_zahlweise: Optional[str] = None
    kautionsform: Optional[str] = None
    uebergabedatum: Optional[str] = None
    timestamp: Optional[str] = None

    # Legacy aliases accepted for backward compatibility.
    ustId: Optional[str] = None
    gegenparteiBekannt: Optional[str] = None
    gegenparteiName: Optional[str] = None
    gegenparteiAnschrift: Optional[str] = None
    gegenparteiEmail: Optional[str] = None
    gegenparteiTelefon: Optional[str] = None
    stellplatzNummer: Optional[str] = None
    mitvermieteteAusstattung: Optional[Any] = None
    miteigentumsanteile: Optional[str] = None
    grundrissDatei: Optional[str] = None
    wegDokument: Optional[str] = None
    zuschlagMoebliert: Optional[str] = None
    zuschlagGewerbe: Optional[str] = None
    zuschlagUntervermietung: Optional[str] = None
    zahlerIban: Optional[str] = None
    abrechnungszeitraum: Optional[str] = None
    bkweg: Optional[str] = None
    haustiere: Optional[str] = None
    kautionZahlweise: Optional[str] = None
    vollmacht: Optional[str] = None

    model_config = ConfigDict(extra="forbid")


def _merge_legacy_fields(payload: Dict[str, Any]) -> Dict[str, Any]:
    legacy_to_canonical = {
        "ustId": "ust_id",
        "gegenparteiBekannt": "gegenpartei_bekannt",
        "gegenparteiName": "gegenpartei_name",
        "gegenparteiAnschrift": "gegenpartei_anschrift",
        "gegenparteiEmail": "gegenpartei_email",
        "gegenparteiTelefon": "gegenpartei_telefon",
        "stellplatzNummer": "stellplatz_nr",
        "mitvermieteteAusstattung": "ausstattung",
        "miteigentumsanteile": "mea",
        "grundrissDatei": "grundriss_datei",
        "wegDokument": "weg_dokument",
        "zuschlagMoebliert": "zuschlag_moeblierung",
        "zuschlagGewerbe": "zuschlag_teilgewerbe",
        "zuschlagUntervermietung": "zuschlag_unterverm",
        "zahlerIban": "zahler_iban",
        "abrechnungszeitraum": "abrz",
        "bkweg": "bk_weg",
        "haustiere": "tiere",
        "kautionZahlweise": "kaution_zahlweise",
        "vollmacht": "vollmacht_vorhanden",
    }

    merged = dict(payload)
    for legacy_key, canonical_key in legacy_to_canonical.items():
        if canonical_key not in merged and legacy_key in merged:
            merged[canonical_key] = merged[legacy_key]

    return merged


def _collect_caller_metadata(req: func.HttpRequest) -> Dict[str, str]:
    caller_metadata = {
        "source_ip": req.headers.get("x-forwarded-for")
        or req.headers.get("x-client-ip")
        or req.headers.get("x-real-ip"),
        "user_agent": req.headers.get("user-agent"),
    }

    return {key: value for key, value in caller_metadata.items() if value}


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

    merged_body = _merge_legacy_fields(body)

    try:
        payload = MaskAClientPayload(**merged_body)
    except ValidationError as exc:
        logging.warning("Validation failed for Mask A payload: %s", exc)
        return func.HttpResponse(
            exc.json(), status_code=400, mimetype="application/json"
        )

    sanitized_payload: Dict[str, Any] = payload.model_dump(exclude_none=True)
    caller_metadata = _collect_caller_metadata(req)
    now = datetime.now(UTC).isoformat()

    enriched_payload = {
        **sanitized_payload,
        "created_at": now,
        "updated_at": now,
        "caller_metadata": caller_metadata or None,
    }

    partition_key = datetime.now(UTC).strftime("%Y-%m-%d")
    row_key = str(uuid4())

    try:
        table_service = _get_table_client()
        table_service.create_table_if_not_exists(table_name="MaskAInput")
        table_client = table_service.get_table_client(table_name="MaskAInput")

        entity = {
            "PartitionKey": partition_key,
            "RowKey": row_key,
            "payload": json.dumps(enriched_payload, ensure_ascii=False),
            "created_at": now,
            "updated_at": now,
        }

        if caller_metadata.get("source_ip"):
            entity["source_ip"] = caller_metadata["source_ip"]
        if caller_metadata.get("user_agent"):
            entity["user_agent"] = caller_metadata["user_agent"]

        table_client.create_entity(entity)
    except (HttpResponseError, RuntimeError) as exc:
        logging.exception("Failed to store Mask A payload: %s", exc)
        return func.HttpResponse(
            "Failed to persist payload.", status_code=500
        )

    response_body = {
        "status": "stored",
        "partitionKey": partition_key,
        "rowKey": row_key,
        "payload": enriched_payload,
    }

    return func.HttpResponse(
        json.dumps(response_body, ensure_ascii=False),
        status_code=201,
        mimetype="application/json",
    )
