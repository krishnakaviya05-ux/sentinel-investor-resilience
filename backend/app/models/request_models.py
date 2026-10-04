"""Request models for the SENTINEL API."""

from pydantic import BaseModel, Field, field_validator


class AnalyzeRequest(BaseModel):
    content: str = Field(
        ...,
        min_length=10,
        max_length=10_000,
        description="Suspicious financial message or claim to be analyzed.",
        examples=["Guaranteed 40% returns in 30 days. Join now and send the registration fee immediately."],
    )

    @field_validator("content")
    @classmethod
    def content_must_not_be_whitespace(cls, v: str) -> str:
        if not v.strip():
            raise ValueError("Content must not be empty or whitespace-only.")
        return v
