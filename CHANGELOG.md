# Changelog

## Unreleased

### Fixed

- Refit dependency and resource-neighborhood graphs when their container size
  changes, including viewport resizing and the Headlamp sidebar. Preserve node
  positions, selection, and blast-radius flags without rerunning layout. Repeated
  notifications at the same size leave manual pan and zoom unchanged.
- Wrap graph controls on narrow screens so the namespace, blast-radius exit,
  and depth controls remain accessible without horizontal scrolling.

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
