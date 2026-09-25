/*
 * Copyright 2026 The KubeAtlas Authors
 * SPDX-License-Identifier: Apache-2.0
 */

import { createTheme, ThemeProvider } from '@mui/material/styles';
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { useState } from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { DetailDrawer } from './DetailDrawer';

vi.mock('../api/client', () => ({ fetchResourceNeighbors: vi.fn() }));

afterEach(cleanup);

function DrawerHarness() {
  const [nodeId, setNodeId] = useState<string | null>('demo');
  return (
    <DetailDrawer
      service={null}
      nodeId={nodeId}
      blastActive={false}
      onClose={() => setNodeId(null)}
      onShowBlastRadius={() => {}}
      onExitBlastRadius={() => {}}
    />
  );
}

describe('DetailDrawer', () => {
  it.each([
    { mode: 'light' as const, drawer: 1200, modal: 1300 },
    { mode: 'dark' as const, drawer: 1200, modal: 1300 },
    { mode: 'light' as const, drawer: 2200, modal: 2300 },
    { mode: 'dark' as const, drawer: 2200, modal: 2300 },
  ])('uses the $mode theme modal layer ($modal) above the host toolbar', options => {
    const theme = createTheme({
      palette: { mode: options.mode },
      zIndex: { drawer: options.drawer, modal: options.modal, tooltip: options.modal + 200 },
    });
    render(
      <ThemeProvider theme={theme}>
        <DrawerHarness />
      </ThemeProvider>
    );

    const root = screen.getByRole('button', { name: 'Close detail' }).closest('.MuiDrawer-root');
    expect(root).not.toBeNull();
    // Headlamp places its toolbar at drawer + 1. Test the portal root,
    // not just the paper: a child cannot escape its parent's stacking context.
    const layer = Number(getComputedStyle(root!).zIndex);
    expect(layer).toBe(theme.zIndex.modal);
    expect(layer).toBeGreaterThan(theme.zIndex.drawer + 1);
    expect(layer).toBeLessThan(theme.zIndex.tooltip);
  });

  it.each(['close button', 'Escape', 'backdrop'])('dismisses via %s', async action => {
    render(<DrawerHarness />);
    const close = screen.getByRole('button', { name: 'Close detail' });

    if (action === 'close button') {
      fireEvent.click(close);
    } else if (action === 'Escape') {
      fireEvent.keyDown(close, { key: 'Escape', code: 'Escape' });
    } else {
      const backdrop = close.closest('.MuiDrawer-root')!.querySelector('.MuiBackdrop-root');
      expect(backdrop).not.toBeNull();
      fireEvent.click(backdrop!);
    }

    await waitFor(() => expect(screen.queryByRole('button', { name: 'Close detail' })).toBeNull());
  });
});
