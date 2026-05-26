/*
 * Copyright 2026 The KubeAtlas Authors
 * SPDX-License-Identifier: Apache-2.0
 *
 * Vitest setup file. Extends Headlamp's bundled setupTests.js
 * (which only sets globalThis.jest = vi) with a jsdom Canvas
 * stub so transitive @xterm/xterm imports from
 * @kinvolk/headlamp-plugin/lib don't crash module evaluation
 * with "Not implemented: HTMLCanvasElement.prototype.getContext".
 *
 * Wire-up: package.json's `test` script passes this file to
 * vitest via --setup-files, overriding the vite.config.mjs
 * default. Keep this file mirror-able with the upstream setup
 * if Headlamp's bundled file gains new globals later.
 */
import { vi } from 'vitest';

// Mirror @kinvolk/headlamp-plugin/config/setupTests.js — the
// upstream alias so test files written against jest globals
// keep working under vitest.
Object.assign(globalThis, { jest: vi });

// jsdom doesn't implement Canvas. @xterm/xterm's color module
// calls getContext('2d') during module load (an unrelated
// transitive import from @kinvolk/headlamp-plugin/lib), so any
// test that pulls the headlamp lib barrel currently throws at
// import time. The stub returns null — xterm handles that path
// gracefully and the test code never actually renders a
// terminal.
if (
  typeof HTMLCanvasElement !== 'undefined' &&
  !HTMLCanvasElement.prototype.getContext.toString().includes('vi.fn')
) {
  HTMLCanvasElement.prototype.getContext = vi.fn(() => null) as never;
}
