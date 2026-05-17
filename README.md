# KubeAtlas plugin for Headlamp

A [Headlamp](https://headlamp.dev) plugin that brings the
[KubeAtlas](https://github.com/lithastra/kubeatlas) dependency graph
into the Headlamp UI.

KubeAtlas builds a live graph of how Kubernetes resources depend on
one another — what a Deployment mounts, what a Service selects, what
a NetworkPolicy allows. This plugin surfaces that graph inside
Headlamp: a cluster-level topology view in the sidebar, and (in a
later release) a "Dependencies" tab on resource detail pages.

> **Status: scaffold.** This release wires up the plugin structure
> and a placeholder "Dependency Graph" sidebar entry. The cluster
> view and resource-detail integration land in subsequent releases.

## How it works

The plugin is a thin client. It talks to a KubeAtlas server already
running in your cluster, through Headlamp's Kubernetes service proxy
— it never connects to a service ClusterIP directly, so it works the
same whether Headlamp runs in-cluster or as the desktop app. No
KubeAtlas server URL is hard-coded; you pick the service from within
the plugin.

It renders only what the KubeAtlas server exposes and never imports
code from the KubeAtlas main repository.

## Prerequisites

- A Kubernetes cluster with [KubeAtlas](https://github.com/lithastra/kubeatlas)
  installed (see the KubeAtlas install docs).
- [Headlamp](https://headlamp.dev), desktop or in-cluster.

## Compatibility matrix

> Placeholder — verified ranges are filled in at the first release.

| Plugin | KubeAtlas server | Headlamp |
|--------|------------------|----------|
| 0.1.x  | >= 1.0           | >= 0.x   |

## Install

Until the plugin is published to Artifact Hub, install it from a
local build:

```bash
npm install
npm run build          # produces dist/main.js
```

Then copy the build output into Headlamp's plugins directory, or use
`npm run start` to load it into a local Headlamp during development.

## Development

See [CONTRIBUTING.md](./CONTRIBUTING.md) for the toolchain commands
and the contribution workflow.

## License

Apache 2.0 — see [LICENSE](./LICENSE).
