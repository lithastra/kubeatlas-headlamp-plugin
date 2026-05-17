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

import cytoscape from 'cytoscape';
import coseBilkent from 'cytoscape-cose-bilkent';
import { useEffect, useRef } from 'react';
import { GraphView } from '../api/types';

// Register the cose-bilkent force-directed layout once, at module
// load — cytoscape.use is idempotent for repeat calls.
cytoscape.use(coseBilkent);

export interface GraphCanvasProps {
  graph: GraphView;
}

// GraphCanvas renders a KubeAtlas aggregated view with cytoscape.
// It is the plugin's own component — it shares the rendering idea
// with the KubeAtlas web UI but none of its code.
export function GraphCanvas({ graph }: GraphCanvasProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) {
      return undefined;
    }

    const nodeIds = new Set(graph.nodes.map(n => n.id));
    const cy = cytoscape({
      container,
      elements: [
        ...graph.nodes.map(n => ({ data: { id: n.id, label: n.label ?? n.id } })),
        // Drop any edge whose endpoint is missing — cytoscape throws
        // when an edge references a node that was not added.
        ...graph.edges
          .filter(e => nodeIds.has(e.from) && nodeIds.has(e.to))
          .map(e => ({ data: { source: e.from, target: e.to } })),
      ],
      style: [
        {
          selector: 'node',
          style: {
            label: 'data(label)',
            'background-color': '#1976d2',
            color: '#ffffff',
            'font-size': 10,
            'text-valign': 'center',
            'text-halign': 'center',
            'text-wrap': 'wrap',
            'text-max-width': '72px',
            width: 64,
            height: 64,
          },
        },
        {
          selector: 'edge',
          style: {
            width: 2,
            'line-color': '#90a4ae',
            'target-arrow-color': '#90a4ae',
            'target-arrow-shape': 'triangle',
            'curve-style': 'bezier',
          },
        },
      ],
      layout: { name: 'cose-bilkent' } as cytoscape.LayoutOptions,
    });

    return () => cy.destroy();
  }, [graph]);

  return <div ref={containerRef} style={{ width: '100%', height: '70vh' }} />;
}
