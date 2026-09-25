/*
 * Copyright 2026 The KubeAtlas Authors
 * SPDX-License-Identifier: Apache-2.0
 */

import cytoscape, { type Core } from 'cytoscape';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { fitOnContainerResize } from './graphViewport';

const instances: Core[] = [];

afterEach(() => {
  instances.splice(0).forEach(cy => cy.destroy());
  vi.restoreAllMocks();
});

function setup() {
  const cy = cytoscape({
    headless: true,
    layout: { name: 'preset' },
    elements: [
      { data: { id: 'root' }, position: { x: 10, y: 20 }, selected: true },
      { data: { id: 'other', dimmed: true }, position: { x: 300, y: 200 } },
      { data: { id: 'edge', source: 'root', target: 'other', dimmed: true } },
    ],
  });
  instances.push(cy);
  let width = 1000;
  let height = 500;
  vi.spyOn(cy, 'width').mockImplementation(() => width);
  vi.spyOn(cy, 'height').mockImplementation(() => height);
  const fit = vi.spyOn(cy, 'fit');
  const layout = vi.spyOn(cy, 'layout');
  fitOnContainerResize(cy);
  const resize = (nextWidth: number, nextHeight = height) => {
    width = nextWidth;
    height = nextHeight;
    cy.emit('resize');
  };
  return { cy, fit, layout, resize };
}

describe('fitOnContainerResize', () => {
  it('does not refit on registration or an unchanged-size notification', () => {
    const { fit, resize } = setup();
    expect(fit).not.toHaveBeenCalled();
    resize(1000, 500);
    expect(fit).not.toHaveBeenCalled();
  });

  it.each([
    [320, 500],
    [1200, 500],
    [1000, 300],
  ])('fits existing elements when the container becomes %s by %s', (width, height) => {
    const { fit, layout, resize } = setup();
    resize(width, height);
    expect(fit).toHaveBeenCalledExactlyOnceWith(undefined, 24);
    expect(layout).not.toHaveBeenCalled();
  });

  it('ignores repeated notifications for the same size', () => {
    const { fit, resize } = setup();
    resize(320);
    resize(320);
    resize(320);
    expect(fit).toHaveBeenCalledTimes(1);
  });

  it.each([
    [0, 500],
    [1000, 0],
    [0, 0],
  ])('defers fitting a hidden %s by %s container until it is visible', (width, height) => {
    const { fit, resize } = setup();
    resize(width, height);
    expect(fit).not.toHaveBeenCalled();
    resize(1000, 500);
    expect(fit).toHaveBeenCalledExactlyOnceWith(undefined, 24);
  });

  it('preserves node positions, selection and blast-radius flags', () => {
    const { cy, resize } = setup();
    const elements = cy.elements().jsons();
    resize(320);
    resize(1000);
    expect(cy.elements().jsons()).toEqual(elements);
    expect(cy.$id('root').selected()).toBe(true);
    expect(cy.$id('other').data('dimmed')).toBe(true);
    expect(cy.$id('edge').data('dimmed')).toBe(true);
  });

  it('preserves manual zoom and pan when the container has not changed', () => {
    const { cy, fit, resize } = setup();
    cy.zoom(2);
    cy.pan({ x: 45, y: 80 });
    resize(1000, 500);
    expect(fit).not.toHaveBeenCalled();
    expect(cy.zoom()).toBe(2);
    expect(cy.pan()).toEqual({ x: 45, y: 80 });
  });

  it('unsubscribes when its graph is destroyed', () => {
    const { cy, fit, resize } = setup();
    const off = vi.spyOn(cy, 'off');
    cy.destroy();
    expect(off).toHaveBeenCalledWith('resize', expect.any(Function));
    resize(320);
    expect(fit).not.toHaveBeenCalled();
  });
});
