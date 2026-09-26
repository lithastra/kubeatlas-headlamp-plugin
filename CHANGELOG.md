# Changelog

## 1.2.2 — Unreleased

Release preparation only; no tag or release asset is published by this change.

### Fixed

- Refit dependency and resource-neighborhood graphs when their container size
  changes, including viewport resizing and the Headlamp sidebar. Preserve node
  positions, selection, and blast-radius flags without rerunning layout. Repeated
  notifications at the same size leave manual pan and zoom unchanged.
- Wrap graph controls on narrow screens so the namespace, blast-radius exit,
  and depth controls remain accessible without horizontal scrolling.
- Keep resource-detail service discovery and dependency requests scoped to the
  resource's own cluster, including retained windows on global settings pages
  or another cluster's route. Identically named resources in different clusters
  must not share dependency data.
- Reset dependency state when the resource or backing service changes, ignore
  stale request completions, and distinguish loading, discovery failure, empty
  discovery, and empty neighborhoods. Show actionable errors without exposing
  raw upstream response bodies or incorrectly claiming KubeAtlas is not installed.

### Validation scope and known limitations

- The combined source passed 72 tests across 10 files, lint, types, production
  build, and Storybook compilation. The release candidate archive must also
  pass the packaging and extracted-archive checks in [PUBLISHING.md](./PUBLISHING.md).
  Storybook compilation validates the toolchain, not rendered components.
- Targeted source checks used an isolated official Headlamp `v0.42.0` container
  with two mock Kubernetes/KubeAtlas clusters, at desktop and 390px widths in
  light/dark themes. They covered graph fitting, retained selection, independent
  resource windows, the detail drawer, and blast-radius controls. These checks
  do not establish real-cluster, all-version, Policies/OTel, whole-host mobile,
  or long-running production acceptance; compatibility declarations are unchanged.
- Existing host version/CRD JSON errors and Cytoscape label-width and wheel
  warnings remain outside these fixes. An initial host WebSocket error was
  recorded during source validation; its cause remains unconfirmed. The host
  image's displayed version differs from its official tag as noted under 1.2.1;
  retain its digest in validation evidence.
- Dependency versions are unchanged. The production audit reported zero
  advisories; the development toolchain retains seven low affected entries in
  the elliptic chain, not seven independent vulnerabilities. The npm 10 optional
  dependency diagnostic described under 1.2.1 also remains unchanged.

## 1.2.1 — 2026-09-25

Published as a [GitHub release](https://github.com/lithastra/kubeatlas-headlamp-plugin/releases/tag/v1.2.1).

### Fixed

- Keep the resource detail drawer and its backdrop above Headlamp's
  toolbar using the host theme's modal layer. The close button remains
  reachable in light/dark themes and at narrow widths. Seven regression
  tests cover layer selection and close button, Escape, and backdrop dismissal.

### Maintenance

- Update Cytoscape to 3.34.1 and refresh locked dependencies since 1.2.0.
- Migrate the development toolchain to Vitest/coverage 4.1.11 and
  Storybook 10.6.0 with SWC addon 4.0.3. Explicit scoped overrides and
  matching root packages are maintained locally; upstream Headlamp 0.14
  does not itself declare support for these major versions.
- Enforce strict peer/engine installation, production and development
  audit gates, Storybook compilation, Conventional Commits, and DCO in
  PR CI. Add ownership and dependency-update configuration.
- Correct standalone installation and release documentation, separating
  GitHub archives from catalog availability and keeping private validation
  files and generated packages outside the source repository.

### Validation scope and known limitations

- The integrated source passed 40 tests, lint, types, production build,
  and Storybook compilation. Production dependency audit reported zero
  advisories; the full tree retains seven low affected entries in the
  elliptic chain, not seven independent vulnerabilities. See
  [CONTRIBUTING.md](./CONTRIBUTING.md) for the override rationale.
- Targeted graph/detail/blast-radius interaction checks used the official
  Headlamp `v0.42.0` container with a mock Kubernetes/KubeAtlas API. Final
  release-archive verification is required by [PUBLISHING.md](./PUBLISHING.md).
  This is not full real-cluster, all-version, Policies/OTel, or long-running
  production acceptance, and does not expand the declared compatibility range.
- Existing Cytoscape wheel-sensitivity/label-width warnings and graph
  auto-fit behavior after narrowing the viewport remain unchanged.
- Global settings version/CRD JSON errors reproduce without this plugin
  on the same Headlamp image. That image's UI reports 0.41.0 and its
  backend reports `unknown` despite the official v0.42.0 tag; pin and
  record the image digest instead of relying on the displayed version alone.
- With npm 10, optional WASM-related dependencies may be reported as
  extraneous by `npm ls --all` on native platforms. The diagnostics are
  documented rather than hidden by removing lockfile entries or optional packages.

## 1.2.0 — 2026-08-09

- Added the OTel overlay, trace timeline, and cluster policy view.
- Incorporated catalog review corrections to documentation and packaging metadata.
- Published a Headlamp plugin archive with a recorded SHA-256.

See the [1.2.0 release](https://github.com/lithastra/kubeatlas-headlamp-plugin/releases/tag/v1.2.0).
