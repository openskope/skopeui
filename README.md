# Synthesizing Knowledge of Past Environments

[![DOI](https://zenodo.org/badge/159711888.svg)](https://zenodo.org/badge/latestdoi/159711888)
[![Build/Test Docker Image CI](https://github.com/openskope/skopeui/actions/workflows/docker-ci.yml/badge.svg)](https://github.com/openskope/skopeui/actions/workflows/docker-ci.yml)

SkopeUI is the Nuxt 3 frontend for the [Synthesizing Knowledge of Past Environments](https://www.openskope.org/) platform. It provides dataset discovery, interactive MapLibre visualization, study-area selection, and time-series analysis backed by [skope-api](https://github.com/openskope/skope-api).

Docker and Docker Compose are the only host dependencies. Node and npm commands run inside the application container.

## Local development

Start the development server at <http://localhost:3000>:

```bash
make deploy-dev
```

The development build uses `http://localhost:8001` for the API by default. Override it for a single command when needed:

```bash
make deploy-dev SKOPE_API_HOST_URL=http://example.test:8001
```

Run the test suite and lint checks with `make test` and `make lint`.

## Deployment

Each deployment target selects its API endpoint explicitly:

| Target | UI image | API endpoint |
| --- | --- | --- |
| `make deploy-dev` | `openskope/skopeui:dev` | `http://localhost:8001` |
| `make deploy-staging` | `openskope/skopeui:staging` | `https://staging-api.openskope.org` |
| `make deploy-production` | `openskope/skopeui:prod` | `https://api.openskope.org` |

Deployments build the selected image, replace the running Compose service, and wait for its health check. Use `make config ENVIRONMENT=staging` to inspect the resolved Compose configuration before deploying. Operational commands accept the same environment selection, for example:

```bash
make ps ENVIRONMENT=staging
make logs ENVIRONMENT=staging
make restart ENVIRONMENT=staging
make down ENVIRONMENT=staging
```

The API URL is compiled into the Nuxt client bundle. Rebuild the image after changing `SKOPE_API_HOST_URL`.

## Contributors

- Allen Lee @alee
- Kyle Bocinsky @bocinsky
- Calvin Pritchard @cpritcha
- Christine Nguyễn @chrstngyn
