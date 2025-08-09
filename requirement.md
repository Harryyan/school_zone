# Auckland School Finder — Detailed Requirements (for Claude Code)

## 1) Summary

Build a public website for discovering **all primary and secondary school campuses in Auckland, New Zealand**, with fast search and an interactive **map view**. Users can:

- Search by **school name**, **address**, or **suburb**.
- Filter by **school type** (Primary/Intermediate/Secondary/Composite), **year levels**, **gender**, **state/integrated/private**, **decile/Equity Index band** (if provided), **co-ed status**, **special character**, and **boarding**.
- See schools **near a given address** with distance sorting.
- Check whether an **address is inside a school’s enrolment zone** (aka home zone) and view the zone polygon on the map.
- Open a school detail page with **key facts**, **contact**, **Ofsted-like ERO summary link** (if available), **roll size**, **zone information**, **transport options** (optional), and links to the **official website**.

The site should be **mobile-first**, **accessible (WCAG AA)**, **fast**, and **multilingual-ready** (English now; Chinese later).

---

## 2) Goals & Non‑Goals

### Goals

1. Provide an accurate, searchable catalogue of Auckland primary and secondary schools and their campuses.
2. Offer reliable **address-in-zone** checks using authoritative zone boundaries.
3. Make it simple to compare nearby schools with filters and map-based discovery.
4. Ensure performance (p95 search response < 300ms with warm cache; map interactions < 100ms on pan/zoom).
5. Ensure accessibility (keyboard nav, proper contrast, ARIA roles), and SEO-friendly rendering.

### Non‑Goals (v1)

- In-depth ERO report content (link out instead).
- Application/enrolment workflow.
- Real-time transport routing or school bus timetables.
- Non-Auckland regions (design extensible, but initial data = Auckland only).

---

## 3) Primary Users & Key Scenarios

- **Parents/Guardians moving house**: Enter a street address → see nearby schools and which zones they fall into.
- **Parents comparing options**: Filter by type/year levels; scan map; open 2–3 detail pages to compare.
- **Students (senior)**: Search school by name; get contact details and quick facts.
- **Real estate agents**: Confirm whether a listing’s address is in a given school’s zone.

---

## 4) Core Features

### 4.1 Global Search (Header)

- Single input accepting **school name**, **address**, or **suburb**.
- Autocomplete suggestions grouped by type: *Schools*, *Addresses*, *Suburbs*.
- Keyboard support (↑/↓, Enter), and clear button.

### 4.2 Results List + Map (Split View)

- Left: **result list** with pagination or infinite scroll.
- Right: **map** (sticky on desktop; full-screen toggle on mobile).
- On pan/zoom, optionally **re-query within map bounds** (user-controlled toggle: “Search this area”).
- Cluster markers at low zoom; individual markers at high zoom.
- Hover/selection sync: list item ↔ marker highlight.

### 4.3 Filters

- School Type: Primary, Intermediate, Secondary, Composite.
- Year Levels: ranges (e.g., Y1–6, Y7–8, Y9–13).
- Gender: Co-ed, Boys, Girls.
- Proprietor: State, State-Integrated, Private.
- Special Character (Catholic, etc.).
- Boarding: Yes/No.
- Equity Index band/Decile band (if available from data).
- Zone presence: Has zone / No zone.
- Distance slider (from searched address) and sort by distance/name.
- Clear-all filters.

### 4.4 Address-in-Zone Check

- Address input box with NZ geocoding.
- Show **which school zones include this address** (can be 0, 1, or many).
- Display the **zone polygon(s)** on the map with clear coloring and legend.
- Provide a **disclaimer** about final confirmation by the school/MoE.

### 4.5 School Detail Page

- Header: School name, type, year levels, co-ed status, state/integrated/private, and a **map snippet**.
- Contact: Address, phone, email, website link.
- Quick facts: roll size (if available), Equity Index/decile (if available), ERO link (if available), Kura/special character flags, boarding.
- Zone tab: zone map polygon, last updated date, zone notes (if provided), “Check my address” mini-widget.
- Nearby schools: 3–5 closest schools with distance.
- Data provenance + disclaimer.

### 4.6 Admin/Data Ops (Internal)

- One-click **data import** from source datasets (CSV/GeoJSON) with schema validation.
- Zone polygon ingestion; union/repair invalid polygons; snapping tolerances.
- **Audit fields**: source file, version, import timestamp.
- Preview diffs before publish; rollback to previous snapshot.

---

## 5) Data Sources & Ingestion (High-Level)

- **Authoritative school directory** for Auckland (official MoE datasets or Education Counts exports).
- **Enrolment zone boundaries** (GeoJSON/ESRI shapefiles) where available.
- **Geocoding**: NZ address geocoder (service or dataset) for forward & reverse geocoding.
- **Suburbs** boundaries (optional) for facet navigation.

### Ingestion Pipeline

1. Scheduled job (daily/weekly) fetches source files from a configured bucket or manual upload.
2. Validate schema; normalize to internal models.
3. Geocode missing coordinates for campuses.
4. Convert zone files to **WGS84 GeoJSON**; fix multi-polygons; ensure valid winding order.
5. Store in **PostGIS** (or equivalent) with spatial indexes.
6. Publish to read-optimized tables and static tiles for the map (vector tiles recommended).

---

## 6) Architecture & Tech Stack (Recommended)

- **Frontend**: Next.js (React), TypeScript, server-side rendering for SEO; Mapbox GL JS or Leaflet + vector tiles; Tailwind CSS; i18n framework (e.g., next-intl).
- **Backend**: Node.js (TypeScript) with Fastify or NestJS; REST + GraphQL (optional); edge caching via CDN.
- **Database**: PostgreSQL + **PostGIS** for spatial queries (point-in-polygon, distance, bbox).
- **Search**: PostgreSQL trigram/tsvector or OpenSearch/Typesense for auto-complete and fast name/address lookup.
- **Geocoding**: external API/service or self-hosted NZ address dataset.
- **Maps/Tiles**: Self-hosted **vector tiles** (tippecanoe + tileserver) or Mapbox/MapTiler.
- **Infra**: Docker, Terraform, CI/CD (GitHub Actions). Cloud object storage for uploads and static tiles.

---

## 7) API Design (Draft)

### Public REST Endpoints

- `GET /api/search?q=...&lat=...&lng=...&radius=...&filters=...&bbox=...&page=...`\
  Returns schools matching text query and/or within radius or map bbox. Supports sorting by distance/name.

- `GET /api/schools/{id}`\
  Returns school detail including campus locations and key facts.

- `GET /api/schools/{id}/zone`\
  Returns GeoJSON for the school’s enrolment zone (if any), with last-updated metadata.

- `GET /api/zones/contains?lat=...&lng=...`\
  Returns a list of schools whose zones contain the point.

- `GET /api/geocode?query=...`\
  Proxies geocoder with rate limiting; returns address candidates with coordinates and confidence.

### Response Contracts (Sketch)

```json
// /api/search response (simplified)
{
  "results": [
    {
      "id": "string",
      "name": "string",
      "type": "Primary|Intermediate|Secondary|Composite",
      "yearLevels": "Y1–6",
      "gender": "Co-ed|Boys|Girls",
      "proprietor": "State|State-Integrated|Private",
      "hasZone": true,
      "distanceMeters": 1234,
      "location": { "lat": -36.85, "lng": 174.76 }
    }
  ],
  "total": 123,
  "page": 1,
  "pageSize": 20
}
```

```json
// /api/zones/contains response (simplified)
{
  "queryPoint": { "lat": -36.85, "lng": 174.76 },
  "matches": [
    { "schoolId": "string", "schoolName": "string", "zoneLastUpdated": "YYYY-MM-DD" }
  ]
}
```

---

## 8) Spatial Logic & Performance

- **Point‑in‑polygon**: Use PostGIS `ST_Contains` on simplified + full-resolution geometries. First run against **simplified** (e.g., Douglas–Peucker simplified) polygons for speed, then confirm with full geometry.
- **Distance queries**: Use `ST_DWithin` with an index (`geography` type) for fast radius searches.
- **Bounding box** queries: From map viewport → `ST_MakeEnvelope`.
- **Tiling**: Pre-generate vector tiles for zones and school points to minimize payload and render fast on mobile.
- **Caching**: CDN-cache GET endpoints; client-side cache recent queries; HTTP ETags for dataset versions.

---

## 9) UX & UI Requirements

- **Mobile-first** layout; responsive grid; sticky map on desktop.
- **Map controls**: zoom, current location (with permission prompt), “Search this area”, basemap switch (light/dark), and a legend for zone colors.
- **Zone visualization**: translucent fill + distinct border; show name and last-updated on hover/click.
- **Error states**: geocoder failure, no results, address outside Auckland (offer switch to NZ-wide if future scope expands).
- **Empty state tips**: suggest filter adjustments.
- **Compare**: (v1.1) Allow users to select 2–3 schools and open a side-by-side compare sheet.
- **Internationalization**: EN v1; CN v1.1. All labels wrapped in i18n keys.
- **Accessibility**: Fully keyboard navigable; map has accessible alternatives (list of results, focusable elements, aria-live updates on map search, data table view option).

---

## 10) Data Model (Simplified)

**School**

- id (UUID)
- name
- akaNames[] (aliases)
- type (enum)
- yearLevels (string or normalized minYear/maxYear)
- gender (enum)
- proprietor (enum)
- specialCharacter (string|nullable)
- boarding (bool)
- websiteUrl (string|nullable)
- phone/email (nullable)
- roll (int|nullable)
- equityIndexBand/decile (nullable)
- campusLocation (POINT; or multiple Campus records if needed)
- zoneId (nullable)
- sourceMeta { provider, fileId, importedAt }

**Zone**

- id (UUID)
- schoolId (FK)
- geometry (MULTIPOLYGON)
- lastUpdated (date)
- notes (text|nullable)
- sourceMeta {...}

**AddressCache** (optional)

- id
- queryString
- lat/lng
- normalizedAddress
- geocoderMeta

---

## 11) Privacy, Legal & Compliance

- Show data **provenance** and **last-updated** labels.
- Include a **disclaimer**: zones change; users must confirm with the school/MoE.
- Respect geolocation permissions; do not store precise user location without consent.
- Rate-limit public APIs; protect admin endpoints behind SSO.

---

## 12) Analytics & Observability

- Page views, search queries, filter usage, address-in-zone checks (aggregated only).
- Performance telemetry: TTFB, LCP, INP.
- Error logging with correlation IDs. Uptime checks and alerting for ingestion failures.

---

## 13) Acceptance Criteria (v1)

1. **Search**: Typing a school name returns ranked results within 300ms (warm cache) and highlights matching tokens.
2. **Address lookup**: Entering a valid Auckland address returns geocode candidates; selecting one pans the map and lists nearby schools sorted by distance.
3. **Zone check**: Entering an address and clicking "Check zones" returns accurate results within 500ms and displays zone polygons on the map.
4. **Filtering**: Applying school type, year level, or other filters immediately updates the results list and map markers.
5. **Mobile responsiveness**: All core features work seamlessly on mobile devices with touch-friendly interactions.
6. **Accessibility**: Site meets WCAG AA standards with full keyboard navigation and screen reader support.
7. **Performance**: Map interactions (pan/zoom) respond within 100ms; initial page load completes in under 2 seconds on 3G.
8. **Data accuracy**: School information matches official MoE datasets with clear provenance and last-updated timestamps.

---

## 14) Security Requirements

- **Rate limiting**: API endpoints protected against abuse (100 requests/minute per IP for public endpoints).
- **Input validation**: All user inputs sanitized and validated server-side.
- **HTTPS only**: All traffic encrypted; HSTS headers enabled.
- **Data protection**: No PII collection without consent; secure handling of any admin authentication.
- **CSRF protection**: Anti-CSRF tokens on admin forms.
- **Content Security Policy**: Strict CSP headers to prevent XSS attacks.

---

## 15) Testing Strategy

### Unit Testing
- Core business logic (search, filtering, geocoding) with >85% coverage
- Spatial query functions with known test cases
- API endpoint handlers with mocked dependencies

### Integration Testing
- Database queries with real PostGIS instance
- Full API request/response cycles
- Map rendering and interaction flows

### End-to-End Testing
- Critical user journeys (search → view → zone check)
- Mobile device testing on actual devices
- Accessibility testing with screen readers
- Performance testing under load

### Data Quality Testing
- Automated validation of imported datasets
- Zone polygon integrity checks
- Geocoding accuracy validation

---

## 16) Deployment & Infrastructure

### Environments
- **Development**: Local Docker containers with sample data
- **Staging**: Production-like environment for testing
- **Production**: High-availability setup with monitoring

### CI/CD Pipeline
- Automated testing on pull requests
- Security scanning (SAST/DAST)
- Database migration validation
- Zero-downtime deployments with health checks

### Infrastructure Requirements
- **Database**: PostgreSQL 15+ with PostGIS 3.3+
- **Application**: Node.js 18+ runtime
- **CDN**: Global content delivery for static assets
- **Monitoring**: APM, log aggregation, uptime monitoring
- **Backup**: Automated daily backups with point-in-time recovery

---

## 17) Success Metrics

### User Engagement
- Monthly active users
- Search completion rate (search → school detail view)
- Average session duration
- Mobile vs desktop usage ratio

### Performance Metrics
- API response times (p95 < 300ms)
- Map load times (< 2s on 3G)
- Search result relevance (click-through rate)
- Zone check accuracy (user feedback)

### Technical Health
- System uptime (>99.9%)
- Error rates (<0.1% for critical flows)
- Database query performance
- Data freshness (imports within SLA)

---

## 18) Future Enhancements (v2+)

- **Multi-region support**: Extend beyond Auckland to other NZ regions
- **Transport integration**: Real-time bus routes and walking times
- **School comparison**: Side-by-side comparison tool
- **Notifications**: Zone boundary change alerts for subscribed addresses
- **API partners**: Public API for real estate platforms
- **Advanced filters**: NCEA results, facility types, languages offered
- **Community features**: Parent reviews and ratings (with moderation)
