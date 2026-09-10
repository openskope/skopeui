# 0001: Adopt Nuxt 3 and Pinia

- Status: Accepted
- Date: 2026-03-14

## Context

The application was built around Nuxt 2, Vue 2 class components, Vuex decorators, and injected compatibility APIs. Those dependencies blocked framework upgrades and made state behavior difficult to test independently.

## Decision

Use Nuxt 3 and Vue 3 for the application. Pinia stores under `app/stores/` are authoritative for domain state, and browser persistence is accessed through composables. The code under `app/store/` remains only as a temporary compatibility surface while consumers are migrated.

## Consequences

- New state and business behavior belong in Pinia stores or composables.
- Existing routes and persisted study-area behavior must remain compatible during migration.
- Legacy store modules should be removed as their final consumers disappear, not extended with new features.

