/*
 * Copyright 2026 The KubeAtlas Authors
 * SPDX-License-Identifier: Apache-2.0
 */

import './index';
import {
  type DetailsViewSectionProps,
  registerDetailsViewSection,
} from '@kinvolk/headlamp-plugin/lib';
import { isValidElement } from 'react';
import { describe, expect, it, vi } from 'vitest';
import { DependenciesSection, type DependenciesSectionProps } from './sections/DependenciesSection';

vi.mock('@kinvolk/headlamp-plugin/lib', () => ({
  registerDetailsViewSection: vi.fn(),
  registerRoute: vi.fn(),
  registerSidebarEntry: vi.fn(),
}));
vi.mock('./pages/DependencyGraph', () => ({ DependencyGraphPage: () => null }));
vi.mock('./pages/PolicyView', () => ({ PolicyView: () => null }));
vi.mock('./pages/OTelOverlay', () => ({ OTelOverlay: () => null }));
vi.mock('./sections/DependenciesSection', () => ({
  DependenciesSection: () => null,
  isSupportedKind: (kind: string) => kind === 'Deployment',
}));

describe('resource details registration', () => {
  it('forwards the resource cluster rather than the currently selected route cluster', () => {
    const section = vi.mocked(registerDetailsViewSection).mock.calls[0][0];
    expect(typeof section).toBe('function');
    if (typeof section !== 'function') throw new Error('Expected a resource section callback');
    const resource = {
      cluster: 'resource-cluster',
      kind: 'Deployment',
      metadata: { namespace: 'demo', name: 'web' },
    } as DetailsViewSectionProps['resource'];
    const view = section({ resource });
    expect(isValidElement<DependenciesSectionProps>(view)).toBe(true);
    if (!isValidElement<DependenciesSectionProps>(view))
      throw new Error('Expected a section element');
    expect(view.type).toBe(DependenciesSection);
    expect(view.props).toEqual({
      cluster: 'resource-cluster',
      kind: 'Deployment',
      namespace: 'demo',
      name: 'web',
    });
  });

  it('still omits unsupported resource kinds', () => {
    const section = vi.mocked(registerDetailsViewSection).mock.calls[0][0];
    if (typeof section !== 'function') throw new Error('Expected a resource section callback');
    const resource = {
      kind: 'Unknown',
      cluster: 'resource-cluster',
    } as DetailsViewSectionProps['resource'];
    expect(section({ resource })).toBeNull();
  });
});
