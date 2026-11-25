# Font validation

Validated locally on 2026-11-24. No staging or production deployment occurred.

- `make fonts`: restored five WOFF2 faces and two licenses, verifying their pins.
- `make test`: offline font-integrity check, full Nuxt type checking and the
  Vitest suite passed.
- `make build ENVIRONMENT=staging PULL=0`: deployable production image built;
  font-integrity verification ran before Nuxt compilation. The same Node base
  had already been pulled and validated during this task.
- The same five font checksums are recorded in the website's `data/fonts.json`
  and this repo's `app/fonts.lock.json`.
- An isolated local production preview on port 3001 confirmed Bitter branding
  and Source Sans 3 body/control text, including Chrome's actual rendered fonts.
  Two anonymous-CORS font preloads use the same local hashed URLs as CSS;
  no Google Fonts requests or page errors occurred.
- Font responses: HTTP 200, `font/woff2`, and
  `Cache-Control: public, max-age=31536000, immutable`. Both licenses returned 200.
- Header wordmark remains unclipped at widths 390, 768 and 1440 pixels.

Browser evidence is held locally with the website's ignored `tmp/browser/`
artifacts (`ui-font-result.json`, `ui-desktop.png`, `ui-mobile.png`). The isolated
preview container is `skopeui-font-preview`; its network is `skope-font-preview`.
It uses the staging API for read-only dataset browsing and leaves the existing
port-3000 development service intact. See [font maintenance](fonts.md) for normal maintenance.
