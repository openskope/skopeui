# Shared web content and styling

`openskope/openskope.github.io` owns reusable content and styling. The app imports
its version-1 `shared/web/` bundle: `footer.json`, `tokens.json`, `footer.css`,
`application-policy.json`, and `CITATION.cff`. Do not edit the copies under
`app/vendor/web-assets/` or the root `CITATION.cff`; update the website source and pin.

The website renders the same content in its footer, `/cite-skope/` and
`/terms-of-use/`. The app's Vue adapter uses the shared CSS classes and tokens;
Vuetify theme footer color also comes from those tokens. Citation text/BibTeX
are generated from the imported CFF using the existing `make citations` target.
Dialogs, acceptance persistence and consent enforcement stay in the app.
There is no app-source or app-build dependency in the website.

## Import a reviewed revision

Commit and review the source changes, then run from this repository:

```sh
make deps-web-assets WEB_ASSETS_REVISION=<full-40-character-commit-sha>
```

This uses Git to fetch the exact commit and export only allowlisted files, then
runs validation/import in the Node container. Git must have read access to the
website repository (currently private). When `gh` is installed, the importer
adds its credential helper after configured Git helpers; authenticate with
`gh auth login` if needed. Otherwise it uses normal Git authentication.
For an unpublished local source commit:

```sh
make deps-web-assets WEB_ASSETS_REVISION=<sha> WEB_ASSETS_SOURCE=/absolute/path/to/site
```

A local import reads committed Git objects, not working-tree edits. The recorded
repository is still the canonical GitHub repository. Push the source revision
before other operators need to restore it. Review `app/web-assets.lock.json`,
all imported changes and the root CFF together. Invalid exports are rejected before
writes; the lock records the exact revision and SHA-256 of each file.

`npm run web-assets:check` verifies committed local bytes during build,
generation and type checking. It never fetches upstream. Make also rejects a root
CFF that differs from its imported copy. Builds work without upstream credentials
or availability. Restore the lock's exact revision with the same import command.

Run `make test`, `make build ENVIRONMENT=staging`, and browser checks on desktop
and mobile: credit text/links, footer geometry, rendered fonts, citation/BibTeX,
copy controls, terms and consent behavior. Compare with the website at the pinned
revision, not an unrelated live deployment. Each service has its own source/build
link. Operator-reviewed pin updates replace live runtime sharing.
