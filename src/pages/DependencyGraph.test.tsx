/*
 * Copyright 2026 The KubeAtlas Authors
 * SPDX-License-Identifier: Apache-2.0
 */

import { cleanup, fireEvent, render, screen, within } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import type { KubeAtlasService } from '../api/types';
import type { DetailDrawerProps } from '../components/DetailDrawer';
import type { GraphCanvasProps } from '../components/GraphCanvas';
import { DependencyGraphPage } from './DependencyGraph';

vi.mock('../api/client', () => ({
  fetchClusterGraph: vi.fn().mockResolvedValue({
    level: 'cluster',
    nodes: [{ id: 'demo', name: 'demo', type: 'aggregated' }],
    edges: [],
  }),
  fetchNamespaceGraph: vi.fn(),
}));

vi.mock('./ChooseService', () => ({
  ChooseService: ({ onSelect }: { onSelect: (service: KubeAtlasService) => void }) => (
    <button onClick={() => onSelect({ name: 'kubeatlas', namespace: 'demo', port: 8080 })}>
      Choose fixture
    </button>
  ),
}));

vi.mock('../components/GraphCanvas', () => ({
  GraphCanvas: ({ onSelect }: GraphCanvasProps) => (
    <button onClick={() => onSelect?.('demo/Deployment/web')}>Select fixture node</button>
  ),
}));

vi.mock('../components/DetailDrawer', () => ({
  DetailDrawer: ({ nodeId, onShowBlastRadius }: DetailDrawerProps) =>
    nodeId ? <button onClick={onShowBlastRadius}>Show blast radius</button> : null,
}));

afterEach(cleanup);

describe('DependencyGraphPage controls', () => {
  it('keeps namespace, blast-radius exit and depth controls in a wrapping group', async () => {
    render(<DependencyGraphPage />);
    fireEvent.click(screen.getByRole('button', { name: 'Choose fixture' }));
    fireEvent.click(await screen.findByRole('button', { name: 'Select fixture node' }));
    fireEvent.click(screen.getByRole('button', { name: 'Show blast radius' }));

    const controls = screen.getByRole('group', { name: 'Graph controls' });
    expect(getComputedStyle(controls).flexWrap).toBe('wrap');
    expect(within(controls).getByRole('combobox', { name: 'Namespace' })).toBeTruthy();
    expect(within(controls).getByRole('combobox', { name: 'Depth' }).textContent).toBe('3');
    const exit = within(controls).getByRole('button', {
      name: 'Blast radius · demo/Deployment/web',
    });
    expect(getComputedStyle(exit).maxWidth).toBe('100%');
    fireEvent.keyUp(exit, { key: 'Delete' });
    expect(within(controls).queryByRole('combobox', { name: 'Depth' })).toBeNull();
  });
});
