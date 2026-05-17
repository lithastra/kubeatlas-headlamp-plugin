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

// Wire types for the KubeAtlas REST API. They mirror the field names
// the server emits (snake_case for the count fields) — the plugin is
// a client, so these must match the server, but the code is the
// plugin's own and shares nothing with the KubeAtlas frontend.

// KubeAtlasService identifies a KubeAtlas Service the plugin talks to
// through the Kubernetes API server's service proxy.
export interface KubeAtlasService {
  namespace: string;
  name: string;
  port: number;
}

// GraphNode is one node of an aggregated view. At cluster level each
// node is a namespace.
export interface GraphNode {
  id: string;
  label?: string;
  children_count?: number;
}

// GraphEdge is one aggregated edge between two nodes.
export interface GraphEdge {
  from: string;
  to: string;
  count?: number;
}

// GraphView is the body of GET /api/v1/graph.
export interface GraphView {
  level: string;
  nodes: GraphNode[];
  edges: GraphEdge[];
}

// Edge is one dependency edge between two resources. `from` and `to`
// are KubeAtlas resource ids of the form "namespace/Kind/name".
export interface Edge {
  from: string;
  to: string;
  type: string;
}

// ResourceNeighbors is the one-hop edge set around a single resource:
// incoming edges point at it, outgoing edges point away from it.
export interface ResourceNeighbors {
  incoming: Edge[];
  outgoing: Edge[];
}
