/*
 * Copyright 2026 The KubeAtlas Authors
 * SPDX-License-Identifier: Apache-2.0
 *
 * Project-local vitest config. Extends Headlamp's bundled vite.config.mjs
 * so the plugin still builds the same way the toolchain expects, then
 * appends our jsdom Canvas stub to setupFiles (see vitest.setup.ts for
 * why that's needed).
 *
 * `vitest -c node_modules/@kinvolk/headlamp-plugin/config/vite.config.mjs`
 * doesn't pick up the project setup file (the upstream config hard-codes
 * its own), so we re-derive the test block here.
 */
import { mergeConfig, defineConfig } from 'vitest/config';
import headlampConfig from '@kinvolk/headlamp-plugin/config/vite.config.mjs';

export default mergeConfig(
  headlampConfig,
  defineConfig({
    test: {
      // Keep the upstream setup (sets globalThis.jest = vi) AND
      // add our Canvas stub. Order matters less than presence.
      setupFiles: [
        'node_modules/@kinvolk/headlamp-plugin/config/setupTests.js',
        './vitest.setup.ts',
      ],
    },
  }),
);
