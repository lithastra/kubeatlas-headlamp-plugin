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

import { K8s } from '@kinvolk/headlamp-plugin/lib';
import { SectionBox } from '@kinvolk/headlamp-plugin/lib/CommonComponents';
import { Alert, Box, CircularProgress, Typography } from '@mui/material';
import { useEffect, useState } from 'react';
import { fetchResourceNeighbors } from '../api/client';
import type { ResourceNeighbors } from '../api/types';
import { NeighborGraph } from '../components/NeighborGraph';

const KUBEATLAS_SERVICE_LABEL = 'app.kubernetes.io/name=kubeatlas';

// SUPPORTED_KINDS are the resource kinds KubeAtlas graphs. The
// Dependencies section is registered only for these — every other
// kind is skipped entirely, so no empty section appears (rather than
// rendering a blank or broken graph).
export const SUPPORTED_KINDS = new Set<string>([
  'Pod',
  'Deployment',
  'ReplicaSet',
  'StatefulSet',
  'DaemonSet',
  'Job',
  'CronJob',
  'Service',
  'Ingress',
  'ConfigMap',
  'Secret',
  'ServiceAccount',
  'PersistentVolumeClaim',
  'NetworkPolicy',
]);

export function isSupportedKind(kind: string | undefined): boolean {
  return kind !== undefined && SUPPORTED_KINDS.has(kind);
}

export interface DependenciesSectionProps {
  cluster: string;
  kind: string;
  namespace: string;
  name: string;
}

// DependenciesSection is the "KubeAtlas Dependencies" section shown on
// a resource's details page. It finds a KubeAtlas Service, fetches
// the resource's one-hop edges, and renders them as a small graph.
export function DependenciesSection(props: DependenciesSectionProps) {
  const { cluster, kind, namespace, name } = props;
  return (
    <SectionBox title="KubeAtlas Dependencies">
      {!cluster?.trim() ? (
        <Alert severity="warning">
          Could not determine the resource cluster. Reopen this resource from its cluster page.
        </Alert>
      ) : (
        // Reset discovery and request state before rendering another resource.
        // A retained window must never fall back to the current route's cluster.
        <ClusterDependencies key={JSON.stringify([cluster, kind, namespace, name])} {...props} />
      )}
    </SectionBox>
  );
}

function ClusterDependencies(props: DependenciesSectionProps) {
  const [services, servicesError] = K8s.ResourceClasses.Service.useList({
    cluster: props.cluster,
    labelSelector: KUBEATLAS_SERVICE_LABEL,
  });

  // Discovery failures take precedence over cached data and empty results.
  // Do not echo upstream response bodies or misreport a failed lookup as absence.
  if (servicesError) {
    return (
      <Alert severity="error">
        Could not list KubeAtlas Services. Check cluster connectivity and your permission to list
        Services, then reopen this resource.
      </Alert>
    );
  }
  if (services === null) return <LoadingDependencies />;
  if (services.length === 0) {
    return (
      <Alert severity="info">
        No KubeAtlas Service was found in this cluster. Check its installation and your access.
      </Alert>
    );
  }

  // The first KubeAtlas Service found backs the lookup — the cluster
  // view has an explicit picker, but a details section stays
  // unobtrusive and just uses what it discovers.
  const svcNamespace = services[0].metadata.namespace ?? '';
  const svcName = services[0].metadata.name;
  const svcPort = services[0].spec?.ports?.[0]?.port ?? 8080;
  return (
    <ResourceNeighborhood
      key={JSON.stringify([svcNamespace, svcName, svcPort])}
      {...props}
      svcNamespace={svcNamespace}
      svcName={svcName}
      svcPort={svcPort}
    />
  );
}

function LoadingDependencies() {
  return (
    <Box sx={{ display: 'flex', justifyContent: 'center', p: 2 }}>
      <CircularProgress size={24} aria-label="Loading dependencies" />
    </Box>
  );
}

type NeighborhoodState =
  | { status: 'loading' }
  | { status: 'error' }
  | { status: 'loaded'; neighbors: ResourceNeighbors };

function ResourceNeighborhood({
  cluster,
  kind,
  namespace,
  name,
  svcNamespace,
  svcName,
  svcPort,
}: DependenciesSectionProps & { svcNamespace: string; svcName: string; svcPort: number }) {
  const [state, setState] = useState<NeighborhoodState>({ status: 'loading' });

  useEffect(() => {
    let cancelled = false;
    fetchResourceNeighbors(
      { namespace: svcNamespace, name: svcName, port: svcPort },
      namespace,
      kind,
      name,
      cluster
    )
      .then(result => {
        if (!cancelled) {
          setState({ status: 'loaded', neighbors: result });
        }
      })
      .catch(() => {
        if (!cancelled) {
          setState({ status: 'error' });
        }
      });
    return () => {
      cancelled = true;
    };
  }, [cluster, svcNamespace, svcName, svcPort, namespace, kind, name]);

  if (state.status === 'loading') return <LoadingDependencies />;
  if (state.status === 'error') {
    return (
      <Alert severity="error">
        Could not load dependencies. Check the KubeAtlas service and your service-proxy access, then
        reopen this resource.
      </Alert>
    );
  }
  const { neighbors } = state;
  if (neighbors.incoming.length + neighbors.outgoing.length === 0) {
    return <Typography>No dependencies recorded for this resource.</Typography>;
  }
  return (
    <NeighborGraph
      centerId={`${namespace}/${kind}/${name}`}
      centerLabel={`${kind}/${name}`}
      incoming={neighbors.incoming}
      outgoing={neighbors.outgoing}
    />
  );
}
