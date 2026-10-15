import { render, screen, cleanup } from '@testing-library/react';
import { it, vi, expect, describe, afterEach, beforeEach } from 'vitest';

import RouteAwareAcademicSearch from './route-aware-search';

const state = vi.hoisted(() => ({ pathname: '/setting', renderSearch: vi.fn() }));
vi.mock('next/navigation', () => ({ usePathname: () => state.pathname }));
vi.mock('./index', () => ({
  default: () => {
    state.renderSearch();
    return <button type="button">Global academic context</button>;
  },
}));
beforeEach(() => vi.clearAllMocks());
afterEach(cleanup);

describe('global academic context in the authenticated header', () => {
  it.each([
    '/setting',
    '/setting/',
    '/setting/academic-setup',
    '/setting/school-identity',
    '/setting/shift-management',
    '/setting/room-management',
    '/setting/building-management',
    '/setting/room-type',
    '/setting/room',
    '/setting/basic-information',
    '/setting/room/record-id',
    '/setting/future-submodule/',
    '/security',
    '/security/',
    '/security/dashboard',
    '/security/role',
    '/security/user',
    '/security/department',
    '/security/user/record-id',
  ])('does not mount the global selector on %s', (pathname) => {
    state.pathname = pathname;
    const view = render(<RouteAwareAcademicSearch />);
    expect(view.container).toBeEmptyDOMElement();
    expect(state.renderSearch).not.toHaveBeenCalled();
  });

  it.each([
    '/dashboard',
    '/academic/dashboard',
    '/student/dashboard',
    '/hr/dashboard',
    '/finance/fee-collection',
    '/settings',
    '/setting-tools',
    '/security-guard',
    '/security-guard/dashboard',
    '/security-tools',
  ])('retains the global selector outside Institute Setup and Security on %s', (pathname) => {
    state.pathname = pathname;
    render(<RouteAwareAcademicSearch />);
    expect(screen.getByRole('button', { name: 'Global academic context' })).toBeVisible();
  });

  it('updates visibility as the user enters and leaves Institute Setup and Security', () => {
    state.pathname = '/academic/dashboard';
    const view = render(<RouteAwareAcademicSearch />);
    expect(screen.getByRole('button', { name: 'Global academic context' })).toBeVisible();
    state.pathname = '/setting/school-identity';
    view.rerender(<RouteAwareAcademicSearch />);
    expect(view.container).toBeEmptyDOMElement();
    state.pathname = '/security/role';
    view.rerender(<RouteAwareAcademicSearch />);
    expect(view.container).toBeEmptyDOMElement();
    state.pathname = '/security/user';
    view.rerender(<RouteAwareAcademicSearch />);
    expect(view.container).toBeEmptyDOMElement();
    state.pathname = '/student/dashboard';
    view.rerender(<RouteAwareAcademicSearch />);
    expect(screen.getByRole('button', { name: 'Global academic context' })).toBeVisible();
  });
});
