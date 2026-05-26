/*
 * Copyright 2026 The KubeAtlas Authors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import { useTheme } from '@mui/material/styles';
import type { Core } from 'cytoscape';
import { useEffect, useRef } from 'react';
import { GraphView } from '../api/types';
import {
  applyAtlasPalette,
  createCytoscape,
  updateCytoscape,
} from '../lib/cytoscape';
import { paletteForScheme } from '../lib/themePalettes';

export interface GraphCanvasProps {
  graph: GraphView;
}

// GraphCanvas renders a KubeAtlas aggregated view with the same
// cartography stylesheet the standalone web UI uses: six node-family
// shapes (rectangle / round-rectangle / hexagon / octagon / cut-
// rectangle), edge encoding by weight + dash + colour + arrow (the
// 4-channel scheme from the design's edge inventory), and a
// runtime-switchable palette that follows Headlamp's MUI mode.
//
// Lifecycle is direct: create on mount, update on view change via
// cy.json, applyAtlasPalette on theme toggle (preserves selection),
// destroy on unmount.
export function GraphCanvas({ graph }: GraphCanvasProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const cyRef = useRef<Core | null>(null);
  const theme = useTheme();
  const palette = paletteForScheme(theme.palette.mode === 'dark' ? 'dark' : 'light');

  // Effect 1: create / update the cytoscape instance from `graph`.
  useEffect(() => {
    if (!containerRef.current) return;
    if (cyRef.current) {
      updateCytoscape(cyRef.current, graph);
    } else {
      cyRef.current = createCytoscape(containerRef.current, graph, palette);
    }
    // palette is intentionally NOT a dep — palette changes flow
    // through effect 2 (live restyle) without rerunning create /
    // update.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [graph]);

  // Effect 2: live palette swap on theme change — preserves
  // selection and layout.
  useEffect(() => {
    if (cyRef.current) {
      applyAtlasPalette(cyRef.current, palette);
    }
  }, [palette]);

  // Effect 3: destroy on unmount.
  useEffect(() => {
    return () => {
      cyRef.current?.destroy();
      cyRef.current = null;
    };
  }, []);

  return (
    <div
      ref={containerRef}
      style={{
        width: '100%',
        height: '70vh',
        backgroundColor: palette.bg,
        borderRadius: 2,
      }}
    />
  );
}
