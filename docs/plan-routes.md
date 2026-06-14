# Implementation plan: multi-route content pipeline

This plan implements the route system agreed in design discussion: raw inputs under `routes/`, generated artifacts under `public/data/`, static Astro pages at `/routes` and `/routes/[slug]`, CI as the builder, JSON Schema for validation.

**Out of scope for this plan:** migrating legacy `public/data/tracks` + `public/data/pois` (handle in a separate effort).

---

## Locked decisions (v1)

| Topic | Decision |
|-------|----------|
| Config | `routes/config.json` with `{ routes: [{ displayName, folder }] }` |
| Slug | Projected from `displayName` (trim → lowercase → non-alphanumeric → `-` → collapse → trim dashes). **Not** stored in config. Duplicates → CI fail. |
| URLs | Slug only. `folder` never appears in URLs. |
| GPX | All `*.gpx` in `routes/<folder>/gpx/`. Order irrelevant; CI sorts filenames for stable merge. |
| Manual POIs | Single file: `routes/<folder>/manual-pois.json` (array) |
| Build scope | **All** routes in config on every build; missing folder/GPX → fail |
| Index page | Display names only (from generated index) |
| Deploy | Static Astro (`output: "static"`), GitHub Pages + `PUBLIC_BASE_PATH` |
| Upload UI on route pages | Not required for v1 |
| Admin docs / checklist | Not required; JSON Schema only |
| Migration from old data layout | Separate chat |

---

## Current state (`dev` branch)

- **Entry:** `src/pages/index.astro` → `Main` → `MapView` (single map app).
- **Stores:** `trackStore` / `poiStore` are simple `atom`s; upload flow fills them client-side via Overpass.
- **Track shape:** `Track { name, data: GeoJSON | null }` (`src/types/track.types.ts`).
- **Deploy:** `.github/workflows/deploy.yml` sets `PUBLIC_BASE_PATH` per branch (`/roadbook` or `/roadbook/<branch>`).
- **Astro:** `adapter: vercel()` in `astro.config.mjs` — must switch to **static** for GH Pages.
- **No** `routes/` input tree, **no** `scripts/build-routes`, **no** route pages yet.

---

## Target architecture

```
routes/                              # INPUT (committed)
  config.json
  alps-divide/
    gpx/*.gpx
    manual-pois.json

public/data/                         # OUTPUT (committed after CI or pre-commit)
  routes-index.json                  # [{ slug, displayName }]
  routes/<slug>/
    manifest.json                    # { slug, displayName, track, pois }
    track.json                       # merged LineString + metadata
    pois.json                        # OSM + manual, enriched

src/pages/
  index.astro                        # redirect or link to /routes
  routes/index.astro                 # list displayName → link to /routes/[slug]
  routes/[slug].astro                # map app for one route

scripts/
  validate-routes.ts                 # schema + filesystem checks
  build-routes.ts                    # GPX → track, Overpass → pois, merge manual
  lib/slug.ts, lib/gpx.ts, lib/config.ts, lib/buildPois.ts, lib/iconMap.ts

schemas/
  routes-config.schema.json
  manual-pois.schema.json
```

### Slug projection (implement once, use in CI + tests)

```ts
// "Alps Divide ULTRA 2025" → "alps-divide-ultra-2025"
function slugFromDisplayName(displayName: string): string
```

Rules: trim → `toLowerCase()` → NFKD + strip diacritics → replace `[^a-z0-9]+` with `-` → collapse `-` → trim `-`. Reject empty slug.

### Generated `track.json` (match MapView expectations)

MapView today expects `track.data` as GeoJSON from GPX (`features[0].geometry`). For built routes, either:

- **Option A (recommended):** Store a minimal GeoJSON `FeatureCollection` with one `LineString` feature (same as upload path), plus `name` on the store when loading.
- **Option B:** Change MapView to accept `{ linestring: LineString, name, distance }` and normalize in a loader.

Pick **Option A** in v1 to minimize MapView churn.

### Generated `pois.json`

Array of `PointOfInterest` with `resourceId`, `resourceCategoryId`, `trackDistance`, `icon` (string icon key), `color`, etc. — same enrichment as `fetchOverPassPOIsAlongRoute` + manual entries from `manual-pois.json`.

### `manifest.json`

```json
{
  "slug": "alps-divide-ultra-2025",
  "displayName": "Alps Divide ULTRA 2025",
  "track": "track.json",
  "pois": "pois.json"
}
```

### `routes-index.json`

```json
{
  "routes": [
    { "slug": "alps-divide-ultra-2025", "displayName": "Alps Divide ULTRA 2025" }
  ]
}
```

---

## Implementation phases

### Phase 0 — Tooling baseline

**Goal:** Scripts can run locally and in CI.

| Task | Details |
|------|---------|
| Add dev deps | `tsx`, `ajv` (+ `ajv-formats` if needed), `@types/node` |
| npm scripts | `"validate:routes": "tsx scripts/validate-routes.ts"`, `"build:routes": "tsx scripts/build-routes.ts"`, `"prebuild": "npm run validate:routes && npm run build:routes"` (or explicit CI step before `astro build`) |
| Astro static | `output: "static"`, remove Vercel adapter (or gate behind env) |

**Acceptance:** `npm run validate:routes` exits 0 on empty/minimal config; fails on invalid JSON.

---

### Phase 1 — Schemas + config contract

**Goal:** Single source of truth validated before any build.

| Task | Details |
|------|---------|
| `schemas/routes-config.schema.json` | `routes[]` with required `displayName`, `folder`; `additionalProperties: false` |
| `schemas/manual-pois.schema.json` | Array of objects: `lat`, `lon`, `name`, `resourceId`, `resourceCategoryId`; optional `website`, `phone`, `address`, `description` |
| `scripts/lib/config.ts` | Load + parse `routes/config.json` |
| `scripts/lib/slug.ts` | `slugFromDisplayName` + `assertUniqueSlugs(routes)` |
| `scripts/validate-routes.ts` | Ajv validate config; for each route: `routes/<folder>/` exists; `gpx/` has ≥1 `.gpx`; `manual-pois.json` exists and validates (allow `[]`) |

**Acceptance:** Duplicate displayNames that slug-collide → exit 1. Missing folder → exit 1.

---

### Phase 2 — Route build pipeline

**Goal:** `npm run build:routes` writes `public/data/`.

| Task | Details |
|------|---------|
| `scripts/lib/gpx.ts` | Parse GPX → coordinates; reuse logic from legacy `gpx-to-json.mjs` or `@we-gold/gpxjs` in Node |
| Merge GPX | Sort `gpx/*.gpx` by filename; concat coordinates into one `LineString`; compute `distance` (turf) |
| Write `track.json` | GeoJSON FeatureCollection + metadata for store loader |
| `scripts/lib/buildPois.ts` | Port Overpass fetch from `fetchOverPassPOIsAlongRoute.ts` (buffer 2500m, resources from `src/lib/data.ts`) |
| Manual merge | Load `manual-pois.json`; assign synthetic ids `manual-<slug>-<n>`; enrich with `trackDistance`, icons (`scripts/lib/iconMap.ts` mirrors poi icon map) |
| Write outputs | `public/data/routes/<slug>/track.json`, `pois.json`, `manifest.json`; regenerate `public/data/routes-index.json` |
| Clean step | Remove `public/data/routes/<slug>/` for slugs no longer in config (avoid ghosts) |

**Acceptance:** One sample route (`alps-divide`) produces loadable JSON; manual POIs appear in `pois.json`.

**Note:** Overpass in CI — use polite rate limiting, clear User-Agent, retries on timeout. Consider caching responses under `routes/.overpass-cache/` (gitignored) for local dev only.

**Incremental builds (opt-in):**

| Command | Behavior |
|---------|----------|
| `npm run build:routes` | Full rebuild of every route in config |
| `npm run build:routes:missing` | Skip routes that already have `track.json`, `pois.json`, and `manifest.json` under `public/data/routes/<slug>/` |
| `npm run build:routes:force` | Full rebuild (overrides missing-only when both env vars are set) |

`routes-index.json` and stale-output cleanup always run. CI sets `BUILD_ROUTES_ONLY_MISSING=1` with `SKIP_OVERPASS=1` so only new slugs without committed artifacts are processed.

If GPX or `manual-pois.json` change for an existing route, run `npm run build:routes:force` or delete `public/data/routes/<slug>/` before `build:routes:missing`.

---

### Phase 3 — Static pages

**Goal:** Browse routes and open the map per slug.

| Task | Details |
|------|---------|
| `src/pages/routes/index.astro` | At build time, read `public/data/routes-index.json`; render list of links: `${import.meta.env.BASE_URL}routes/${slug}` + `displayName` only |
| `src/pages/routes/[slug].astro` | `export async function getStaticPaths()` from `routes-index.json`; pass `slug` to island |
| `src/pages/index.astro` | Redirect to `/routes` or simple landing with link |
| Route loader component | On mount: `fetch(`${import.meta.env.BASE_URL}data/routes/${slug}/manifest.json`)` then track + pois; `trackStore.set` / `poiStore.set` |
| `Map.astro` / `MapView` | Accept optional `slug` prop from Astro page wrapper, or read from `data-slug` attribute |

**Acceptance:** `astro build` emits `/routes/index.html` and `/routes/<slug>/index.html`. Preview with `PUBLIC_BASE_PATH=/roadbook/dev` resolves data URLs correctly.

**Pitfall:** All fetches must prefix `import.meta.env.BASE_URL` (not root-absolute `/data/...`).

---

### Phase 4 — CI integration

**Goal:** Every deploy builds routes before Astro.

| Task | Details |
|------|---------|
| Update `.github/workflows/deploy.yml` | After checkout: `npm ci` → `npm run validate:routes` → `npm run build:routes` → Astro build (withastro/action runs `npm run build` if `prebuild` hook set) |
| Commit policy | **Option 1:** CI only writes to `dist` (generated data committed manually or by bot). **Option 2:** CI commits `public/data/**` back to branch. Pick one; v1 recommendation: **commit generated JSON in PR** so Pages deploy does not require Overpass on every Astro build (faster, reproducible). Document in plan README. |
| Branch “build all” | Feature branch with only one `routes/<folder>/` but full config → validate fails until config trimmed or folders added (intentional) |

**Acceptance:** Push to `dev` deploys list + route pages with data.

---

### Phase 5 — Polish (still v1)

| Task | Details |
|------|---------|
| Hide upload on `/routes/[slug]` | Do not render `UploadSection` on curated pages (keep on `/` if needed for playground) |
| 404 | `getStaticPaths` only known slugs; Astro `404.astro` for unknown |
| Tests | Unit tests for `slugFromDisplayName` (collisions, unicode, punctuation) |

---

## JSON Schema sketches

### `routes-config.schema.json`

```json
{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "type": "object",
  "required": ["routes"],
  "properties": {
    "routes": {
      "type": "array",
      "minItems": 1,
      "items": {
        "type": "object",
        "required": ["displayName", "folder"],
        "additionalProperties": false,
        "properties": {
          "displayName": { "type": "string", "minLength": 1 },
          "folder": {
            "type": "string",
            "pattern": "^[a-z0-9]+(?:-[a-z0-9]+)*$",
            "description": "Directory name under routes/, not used in URLs"
          }
        }
      }
    }
  },
  "additionalProperties": false
}
```

### `manual-pois.schema.json` (excerpt)

- Root: `array`
- Items: required `lat`, `lon`, `name`, `resourceId`, `resourceCategoryId`
- `lat`/`lon` number bounds

---

## Admin workflow (operational, not docs)

1. Create `routes/<folder>/gpx/*.gpx` + `manual-pois.json` (`[]` if empty).
2. Add entry to `routes/config.json`.
3. Run `npm run validate:routes && npm run build:routes:missing` locally when adding a route (or full `build:routes` / `build:routes:force` after input changes).
4. Commit inputs + generated `public/data/**`.
5. Merge; CI deploys. Canonical URL on `main`: `https://christophschaller.github.io/roadbook/routes/<slug>/`.

---

## Task checklist (execution order)

```
[ ] Phase 0: static Astro, tsx, npm scripts
[ ] Phase 1: schemas + validate-routes.ts + slug.ts
[ ] Phase 2: build-routes.ts (gpx merge, overpass, manual merge, outputs)
[ ] Seed routes/alps-divide/ + routes/config.json (migration chat may supply GPX)
[ ] Phase 3: routes/index.astro, routes/[slug].astro, route data loader
[ ] Phase 4: GitHub Actions prebuild
[ ] Phase 5: hide upload on route pages, slug unit tests, 404
```

---

## Risks and mitigations

| Risk | Mitigation |
|------|------------|
| Overpass flaky in CI | Commit built `public/data`; optional cache; retries |
| Slug changes when renaming displayName | Document; add optional `slug` field in v2 if needed |
| Large `pois.json` | Accept for v1; split per-section later if needed |
| `trackStore`/`poiStore` global state | Full page navigation between routes (static MPA) resets state — OK for v1 |
| Branch deploy base path | Always use `import.meta.env.BASE_URL` for data + routes links |

---

## Definition of done (v1)

- [ ] `routes/config.json` drives all routes; CI validates and builds.
- [ ] `/routes` lists display names; each links to a working map.
- [ ] `/routes/<slug>` loads track + POIs from `public/data/routes/<slug>/`.
- [ ] Slug projection tested; duplicate slugs fail validation.
- [ ] Static build works with `PUBLIC_BASE_PATH` on GH Pages.
- [ ] JSON Schema present for config and manual POIs.

---

## References (current code to port or wire)

| Area | Path |
|------|------|
| Overpass + enrichment | `src/lib/dataFetching/fetchOverPassPOIsAlongRoute.ts` |
| Resource definitions | `src/lib/data.ts` |
| Map + stores | `src/components/react/MapView.tsx`, `trackStore`, `poiStore` |
| Deploy base path | `.github/workflows/deploy.yml`, `astro.config.mjs` |
| Upload (client GPX) | `src/components/react/MainControlsBar/sections/UploadSection.tsx` |
