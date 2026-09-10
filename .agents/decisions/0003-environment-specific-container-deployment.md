# 0003: Use Explicit Environment-Specific Container Deployments

- Status: Accepted
- Date: 2026-09-09

## Context

The previous workflow generated ignored configuration and Compose files, used one mutable image tag, and compiled the production API URL into staging builds. Nuxt was rebuilt whenever a deployed container started.

## Decision

Select `dev`, `staging`, or `prod` explicitly through Make targets and layered Compose files. Generate client constants before the image build, build the Nuxt artifact in a multi-stage Dockerfile, and run only the Nitro output in deployed containers. Use distinct image tags and wait for container health during deployment.

The default API endpoints are:

- Development: `http://localhost:8001`
- Staging: `https://staging-api.openskope.org`
- Production: `https://api.openskope.org`

## Consequences

- Changing the API URL requires rebuilding the UI image.
- `make deploy-staging` and `make deploy-production` are the canonical host deployment commands.
- CI verifies that the staging bundle contains the staging API endpoint.
