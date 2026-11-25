# 0006: Import shared content and styling from the static website

- Status: Accepted
- Date: 2026-11-25

## Context

The Hugo website and interactive app repeat project credits, typography choices,
citation guidance and terms. Independent edits create drift. Shared content must
remain available without either deployment depending on the other at runtime.

## Decision

The website owns reusable, shareable project content and styling. The app imports
its small `shared/web/` bundle from a full Git commit and records SHA-256 checksums.
Use `app/vendor/web-assets/` for the imported distribution; Nuxt reserves `shared/`
for its own cross-runtime handling, which broke production JSON resolution here.
The root `CITATION.cff` is synchronized from the bundle for GitHub and the existing
citation generator. Application state, dialogs and consent behavior stay local.

## Consequences

- Normal builds verify local files without upstream access. Only the explicit
  maintenance import fetches Git objects; it can also use a local source checkout.
- The website never imports app code or app build output; there is no cycle.
- Shared data, tokens and CSS have one editable source, while rendering adapters
  remain small and preserve each framework's behavior.
- Schema/class changes and bundle pin updates require coordinated review.
- See [update instructions](../../docs/shared-web-assets.md). This decision does
  not move unrelated application UI or independently maintained font assets.
