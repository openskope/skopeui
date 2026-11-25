# Self-hosted fonts

SKOPE UI and the www.openskope.org website use Bitter 700 for the SKOPE wordmark
and subtitle, with Source Sans 3 300–700 for body text and controls. Bitter retains
the existing identity; Source Sans 3 was selected to replace Roboto across both
repos. Vuetify typography is configured in `app/assets/style/vuetify-settings.scss`;
the header uses the same body family for its controls.

`app/fonts.lock.json` records versioned upstream URLs, Unicode ranges and SHA-256
checksums. WOFF2 files are committed in `app/assets/fonts/`, with licenses under
`app/public/fonts/`. `app/assets/style/fonts.css` declares normal and real italic
faces with `font-display: swap`. Latin Extended loads only when needed.
`app/plugins/fonts.ts` preloads only the normal Latin Bitter and Source Sans 3
faces. Vite fingerprints both CSS URLs and preload imports; there are no Google
Fonts stylesheet requests. Existing icon-font handling is separate.

Builds and type checks verify committed font bytes and licenses locally, with no
font download needed. Restore the pinned set through the normal container:

```sh
make fonts
```

For a deliberate update, review upstream changes, edit the versioned source URLs
and metadata, then run `make fonts FONT_UPDATE_LOCK=1`. Review new checksums,
licenses and binary changes. Keep font-face ranges and the two preload imports
aligned if changing families or subsets. Coordinate the same asset/checksum set
with the website’s
[`data/fonts.json`](https://github.com/openskope/openskope.github.io/blob/main/data/fonts.json); do not update a live site independently
and assume the other repo followed automatically.

Run `make test` and `make build ENVIRONMENT=staging`. In a browser, verify actual
rendered font families, successful local WOFF2 requests, two preload links,
no Google Fonts requests, header/control fit on desktop/mobile, and genuine italic
text. Font upgrades are operator-led: prioritize useful glyph/rendering fixes or
security advisories, and check line wrapping and layout before deployment.
