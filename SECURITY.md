# Security Policy

## Supported versions

The KubeAtlas Headlamp plugin is pre-1.0. No versions are formally
supported for security updates yet; a support policy will be defined
alongside the first stable release.

## Reporting a vulnerability

**Please do not report security issues via public GitHub issues.**

Email dev@lithastra.com with:

- A description of the vulnerability
- Steps to reproduce
- The affected version (commit SHA if pre-release)
- Your proposed fix, if any

We will acknowledge your report within 48 hours and provide a more
detailed response within 5 business days indicating the next steps in
handling your report.

## Scope

In scope:

- The Headlamp plugin code in this repository

Out of scope:

- Headlamp itself (report to https://github.com/headlamp-k8s/headlamp)
- The KubeAtlas server (report via https://github.com/lithastra/kubeatlas)
- Third-party dependencies (please report to the upstream project)
- User misconfigurations (e.g. pointing the plugin at an untrusted
  KubeAtlas endpoint)
