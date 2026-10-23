'use client';

import type { ReactNode } from 'react';
import type { Standards } from 'src/types/school';
import type { AdmissionCycle } from 'src/redux/student/admissions/admission-cycles-api';

import { useEffect } from 'react';
import { Grid, Paper, Button } from '@mui/material';
import CustomSelect from 'src/components/custom-select';
import { StudentFeedback } from 'src/components/student-feedback';
import { useGetClassByMediumQuery } from 'src/redux/class/classApi';
import {
  readAcademicFilterIds,
  academicMultipleFilterValue,
} from 'src/utils/student-academic-filter-query';
import { useGetAcademicOrganizationOptionsQuery } from 'src/redux/academicOrganizationOptions/academicOrganizationOptionsApi';

import { getAdmissionHierarchyOptions } from './admission-hierarchy-options';

import type { AdmissionOfferingFilters as FilterValues } from './use-admission-offering-filters';

type Props = {
  cycle: AdmissionCycle | null;
  values: FilterValues;
  onChange: (changes: Partial<FilterValues>) => void;
  filterAction: ReactNode;
};

const ALL_FILTER_VALUE = '__all__';

export function AdmissionOfferingFilters({ cycle, values, onChange, filterAction }: Props) {
  const hierarchyQuery = useGetAcademicOrganizationOptionsQuery(
    { academicYearId: cycle?.academicYearId ?? '' },
    { skip: !cycle }
  );
  const standardsQuery = useGetClassByMediumQuery(values.mediumId, { skip: !values.mediumId });
  const { boards, mediums } = getAdmissionHierarchyOptions(
    hierarchyQuery.currentData?.items ?? [],
    values.boardId,
    values.mediumId
  );
  const standards = ((standardsQuery.currentData ?? []) as Standards[]).filter(
    (item) => !values.stageId || item.educationMediumStageId === values.stageId
  );

  useEffect(() => {
    if (!hierarchyQuery.currentData) return;
    if (!boards.some((item) => item.id === values.boardId)) {
      if (boards[0]) onChange({ boardId: boards[0].id, mediumId: '', stageId: '', standardId: '' });
    } else if (!mediums.some((item) => item.id === values.mediumId)) {
      if (mediums[0]) onChange({ mediumId: mediums[0].id, stageId: '', standardId: '' });
    } else if (standardsQuery.currentData) {
      const valid = readAcademicFilterIds(values.standardId)
        .filter((id) => standards.some((item) => item.id === id))
        .join(',');
      if (valid !== readAcademicFilterIds(values.standardId).join(','))
        onChange({ standardId: valid });
    }
  }, [
    hierarchyQuery.currentData,
    standardsQuery.currentData,
    boards,
    mediums,
    standards,
    values.boardId,
    values.mediumId,
    values.standardId,
    onChange,
  ]);

  return (
    <Paper variant="outlined" sx={{ p: 1, borderRadius: 2 }}>
      <Grid container spacing={1} alignItems="center">
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <CustomSelect
            options={boards}
            label="Board"
            labelKey="name"
            valueKey="id"
            value={values.boardId}
            isLoading={hierarchyQuery.isFetching}
            disabled={!cycle || hierarchyQuery.isError}
            onChange={(id) =>
              onChange({
                boardId: String(id),
                mediumId: '',
                stageId: '',
                standardId: '',
              })
            }
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <CustomSelect
            options={mediums}
            label="Medium"
            labelKey="name"
            valueKey="id"
            value={values.mediumId}
            disabled={!values.boardId || hierarchyQuery.isFetching || hierarchyQuery.isError}
            onChange={(id) =>
              onChange({
                mediumId: String(id),
                stageId: '',
                standardId: '',
              })
            }
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <CustomSelect
            multiple
            options={[{ id: ALL_FILTER_VALUE, name: 'All classes' }, ...standards]}
            label="Class"
            labelKey="name"
            valueKey="id"
            value={
              readAcademicFilterIds(values.standardId).length
                ? readAcademicFilterIds(values.standardId)
                : [ALL_FILTER_VALUE]
            }
            isLoading={standardsQuery.isFetching && Boolean(values.mediumId)}
            disabled={!values.mediumId || standardsQuery.isError}
            onChange={(id) =>
              onChange({ standardId: academicMultipleFilterValue(values.standardId, id) })
            }
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }} sx={{ display: 'flex', justifyContent: 'flex-end' }}>
          {filterAction}
        </Grid>
        {hierarchyQuery.isError && (
          <Grid size={12}>
            <StudentFeedback
              notificationKey="STU-0126"
              presentation="toast"
              severity="error"
              action={<Button onClick={() => hierarchyQuery.refetch()}>Retry</Button>}
            >
              Could not load Board and Medium options.
            </StudentFeedback>
          </Grid>
        )}
        {standardsQuery.isError && values.mediumId && (
          <Grid size={12}>
            <StudentFeedback
              notificationKey="STU-0127"
              presentation="toast"
              severity="error"
              action={<Button onClick={() => standardsQuery.refetch()}>Retry</Button>}
            >
              Could not load Class options.
            </StudentFeedback>
          </Grid>
        )}
      </Grid>
    </Paper>
  );
}
