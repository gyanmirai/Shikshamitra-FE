'use client';

import type { RootState } from 'src/redux/store';
import type { Standards } from 'src/types/school';

import { useSelector } from 'react-redux';
import { useEffect, useCallback } from 'react';
import CustomSelect from 'src/components/custom-select';
import { Paper, Stack, Alert, Button } from '@mui/material';
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
      next.delete('page');
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
    next.delete('page');
    const query = next.toString();
    if (query === params.toString()) return;
    router.replace(query ? `${pathname}?${query}` : pathname, { scroll: false });
  }, [params, pathname, router, setStandardId]);

  return { academicYearId: currentYearId, boardId, mediumId, standardId, update, clear };
}

export function AdmissionAcademicFilters({
  boardId,
  mediumId,
  standardId,
  onChange,
  onClear,
}: {
  boardId: string;
  mediumId: string;
  standardId: string;
  onChange: (key: 'board' | 'medium' | 'class', value: string) => void;
  onClear?: () => void;
}) {
  const academicYearId = useSelector((state: RootState) => state.globalState.currentYear?.id);
  const hierarchy = useGetAcademicOrganizationOptionsQuery(
    { academicYearId: academicYearId ?? '' },
    { skip: !academicYearId }
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

  useEffect(() => {
    if (!hierarchy.currentData) return;
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
        <Alert severity="info">Select an academic year to view admissions.</Alert>
      )}
      {hierarchy.isError && (
        <Alert severity="error" action={<Button onClick={() => hierarchy.refetch()}>Retry</Button>}>
          Could not load Board and Medium options.
        </Alert>
      )}
      {classes.isError && mediumId && (
        <Alert severity="error" action={<Button onClick={() => classes.refetch()}>Retry</Button>}>
          Could not load Class options.
        </Alert>
      )}
      <Paper variant="outlined" sx={{ p: 1, borderRadius: 2, flexShrink: 0 }}>
        <Stack direction={{ xs: 'column', lg: 'row' }} spacing={1}>
          <CustomSelect
            fullWidth
            label="Board"
            labelKey="name"
            valueKey="id"
            options={boards}
            value={boardId}
            isLoading={hierarchy.isFetching}
            disabled={!academicYearId || hierarchy.isError}
            onChange={(value) => onChange('board', String(value))}
          />
          <CustomSelect
            fullWidth
            label="Medium"
            labelKey="name"
            valueKey="id"
            options={mediums}
            value={mediumId}
            isLoading={hierarchy.isFetching}
            disabled={!boardId || hierarchy.isError}
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
            disabled={!mediumId || classes.isError}
            onChange={(value) => onChange('class', academicMultipleFilterValue(standardId, value))}
          />
          {onClear && standardId && (
            <Button variant="text" size="small" onClick={onClear} sx={{ flexShrink: 0 }}>
              Clear academic filters
            </Button>
          )}
        </Stack>
      </Paper>
    </>
  );
}
