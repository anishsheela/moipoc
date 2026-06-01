# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project overview

This is a **static HTML/CSS/JS demo** for "MOI — My Own Information", a digital identity concept built around OSMIO certificates. There is no build step, no package manager, and no framework — open any `.html` file directly in a browser or serve with any static file server (e.g. `python3 -m http.server`).

## Architecture

### Entry points

| File | Purpose |
|---|---|
| `index.html` | Top-level landing — two buttons directing to the two separate demo hubs |
| `moi-hub.html` | MOI Demo Hub — all identity vault and age-attestation scenarios |
| `attestation-hub.html` | Attestation Portal Demo Hub — officer scheduling and verification workflow (separate client) |
| `landing.html` | Legacy marketing page; redirects to `index.html` |
| `moi.html` | MOI user app (personal identity vault) |
| `admin.html` | OSMIO attestation portal (supervisor + officer roles) |
| `tnt.html` | "Trusted & True" dating app (consumes MOI identity) |
| `nextcloud.html` | Nextcloud integration demo |
| `betmax.html` | BetMax gambling app (age verification demo) |
| `cigs.html` | Cigs app (age verification demo) |
| `email.html` | In-demo email client (for officer communication flow) |

### Core JS pattern

Every app page follows the same SPA pattern:

1. **`js/router.js`** — loaded by every app. Provides `Router` (hash-based, with fade transitions) and shared helpers (`formatDate`, `timeAgo`, `avatar`, `idqaBadge`, `verifiedBadge`, `statusBadge`, SVG constants).
2. **`js/mock-data.js`** — loaded by every app. `MOCK` is the single source of truth for all demo state (current user, attestation requests, officers, email personas, etc.). State changes during a demo session are made by mutating this object directly.
3. **App JS file** (e.g. `js/moi.js`) — creates `const router = new Router()`, registers hash routes, and renders screens by setting `document.getElementById('app').innerHTML`.

### CSS structure

- `css/shared.css` — reset, CSS custom properties, badge system (`.badge-verified`, `.badge-pending`, etc.), `.idqa-badge`, `.avatar`, animations, utility classes. Loaded by all apps.
- Per-app CSS files (e.g. `css/moi.css`, `css/admin.css`) contain app-specific variables and component styles.

### Key domain concepts

- **IDQA score** — Identity Quality Assurance score (0–24). Current max achievable in the demo is 12 ("ID Attested"). Rendered by `idqaBadge()`.
- **Osmio ID Pair** — the certificate pair (Foundation + Numberplate) that backs a user's identity.
- **Attestation flow** — user requests ID verification → supervisor assigns officer → officer schedules slot → in-person session → admin approves/rejects. The `MOCK.attestationRequests` array drives this.
- **Consent screen** — when a third-party app (TNT, BetMax, etc.) requests identity fields from MOI, `moi.html#consent` renders the consent UI showing which fields are requested.

### Admin portal roles

`admin.js` has two personas switched at login (`adminRole`: `'supervisor'` | `'officer'`). Supervisor screens are prefixed `sup-`, officer screens prefixed `off-` in the router hash.

**Supervisor routes:**

| Hash | Screen |
|---|---|
| `sup-dashboard` | Overview stats, upcoming sessions, officer roster |
| `sup-assign` | Assign officers to unassigned slot-chosen requests |
| `sup-reassign` | Reassign officer for a specific request |
| `sup-all-requests` | Full table of all attestation requests |
| `sup-officer-schedules` | View any officer's session schedule (list or calendar) |

**Officer routes:**

| Hash | Screen |
|---|---|
| `off-dashboard` | Personal stats, pending-acceptance queue, today's sessions |
| `off-schedule` | Full session list / calendar view |
| `off-availability` | Weekly availability grid (block slots, mark days off) |
| `off-session` | Complete a live session (approve / reject) |
| `off-cert-issued` | Notarial certificate preview after approval |

The legacy verification-queue screens (`dashboard`, `review`, `users`) and their supporting functions have been fully removed, including `MOCK.verificationQueue` and `MOCK.admin` from `mock-data.js`.

## Minimal POC (`moi_minimal_poc/`)

A self-contained, simpler prototype living in its own subdirectory. No shared code with the main demo. Has its own `CLAUDE.md` with full details.

| File | Purpose |
|---|---|
| `index.html` | MOI vault — login, verification animation, dashboard, consent screen |
| `moi.html` | Alternate MOI vault entry point |
| `about.html` | About / explainer page |
| `gambling.html` | Gambling app age-gate demo (relying party) |
| `medical.html` | Medical app demo (relying party) |
| `ypo.html` | YPO (Young Presidents' Organization) demo (relying party) |

Cross-page consent uses `sessionStorage` + URL hash — no server, no OAuth. All state is in-memory JS; no persistence or real cryptography.

## Deployment

The site is hosted at `moidemo.authentiverse.net` on a NixOS VPS at `77.90.40.64`. It deploys automatically via GitHub Actions on every push to `main` — see `.github/workflows/deploy.yml`.

Files are rsynced to `/var/www/moidemo.authentiverse.net/` on the server as user `anish`. The workflow uses a dedicated SSH deploy key stored as the `DEPLOY_SSH_KEY` GitHub Actions secret.

### Adding the deploy key to the server

1. Generate a keypair (no passphrase): `ssh-keygen -t ed25519 -C "moidemo-deploy" -f moidemo_deploy_key`
2. Add the **public key** to `users.users.anish.openssh.authorizedKeys.keys` in the NixOS config and redeploy (or append to `~/.ssh/authorized_keys`).
3. Add the **private key** as the `DEPLOY_SSH_KEY` secret in **Settings → Secrets and variables → Actions**.
4. Delete both key files locally.
