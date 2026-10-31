import { it, vi, expect } from 'vitest';
import { renderHook } from '@testing-library/react';

import { useAssessmentWorkbench } from './use-assessment-workbench';

const navigation = vi.hoisted(() => ({ query: '', push: vi.fn(), replace: vi.fn() }));
vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: navigation.push, replace: navigation.replace }),
  usePathname: () => '/student/admissions/assessments',
  useSearchParams: () => new URLSearchParams(navigation.query),
}));

it('keeps a legacy Student link in Student after its last filter is cleared', () => {
  navigation.query = 'board=board&assessmentStatus=pending';
  const { result } = renderHook(() => useAssessmentWorkbench());
  const url = new URL(result.current.href({ assessmentStatus: undefined }), 'http://localhost');
  expect(url.searchParams.get('assessmentTab')).toBe('students');
  expect(url.searchParams.get('board')).toBe('board');
  expect(url.searchParams.has('assessmentStatus')).toBe(false);
});

it('lets an explicit panel link override the inferred legacy panel', () => {
  navigation.query = 'assessmentSession=session';
  const { result } = renderHook(() => useAssessmentWorkbench());
  const url = new URL(result.current.href({ assessmentTab: 'sessions' }), 'http://localhost');
  expect(url.searchParams.get('assessmentTab')).toBe('sessions');
  expect(url.searchParams.get('assessmentSession')).toBe('session');
});
