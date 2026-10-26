
from app.security_headers import analyze_security_headers


def test_all_security_headers_are_missing_when_input_is_empty():
    findings = analyze_security_headers({})

    assert len(findings) == 6
    assert all(item["status"] == "missing" for item in findings)


def test_present_headers_are_detected():
    headers = {
        "Content-Security-Policy": "default-src 'self'",
        "X-Content-Type-Options": "nosniff",
    }

    findings = analyze_security_headers(headers)
    by_name = {item["header"]: item for item in findings}

    assert by_name["Content-Security-Policy"]["status"] == "present"
    assert (
        by_name["Content-Security-Policy"]["value"]
        == "default-src 'self'"
    )

    assert by_name["X-Content-Type-Options"]["status"] == "present"
    assert by_name["X-Content-Type-Options"]["value"] == "nosniff"


def test_header_names_are_case_insensitive():
    headers = {
        "content-security-policy": "default-src 'self'",
        "x-frame-options": "DENY",
    }

    findings = analyze_security_headers(headers)
    by_name = {item["header"]: item for item in findings}

    assert by_name["Content-Security-Policy"]["status"] == "present"
    assert by_name["X-Frame-Options"]["status"] == "present"


def test_empty_header_value_is_reported_as_missing():
    findings = analyze_security_headers(
        {"Content-Security-Policy": "   "}
    )

    by_name = {item["header"]: item for item in findings}

    assert by_name["Content-Security-Policy"]["status"] == "missing"


def test_header_names_with_surrounding_whitespace_are_normalized():
    findings = analyze_security_headers(
        {
            "  Content-Security-Policy  ": " default-src 'self' ",
        }
    )

    by_name = {item["header"]: item for item in findings}

    assert by_name["Content-Security-Policy"]["status"] == "present"
    assert (
        by_name["Content-Security-Policy"]["value"]
        == "default-src 'self'"
    )


def test_unrecognized_headers_do_not_replace_recommended_findings():
    findings = analyze_security_headers(
        {
            "X-Custom-Header": "example",
        }
    )

    by_name = {item["header"]: item for item in findings}

    assert len(findings) == 6
    assert all(item["status"] == "missing" for item in findings)
    assert "X-Custom-Header" not in by_name


def test_x_content_type_options_valid_value():
    findings = analyze_security_headers(
        {"X-Content-Type-Options": "nosniff"}
    )

    by_name = {item["header"]: item for item in findings}

    assert by_name["X-Content-Type-Options"]["status"] == "present"
    assert "nosniff" in (
        by_name["X-Content-Type-Options"]["recommendation"].lower()
    )


def test_x_content_type_options_invalid_value_is_flagged():
    findings = analyze_security_headers(
        {"X-Content-Type-Options": "invalid"}
    )

    by_name = {item["header"]: item for item in findings}

    assert by_name["X-Content-Type-Options"]["status"] == "present"
    assert "review" in (
        by_name["X-Content-Type-Options"]["recommendation"].lower()
    )


def test_x_frame_options_accepts_deny():
    findings = analyze_security_headers(
        {"X-Frame-Options": "DENY"}
    )

    by_name = {item["header"]: item for item in findings}

    assert by_name["X-Frame-Options"]["status"] == "present"


def test_x_frame_options_invalid_value_is_flagged():
    findings = analyze_security_headers(
        {"X-Frame-Options": "ALLOW"}
    )

    by_name = {item["header"]: item for item in findings}

    assert by_name["X-Frame-Options"]["status"] == "present"
    assert "review" in (
        by_name["X-Frame-Options"]["recommendation"].lower()
    )


def test_referrer_policy_accepts_strict_origin():
    findings = analyze_security_headers(
        {"Referrer-Policy": "strict-origin"}
    )

    by_name = {item["header"]: item for item in findings}

    assert by_name["Referrer-Policy"]["status"] == "present"


def test_referrer_policy_flags_unsafe_url():
    findings = analyze_security_headers(
        {"Referrer-Policy": "unsafe-url"}
    )

    by_name = {item["header"]: item for item in findings}

    assert by_name["Referrer-Policy"]["status"] == "present"
    assert "review" in (
        by_name["Referrer-Policy"]["recommendation"].lower()
    )
