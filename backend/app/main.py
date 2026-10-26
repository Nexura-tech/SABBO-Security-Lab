import re
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field, ConfigDict, field_validator

from app.security_headers import analyze_security_headers


class HealthResponse(BaseModel):
    status: str
    service: str


class SecurityHeadersRequest(BaseModel):
    model_config = ConfigDict(extra="forbid")
    headers: dict[str, str] = Field(
        min_length=0,
        max_length=100,
        description="HTTP response headers to analyze (maximum 100)",
        examples=[
            {
                "Content-Security-Policy": "default-src 'self'",
                "X-Content-Type-Options": "nosniff",
            }
        ],
    )

    @field_validator("headers")
    @classmethod
    def validate_headers(cls, headers: dict[str, str]) -> dict[str, str]:
        for name, value in headers.items():
            if not name.strip():
                raise ValueError("Header names must not be empty.")

            if not re.fullmatch(r"[!#$%&'*+\-.^_`|~0-9A-Za-z]+", name):
                raise ValueError(f"Invalid header name: {name!r}")

            if "\r" in value or "\n" in value:
                raise ValueError("Header values must not contain CR or LF.")

        return headers


class SecurityHeaderFinding(BaseModel):
    header: str
    status: str
    value: str
    recommendation: str


class SecurityHeadersResponse(BaseModel):
    findings: list[SecurityHeaderFinding]
    total_headers: int
    present_headers: int
    missing_headers: int


app = FastAPI(
    title="SABBO Security Lab API",
    description="Backend API for SABBO Security Lab",
    version="0.1.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
    ],
    allow_credentials=False,
    allow_methods=["GET", "POST"],
    allow_headers=["Content-Type"],
)


@app.get(
    "/api/health",
    response_model=HealthResponse,
    tags=["Health"],
)
def health_check() -> HealthResponse:
    return HealthResponse(
        status="ok",
        service="SABBO Security Lab API",
    )


@app.post(
    "/api/security-headers/analyze",
    response_model=SecurityHeadersResponse,
    tags=["Security Headers"],
)
def security_headers_check(
    request: SecurityHeadersRequest,
) -> SecurityHeadersResponse:
    findings = analyze_security_headers(request.headers)

    present_count = sum(
        finding["status"] == "present"
        for finding in findings
    )

    return SecurityHeadersResponse(
        findings=findings,
        total_headers=len(findings),
        present_headers=present_count,
        missing_headers=len(findings) - present_count,
    )
