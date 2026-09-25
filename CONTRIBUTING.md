# Contributing

This repository is the KubeAtlas plugin for [Headlamp](https://headlamp.dev) —
it adds a dependency-graph view to the Headlamp UI, backed by a
KubeAtlas server running in the cluster.

## Development setup

The plugin uses the standard Headlamp plugin toolchain
(`@kinvolk/headlamp-plugin`). Use Node.js 22 and npm 10 to match
the CI build environment.

```bash
npm ci               # install the locked toolchain
npm run start        # dev server; load the plugin into a local Headlamp
npm run lint         # eslint + prettier check
npm run tsc          # type-check
npm run test         # vitest unit tests
npm run build        # production build -> dist/main.js
npm run audit:prod   # fail on low-or-higher production advisories
npm run audit:tooling # fail on high/critical advisories, including dev dependencies
```

Run `npm run lint-fix` to auto-fix lint and import-order issues
before opening a pull request. CI runs both dependency audits, lint,
tsc, test, and build on every pull request; all checks must pass.

## Dependency security

Keep `package-lock.json` committed and validate dependency updates with
`npm ci` and all checks above. Prefer updates within the Headlamp
toolchain's compatible ranges. Do not use `npm audit fix --force`
without reviewing its proposed version changes: it can downgrade the
Headlamp toolchain or introduce incompatible major versions.

The tooling audit intentionally reports all severities while failing
on high or critical advisories. Passing that gate does not mean the
dependency tree has no advisories. The production audit checks npm's
non-development dependency tree; neither check proves the generated
bundle or the dependencies provided by the Headlamp host are secure.

The current Headlamp 0.14 toolchain still brings in two known advisory
families through development dependencies:

- [Vitest redirect mocks](https://github.com/vitest-dev/vitest/security/advisories/GHSA-82fw-gwwq-j7x9)
  affect Vitest 3 and Storybook's mocker dependency. The upstream fix
  requires Vitest 4.1.11 or later; do not override these to another
  major without validating the Headlamp toolchain and its peer dependencies.
- [Elliptic's cryptographic implementation](https://github.com/advisories/GHSA-848j-6mx2-7j84)
  is pulled in through the toolchain's Node polyfills.

Keep development, test UI, and Storybook servers off untrusted networks.
The project's tests use non-interactive `vitest run`; they do not enable
the Vitest UI or browser mode. Revisit these advisories when a compatible
upstream toolchain update is available, and review any newly reported
advisory rather than silently suppressing it.

## What belongs here

This repo is a *client*. It renders data the KubeAtlas server
already exposes — it never re-implements analysis the server lacks,
and it never imports code from the kubeatlas main repository. If a
view needs data the server does not provide, that is a change to the
server, not to this plugin.

## Sign your commits (DCO)

Every commit must be signed off under the
[Developer Certificate of Origin](./DCO):

```bash
git commit -s -m "your message"
```

The sign-off certifies you wrote the patch or otherwise have the
right to submit it under the project's Apache-2.0 license.

## Pull requests

- One logical change per pull request.
- Keep the compatibility matrix in `README.md` honest — note the
  KubeAtlas and Headlamp versions a change was verified against.
- Be civil; this project follows the [Code of Conduct](./CODE_OF_CONDUCT.md).
