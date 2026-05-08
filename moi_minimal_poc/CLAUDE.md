# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

A two-file browser-only proof-of-concept for **MOI (My Own Information)** — a personal identity vault that lets users share derived, privacy-preserving answers (e.g. "is user 18+?") with third-party apps, without disclosing raw PII.

No build step. No framework. No dependencies beyond Google Fonts. Open the HTML files directly in a browser or via any static file server.

```
python3 -m http.server 8080   # then open http://localhost:8080
```

## File roles

- **`index.html`** — the MOI vault app. Three screens driven by `location.hash`:
  - **Login** (`#` / default): detects the user's Osmio ID Pair cert, prompts "Access My Vault"
  - **Verification**: animates four sequential steps (cert signature → Numberplate linkage → OSMIO trust chain → vault decryption) before opening the dashboard
  - **Dashboard**: shows profile, Osmio ID Pair cards (Foundation + Numberplate), and attested identity fields
  - **Consent** (`#consent`): intercepts a cross-page data request from a relying party, shows the derived answer, and lets the user grant or decline

- **`nextcloud.html`** — a mock Nextcloud relying party. Shows an age-gate banner that triggers the MOI consent flow, then renders a locked/unlocked file grid depending on the result.

## Cross-page consent flow

The two pages communicate via `sessionStorage` and URL hash — no server, no OAuth:

1. `nextcloud.html` writes a JSON request object to `sessionStorage['moi_nc_request']` and navigates to `index.html#consent`.
2. `index.html` reads the request, computes the derived answer locally (e.g. age ≥ 18 from a hardcoded DOB), and renders the Consent screen.
3. On grant/decline, `index.html` writes `'granted'` or `'declined'` to `sessionStorage['moi_nc_result']`, clears the request, and redirects back to `nextcloud.html#granted` or `#declined`.
4. `nextcloud.html` reads the result on load and renders the appropriate banner.

## Key concepts

- **Osmio ID Pair**: two paired certs — Foundation (identity) and Numberplate (pseudonymous link). Both are hardcoded demo values.
- **IDQA score**: Identity Quality Assurance score shown on the dashboard (hardcoded `12`).
- **Attested fields**: PII fields each carry a `verifiedDate`; the badge shows "Attested <date>" not the raw cert.
- **Privacy model**: the consent screen explicitly computes and shares only a derived boolean — the actual DOB never leaves the vault.

## Architecture notes

All state is in-memory JS (`const USER = {...}`) and `sessionStorage`. There is no persistence, no authentication, and no real cryptography — this is a UI/UX prototype only. The `startVerification()` animation in `index.html` is purely cosmetic (timeouts, no real cert validation).

Screen transitions work by replacing `document.getElementById('app').innerHTML` wholesale — there is no virtual DOM or router.
