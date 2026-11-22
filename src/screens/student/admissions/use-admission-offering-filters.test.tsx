import { it, vi, expect, beforeEach } from 'vitest';
import { act, renderHook } from '@testing-library/react';

import { useAdmissionOfferingFilters } from './use-admission-offering-filters';

const mocks = vi.hoisted(() => ({ embedded: false, query: '', replace: vi.fn() }));
vi.mock('next/navigation', () => ({
  useRouter: () => ({ replace: mocks.replace }),
  usePathname: () => (mocks.embedded ? '/student/setup' : '/student/admissions/settings/offerings'),
  useSearchParams: () => new URLSearchParams(mocks.query),
}));
vi.mock('src/screens/student/setup/embedding', () => ({
  useStudentSetupEmbedding: () => ({ embedded: mocks.embedded }),
}));

beforeEach(() => {
  vi.clearAllMocks();
  mocks.embedded = false;
  mocks.query = '';
});

it('does not use the guide stage as an Offering School Level filter', () => {
  mocks.embedded = true;
  mocks.query = 'stage=admissions&setting=admission-offerings&guideYear=year-a';
  const { result } = renderHook(() => useAdmissionOfferingFilters());
  expect(result.current.filters.stageId).toBe('');
});

it('keeps embedded Offering filters local without replacing the guide URL', () => {
  mocks.embedded = true;
  mocks.query = 'stage=admissions&setting=admission-offerings&guideYear=year-a';
  const { result } = renderHook(() => useAdmissionOfferingFilters());
  act(() => result.current.update({ stageId: 'primary-stage', search: 'Class 1' }));
  expect(result.current.filters).toMatchObject({ stageId: 'primary-stage', search: 'Class 1' });
  expect(mocks.replace).not.toHaveBeenCalled();
});

it('retains shareable School Level filtering on the standalone Offering page', () => {
  mocks.query = 'stage=primary-stage&page=3&size=25';
  const { result } = renderHook(() => useAdmissionOfferingFilters());
  expect(result.current.filters).toMatchObject({
    stageId: 'primary-stage',
    page: 2,
    rowsPerPage: 25,
  });
  act(() => result.current.update({ search: 'Class 1' }));
  const params = new URL(mocks.replace.mock.lastCall![0], 'http://localhost').searchParams;
  expect(params.get('stage')).toBe('primary-stage');
  expect(params.get('search')).toBe('Class 1');
  expect(params.has('page')).toBe(false);
});

it('uses the default size for legacy All page sizes in bookmarked URLs', () => {
  mocks.query = 'size=13';
  const { result } = renderHook(() => useAdmissionOfferingFilters());
  expect(result.current.filters.rowsPerPage).toBe(10);
});
