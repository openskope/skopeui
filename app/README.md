# SkopeUI frontend

Nuxt 4, Vue, Pinia, Vuetify, MapLibre, and Plotly provide dataset discovery, visualization, and analysis.

Run all Node and npm commands through Docker, from the repository root:

```bash
# Local development against the staging API
make deploy-dev SKOPE_API_HOST_URL=https://staging-api.openskope.org

# Tests and deployable staging build
make test
make build ENVIRONMENT=staging
```

The Dockerfile pins Node 26.13.1 LTS and npm 12.2.2. It installs dependencies with `npm ci` using the committed `package-lock.json`, then builds with `npm run build`. No Yarn or Corepack is required.

The `glob` and `minimatch` overrides select patched stable releases until upstream tools adopt them. `npm audit` still reports the unpatched low-severity [deepmerge advisory](https://github.com/advisories/GHSA-gcqx-w48m-w2h4) through Nuxt’s Rollup build dependencies; do not downgrade Nuxt to hide it. Revisit these overrides and the advisory with future updates.

TypeScript stays on `~6.0.3` because the current ESLint and Vue tooling require its JavaScript compiler API; [TypeScript 7.0 does not provide that API](https://devblogs.microsoft.com/typescript/announcing-typescript-7-0/). `vuetify-nuxt-module` stays on stable `0.19.5` rather than the `1.0.0` release candidate tagged `latest`.

When changing dependencies, regenerate the lockfile in Docker, rebuild the image, and recreate the development container's anonymous `/code/node_modules` volume (stop it with `make down` before `make deploy-dev`). Keep dependencies on stable releases; some package `latest` tags point to prereleases.

Nuxt retains the existing source layout through `srcDir: "."`. Generated output lives in `.nuxt` and `.output`; both are ignored by Git and Docker build contexts.

See the [root README](../README.md) for deployment targets and the [Nuxt documentation](https://nuxt.com/docs/4.x/getting-started/introduction).
