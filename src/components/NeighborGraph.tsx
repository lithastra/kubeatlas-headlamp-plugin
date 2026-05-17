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
import { useEffect, useRef } from 'react';
import { Edge } from '../api/types';

export interface NeighborGraphProps {
  centerId: string;
  centerLabel: string;
  incoming: Edge[];
  outgoing: Edge[];
}

// shortLabel trims a KubeAtlas resource id (namespace/Kind/name) down
// to its Kind/name tail so neighbour nodes stay readable.
function shortLabel(id: string): string {
  return id.split('/').slice(-2).join('/');
}

// NeighborGraph renders the one-hop dependency neighbourhood of a
// single resource: the resource at the centre, its incoming and
// outgoing neighbours around it. It is intentionally a separate,
// small component from the cluster-level GraphCanvas — a star layout
// reads better than a force-directed one for a handful of nodes.
export function NeighborGraph({ centerId, centerLabel, incoming, outgoing }: NeighborGraphProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) {
      return undefined;
    }

    const labels = new Map<string, string>([[centerId, centerLabel]]);
    const edges: { source: string; target: string; label: string }[] = [];
    for (const e of incoming) {
      labels.set(e.from, shortLabel(e.from));
      edges.push({ source: e.from, target: centerId, label: e.type });
    }
    for (const e of outgoing) {
      labels.set(e.to, shortLabel(e.to));
      edges.push({ source: centerId, target: e.to, label: e.type });
    }

    const cy = cytoscape({
      container,
      elements: [
        ...[...labels.entries()].map(([id, label]) => ({
          data: { id, label },
          classes: id === centerId ? 'center' : 'neighbor',
        })),
        ...edges.map(e => ({ data: e })),
      ],
      style: [
        {
          selector: 'node',
          style: {
            label: 'data(label)',
            'background-color': '#90a4ae',
            color: '#ffffff',
            'font-size': 9,
            'text-valign': 'center',
            'text-halign': 'center',
            'text-wrap': 'wrap',
            'text-max-width': '80px',
            width: 56,
            height: 56,
          },
        },
        {
          selector: 'node.center',
          style: { 'background-color': '#1976d2', width: 72, height: 72 },
        },
        {
          selector: 'edge',
          style: {
            label: 'data(label)',
            'font-size': 8,
            color: '#607d8b',
            width: 2,
            'line-color': '#b0bec5',
            'target-arrow-color': '#b0bec5',
            'target-arrow-shape': 'triangle',
            'curve-style': 'bezier',
          },
        },
      ],
      layout: {
        name: 'concentric',
        concentric: node => (node.data('id') === centerId ? 2 : 1),
        levelWidth: () => 1,
        minNodeSpacing: 40,
      } as cytoscape.LayoutOptions,
    });

    return () => cy.destroy();
  }, [centerId, centerLabel, incoming, outgoing]);

  return <div ref={containerRef} style={{ width: '100%', height: '420px' }} />;
}
