# Releasing the Headlamp plugin

This tracked document describes the standalone release process for
`lithastra/kubeatlas-headlamp-plugin`. A release-preparation PR does not
publish a tag, a GitHub release, an npm package, or a catalog entry.
Publishing requires a separate maintainer decision after verification.

## 1. Prepare the release commit

- Use a clean checkout and a release-preparation branch based on current
  `main`. Preserve unrelated work and existing archives.
- Use Node.js 22 and npm 10, matching CI. See [CONTRIBUTING.md](./CONTRIBUTING.md).
- Update the version in `package.json` and both root version fields in
  `package-lock.json`, without unrelated lockfile changes.
- Update [CHANGELOG.md](./CHANGELOG.md), including known limitations and
  the distinction between declared compatibility and tested environments.
- Keep generated files, local fixtures, screenshots, private evidence,
  credentials, and machine-specific helper scripts out of Git.
- Commit with Conventional Commits and DCO, open a PR, and require CI.
  Do not push a release change directly to `main` or create a tag yet.

## 2. Validate and build

Run from the plugin repository. The commands below use a POSIX shell;
Windows maintainers can use WSL or equivalent native commands. No
maintainer-specific checkout path is required.

```sh
npm ci --strict-peer-deps --engine-strict
npm run lint
npm run tsc
npm run test
npm run audit:prod
npm run audit:tooling
npm run build
STORYBOOK_DISABLE_TELEMETRY=1 DO_NOT_TRACK=1 npm run storybook:build
git diff --check
git status --short
```

Do not suppress failed checks or use `npm audit fix --force` to make a
release pass. The current development audit permits low advisories;
record them rather than claiming the dependency tree is advisory-free.
Storybook compilation is not a rendered UI test: this repository has no stories.

## 3. Package outside the checkout

The locked Headlamp packaging command **does not build the plugin**. It
copies the existing `dist/` files and `package.json`. Build from the exact
candidate commit first, in a fresh checkout without stale `dist/` files.

It also uses the checkout directory's basename as the archive's top-level
directory. Use a checkout named `kubeatlas-headlamp-plugin` for the
standalone distribution, including when creating a temporary worktree.
Do not package a randomly named worktree and silently ship that name.

```sh
test "$(basename "$PWD")" = kubeatlas-headlamp-plugin
git rev-parse HEAD
node -p 'require("./package.json").version'
RELEASE_OUTPUT=$(mktemp -d)
npm run package -- . "$RELEASE_OUTPUT"
```

Keep the printed output path and archive checksum with the private
validation record. The command refuses to overwrite an existing archive.
This is a Headlamp plugin archive, not an npm registry publication.

For the version declared in `package.json`, expect
`lithastra-kubeatlas-headlamp-plugin-<version>.tar.gz` containing only:

```text
kubeatlas-headlamp-plugin/
  main.js
  package.json
```

Inspect the archive before extraction with `tar -tzf <archive>`. Reject
absolute paths, parent traversal, links, unexpected files, credentials,
source maps, source files, and development dependencies. Extract into a
new temporary directory, not directly over an installed plugin.

Verify that the extracted `main.js` equals the candidate's `dist/main.js`
and that the extracted `package.json` equals the candidate's file. Check
its package name and version explicitly. Calculate the archive SHA-256
independently (`shasum -a 256`, `sha256sum`, or PowerShell `Get-FileHash`).
Retain the exact tested archive: repacking may change its checksum even
when the plugin code is unchanged.

## 4. Test the extracted archive

Follow the [installation instructions](./README.md#install) and the
[official Headlamp deployment guide](https://headlamp.dev/docs/latest/development/plugins/building/).
Use an isolated Headlamp instance and mount only the extracted plugin.
Do not modify an operator's installed plugins or connect to a real cluster
without explicit permission.

Verify the entry route, service/namespace selection, dependency graph,
node details, drawer close button/Escape/backdrop, blast radius, and
light/dark rendering. Record the host image tag **and digest**, plugin
version, source commit, archive/bundle checksums, viewport, interactions,
console findings, and untested flows outside this public repository.

A real Headlamp host with a mock API proves host integration for the
exercised flows, not real-cluster acceptance, all advertised versions,
full Policies/OTel behavior, or long-term reliability. Test those claims
separately before making them. Known unrelated host warnings/errors must
remain visible in the validation record.

## 5. Merge, then publish only when approved

After review and successful PR checks, merge the preparation PR and wait
for CI on the resulting `main` commit. Confirm its tracked tree matches
the tested candidate. If code or packaging inputs changed, repeat the
affected validation before publishing. Record both the candidate commit
and final release commit; do not silently attribute old evidence to new code.

Only after explicit release approval:

1. Create and verify a signed annotated `v<version>` tag at the approved
   final commit, then push that tag. Never replace an existing tag.
2. Create the GitHub release in `lithastra/kubeatlas-headlamp-plugin` for
   that existing tag. Use the reviewed release notes and attach the exact
   tested archive with its SHA-256. Do not rebuild the asset during upload.
3. Verify the published release is not a draft, the tag points to the
   approved commit, and the downloaded asset hash matches the tested file.
4. Preserve the previous release for rollback. Stop if any identity or
   checksum differs; do not overwrite an already published asset.

Preparation, a merged PR, a draft release, and a publicly downloadable
release are distinct states. Report only the state actually verified.

## 6. Catalog distribution is independent

This standalone repository currently has no root `artifacthub-pkg.yml`.
Do not require or invent one as part of its package build. Catalog
version manifests belong to the chosen catalog/Artifact Hub workflow;
consult the [official publishing guide](https://headlamp.dev/docs/latest/development/plugins/publishing/)
and that repository's current contribution instructions.

An upstream catalog PR may remain open while the standalone GitHub
release ships. Updating that PR does not require waiting for its merge
and does not prove installation through the catalog is available.
Do not promise indexing times or widen compatibility based on one smoke test.

When catalog work is explicitly in scope, match each manifest's version,
archive URL, and checksum to the **same actual distributed archive**.
A catalog pipeline may build a different archive than this repository;
never reuse our checksum for an unverified upstream-built asset. Retain
historical version entries and published releases; do not replace them.

## Rollback

Stop Headlamp, preserve the current plugin outside its plugin root, and
reinstall the previously verified release. Avoid duplicate KubeAtlas
plugin directories and leave unrelated plugins untouched. Publish a new
patch version for a correction instead of deleting or retagging a release.
