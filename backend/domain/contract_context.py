from datetime import datetime, date
from typing import Dict, Any, List
from decimal import Decimal, InvalidOperation
import re
MPB_THRESHOLD = datetime.strptime("2014-10-01", "%Y-%m-%d").date()


class ContractContextError(Exception):
    pass


def build_contract_context(mask_a: Dict[str, Any], mask_b: Dict[str, Any]) -> Dict[str, Any]:
    context: Dict[str, Any] = {}

    # -------------------------------------------------
    # A1 – ROLE (Landlord / Tenant)
    # -------------------------------------------------
    rolle = mask_a.get("rolle")
    if rolle not in ("Vermieter", "Mieter"):
        raise ContractContextError("A1.rolle must be 'Vermieter' or 'Mieter'")

    context.update(_format_party_fields(rolle, mask_a))

    context["VAT_ID"] = mask_a.get("ust_id", "")
    context["TAX_NUMBER"] = mask_a.get("steuernummer", "")

    # -------------------------------------------------
    # A2 – PROPERTY
    # -------------------------------------------------
    context["OBJEKTADRESSE"] = mask_a.get("objektadresse", "")
    context["WOHNUNG_BESCHREIBUNG"] = mask_a.get("wohnung_bez", "")

    context["FLAECHE"] = _format_decimal(mask_a.get("wohnflaeche"))

    ausstattung = mask_a.get("ausstattung", [])
    context["AUSSTATTUNG"] = ", ".join(ausstattung) if ausstattung else "keine"

    # -------------------------------------------------
    # A3 – CONDITION & KEYS
    # -------------------------------------------------
    context["ZUSTAND"] = _map_zustand_text(mask_a.get("zustand", ""))

    context["ANZAHL"] = str(mask_a.get("schluessel_anzahl", "") or "")
    context["ARTEN"] = ", ".join(mask_a.get("schluessel_arten", []) or [])

    # -------------------------------------------------
    # B2 – MIETPREISBREMSE (MPB) FULL CASCADE
    # Triggered by A3.bezugsfertig date (critical)
    # -------------------------------------------------
    context["MPB_CLAUSE"] = _build_mpb_clause(mask_a, mask_b)



    # -------------------------------------------------
    # A4 – RENTAL START
    # -------------------------------------------------
    mietbeginn = _parse_date(mask_a.get("mietbeginn"), "A4.mietbeginn")
    context["MIETBEGINN"] = _format_date(mietbeginn)

    # -------------------------------------------------
    # A5 – RENT
    # -------------------------------------------------
    grundmiete = _format_monetary(mask_a.get("grundmiete"), "A5.grundmiete")
    context["BETRAG"] = grundmiete

    context["IBAN"] = mask_a.get("eigene_iban", "")

    # -------------------------------------------------
    # B1 – TERMINATION WAIVER
    # -------------------------------------------------
    jahre = int(mask_b.get("kuendigungsverzicht", 0) or 0)
    context["JAHRE"] = str(jahre) if jahre > 0 else ""

    # -------------------------------------------------
    # B3 – WEG (optional)
    # -------------------------------------------------
    if mask_a.get("weg") == "Ja":
        context["MEA"] = str(mask_a.get("mea", "") or "")
        context["WEG_TEXT"] = mask_b.get("weg_text", "")
    else:
        context["MEA"] = ""
        context["WEG_TEXT"] = ""

    # -------------------------------------------------
    # B7 – ANNEXES
    # -------------------------------------------------
    anlagen: List[str] = mask_b.get("anlagen", []) or []
    context["COMPLETE_ANNEX_LIST"] = _format_anlagen(anlagen)

    # -------------------------------------------------
    # SIGNATURE
    # -------------------------------------------------
    context["ORT"] = _extract_city(context["OBJEKTADRESSE"])
    context["DATUM"] = _format_date(date.today())

    _validate_context(context)
    return context


# ==========================
# Helper functions
# ==========================

def _clean_text(value: Any) -> str:
    return str(value or "").strip()


def _format_party_fields(rolle: str, mask_a: Dict[str, Any]) -> Dict[str, str]:
    if rolle == "Vermieter":
        landlord_name = _clean_text(mask_a.get("eigene_name"))
        landlord_address = _clean_text(mask_a.get("eigene_anschrift"))
        tenant_name = _clean_text(mask_a.get("gegenpartei_name"))
        tenant_address = _clean_text(mask_a.get("gegenpartei_anschrift"))
    else:
        landlord_name = _clean_text(mask_a.get("gegenpartei_name"))
        landlord_address = _clean_text(mask_a.get("gegenpartei_anschrift"))
        tenant_name = _clean_text(mask_a.get("eigene_name"))
        tenant_address = _clean_text(mask_a.get("eigene_anschrift"))

    representative_selected = mask_a.get("wird_vertreten") == "Ja"
    representative_name = _clean_text(mask_a.get("vertreten_durch"))

    if representative_selected and not representative_name:
        raise ContractContextError("Representative selected but no name provided")

    landlord_rep = representative_name if representative_selected and rolle == "Vermieter" else ""
    tenant_rep = representative_name if representative_selected and rolle == "Mieter" else ""

    return {
        "LANDLORD_NAME": landlord_name,
        "LANDLORD_ADDRESS": landlord_address,
        "TENANT_NAME": tenant_name,
        "TENANT_ADDRESS": tenant_address,
        "LANDLORD_REPRESENTATIVE": landlord_rep,
        "TENANT_REPRESENTATIVE": tenant_rep,
    }


def _parse_date(value: str, field_name: str) -> date:
    if not value:
        raise ContractContextError(f"{field_name} is required")
    try:
        return datetime.strptime(value, "%Y-%m-%d").date()
    except (TypeError, ValueError) as exc:
        raise ContractContextError(f"{field_name} must use YYYY-MM-DD format") from exc


def _format_date(value: date) -> str:
    return value.strftime("%d.%m.%Y")


def _format_decimal(value) -> str:
    if value is None or value == "":
        return ""
    return f"{Decimal(value):,.2f}".replace(",", "X").replace(".", ",").replace("X", ".")


def _format_monetary(value: Any, field_name: str, allow_zero: bool = True) -> str:
    if value in (None, ""):
        raise ContractContextError(f"{field_name} is required")

    try:
        decimal_value = Decimal(str(value))
    except (InvalidOperation, TypeError, ValueError) as exc:
        raise ContractContextError(f"{field_name} must be a valid number") from exc

    if not allow_zero and decimal_value == 0:
        raise ContractContextError(f"{field_name} must be greater than zero")

    return _format_decimal(decimal_value)


def _map_zustand_text(zustand: str) -> str:
    return {
        "renoviert": "renoviert",
        "neu erstellt": "ist neu erstellt",
        "gebraucht/vertragsgemäß": "in gebrauchtem, vertragsgemäßem Zustand",
    }.get(zustand, zustand)


def _extract_city(address: str) -> str:
    if not address:
        return ""
    return address.split(",")[-1].strip()


def _format_anlagen(items: List[str]) -> str:
    return "\n".join(
        f"Anlage MV.{i}: {name}" for i, name in enumerate(items, start=1)
    )


def _validate_context(context: Dict[str, Any]) -> None:
    required = ["LANDLORD_NAME", "TENANT_NAME", "OBJEKTADRESSE", "MIETBEGINN", "BETRAG"]
    missing = [k for k in required if not context.get(k)]
    if missing:
        raise ContractContextError(f"Missing required placeholders: {missing}")

    bad = [
        k for k, v in context.items()
        if isinstance(v, str) and re.search(r"\[[A-Z0-9_]+\]", v)
    ]
    if bad:
        raise ContractContextError(f"Unresolved placeholders found: {bad}")
    
def _truthy(value: Any) -> bool:
    """
    Accepts common checkbox formats from HTML forms:
    - True/False
    - "true"/"false"
    - "Ja"/"Nein"
    - "on"
    - 1/0
    """
    if value is True:
        return True
    if value is False or value is None:
        return False
    if isinstance(value, (int, float)):
        return value != 0
    if isinstance(value, str):
        v = value.strip().lower()
        return v in ("true", "ja", "on", "1", "checked", "yes")
    return False


def _resolve_mpb_justifications(candidates: List[tuple[str, str]]) -> str:
    if not candidates:
        raise ContractContextError(
            "MPB over limit selected (B2.mpb_grenze='Nein, über Grenze') but no justification was provided "
            "(mpb_vormiete / mpb_modern / mpb_erstmiete)."
        )

    priority = ["mpb_vormiete", "mpb_modern", "mpb_erstmiete"]
    ordered = sorted(candidates, key=lambda item: priority.index(item[0]))

    if len(candidates) > 1:
        provided = ", ".join(name for name, _ in candidates)
        priority_text = " > ".join(priority)
        raise ContractContextError(
            "Multiple MPB justifications provided ({provided}). Only one justification is allowed; "
            f"if several are set the priority is {priority_text}.".format(
                provided=provided
            )
        )

    return ordered[0][1]


def _build_mpb_clause(mask_a: Dict[str, Any], mask_b: Dict[str, Any]) -> str:
    """
    Returns the full MPB clause text or an empty string if no clause should be included.
    Implements the cascade described in the annotated contract template.

    Required inputs:
      - A3: bezugsfertig (ISO date string YYYY-MM-DD)
      - B2: mpb_status, mpb_vormiet, mpb_grenze
      - B2: mpb_vormiete (checkbox / boolean-like), mpb_vormiete_betrag
      - B2: mpb_modern (checkbox / boolean-like), mpb_modern_text
      - B2: mpb_erstmiete (checkbox / boolean-like), mpb_erstmiete_text
    """

    bezugsfertig_raw = mask_a.get("bezugsfertig")
    if not bezugsfertig_raw:
        # MPB logic depends on this field; fail safely.
        raise ContractContextError("A3.bezugsfertig is required for Mietpreisbremse (MPB) logic")

    bezugsfertig_date = _parse_date(bezugsfertig_raw, "A3.bezugsfertig")

    # -------------------------
    # STAGE 1: Date Check
    # -------------------------
    # If property became ready on/after 01.10.2014 => special clause and STOP.
    if bezugsfertig_date >= MPB_THRESHOLD:
        return (
            "Die Wohnung, die Gegenstand dieses Mietvertrages ist, wurde vor dem 1. Oktober 2014 "
            "weder genutzt noch vermietet. Eine Nutzung oder Vermietung erfolgte erst nach dem 1. Oktober 2014 "
            "(§ 556f BGB)."
        )

    # If before threshold => continue with lawyer cascade decisions
    mpb_status = (mask_b.get("mpb_status") or "").strip()
    mpb_vormiet = (mask_b.get("mpb_vormiet") or "").strip()
    mpb_grenze = (mask_b.get("mpb_grenze") or "").strip()

    # -------------------------
    # STAGE 2: Property Status
    # -------------------------
    if not mpb_status:
        raise ContractContextError("B2.mpb_status is required because bezugsfertig < 2014-10-01")

    # If “Neubau (nie vermietet)” => same clause as Stage 1 and STOP.
    if mpb_status.lower().startswith("neubau"):
        return (
            "Die Wohnung, die Gegenstand dieses Mietvertrages ist, wurde vor dem 1. Oktober 2014 "
            "weder genutzt noch vermietet. Eine Nutzung oder Vermietung erfolgte erst nach dem 1. Oktober 2014 "
            "(§ 556f BGB)."
        )

    if mpb_status != "Bereits vermietet":
        raise ContractContextError(
            "B2.mpb_status must be either 'Neubau (nie vermietet)' or 'Bereits vermietet'"
        )

    # -------------------------
    # STAGE 3: Prior Tenancy Start
    # -------------------------
    if not mpb_vormiet:
        raise ContractContextError("B2.mpb_vormiet is required when mpb_status='Bereits vermietet'")

    # Always insert this sentence
    # Wording depends on value
    if mpb_vormiet == "vor dem 1. Juni 2015":
        vormiet_sentence = "Das Vormietverhältnis hat vor dem 1. Juni 2015 begonnen."
        # STOP (less restrictive) - but still include the sentence
        return vormiet_sentence

    if mpb_vormiet == "nach dem 1. Juni 2015":
        vormiet_sentence = "Das Vormietverhältnis hat nach dem 1. Juni 2015 begonnen."
        # continue to Stage 4
    else:
        raise ContractContextError(
            "B2.mpb_vormiet must be either 'vor dem 1. Juni 2015' or 'nach dem 1. Juni 2015'"
        )

    # -------------------------
    # STAGE 4: Rent within limit?
    # -------------------------
    if not mpb_grenze:
        raise ContractContextError("B2.mpb_grenze is required when mpb_vormiet='nach dem 1. Juni 2015'")

    parts: list[str] = [vormiet_sentence]

    if mpb_grenze == "Ja, unter Grenze":
        parts.append(
            "Die in diesem Mietvertrag geforderte Miete überschreitet die nach § 556d BGB "
            "(sogenannte „Mietpreisbremse\") zulässige Miete (ortsübliche Miete + 10 %) nicht."
        )
        return " ".join(parts)

    if mpb_grenze != "Nein, über Grenze":
        raise ContractContextError("B2.mpb_grenze must be 'Ja, unter Grenze' or 'Nein, über Grenze'")

    # Over limit => omit “nicht” and require justifications section
    parts.append(
        "Die in diesem Mietvertrag geforderte Miete überschreitet die nach § 556d BGB "
        "(sogenannte „Mietpreisbremse\") zulässige Miete (ortsübliche Miete + 10 %)."
    )
    parts.append(
        "Der Vermieter erklärt hiermit vor Mietvertragsabschluss, dass die vereinbarte Miete "
        "auf folgender Ausnahme von § 556d BGB (zulässige Miethöhe bei Mietbeginn) beruht:"
    )

    # -------------------------
    # JUSTIFICATIONS (any/all)
    # -------------------------
    justification_candidates: list[tuple[str, str]] = []

    if _truthy(mask_b.get("mpb_vormiete")):
        amount = _format_monetary(
            mask_b.get("mpb_vormiete_betrag"), "B2.mpb_vormiete_betrag", allow_zero=False
        )
        justification_candidates.append(
            (
                "mpb_vormiete",
                f"Die Vormiete gemäß § 556e Abs. 1 BGB betrug {amount} Euro (Nettokaltmiete).",
            )
        )

    if _truthy(mask_b.get("mpb_modern")):
        details = (mask_b.get("mpb_modern_text") or "").strip()
        text = (
            "In den letzten drei Jahren vor Beginn dieses Mietverhältnisses wurde eine Modernisierung "
            "im Sinne des § 555b BGB durchgeführt, für die eine Modernisierungsmieterhöhung zulässig gewesen "
            "wäre (§ 556e Abs. 2 BGB)."
        )
        if details:
            text = f"{text}\nDetails: {details}"
        justification_candidates.append(("mpb_modern", text))

    if _truthy(mask_b.get("mpb_erstmiete")):
        details = (mask_b.get("mpb_erstmiete_text") or "").strip()
        text = (
            "Bei diesem Mietvertragsabschluss handelt es sich um den ersten nach umfassender "
            "Modernisierung (§ 556f BGB)."
        )
        if details:
            text = f"{text}\nDetails: {details}"
        justification_candidates.append(("mpb_erstmiete", text))

    justification_text = _resolve_mpb_justifications(justification_candidates)

    # Format justification as numbered list
    parts.append("\n".join([f"1. {justification_text}"]))

    return " ".join(parts)
