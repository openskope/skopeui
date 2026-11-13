# 0002: Render COG Data Through the API Tile Gateway

- Status: Accepted
- Date: 2026-08-11
- Supersedes: the 2026-03-16 proposal for direct browser COG decoding

## Context

Direct browser access to public COGs was considered to reduce server work. It would also couple clients to storage layout, move decoding cost to browsers, and make rendering policy, observability, and future access control harder to manage.

## Decision

MapLibre consumes ordinary raster tiles from `skope-api`. The API resolves dataset metadata and delegates COG reads and rendering to TiTiler. SkopeUI does not construct storage URLs or reintroduce the retired GeoServer/WMS path.

## Consequences

- Dataset, variable, year, colormap, and rescale parameters remain part of the API contract.
- Storage layout and COG implementation details stay behind `skope-api`.
- Tile-service availability is required for raster visualization.
- Direct client-side COG rendering remains a rejected historical option unless this ADR is superseded.

