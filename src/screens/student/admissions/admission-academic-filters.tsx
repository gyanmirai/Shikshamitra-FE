'use client';

import type { RootState } from 'src/redux/store';
import type { Standards } from 'src/types/school';

import { useCallback, useEffect } from 'react';
import { useSelector } from 'react-redux';
import CustomSelect from 'src/components/custom-select';
import { Paper, Stack, Alert, Button } from '@mui/material';
import { useGetClassByMediumQuery } from 'src/redux/class/classApi';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { useGetAcademicOrganizationOptionsQuery } from 'src/redux/academicOrganizationOptions/academicOrganizationOptionsApi';

import { getAdmissionHierarchyOptions } from './admission-hierarchy-options';

const ALL = '__all__';

export function useAdmissionAcademicFilters() {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const currentYearId = useSelector((state: RootState) => state.globalState.currentYear?.id);
  const boardId = params.get('board') ?? '';
  const mediumId = params.get('medium') ?? '';
  const standardId = params.get('class') ?? '';

  const update = useCallback((key: 'board' | 'medium' | 'class', value: string) => {
    const next = new URLSearchParams(params.toString());
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
  }, [params, pathname, router]);

  const clear = useCallback(() => {
    const next = new URLSearchParams(params.toString());
    ['board', 'medium', 'class'].forEach((key) => next.delete(key));
    next.delete('page');
    const query = next.toString();
    if (query === params.toString()) return;
    router.replace(query ? `${pathname}?${query}` : pathname, { scroll: false });
  }, [params, pathname, router]);

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
    hierarchy.currentData?.items ?? [], boardId, mediumId
  );
  const standards = ((classes.currentData ?? []) as Standards[]).filter((item) =>
    (hierarchy.currentData?.items ?? []).some((node) =>
      node.mediumId === mediumId && node.id === item.educationMediumStageId
    )
  );

  useEffect(() => {
    if (hierarchy.currentData && boardId && !boards.some((item) => item.id === boardId))
      onChange('board', ALL);
    else if (hierarchy.currentData && mediumId && !mediums.some((item) => item.id === mediumId))
      onChange('medium', ALL);
    else if (classes.currentData && standardId && !standards.some((item) => item.id === standardId))
      onChange('class', ALL);
  }, [boardId, boards, classes.currentData, hierarchy.currentData, mediumId, mediums, onChange, standardId, standards]);

  return (
    <>
    {!academicYearId && <Alert severity="info">Select an academic year to view admissions.</Alert>}
    <Paper variant="outlined" sx={{ p: 1, borderRadius: 2, flexShrink: 0 }}>
      <Stack direction={{ xs: 'column', lg: 'row' }} spacing={1}>
        <CustomSelect
          fullWidth label="Board" labelKey="name" valueKey="id"
          options={[{ id: ALL, name: 'All boards' }, ...boards]}
          value={boardId || ALL} isLoading={hierarchy.isFetching}
          onChange={(value) => onChange('board', String(value))}
        />
        <CustomSelect
          fullWidth label="Medium" labelKey="name" valueKey="id"
          options={[{ id: ALL, name: 'All mediums' }, ...mediums]}
          value={mediumId || ALL} disabled={!boardId}
          onChange={(value) => onChange('medium', String(value))}
        />
        <CustomSelect
          fullWidth label="Class" labelKey="name" valueKey="id"
          options={[{ id: ALL, name: 'All classes' }, ...standards]}
          value={standardId || ALL} isLoading={classes.isFetching} disabled={!mediumId}
          onChange={(value) => onChange('class', String(value))}
        />
        {onClear && (boardId || mediumId || standardId) && (
          <Button variant="text" size="small" onClick={onClear} sx={{ flexShrink: 0 }}>
            Clear academic filters
          </Button>
        )}
      </Stack>
    </Paper>
    </>
  );
}
