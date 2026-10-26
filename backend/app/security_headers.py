
from collections.abc import Mapping


SECURITY_HEADERS = (
    (
        "Strict-Transport-Security",
        "Helps browsers enforce HTTPS. Configure it only when the site "
        "supports HTTPS correctly.",
    ),
    (
        "Content-Security-Policy",
        "Helps control which sources a browser may load content from.",
    ),
    (
        "X-Content-Type-Options",
        "Use nosniff to help prevent MIME-type sniffing.",
    ),
    (
        "X-Frame-Options",
        "Use DENY or SAMEORIGIN when appropriate for the application.",
    ),
    (
        "Referrer-Policy",
        "Prefer a deliberate policy that limits unnecessary referrer data.",
    ),
    (
        "Permissions-Policy",
        "Restrict browser features to those the application actually needs.",
    ),
)


def validate_header_value(header_name: str, value: str) -> str:
    """Return a basic configuration review message for known header values."""

    normalized_name = header_name.lower()
    normalized_value = value.strip().lower()

    if normalized_name == "x-content-type-options":
        if normalized_value != "nosniff":
            return (
                "Configuration warning: the expected value is 'nosniff'. "
                "Review this value against browser security guidance."
            )

        return "Expected value 'nosniff' is present."

    if normalized_name == "x-frame-options":
        if normalized_value not in {"deny", "sameorigin"}:
            return (
                "Configuration warning: commonly used values are DENY "
                "and SAMEORIGIN. Review whether framing is required."
            )

        return "Recognized value. Confirm it matches the application's framing needs."

    if normalized_name == "strict-transport-security":
        if not normalized_value.startswith("max-age="):
            return (
                "Configuration warning: an HSTS policy normally includes "
                "a max-age directive. Confirm HTTPS is configured correctly."
            )

        return (
            "HSTS max-age directive detected. Review its duration and any "
            "optional directives before deployment."
        )

    if normalized_name == "referrer-policy":
        allowed_values = {
            "no-referrer",
            "no-referrer-when-downgrade",
            "origin",
            "origin-when-cross-origin",
            "same-origin",
            "strict-origin",
            "strict-origin-when-cross-origin",
            "unsafe-url",
        }

        if normalized_value not in allowed_values:
            return (
                "Configuration warning: this value is not a recognized "
                "single Referrer-Policy token. Review the policy syntax."
            )

        if normalized_value == "unsafe-url":
            return (
                "Recognized value, but unsafe-url may disclose referrer "
                "details. Review whether a more restrictive policy is suitable."
            )

        return "Recognized policy token. Confirm it suits the application."

    if normalized_name == "content-security-policy":
        if not normalized_value:
            return "Configuration warning: the policy value is empty."

        return (
            "Policy is present. Review its directives and sources; "
            "presence alone does not establish that it is secure."
        )

    if normalized_name == "permissions-policy":
        if not normalized_value:
            return "Configuration warning: the policy value is empty."

        return (
            "Policy is present. Review each directive against the browser "
            "features your application needs."
        )

    return (
        "Header is present but has no specific validator in this version. "
        "Review its configuration manually."
    )


def analyze_security_headers(
    headers: Mapping[str, str],
) -> list[dict[str, str]]:
    """Analyze supplied HTTP headers without making network requests."""

    normalized_headers = {
        name.strip().lower(): value.strip()
        for name, value in headers.items()
    }

    findings: list[dict[str, str]] = []

    for header_name, recommendation in SECURITY_HEADERS:
        value = normalized_headers.get(header_name.lower(), "")

        if value:
            status = "present"
            message = validate_header_value(header_name, value)
        else:
            status = "missing"
            message = recommendation

        findings.append(
            {
                "header": header_name,
                "status": status,
                "value": value,
                "recommendation": message,
            }
        )

    return findings
