# Releasing v1.0.0 — paste-runnable commands

Copy and paste each block. No `<placeholder>` strings except where
explicitly called out.

Assumes:
- Standalone repo at `~/kubeatlas-headlamp-plugin/`
- Headlamp catalog fork at `~/headlamp-k8s-plugins/`
- Headlamp Desktop installed (verified against 0.42)
- `gh` CLI authenticated against the GitHub account that owns the
  catalog fork
- A real Kubernetes cluster (with KubeAtlas running) for the
  smoke test

This file is local-only — it is NOT committed and NOT in
`.gitignore`. Don't `git add .` blindly or you'll re-add it.

---

## 1. Pre-flight (60 seconds)

```bash
cd ~/kubeatlas-headlamp-plugin

# 1a. Tree clean, on main
git fetch origin
git status -sb

# 1b. Versions match what we're releasing
grep '"version"' package.json
grep '^version:' artifacthub-pkg.yml
# Both should say 1.0.0

# 1c. Gates
npm install
npm run lint
npm run tsc
npm test
npm run build
ls -la dist/main.js
```

If anything fails, fix and re-run before continuing.

---

## 2. Push the README install-path fix to origin

```bash
git push origin main
git status -sb     # should now read: ## main...origin/main
```

---

## 3. Build the release tarball

```bash
cd ~/kubeatlas-headlamp-plugin
npm run package
```

That command:
1. Runs the build.
2. Writes a tarball to the repo root.
3. Prints the SHA256 to stdout.

You'll see output like:

```
Created tarball: ".../lithastra-kubeatlas-headlamp-plugin-1.0.0.tar.gz".
Tarball checksum (sha256): 25b2f6720c7f52929d7ec088cd3b11fc597d81fc19543ae06e91b0cc7f54cb43
```

Capture both values into shell variables (subsequent steps use
them):

```bash
export TARBALL="$HOME/kubeatlas-headlamp-plugin/lithastra-kubeatlas-headlamp-plugin-1.0.0.tar.gz"
export SHA=$(sha256sum "$TARBALL" | awk '{print $1}')
echo "tarball: $TARBALL"
echo "sha:     SHA256:$SHA"
ls -la "$TARBALL"
```

The tarball contains only `main.js` + `package.json` inside a
`kubeatlas-headlamp-plugin/` top-level directory. That's the
canonical Headlamp plugin layout.

---

## 4. Smoke-test the tarball locally

Install it into Headlamp Desktop manually to make sure it loads.
The plugins directory differs per OS:

| OS | Plugins directory |
|---|---|
| Linux Headlamp Desktop | `$HOME/.config/Headlamp/plugins/` |
| macOS Headlamp Desktop | `$HOME/.config/Headlamp/plugins/` |
| Windows Headlamp Desktop | `%APPDATA%\Headlamp\Config\plugins\` |

### On Linux / macOS

```bash
PLUGINS_DIR="$HOME/.config/Headlamp/plugins"
mkdir -p "$PLUGINS_DIR"

# Remove any previous install
rm -rf "$PLUGINS_DIR/kubeatlas-headlamp-plugin" "$PLUGINS_DIR/kubeatlas"

# Unpack — the tarball already has a kubeatlas-headlamp-plugin/ top-level dir
tar -xzf "$TARBALL" -C "$PLUGINS_DIR"
ls "$PLUGINS_DIR/kubeatlas-headlamp-plugin/"
# Expected: main.js, package.json
```

### On Windows (PowerShell, from outside WSL)

```powershell
$dest = "$env:APPDATA\Headlamp\Config\plugins\kubeatlas-headlamp-plugin"
Remove-Item -Recurse -Force $dest -ErrorAction SilentlyContinue
New-Item -ItemType Directory -Force -Path $dest | Out-Null

# Replace "Ubuntu" with whatever `wsl --list` shows for your distro
$tarball = "\\wsl$\Ubuntu\home\nick\kubeatlas-headlamp-plugin\lithastra-kubeatlas-headlamp-plugin-1.0.0.tar.gz"
tar -xzf $tarball -C "$env:APPDATA\Headlamp\Config\plugins"
ls $dest
```

### Smoke checklist

Restart Headlamp Desktop. Then:

1. **Settings → Plugins** — KubeAtlas listed and enabled.
2. Click into your cluster.
3. **Sidebar shows "Dependency Graph"** entry.
4. Open it → canvas renders the cartography stylesheet.
5. Pick a namespace from the dropdown → graph re-renders.
6. Tap a node → drawer with incoming/outgoing edges.
7. Click **↯ Show blast radius** → canvas dims correctly.
8. Toggle Headlamp light/dark → palette swaps live.

If any step breaks, **stop**. Fix in the standalone repo, re-run
steps 1–3.

---

## 5. Sync the catalog fork with upstream

```bash
cd ~/headlamp-k8s-plugins

# One-time: add upstream remote if missing
git remote get-url upstream 2>/dev/null || \
  git remote add upstream https://github.com/headlamp-k8s/plugins.git

# Fetch upstream + cut a fresh branch
git fetch upstream
git checkout -B kubeatlas-1.0.0 upstream/main
```

---

## 6. Vendor the plugin source into the catalog

```bash
SRC=$HOME/kubeatlas-headlamp-plugin
DEST=$HOME/headlamp-k8s-plugins/kubeatlas

mkdir -p "$DEST"

rsync -av --delete \
  --exclude='node_modules' \
  --exclude='dist' \
  --exclude='.git' \
  --exclude='.github/' \
  --exclude='docs/' \
  --exclude='vitest.config.ts' \
  --exclude='vitest.setup.ts' \
  --include='README.md' \
  --exclude='*.md' \
  --exclude='/[0-9]*.[0-9]*.[0-9]*/' \
  --exclude='LICENSE' \
  --exclude='DCO' \
  --exclude='lithastra-*.tar.gz' \
  --exclude='*.tgz' \
  "$SRC/" "$DEST/"

# The standalone repo's .github/workflows/ci.yml is valid there but
# dead config in the monorepo — GitHub only runs workflows from the
# repo root, so a vendored kubeatlas/.github/ just confuses
# maintainers. Exclude it above, and drop any copy a previous vendor
# left behind.
rm -rf "$DEST/.github"

# Upstream CI doesn't have our vitest config; reset the test
# script back to the headlamp-plugin shim.
sed -i 's|"test": "vitest run -c vitest.config.ts"|"test": "headlamp-plugin test"|' \
  "$DEST/package.json"

ls "$DEST"
```

---

## 7. Verify the catalog copy builds clean

```bash
cd ~/headlamp-k8s-plugins/kubeatlas
rm -rf node_modules dist
npm install
npm run lint
npm run tsc
npm test
npm run build
ls -la dist/main.js

# Drop local-only build outputs before committing
rm -rf node_modules dist *.tar.gz
```

---

## 8. Write the version manifest

```bash
cd ~/headlamp-k8s-plugins/kubeatlas
mkdir -p 1.0.0

# $SHA was captured in step 3
echo "Using checksum: SHA256:$SHA"

cat > 1.0.0/artifacthub-pkg.yml <<EOF
version: 1.0.0
name: headlamp_kubeatlas
displayName: KubeAtlas
createdAt: "$(date -u +%Y-%m-%dT%H:%M:%SZ)"
logoURL: "https://raw.githubusercontent.com/lithastra/kubeatlas/main/docs/static/img/logo.svg"
description: "Dependency graph plugin for Headlamp powered by KubeAtlas."
keywords:
  - dependency
  - graph
  - topology
  - kubeatlas
  - visualization
homeURL: "https://github.com/lithastra/kubeatlas-headlamp-plugin"
license: Apache-2.0
links:
  - name: source
    url: "https://github.com/lithastra/kubeatlas-headlamp-plugin"
  - name: docs
    url: "https://docs.kubeatlas.lithastra.com"
maintainers:
  - name: lithastra
    email: dev@lithastra.com
changes:
  - kind: added
    description: "First stable release. Cartography stylesheet, namespace selector, per-resource detail drawer with incoming/outgoing edges, blast-radius mode, and the Headlamp details-view Dependencies section."
annotations:
  headlamp/plugin/archive-url: "https://github.com/headlamp-k8s/plugins/releases/download/kubeatlas-1.0.0/headlamp-k8s-kubeatlas-1.0.0.tar.gz"
  headlamp/plugin/archive-checksum: "SHA256:$SHA"
  headlamp/plugin/version-compat: ">=0.30"
  headlamp/plugin/distro-compat: "in-cluster,web,docker-desktop,desktop"
EOF

cat > 1.0.0/README.md <<'EOF'
KubeAtlas plugin v1.0.0 for Headlamp.

See [../README.md](../README.md) for the full description, install
steps, and screenshots.
EOF

# Confirm contents
cat 1.0.0/artifacthub-pkg.yml
```

The `archive-url` points at the catalog repo, not ours, because
the catalog's release pipeline tags `kubeatlas-1.0.0` and
publishes the asset there after the PR merges. Cross-check the
URL form against
<https://github.com/headlamp-k8s/plugins/blob/main/cert-manager/0.1.0/artifacthub-pkg.yml>
before opening the PR — if upstream's convention has shifted,
match what the most-recently-merged plugin uses.

---

## 9. Commit + push to your fork

```bash
cd ~/headlamp-k8s-plugins

git add kubeatlas/
git status
git diff --staged --stat | head -30

git commit -s -m "$(cat <<'EOF'
feat(kubeatlas): add v1.0.0

KubeAtlas (https://github.com/lithastra/kubeatlas) is a read-only
Kubernetes resource dependency-graph explorer. This plugin embeds
its cluster + per-resource graph views inside Headlamp.

Features:
- Cluster-level dependency graph (cartography stylesheet)
- Namespace selector
- Per-resource detail drawer with incoming/outgoing edges
- Blast-radius mode (BFS dim/brighten)
- Blast-radius mode with depth + direction controls
- KubeAtlas Dependencies section on Headlamp resource detail pages
- Theme-aware palette (Parchment / Slate, WCAG AA)

Compatibility:
- Headlamp >= 0.30 (verified against 0.42)
- KubeAtlas server >= 1.3.0

Upstream source: https://github.com/lithastra/kubeatlas-headlamp-plugin
EOF
)"

git push origin kubeatlas-1.0.0
```

---

## 10. Open the PR

```bash
cd ~/headlamp-k8s-plugins

gh repo set-default headlamp-k8s/plugins

gh pr create \
  --title "Add KubeAtlas plugin v1.0.0" \
  --body "$(cat <<'EOF'
KubeAtlas is a read-only Kubernetes resource dependency-graph
explorer. It answers questions like *"if I delete this Secret,
what breaks?"* with a visual blast-radius graph.

This plugin embeds KubeAtlas's cluster + per-resource graph views
directly inside Headlamp:

- Cluster-level dependency graph (cartography stylesheet — six
  node-family shapes, edge encoding by weight/dash/colour/arrow)
- Namespace selector
- Per-resource selection drawer with incoming/outgoing edges
- Blast-radius mode (BFS dim/brighten)
- Blast-radius mode via detail drawer button
- "KubeAtlas Dependencies" section on Headlamp's resource detail pages
- Theme-aware palette (Parchment for light, Slate for dark)

**Source repo:** https://github.com/lithastra/kubeatlas-headlamp-plugin
**Docs:**        https://docs.kubeatlas.lithastra.com
**License:**     Apache-2.0

Requires an in-cluster KubeAtlas server (>= 1.3.0).
Headlamp >= 0.30 (verified against 0.42).

Tested by installing the `npm run package` tarball into Headlamp
Desktop and walking the cluster view, namespace selector, detail
drawer, and blast-radius mode.
EOF
)"

gh pr view --json url --jq .url
```

---

## 11. Watch CI

```bash
gh pr checks --watch
```

If anything fails:

```bash
# See the failing job
gh pr checks --json name,state,link --jq '.[] | select(.state=="FAILURE")'
# Fix, then re-run steps 6-9 (the PR auto-updates on push)
```

---

## 12. After the PR merges

Catalog maintainers (or their CI) tag `kubeatlas-1.0.0` on the
catalog repo and publish `headlamp-k8s-kubeatlas-1.0.0.tar.gz`.
The `archive-url` in your manifest then resolves.

Within ~24 hours, ArtifactHub indexes the new package at
<https://artifacthub.io/packages/search?repo=headlamp-default>.
Headlamp Desktop's Plugin Catalog UI shows it after that
indexing completes.

Verify:

```bash
# Tag exists on the catalog repo
gh release view kubeatlas-1.0.0 --repo headlamp-k8s/plugins

# Asset is reachable
curl -sIL -o /dev/null -w '%{http_code}\n' \
  https://github.com/headlamp-k8s/plugins/releases/download/kubeatlas-1.0.0/headlamp-k8s-kubeatlas-1.0.0.tar.gz
# Expect: 200
```

---

## 13. v1.0.1 and beyond

Same flow, swap `1.0.0` → `1.0.1` in every command. Keep the
older `kubeatlas/1.0.0/` subdir intact — users who pinned can
still install it.

For the standalone repo bump:

```bash
cd ~/kubeatlas-headlamp-plugin
sed -i 's/"version": "1.0.0"/"version": "1.0.1"/' package.json
sed -i 's/^version: 1.0.0$/version: 1.0.1/' artifacthub-pkg.yml

git add package.json package-lock.json artifacthub-pkg.yml
git commit -s -m "chore: bump to 1.0.1 for catalog submission"
git push origin main
```

Then re-run steps 3-11 with `1.0.1` substituted.

---

## Rollback

Don't delete published tags or releases on the catalog repo —
operators may have pinned. Instead cut `1.0.x+1` with the fix.
If the bug is severe, ask the catalog maintainers to add a
deprecation note to the 1.0.x release page.
