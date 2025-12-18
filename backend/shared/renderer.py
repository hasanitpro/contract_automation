from __future__ import annotations

from pathlib import Path
from typing import Dict, List

from jinja2 import Environment, FileSystemLoader, select_autoescape

from .models import ContractRequest, ContractTerm, Party

TEMPLATES_DIR = Path(__file__).parent.parent / "templates"


def _build_context(parties: List[Party], terms: List[ContractTerm]) -> Dict[str, str]:
    context: Dict[str, str] = {}
    term_map: Dict[str, str] = {}
    for term in terms:
        term_map[term.key] = term.value
    context["terms"] = term_map
    context["parties"] = [party.model_dump() for party in parties]
    return context


def render_contract(request: ContractRequest) -> str:
    env = Environment(
        loader=FileSystemLoader(str(TEMPLATES_DIR)),
        autoescape=select_autoescape(["html", "xml"]),
    )
    template_path = f"{request.template_id}.html"
    template = env.get_template(template_path)

    context = _build_context(request.parties, request.terms)
    context["effective_date"] = request.effective_date
    return template.render(**context)


def list_templates() -> List[str]:
    return [
        template.stem
        for template in TEMPLATES_DIR.glob("*.html")
        if template.is_file()
    ]
