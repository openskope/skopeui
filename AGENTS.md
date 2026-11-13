# SkopeUI Agent Guide

SkopeUI is a Nuxt 4 frontend for paleoclimate dataset discovery, study-area selection, raster visualization, and time-series analysis. Application code lives under `app/`.

## Working Conventions

- Run Node and npm commands in Docker; do not use host-installed tooling. Prefer the root Make targets.
- `app/store/modules/_constants.js` is generated and ignored. Generate it through Make; do not edit it directly.
- The API URL is compiled into the client bundle. Staging must use `https://staging-api.openskope.org`, and changing the URL requires an image rebuild.
- Pinia stores in `app/stores/` are authoritative for new state. Do not add features to the legacy modules in `app/store/`.
- Browser-dependent map components use the `.client.vue` suffix.
- Keep study-area persistence behind `useLegacyStoreActions` until that bridge is deliberately retired. The application supports one active study feature, and circles must become polygons before persistence or API submission.
- Preserve the study-area guard on the visualize and analyze routes (`middleware/requires-study-area.ts`): without an area they redirect to the select-area page.
- Raster work uses MapLibre with the `skope-api` tile gateway. Do not add direct storage coupling or restore GeoServer/WMS paths.

## Validation

Use `make test` for the full Vitest suite. Use `make build ENVIRONMENT=staging` to validate the deployable Nuxt image and `make config ENVIRONMENT=staging` to inspect resolved Compose configuration.

## Git And Decisions

- Use Conventional Commit messages.
- Do not create commits unless the user explicitly asks.
- Use scopes only for established repository areas.
- For non-trivial changes, use concise lowercase `-` bullets in the body to explain the rationale and operationally relevant details.
- Keep each bullet concrete and independently legible; omit a body when the subject already explains the complete change.
- Prefer branch-wide issue references in the pull request description. Do not repeat the same issue footer across every commit in a branch. Add a lowercase commit footer only when standalone traceability matters, such as for a direct fix, backport, or independently cherry-picked change.
- Architectural decisions live in `.agents/decisions/`. Add an ADR only for durable, cross-cutting choices; preserve accepted ADRs and supersede them with a new ADR when a decision changes.
