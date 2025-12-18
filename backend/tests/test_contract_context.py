import sys
from pathlib import Path

import pytest

ROOT = Path(__file__).resolve().parents[1]
if str(ROOT) not in sys.path:
    sys.path.insert(0, str(ROOT))

from domain.contract_context import ContractContextError, _build_mpb_clause  # noqa: E402


def _base_masks():
    mask_a = {"bezugsfertig": "2014-09-01"}
    mask_b = {
        "mpb_status": "Bereits vermietet",
        "mpb_vormiet": "nach dem 1. Juni 2015",
        "mpb_grenze": "Nein, über Grenze",
    }
    return mask_a, mask_b


def test_build_mpb_clause_rejects_invalid_bezugsfertig_format():
    with pytest.raises(ContractContextError) as excinfo:
        _build_mpb_clause({"bezugsfertig": "10/2014"}, {})

    assert "A3.bezugsfertig must use YYYY-MM-DD format" in str(excinfo.value)


def test_build_mpb_clause_rejects_zero_vormiete_amount():
    mask_a, mask_b = _base_masks()
    mask_b.update({"mpb_vormiete": True, "mpb_vormiete_betrag": 0})

    with pytest.raises(ContractContextError) as excinfo:
        _build_mpb_clause(mask_a, mask_b)

    assert "B2.mpb_vormiete_betrag must be greater than zero" in str(excinfo.value)


def test_build_mpb_clause_rejects_multiple_justifications():
    mask_a, mask_b = _base_masks()
    mask_b.update(
        {
            "mpb_vormiete": True,
            "mpb_vormiete_betrag": "600",
            "mpb_modern": True,
        }
    )

    with pytest.raises(ContractContextError) as excinfo:
        _build_mpb_clause(mask_a, mask_b)

    message = str(excinfo.value)
    assert "Multiple MPB justifications provided" in message
    assert "mpb_vormiete > mpb_modern > mpb_erstmiete" in message
