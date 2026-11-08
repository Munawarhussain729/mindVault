# Security Policy

## Supported versions

MindVault is under active development. Only the latest commit on `main`
receives security fixes.

## Reporting a vulnerability

Please do not open a public issue for security problems.

Instead, report the vulnerability privately through GitHub:

1. Go to the repository's **Security** tab.
2. Click **Report a vulnerability** to open a private advisory.

If private reporting is unavailable, open a minimal issue asking for a private
contact — do not include details of the vulnerability.

Please include as much as you can: the affected endpoint or component, steps to
reproduce, the potential impact, and any suggested mitigation. You can expect
an acknowledgement within a few days.

## Scope notes

- Authentication is JWT-based; tokens are stored in browser cookies that are
  readable by scripts (not `httpOnly`). Treat cross-site scripting reports as
  high impact.
- The backend must always scope notes and personal tags to the requesting
  user. Any way to read or modify another user's data is a security issue.
- `DJANGO_DEBUG` must never be enabled outside local development.
