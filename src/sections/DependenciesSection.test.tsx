/*
 * Copyright 2026 The KubeAtlas Authors
 * SPDX-License-Identifier: Apache-2.0
 */

import { act, cleanup, render, screen, waitFor } from '@testing-library/react';
import type { ReactNode } from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { fetchResourceNeighbors } from '../api/client';
import type { ResourceNeighbors } from '../api/types';
import type { NeighborGraphProps } from '../components/NeighborGraph';
import { DependenciesSection } from './DependenciesSection';

const { useServices } = vi.hoisted(() => ({ useServices: vi.fn() }));
vi.mock('@kinvolk/headlamp-plugin/lib', () => ({
  K8s: { ResourceClasses: { Service: { useList: useServices } } },
}));
vi.mock('@kinvolk/headlamp-plugin/lib/CommonComponents', () => ({
  SectionBox: ({ title, children }: { title: string; children: ReactNode }) => (
    <section>
      <h2>{title}</h2>
      {children}
    </section>
  ),
}));
vi.mock('../api/client', () => ({ fetchResourceNeighbors: vi.fn() }));
vi.mock('../components/NeighborGraph', () => ({
  NeighborGraph: ({ centerId, outgoing }: NeighborGraphProps) => (
    <div data-testid="neighbors">
      {centerId} {outgoing[0]?.to}
    </div>
  ),
}));

const props = { cluster: 'cluster-a', kind: 'Deployment', namespace: 'demo', name: 'web' };
const service = {
  metadata: { namespace: 'atlas', name: 'kubeatlas' },
  spec: { ports: [{ port: 8080 }] },
};
const graph = (name: string): ResourceNeighbors => ({
  incoming: [],
  outgoing: [{ from: 'demo/Deployment/web', to: name, type: 'USES_CONFIGMAP' }],
});
function deferred() {
  let resolve!: (value: ResourceNeighbors) => void;
  let reject!: (error: Error) => void;
  const promise = new Promise<ResourceNeighbors>((res, rej) => {
    resolve = res;
    reject = rej;
  });
  return { promise, resolve, reject };
}

beforeEach(() => {
  useServices.mockReset().mockReturnValue([[service], null]);
  vi.mocked(fetchResourceNeighbors).mockReset().mockResolvedValue(graph('cluster-a-config'));
});
afterEach(cleanup);

describe('DependenciesSection cluster identity and states', () => {
  it('scopes both service discovery and neighbors to the resource cluster', async () => {
    render(<DependenciesSection {...props} />);
    expect(useServices).toHaveBeenCalledWith({
      cluster: 'cluster-a',
      labelSelector: 'app.kubernetes.io/name=kubeatlas',
    });
    expect(fetchResourceNeighbors).toHaveBeenCalledWith(
      { namespace: 'atlas', name: 'kubeatlas', port: 8080 },
      'demo',
      'Deployment',
      'web',
      'cluster-a'
    );
    expect((await screen.findByTestId('neighbors')).textContent).toContain('cluster-a-config');
  });

  it.each(['', '   '])(
    'does not guess the current cluster when identity is missing (%j)',
    cluster => {
      render(<DependenciesSection {...props} cluster={cluster} />);
      expect(screen.getByRole('alert').textContent).toContain('resource cluster');
      expect(useServices).not.toHaveBeenCalled();
      expect(fetchResourceNeighbors).not.toHaveBeenCalled();
    }
  );

  it('shows loading instead of an installation claim during discovery', () => {
    useServices.mockReturnValue([null, null]);
    render(<DependenciesSection {...props} />);
    expect(screen.getByRole('progressbar')).toBeTruthy();
    expect(screen.queryByRole('alert')).toBeNull();
    expect(fetchResourceNeighbors).not.toHaveBeenCalled();
  });

  it('reports an empty discovery result without claiming installation is absent', () => {
    useServices.mockReturnValue([[], null]);
    render(<DependenciesSection {...props} />);
    expect(screen.getByRole('alert').textContent).toContain('No KubeAtlas Service was found');
    expect(screen.queryByText(/is not installed/)).toBeNull();
    expect(fetchResourceNeighbors).not.toHaveBeenCalled();
  });

  it.each([{ services: [] }, { services: [service] }])(
    'discovery failure takes precedence over cached services: %j',
    ({ services }) => {
      useServices.mockReturnValue([services, new Error('private server response')]);
      render(<DependenciesSection {...props} />);
      expect(screen.getAllByRole('alert')).toHaveLength(1);
      expect(screen.getByRole('alert').textContent).toContain('Could not list KubeAtlas Services');
      expect(
        screen.queryByText(
          /private server response|is not installed|No KubeAtlas Service was found/
        )
      ).toBeNull();
      expect(fetchResourceNeighbors).not.toHaveBeenCalled();
    }
  );

  it('shows a safe actionable neighbor error without echoing the response body', async () => {
    vi.mocked(fetchResourceNeighbors).mockRejectedValue(new Error('private upstream response'));
    render(<DependenciesSection {...props} />);
    expect((await screen.findByRole('alert')).textContent).toContain('Could not load dependencies');
    expect(screen.queryByText(/private upstream response/)).toBeNull();
    expect(screen.queryByRole('progressbar')).toBeNull();
  });

  it('distinguishes a successfully loaded empty neighborhood', async () => {
    vi.mocked(fetchResourceNeighbors).mockResolvedValue({ incoming: [], outgoing: [] });
    render(<DependenciesSection {...props} />);
    expect(await screen.findByText('No dependencies recorded for this resource.')).toBeTruthy();
    expect(screen.queryByRole('alert')).toBeNull();
  });

  it('hides previous cluster data immediately and ignores an old cluster completion', async () => {
    const old = deferred();
    const current = deferred();
    vi.mocked(fetchResourceNeighbors)
      .mockReturnValueOnce(old.promise)
      .mockReturnValueOnce(current.promise);
    const view = render(<DependenciesSection {...props} />);
    view.rerender(<DependenciesSection {...props} cluster="cluster-b" />);
    expect(useServices).toHaveBeenLastCalledWith({
      cluster: 'cluster-b',
      labelSelector: 'app.kubernetes.io/name=kubeatlas',
    });
    expect(fetchResourceNeighbors).toHaveBeenLastCalledWith(
      { namespace: 'atlas', name: 'kubeatlas', port: 8080 },
      'demo',
      'Deployment',
      'web',
      'cluster-b'
    );
    await act(async () => old.resolve(graph('old-cluster-config')));
    expect(screen.queryByTestId('neighbors')).toBeNull();
    await act(async () => current.resolve(graph('new-cluster-config')));
    expect(screen.getByTestId('neighbors').textContent).toContain('new-cluster-config');
  });

  it('clears an already displayed graph when switching to an identically named resource in another cluster', async () => {
    const current = deferred();
    const view = render(<DependenciesSection {...props} />);
    await screen.findByTestId('neighbors');
    vi.mocked(fetchResourceNeighbors).mockReturnValueOnce(current.promise);
    view.rerender(<DependenciesSection {...props} cluster="cluster-b" />);
    expect(screen.queryByTestId('neighbors')).toBeNull();
    expect(screen.getByRole('progressbar')).toBeTruthy();
  });

  it('does not let a late resource rejection overwrite the replacement resource', async () => {
    const old = deferred();
    vi.mocked(fetchResourceNeighbors).mockReturnValueOnce(old.promise);
    const view = render(<DependenciesSection {...props} />);
    view.rerender(<DependenciesSection {...props} name="other" />);
    await screen.findByTestId('neighbors');
    await act(async () => old.reject(new Error('late failure')));
    expect(screen.getByTestId('neighbors').textContent).toContain('demo/Deployment/other');
    expect(screen.queryByRole('alert')).toBeNull();
  });

  it('removes stale data on service loss and fetches again after discovery recovers', async () => {
    const view = render(<DependenciesSection {...props} />);
    await screen.findByTestId('neighbors');
    useServices.mockReturnValue([[], new Error('unavailable')]);
    view.rerender(<DependenciesSection {...props} />);
    expect(screen.queryByTestId('neighbors')).toBeNull();
    expect(screen.getAllByRole('alert')).toHaveLength(1);
    useServices.mockReturnValue([[service], null]);
    view.rerender(<DependenciesSection {...props} />);
    await screen.findByTestId('neighbors');
    expect(fetchResourceNeighbors).toHaveBeenCalledTimes(2);
  });

  it('replaces an in-flight request when the discovered service changes', async () => {
    const old = deferred();
    vi.mocked(fetchResourceNeighbors).mockReturnValueOnce(old.promise);
    const view = render(<DependenciesSection {...props} />);
    useServices.mockReturnValue([
      [{ ...service, metadata: { namespace: 'new-atlas', name: 'other' } }],
      null,
    ]);
    view.rerender(<DependenciesSection {...props} />);
    await waitFor(() => expect(fetchResourceNeighbors).toHaveBeenCalledTimes(2));
    await screen.findByTestId('neighbors');
    await act(async () => old.resolve(graph('stale-service-config')));
    expect(screen.getByTestId('neighbors').textContent).not.toContain('stale-service-config');
  });
});
