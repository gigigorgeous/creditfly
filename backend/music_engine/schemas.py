from typing import Literal
from uuid import UUID

from pydantic import BaseModel, Field, field_validator

KEYS = ("C", "C#", "Db", "D", "D#", "Eb", "E", "F", "F#", "Gb", "G", "G#", "Ab", "A", "A#", "Bb", "B")


class GenerationRequest(BaseModel):
    prompt: str = Field(default="", max_length=500)
    title: str | None = Field(default=None, max_length=100)
    genre: str = Field(default="pop", min_length=1, max_length=40)
    key: str = "C"
    mode: Literal["major", "minor"] = "major"
    tempo: int = Field(default=110, ge=40, le=240)
    bars: int = Field(default=8, ge=1, le=64)
    seed: int | None = Field(default=None, ge=0, le=2**32 - 1)

    @field_validator("key")
    @classmethod
    def validate_key(cls, value: str) -> str:
        if value not in KEYS:
            raise ValueError(f"key must be one of: {', '.join(KEYS)}")
        return value


class PreviewNote(BaseModel):
    track: str
    pitch: int = Field(ge=0, le=127)
    start: float = Field(ge=0)
    end: float = Field(gt=0)
    velocity: int = Field(ge=0, le=127)


class GenerationResponse(BaseModel):
    id: UUID
    title: str
    genre: str
    key: str
    mode: str
    tempo: int
    bars: int
    tracks: list[str]
    preview: list[PreviewNote]
    download_url: str


class HealthResponse(BaseModel):
    status: Literal["ok"]
    service: str


class GenerationRecord(GenerationResponse):
    file_path: str
