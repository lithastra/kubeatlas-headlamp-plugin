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

import { Alert, Box, Button, CircularProgress, Link, Stack, Typography } from '@mui/material';
import { useEffect, useState } from 'react';
import { fetchClusterGraph } from '../api/client';
import { GraphView, KubeAtlasService } from '../api/types';
import { GraphCanvas } from '../components/GraphCanvas';
import { ChooseService } from './ChooseService';

const DOCS_URL = 'https://docs.kubeatlas.lithastra.com';

// DependencyGraphPage is the cluster-level dependency graph view. It
// first asks the operator to pick a KubeAtlas Service, then renders
// that service's cluster graph.
export function DependencyGraphPage() {
  const [service, setService] = useState<KubeAtlasService | null>(null);
  const [graph, setGraph] = useState<GraphView | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!service) {
      return undefined;
    }
    let cancelled = false;
    setLoading(true);
    setError(null);
    setGraph(null);
    fetchClusterGraph(service)
      .then(view => {
        if (!cancelled) {
          setGraph(view);
        }
      })
      .catch((err: unknown) => {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : String(err));
        }
      })
      .finally(() => {
        if (!cancelled) {
          setLoading(false);
        }
      });
    return () => {
      cancelled = true;
    };
  }, [service]);

  return (
    <Box sx={{ p: 3 }}>
      <Stack direction="row" alignItems="center" justifyContent="space-between">
        <Typography variant="h4" gutterBottom>
          Dependency Graph
        </Typography>
        {service && (
          <Button size="small" onClick={() => setService(null)}>
            Change service
          </Button>
        )}
      </Stack>

      {!service && <ChooseService onSelect={setService} />}

      {service && loading && (
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
          <CircularProgress />
        </Box>
      )}

      {service && error && (
        <Alert severity="error">
          Could not load the graph from {service.namespace}/{service.name}: {error}.
          Check that KubeAtlas is healthy — see the{' '}
          <Link href={DOCS_URL} target="_blank" rel="noopener noreferrer">
            documentation
          </Link>
          .
        </Alert>
      )}

      {service && graph && <GraphCanvas graph={graph} />}
    </Box>
  );
}
