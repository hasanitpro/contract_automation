from __future__ import annotations

from typing import Any, Dict, Optional

from pydantic import BaseModel, EmailStr, Field, ValidationError, model_validator


class ErrorResponse(BaseModel):
    error: str
    details: Optional[str] = None


class MaskARequest(BaseModel):
    rolle: str = Field(..., description="Role of the submitter (e.g., Vermieter or Mieter)")
    eigeneName: str = Field(..., description="Submitter full name")
    eigeneEmail: EmailStr = Field(..., description="Submitter email address")
    eigeneTelefon: str = Field(..., description="Submitter phone number")

    class Config:
        extra = "allow"


class MaskBRequest(BaseModel):
    class Config:
        extra = "allow"


class GenerateContractRequest(BaseModel):
    maskA: MaskARequest
    maskB: MaskBRequest

    class Config:
        extra = "allow"

    @model_validator(mode="after")
    def check_masks_present(self) -> "GenerateContractRequest":
        if not self.maskA or not self.maskB:
            raise ValueError("maskA and maskB are required")
        return self


class SaveMaskAResponse(BaseModel):
    id: str
    table: str


class GenerateContractResponse(BaseModel):
    blobName: str
    blobUrl: str


def parse_mask_a_request(payload: Dict[str, Any]) -> MaskARequest:
    try:
        return MaskARequest.model_validate(payload)
    except ValidationError as exc:
        raise ValueError(exc.json()) from exc


def parse_generate_contract_request(payload: Dict[str, Any]) -> GenerateContractRequest:
    try:
        return GenerateContractRequest.model_validate(payload)
    except ValidationError as exc:
        raise ValueError(exc.json()) from exc
