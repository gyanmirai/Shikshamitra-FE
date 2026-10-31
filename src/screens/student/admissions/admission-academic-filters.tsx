'use client';

import type { ReactNode } from 'react';
import type { RootState } from 'src/redux/store';
import type { Standards } from 'src/types/school';

import { useSelector } from 'react-redux';
import { useEffect, useCallback } from 'react';
import CustomSelect from 'src/components/custom-select';
import { Box, Paper, Stack, Button } from '@mui/material';
import { StudentFeedback } from 'src/components/student-feedback';
import { useUrlFilterValue } from 'src/hooks/use-url-filter-value';
import { useGetClassByMediumQuery } from 'src/redux/class/classApi';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import {
  readAcademicFilterIds,
  academicMultipleFilterValue,
} from 'src/utils/student-academic-filter-query';
import { useGetAcademicOrganizationOptionsQuery } from 'src/redux/academicOrganizationOptions/academicOrganizationOptionsApi';

import { getAdmissionHierarchyOptions } from './admission-hierarchy-options';

const ALL = '__all__';

export function useAdmissionAcademicFilters() {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const currentYearId = useSelector((state: RootState) => state.globalState.currentYear?.id);
  const dashboardScope = [
    'active-applications',
    'admission-decisions',
    'inquiry-followups',
  ].includes(params.get('dashboard') ?? '');
  const boardId = readAcademicFilterIds(params.get('board'))[0] ?? '';
  const mediumId = readAcademicFilterIds(params.get('medium'))[0] ?? '';
  const [standardId, setStandardId] = useUrlFilterValue(params.get('class') ?? '');

  const update = useCallback(
    (key: 'board' | 'medium' | 'class', value: string) => {
      const next = new URLSearchParams(params.toString());
      setStandardId(key === 'class' && value !== ALL ? value : '');
      if (value && value !== ALL) next.set(key, value);
      else next.delete(key);
      if (key === 'board') {
        next.delete('medium');
        next.delete('class');
      } else if (key === 'medium') next.delete('class');
      next.delete('division');
      next.delete('page');
      if (pathname.endsWith('/assessments')) {
        next.delete('assessmentPage');
        next.delete('assessmentSessionPage');
        next.delete('assessmentScope');
        next.delete('assessmentSession');
      }
      const query = next.toString();
      if (query === params.toString()) return;
      router.replace(query ? `${pathname}?${query}` : pathname, { scroll: false });
    },
    [params, pathname, router, setStandardId]
  );

  const clear = useCallback(() => {
    const next = new URLSearchParams(params.toString());
    setStandardId('');
    next.delete('class');
    next.delete('division');
    next.delete('page');
    const query = next.toString();
    if (query === params.toString()) return;
    router.replace(query ? `${pathname}?${query}` : pathname, { scroll: false });
  }, [params, pathname, router, setStandardId]);

  return {
    academicYearId: dashboardScope ? params.get('year') || currentYearId : currentYearId,
    boardId,
    mediumId,
    standardId,
    update,
    clear,
    dashboardScope,
  };
}

export function AdmissionAcademicFilters({
  boardId,
  mediumId,
  standardId,
  onChange,
  onClear,
  filterAction,
  disabled = false,
  allowAllHierarchy = false,
  onLoadingChange,
}: {
  boardId: string;
  mediumId: string;
  standardId: string;
  onChange: (key: 'board' | 'medium' | 'class', value: string) => void;
  onClear?: () => void;
  filterAction?: ReactNode;
  disabled?: boolean;
  allowAllHierarchy?: boolean;
  onLoadingChange?: (loading: boolean) => void;
}) {
  const academicYearId = useSelector((state: RootState) => state.globalState.currentYear?.id);
  const params = useSearchParams();
  const dashboardScope = [
    'active-applications',
    'admission-decisions',
    'inquiry-followups',
  ].includes(params.get('dashboard') ?? '');
  const effectiveYearId = dashboardScope ? params.get('year') || academicYearId : academicYearId;
  const hierarchy = useGetAcademicOrganizationOptionsQuery(
    { academicYearId: effectiveYearId ?? '' },
    { skip: !effectiveYearId }
  );
  const classes = useGetClassByMediumQuery(mediumId, { skip: !mediumId });
  const { boards, mediums } = getAdmissionHierarchyOptions(
    hierarchy.currentData?.items ?? [],
    boardId,
    mediumId
  );
  const standards = ((classes.currentData ?? []) as Standards[]).filter((item) =>
    (hierarchy.currentData?.items ?? []).some(
      (node) => node.mediumId === mediumId && node.id === item.educationMediumStageId
    )
  );
  // A skipped list is not an empty result while its default scope is being restored.
  const resolvingScope = Boolean(
    effectiveYearId &&
    !hierarchy.isError &&
    (!hierarchy.currentData ||
      (!dashboardScope &&
        !allowAllHierarchy &&
        ((boards.length > 0 && !boards.some((item) => item.id === boardId)) ||
          (mediums.length > 0 && !mediums.some((item) => item.id === mediumId)))))
  );
  useEffect(() => {
    onLoadingChange?.(resolvingScope);
  }, [onLoadingChange, resolvingScope]);

  useEffect(() => {
    if (disabled || !hierarchy.currentData || dashboardScope || allowAllHierarchy) return;
    if (!boards.some((item) => item.id === boardId)) {
      if (boards[0]) onChange('board', boards[0].id);
      return;
    }
    if (!mediums.some((item) => item.id === mediumId)) {
      if (mediums[0]) onChange('medium', mediums[0].id);
      return;
    }
    if (classes.currentData) {
      const validIds = readAcademicFilterIds(standardId).filter((id) =>
        standards.some((item) => item.id === id)
      );
      if (validIds.join(',') !== readAcademicFilterIds(standardId).join(','))
        onChange('class', validIds.join(','));
    }
  }, [
    boardId,
    boards,
    disabled,
    allowAllHierarchy,
    dashboardScope,
    classes.currentData,
    hierarchy.currentData,
    mediumId,
    mediums,
    onChange,
    standardId,
    standards,
  ]);

  return (
    <>
      {!academicYearId && (
        <StudentFeedback notificationKey="STU-0001" presentation="inline" severity="info">
          Select an academic year to view admissions.
        </StudentFeedback>
      )}
      {hierarchy.isError && (
        <StudentFeedback
          notificationKey="STU-0002"
          presentation="toast"
          severity="error"
          action={
            <Button disabled={disabled} onClick={() => hierarchy.refetch()}>
              Retry
            </Button>
          }
        >
          Could not load Board and Medium options.
        </StudentFeedback>
      )}
      {classes.isError && mediumId && (
        <StudentFeedback
          notificationKey="STU-0003"
          presentation="toast"
          severity="error"
          action={
            <Button disabled={disabled} onClick={() => classes.refetch()}>
              Retry
            </Button>
          }
        >
          Could not load Class options.
        </StudentFeedback>
      )}
      <Paper variant="outlined" sx={{ p: 1, borderRadius: 2, flexShrink: 0 }}>
        <Stack direction={{ xs: 'column', lg: 'row' }} spacing={1}>
          <CustomSelect
            fullWidth
            label="Board"
            labelKey="name"
            valueKey="id"
            options={
              dashboardScope || allowAllHierarchy
                ? [{ id: allowAllHierarchy ? ALL : '', name: 'All boards' }, ...boards]
                : boards
            }
            value={allowAllHierarchy && !boardId ? ALL : boardId}
            isLoading={hierarchy.isFetching}
            disabled={disabled || !academicYearId || hierarchy.isError}
            onChange={(value) => onChange('board', String(value))}
          />
          <CustomSelect
            fullWidth
            label="Medium"
            labelKey="name"
            valueKey="id"
            options={
              dashboardScope || allowAllHierarchy
                ? [{ id: allowAllHierarchy ? ALL : '', name: 'All mediums' }, ...mediums]
                : mediums
            }
            value={allowAllHierarchy && !mediumId ? ALL : mediumId}
            isLoading={hierarchy.isFetching}
            disabled={disabled || !boardId || hierarchy.isError}
            onChange={(value) => onChange('medium', String(value))}
          />
          <CustomSelect
            multiple
            fullWidth
            label="Class"
            labelKey="name"
            valueKey="id"
            options={[{ id: ALL, name: 'All classes' }, ...standards]}
            value={
              readAcademicFilterIds(standardId).length ? readAcademicFilterIds(standardId) : [ALL]
            }
            isLoading={classes.isFetching}
            disabled={disabled || !mediumId || classes.isError}
            onChange={(value) => onChange('class', academicMultipleFilterValue(standardId, value))}
          />
          {onClear && standardId && (
            <Button
              variant="text"
              size="small"
              disabled={disabled}
              onClick={onClear}
              sx={{ flexShrink: 0 }}
            >
              Clear academic filters
            </Button>
          )}
          {filterAction && (
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'flex-end',
                flexShrink: 0,
              }}
            >
              {filterAction}
            </Box>
          )}
        </Stack>
      </Paper>
    </>
  );
}
