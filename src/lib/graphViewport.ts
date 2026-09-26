/*
 * Copyright 2026 The KubeAtlas Authors
 * SPDX-License-Identifier: Apache-2.0
 */

import type { Core } from 'cytoscape';

// Cytoscape already observes container and window resizes, but only resizes
// its renderer. Refit the existing graph without rerunning layout or replacing
// elements, so selection and blast-radius flags survive sidebar/viewport changes.
export function fitOnContainerResize(cy: Core): void {
  let width = cy.width();
  let height = cy.height();

  const onResize = () => {
    const nextWidth = cy.width();
    const nextHeight = cy.height();
    if (nextWidth === width && nextHeight === height) return;
    width = nextWidth;
    height = nextHeight;

    // Hidden containers cannot be fitted. Remember their size so returning to
    // the previous visible dimensions still triggers a fit. Unchanged-size
    // notifications (including theme restyles) must not reset manual pan/zoom.
    if (width > 0 && height > 0 && !cy.destroyed()) {
      cy.fit(undefined, 24);
    }
  };

  cy.on('resize', onResize);
  cy.one('destroy', () => cy.off('resize', onResize));
}
