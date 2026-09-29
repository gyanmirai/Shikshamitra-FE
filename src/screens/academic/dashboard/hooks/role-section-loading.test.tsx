import { it, vi, expect, beforeEach } from 'vitest';
import { renderHook } from '@testing-library/react';
import {
  useGetTeacherAcademicDashboardQuery,
  useGetPrincipalAcademicDashboardQuery,
  useGetTeacherAcademicDashboardAttentionQuery,
  useGetTeacherAcademicDashboardAssessmentQuery,
  useGetTeacherAcademicDashboardAssignmentsQuery,
  useGetPrincipalAcademicDashboardCurriculumQuery,
  useGetPrincipalAcademicDashboardOperationsQuery,
  useGetPrincipalAcademicDashboardPerformanceQuery,
} from 'src/redux/academicAPI/academicDashboardApi';

import { useTeacherAcademicDashboardSections } from './useTeacherAcademicDashboardSections';
import { usePrincipalAcademicDashboardSections } from '../../AcademicPrincipalDashboard/hooks/usePrincipalAcademicDashboardSections';

vi.mock('src/redux/academicAPI/academicDashboardApi', () => {
  const query = () => ({ data: undefined, isFetching: false, refetch: vi.fn() });
  return {
    useGetTeacherAcademicDashboardQuery: vi.fn(query),
    useGetTeacherAcademicDashboardAttentionQuery: vi.fn(query),
    useGetTeacherAcademicDashboardAssessmentQuery: vi.fn(query),
    useGetTeacherAcademicDashboardAssignmentsQuery: vi.fn(query),
    useGetPrincipalAcademicDashboardQuery: vi.fn(query),
    useGetPrincipalAcademicDashboardCurriculumQuery: vi.fn(query),
    useGetPrincipalAcademicDashboardOperationsQuery: vi.fn(query),
    useGetPrincipalAcademicDashboardPerformanceQuery: vi.fn(query),
  };
});

beforeEach(() => vi.clearAllMocks());

it('uses only the legacy teacher request when the backend has no section support', () => {
  renderHook(() => useTeacherAcademicDashboardSections(false));

  expect(useGetTeacherAcademicDashboardQuery).toHaveBeenCalledWith(undefined, { skip: false });
  expect(useGetTeacherAcademicDashboardAssignmentsQuery).toHaveBeenCalledWith(undefined, {
    skip: true,
  });
  expect(useGetTeacherAcademicDashboardAssessmentQuery).toHaveBeenCalledWith(undefined, {
    skip: true,
  });
  expect(useGetTeacherAcademicDashboardAttentionQuery).toHaveBeenCalledWith(undefined, {
    skip: true,
  });
});

it('loads the teacher sections independently on a section-capable backend', () => {
  renderHook(() => useTeacherAcademicDashboardSections(true));

  expect(useGetTeacherAcademicDashboardQuery).toHaveBeenCalledWith(undefined, { skip: true });
  expect(useGetTeacherAcademicDashboardAssignmentsQuery).toHaveBeenCalledWith(undefined, {
    skip: false,
  });
  expect(useGetTeacherAcademicDashboardAssessmentQuery).toHaveBeenCalledWith(undefined, {
    skip: false,
  });
  expect(useGetTeacherAcademicDashboardAttentionQuery).toHaveBeenCalledWith(undefined, {
    skip: false,
  });
});

it('uses only the legacy principal request when the backend has no section support', () => {
  renderHook(() => usePrincipalAcademicDashboardSections(false));

  expect(useGetPrincipalAcademicDashboardQuery).toHaveBeenCalledWith(undefined, { skip: false });
  expect(useGetPrincipalAcademicDashboardPerformanceQuery).toHaveBeenCalledWith(undefined, {
    skip: true,
  });
  expect(useGetPrincipalAcademicDashboardCurriculumQuery).toHaveBeenCalledWith(undefined, {
    skip: true,
  });
  expect(useGetPrincipalAcademicDashboardOperationsQuery).toHaveBeenCalledWith(undefined, {
    skip: true,
  });
});

it('loads the principal sections independently on a section-capable backend', () => {
  renderHook(() => usePrincipalAcademicDashboardSections(true));

  expect(useGetPrincipalAcademicDashboardQuery).toHaveBeenCalledWith(undefined, { skip: true });
  expect(useGetPrincipalAcademicDashboardPerformanceQuery).toHaveBeenCalledWith(undefined, {
    skip: false,
  });
  expect(useGetPrincipalAcademicDashboardCurriculumQuery).toHaveBeenCalledWith(undefined, {
    skip: false,
  });
  expect(useGetPrincipalAcademicDashboardOperationsQuery).toHaveBeenCalledWith(undefined, {
    skip: false,
  });
});
