'use client';

import type { ReactNode } from 'react';
import type { Standards } from 'src/types/school';
import type { AdmissionCycle } from 'src/redux/student/admissions/admission-cycles-api';

import CustomSelect from 'src/components/custom-select';
import { Grid, Paper, Alert, Button } from '@mui/material';
import { useGetClassByMediumQuery } from 'src/redux/class/classApi';
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

  return (
    <Paper variant="outlined" sx={{ p: 1, borderRadius: 2 }}>
      <Grid container spacing={1} alignItems="center">
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <CustomSelect
            options={[{ id: ALL_FILTER_VALUE, name: 'All boards' }, ...boards]}
            label="Board"
            labelKey="name"
            valueKey="id"
            value={values.boardId || ALL_FILTER_VALUE}
            isLoading={hierarchyQuery.isFetching}
            disabled={!cycle || hierarchyQuery.isError}
            onChange={(id) =>
              onChange({
                boardId: id === ALL_FILTER_VALUE ? '' : String(id),
                mediumId: '',
                stageId: '',
                standardId: '',
              })
            }
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <CustomSelect
            options={[{ id: ALL_FILTER_VALUE, name: 'All mediums' }, ...mediums]}
            label="Medium"
            labelKey="name"
            valueKey="id"
            value={values.mediumId || ALL_FILTER_VALUE}
            disabled={!values.boardId || hierarchyQuery.isFetching || hierarchyQuery.isError}
            onChange={(id) =>
              onChange({
                mediumId: id === ALL_FILTER_VALUE ? '' : String(id),
                stageId: '',
                standardId: '',
              })
            }
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <CustomSelect
            options={[{ id: ALL_FILTER_VALUE, name: 'All classes' }, ...standards]}
            label="Class"
            labelKey="name"
            valueKey="id"
            value={values.standardId || ALL_FILTER_VALUE}
            isLoading={standardsQuery.isFetching && Boolean(values.mediumId)}
            disabled={!values.mediumId || standardsQuery.isError}
            onChange={(id) =>
              onChange({ standardId: id === ALL_FILTER_VALUE ? '' : String(id) })
            }
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }} sx={{ display: 'flex', justifyContent: 'flex-end' }}>
          {filterAction}
        </Grid>
        {hierarchyQuery.isError && (
          <Grid size={12}>
            <Alert severity="error" action={<Button onClick={() => hierarchyQuery.refetch()}>Retry</Button>}>
              Could not load Board and Medium options.
            </Alert>
          </Grid>
        )}
        {standardsQuery.isError && values.mediumId && (
          <Grid size={12}>
            <Alert severity="error" action={<Button onClick={() => standardsQuery.refetch()}>Retry</Button>}>
              Could not load Class options.
            </Alert>
          </Grid>
        )}
      </Grid>
    </Paper>
  );
}
