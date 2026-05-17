# Contributing

This repository is the KubeAtlas plugin for [Headlamp](https://headlamp.dev) —
it adds a dependency-graph view to the Headlamp UI, backed by a
KubeAtlas server running in the cluster.

## Development setup

The plugin uses the standard Headlamp plugin toolchain
(`@kinvolk/headlamp-plugin`). Node.js 20+ is required.

```bash
npm install        # install the toolchain
npm run start      # dev server; load the plugin into a local Headlamp
npm run lint       # eslint + prettier check
npm run tsc        # type-check
npm run test       # jest unit tests
npm run build      # production build -> dist/main.js
```

Run `npm run lint-fix` to auto-fix lint and import-order issues
before opening a pull request. CI runs lint, tsc, test, and build on
every pull request; all four must be green.

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
