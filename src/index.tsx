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

import { registerRoute, registerSidebarEntry } from '@kinvolk/headlamp-plugin/lib';
import { DependencyGraphPage } from './pages/DependencyGraph';

// The plugin contributes a single top-level "Dependency Graph"
// sidebar entry and the route it points at. This scaffold ships the
// registration only — the page itself is a placeholder until the
// cluster view is wired to a KubeAtlas service.
registerSidebarEntry({
  parent: null,
  name: 'kubeatlas-dependency-graph',
  label: 'Dependency Graph',
  url: '/kubeatlas',
  icon: 'mdi:graph-outline',
});

registerRoute({
  path: '/kubeatlas',
  sidebar: 'kubeatlas-dependency-graph',
  name: 'Dependency Graph',
  component: () => <DependencyGraphPage />,
});
