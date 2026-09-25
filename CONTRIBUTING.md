# Contributing

This repository is the KubeAtlas plugin for [Headlamp](https://headlamp.dev) —
it adds a dependency-graph view to the Headlamp UI, backed by a
KubeAtlas server running in the cluster.

## Development setup

The plugin uses the standard Headlamp plugin toolchain
(`@kinvolk/headlamp-plugin`). Use Node.js 22 and npm 10 to match
the CI build environment.

```bash
npm ci --strict-peer-deps --engine-strict # install the locked toolchain
npm run start        # dev server; load the plugin into a local Headlamp
npm run lint         # eslint + prettier check
npm run tsc          # type-check
npm run test         # vitest unit tests
npm run build        # production build -> dist/main.js
npm run storybook:build # validate Headlamp's Storybook manager and preview build
npm run audit:prod   # fail on low-or-higher production advisories
npm run audit:tooling # fail on moderate-or-higher advisories, including dev dependencies
```

Run `npm run lint-fix` to auto-fix lint and import-order issues
before opening a pull request. CI runs both dependency audits, lint,
tsc, test, production build, and Storybook build on every pull request;
all checks must pass. The repository currently has no stories, so the
Storybook check validates the toolchain, not rendered plugin behavior.

## Dependency security

Keep `package-lock.json` committed and validate dependency updates with
`npm ci` and all checks above. Prefer updates within the Headlamp
toolchain's compatible ranges. Do not use `npm audit fix --force`
without reviewing its proposed version changes: it can downgrade the
Headlamp toolchain or introduce incompatible major versions.

The tooling audit intentionally reports all severities while failing
on moderate, high, or critical advisories. Passing that gate does not mean the
dependency tree has no advisories. The production audit checks npm's
non-development dependency tree; neither check proves the generated
bundle or the dependencies provided by the Headlamp host are secure.

Headlamp 0.14 declares Vitest 3 and Storybook 9. This project deliberately
overrides them with Vitest/coverage 4.1.11 and Storybook 10.6.0 (SWC addon
4.0.3) to remove the
[Vitest redirect-mock advisory](https://github.com/vitest-dev/vitest/security/advisories/GHSA-82fw-gwwq-j7x9).
Keep these coupled versions synchronized. Storybook and its framework/addon
packages are also direct development dependencies because Headlamp's CLI
expects a root executable and Storybook resolves presets from that root.
Overrides alone can break both resolution paths. These overrides are maintained
here; they are not a claim that upstream declares these major versions supported.

Validate changes with clean installation, all CI checks, and a real Headlamp
host smoke test. Keep React and the host API compatibility separate from
development-tool versions. Revisit the overrides when the upstream toolchain
adopts compatible versions.

[Elliptic's cryptographic implementation](https://github.com/advisories/GHSA-848j-6mx2-7j84)
remains in the development toolchain's Node polyfills. Do not use the proposed
forced Headlamp downgrade to hide this advisory.

With npm 10, `npm ls --all` can report optional `@emnapi/*`,
`@napi-rs/wasm-runtime`, and `@tybys/wasm-util` entries as extraneous after
`npm ci`. The diagnostic is reproducible with just Oxc parser and resolver:
their `wasm32`-only bindings share optional dependencies that npm can leave
installed on native platforms. The native bindings are still selected. These
entries remain recorded in the lockfile; do not hand-delete lockfile entries,
omit all optional dependencies, or ignore peer/engine errors to silence it.

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
