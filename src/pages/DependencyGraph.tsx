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

import { Box, Typography } from '@mui/material';

// DependencyGraphPage is the cluster-level dependency graph view.
// This is a placeholder: the next iteration adds a service picker
// and a Cytoscape canvas fed by a KubeAtlas service in the cluster.
// It stays free of Headlamp-context-bound components so the scaffold
// is trivially testable.
export function DependencyGraphPage() {
  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Dependency Graph
      </Typography>
      <Typography>
        The KubeAtlas dependency graph will render here. A future release
        connects this page to a KubeAtlas service running in the cluster.
      </Typography>
    </Box>
  );
}
