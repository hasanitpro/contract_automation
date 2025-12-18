from __future__ import annotations

from typing import List, Optional

from pydantic import BaseModel, Field, HttpUrl, ValidationError, model_validator


class Party(BaseModel):
    name: str = Field(..., description="Full legal name of the party")
    role: Optional[str] = Field(None, description="Role of the party in the contract")
    contact_email: Optional[str] = Field(None, description="Contact email for correspondence")


class ContractTerm(BaseModel):
    key: str
    value: str


class ContractRequest(BaseModel):
    template_id: str = Field(..., description="Identifier for the template to render")
    effective_date: Optional[str] = Field(
        None, description="Effective date string for the contract"
    )
    parties: List[Party] = Field(default_factory=list)
    terms: List[ContractTerm] = Field(default_factory=list)
    callback_url: Optional[HttpUrl] = Field(None, description="Optional webhook to call")

    @model_validator(mode="after")
    def check_parties(self) -> "ContractRequest":
        if len(self.parties) < 2:
            raise ValueError("At least two parties are required to generate a contract")
        return self


class ContractResponse(BaseModel):
    document: str = Field(..., description="Rendered contract body")
    template_id: str
    parties: List[Party]


class ErrorResponse(BaseModel):
    error: str
    details: Optional[str] = None


def parse_contract_request(payload: dict) -> ContractRequest:
    try:
        return ContractRequest.model_validate(payload)
    except ValidationError as exc:
        raise ValueError(exc.json()) from exc
