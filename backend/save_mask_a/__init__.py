import json
import logging
import os
import re
from datetime import UTC, datetime
from typing import Annotated, Any, Dict, List, Optional
from uuid import uuid4

import azure.functions as func
from azure.core.exceptions import HttpResponseError
from azure.data.tables import TableServiceClient
from pydantic import (
    BaseModel,
    ConfigDict,
    EmailStr,
    Field,
    StringConstraints,
    ValidationError,
    field_validator,
    model_validator,
)

EMAIL_FIELD = Annotated[str, StringConstraints(min_length=1)]
REQUIRED_TEXT = Annotated[str, StringConstraints(min_length=1)]
OPTIONAL_TEXT = Annotated[Optional[str], StringConstraints(strip_whitespace=True)]


def _normalize_optional_text(value: Optional[str]) -> Optional[str]:
    if value is None:
        return None
    if isinstance(value, str):
        stripped = value.strip()
        return stripped or None
    return value


def _has_valid_digits(value: str, minimum: int) -> bool:
    return sum(ch.isdigit() for ch in value) >= minimum


class MaskAClientPayload(BaseModel):
    rolle: REQUIRED_TEXT
    eigene_name: REQUIRED_TEXT
    eigene_anschrift: REQUIRED_TEXT
    eigene_email: EmailStr
    eigene_telefon: REQUIRED_TEXT
    eigene_iban: REQUIRED_TEXT
    gegenpartei_bekannt: REQUIRED_TEXT
    gegenpartei_name: OPTIONAL_TEXT = None
    gegenpartei_anschrift: OPTIONAL_TEXT = None
    gegenpartei_email: Optional[EmailStr] = None
    gegenpartei_telefon: OPTIONAL_TEXT = None
    objektadresse: REQUIRED_TEXT
    wohnungsart: REQUIRED_TEXT
    wohnflaeche: REQUIRED_TEXT
    bezugsfertig: REQUIRED_TEXT
    mietbeginn: REQUIRED_TEXT
    vertragsart: REQUIRED_TEXT
    grundmiete: REQUIRED_TEXT
    kaution: REQUIRED_TEXT

    wird_vertreten: OPTIONAL_TEXT = None
    vertreten_durch: OPTIONAL_TEXT = None
    vollmacht_vorhanden: OPTIONAL_TEXT = None
    ust_id: OPTIONAL_TEXT = None
    steuernummer: OPTIONAL_TEXT = None
    wohnung_bez: OPTIONAL_TEXT = None
    aussenbereich: List[str] = Field(default_factory=list)
    nebenraeume: List[str] = Field(default_factory=list)
    stellplatz: OPTIONAL_TEXT = None
    stellplatz_nr: OPTIONAL_TEXT = None
    ausstattung: Optional[Any] = None
    weg: OPTIONAL_TEXT = None
    mea: OPTIONAL_TEXT = None
    grundriss_datei: OPTIONAL_TEXT = None
    weg_dokument: OPTIONAL_TEXT = None
    zustand: OPTIONAL_TEXT = None
    uebergabeprotokoll: Optional[Any] = None
    laerm: OPTIONAL_TEXT = None
    schluessel_arten: List[str] = Field(default_factory=list)
    schluessel_anzahl: OPTIONAL_TEXT = None
    mietende: OPTIONAL_TEXT = None
    befristungsgrund: OPTIONAL_TEXT = None
    befristungsgrund_text: OPTIONAL_TEXT = None
    zuschlag_moeblierung: OPTIONAL_TEXT = None
    zuschlag_teilgewerbe: OPTIONAL_TEXT = None
    zuschlag_unterverm: OPTIONAL_TEXT = None
    vz_heizung: OPTIONAL_TEXT = None
    vz_bk: OPTIONAL_TEXT = None
    stellplatzmiete: OPTIONAL_TEXT = None
    zahlungsart: OPTIONAL_TEXT = None
    zahler_iban: OPTIONAL_TEXT = None
    bk_modell: OPTIONAL_TEXT = None
    abrz: OPTIONAL_TEXT = None
    bk_weg: OPTIONAL_TEXT = None
    nutzung: OPTIONAL_TEXT = None
    unterverm: OPTIONAL_TEXT = None
    tiere: OPTIONAL_TEXT = None
    tiere_details: OPTIONAL_TEXT = None
    kaution_zahlweise: OPTIONAL_TEXT = None
    kautionsform: OPTIONAL_TEXT = None
    uebergabedatum: OPTIONAL_TEXT = None
    timestamp: OPTIONAL_TEXT = None

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

    @field_validator(
        "gegenpartei_name",
        "gegenpartei_anschrift",
        "gegenpartei_telefon",
        "stellplatz",
        "stellplatz_nr",
        "weg",
        "mea",
        "grundriss_datei",
        "weg_dokument",
        "zustand",
        "laerm",
        "schluessel_anzahl",
        "mietende",
        "befristungsgrund",
        "befristungsgrund_text",
        "zuschlag_moeblierung",
        "zuschlag_teilgewerbe",
        "zuschlag_unterverm",
        "vz_heizung",
        "vz_bk",
        "stellplatzmiete",
        "zahlungsart",
        "zahler_iban",
        "bk_modell",
        "abrz",
        "bk_weg",
        "nutzung",
        "unterverm",
        "tiere",
        "tiere_details",
        "kaution_zahlweise",
        "kautionsform",
        "uebergabedatum",
        "timestamp",
        "wird_vertreten",
        "vertreten_durch",
        "vollmacht_vorhanden",
        "ust_id",
        "steuernummer",
        "wohnung_bez",
        "grundrissDatei",
        "wegDokument",
        "zuschlagMoebliert",
        "zuschlagGewerbe",
        "zuschlagUntervermietung",
        "zahlerIban",
        "abrechnungszeitraum",
        "bkweg",
        "haustiere",
        "kautionZahlweise",
        "vollmacht",
        mode="before",
    )
    @classmethod
    def _strip_optional_strings(cls, value: Optional[str]) -> Optional[str]:
        return _normalize_optional_text(value)

    @field_validator("gegenpartei_email", mode="before")
    @classmethod
    def _normalize_optional_email(cls, value: Optional[str]) -> Optional[str]:
        return _normalize_optional_text(value)

    @field_validator("eigene_telefon", "gegenpartei_telefon", mode="after")
    @classmethod
    def _validate_phone(cls, value: Optional[str]) -> Optional[str]:
        if not value:
            return value
        if not _has_valid_digits(value, 6):
            raise ValueError("Ungültige Telefonnummer.")
        if not re.fullmatch(r"\+?[0-9\s().-]{6,}", value):
            raise ValueError("Ungültige Telefonnummer.")
        return value

    @field_validator("eigene_iban", "zahler_iban", mode="after")
    @classmethod
    def _validate_iban(cls, value: Optional[str]) -> Optional[str]:
        if not value:
            return value
        compact = value.replace(" ", "").upper()
        if not re.fullmatch(r"[A-Z]{2}\d{2}[A-Z0-9]{11,30}", compact):
            raise ValueError("Ungültige IBAN.")
        return value

    @field_validator(
        "wohnflaeche",
        "grundmiete",
        "zuschlag_moeblierung",
        "zuschlag_teilgewerbe",
        "zuschlag_unterverm",
        "vz_heizung",
        "vz_bk",
        "stellplatzmiete",
        "schluessel_anzahl",
        "mea",
        mode="after",
    )
    @classmethod
    def _validate_positive_numbers(cls, value: Optional[str]) -> Optional[str]:
        if value is None:
            return value
        try:
            numeric = float(value)
        except (TypeError, ValueError):
            raise ValueError("Muss eine Zahl größer als 0 sein.")
        if numeric <= 0:
            raise ValueError("Muss eine Zahl größer als 0 sein.")
        return value

    @model_validator(mode="after")
    def _validate_conditionals(self) -> "MaskAClientPayload":
        if self.gegenpartei_bekannt.lower() == "ja":
            missing = [
                field
                for field, value in {
                    "gegenpartei_name": self.gegenpartei_name,
                    "gegenpartei_anschrift": self.gegenpartei_anschrift,
                    "gegenpartei_email": self.gegenpartei_email,
                }.items()
                if not value
            ]
            if missing:
                raise ValueError(
                    f"Fehlende Gegenpartei-Angaben: {', '.join(missing)}."
                )

        if self.vertragsart == "Befristet" and self.mietende:
            try:
                mietbeginn_date = datetime.fromisoformat(self.mietbeginn)
                mietende_date = datetime.fromisoformat(self.mietende)
            except ValueError:
                return self
            if mietende_date <= mietbeginn_date:
                raise ValueError("Das Mietende muss nach dem Mietbeginn liegen.")

        return self


def _merge_legacy_fields(payload: Dict[str, Any]) -> Dict[str, Any]:
    legacy_to_canonical = {
        "ustId": "ust_id",
        "gegenparteiBekannt": "gegenpartei_bekannt",
        "gegenpartei": "gegenpartei_bekannt",
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

    if "gegenpartei" in merged:
        merged.pop("gegenpartei", None)

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
