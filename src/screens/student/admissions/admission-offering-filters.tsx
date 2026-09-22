'use client';

import type { Standards } from 'src/types/school';
import type { AdmissionCycle } from 'src/redux/student/admissions/admission-cycles-api';

import { useState } from 'react';
import { Button, Grid, Paper } from '@mui/material';
import { Iconify } from 'src/components/iconify';
import CustomSelect from 'src/components/custom-select';
import { useGetClassByMediumQuery } from 'src/redux/class/classApi';
import { useGetAcademicOrganizationOptionsQuery } from 'src/redux/academicOrganizationOptions/academicOrganizationOptionsApi';
import { useGetAdmissionCampusQuery } from 'src/redux/student/admissions/admission-campuses-api';

import { AdmissionCampusSelect } from './admission-campus-select';
import { getAdmissionHierarchyOptions } from './admission-hierarchy-options';
import { useAdmissionCampusOptions } from './use-admission-campus-options';

import type { AdmissionOfferingFilters as FilterValues } from './use-admission-offering-filters';

type Props = {
  cycles: AdmissionCycle[];
  cycle: AdmissionCycle | null;
  values: FilterValues;
  onChange: (changes: Partial<FilterValues>) => void;
};

const ALL_FILTER_VALUE = '__all__';

export function AdmissionOfferingFilters({ cycles, cycle, values, onChange }: Props) {
  const [showAdvanced, setShowAdvanced] = useState(() =>
    Boolean(
      values.boardId ||
      values.mediumId ||
      values.stageId ||
      values.standardId ||
      values.isActive ||
      values.configurationStatus
    )
  );
  const hierarchyQuery = useGetAcademicOrganizationOptionsQuery(
    { academicYearId: cycle?.academicYearId ?? '' },
    { skip: !cycle }
  );
  const standardsQuery = useGetClassByMediumQuery(values.mediumId, { skip: !values.mediumId });
  const fetchCampuses = useAdmissionCampusOptions();
  const selectedCampusQuery = useGetAdmissionCampusQuery(values.campusId, {
    skip: !values.campusId,
  });
  const hierarchy = hierarchyQuery.data?.items ?? [];
  const { boards, mediums, stages } = getAdmissionHierarchyOptions(
    hierarchy,
    values.boardId,
    values.mediumId
  );
  const standards = ((standardsQuery.data ?? []) as Standards[]).filter(
    (item) => item.educationMediumStageId === values.stageId
  );
  const advancedFilterCount = [
    values.boardId,
    values.mediumId,
    values.stageId,
    values.standardId,
    values.isActive,
    values.configurationStatus,
  ].filter(Boolean).length;
  const advancedVisible = showAdvanced;

  return (
    <Paper variant="outlined" sx={{ p: 1, borderRadius: 2 }}>
      <Grid container spacing={1} alignItems="center">
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <CustomSelect
            options={cycles}
            label="Admission cycle *"
            labelKey="name"
            valueKey="id"
            value={cycle?.id ?? ''}
            onChange={(id) =>
              onChange({
                admissionCycleId: String(id),
                campusId: '',
                boardId: '',
                mediumId: '',
                stageId: '',
                standardId: '',
              })
            }
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <AdmissionCampusSelect
            label="Campus"
            valueId={values.campusId || ALL_FILTER_VALUE}
            initialOption={
              selectedCampusQuery.data ?? {
                id: ALL_FILTER_VALUE,
                name: 'All campuses',
                code: '',
                isActive: true,
              }
            }
            fetchOptions={fetchCampuses}
            onChange={(id) =>
              onChange({ campusId: !id || id === ALL_FILTER_VALUE ? '' : String(id) })
            }
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <CustomSelect
            options={[
              { value: ALL_FILTER_VALUE, label: 'All availability statuses' },
              { value: '0', label: 'Configuration incomplete' },
              { value: '1', label: 'Not open yet' },
              { value: '2', label: 'Open' },
              { value: '3', label: 'Closed' },
              { value: '4', label: 'Inactive' },
            ]}
            label="Availability"
            value={values.availabilityStatus || ALL_FILTER_VALUE}
            onChange={(value) =>
              onChange({
                availabilityStatus: value === ALL_FILTER_VALUE ? '' : String(value),
              })
            }
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Button
            fullWidth
            size="small"
            variant="outlined"
            startIcon={<Iconify icon="mdi:filter-variant" />}
            onClick={() => setShowAdvanced((current) => !current)}
            aria-expanded={advancedVisible}
          >
            {advancedVisible ? 'Fewer filters' : 'More filters'}
            {advancedFilterCount > 0 ? ` (${advancedFilterCount})` : ''}
          </Button>
        </Grid>
        {advancedVisible && (
          <>
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <CustomSelect
                options={[{ id: ALL_FILTER_VALUE, name: 'All boards' }, ...boards]}
                label="Board"
                labelKey="name"
                valueKey="id"
                value={values.boardId || ALL_FILTER_VALUE}
                isLoading={hierarchyQuery.isFetching}
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
                disabled={!values.boardId}
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
                options={[{ id: ALL_FILTER_VALUE, name: 'All school levels' }, ...stages]}
                label="School level"
                labelKey="name"
                valueKey="id"
                value={values.stageId || ALL_FILTER_VALUE}
                disabled={!values.mediumId}
                onChange={(id) =>
                  onChange({
                    stageId: id === ALL_FILTER_VALUE ? '' : String(id),
                    standardId: '',
                  })
                }
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <CustomSelect
                options={[{ id: ALL_FILTER_VALUE, name: 'All standards' }, ...standards]}
                label="Standard"
                labelKey="name"
                valueKey="id"
                value={values.standardId || ALL_FILTER_VALUE}
                isLoading={standardsQuery.isFetching}
                disabled={!values.stageId}
                onChange={(id) =>
                  onChange({ standardId: id === ALL_FILTER_VALUE ? '' : String(id) })
                }
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <CustomSelect
                options={[
                  { value: ALL_FILTER_VALUE, label: 'All activity statuses' },
                  { value: 'true', label: 'Active' },
                  { value: 'false', label: 'Inactive' },
                ]}
                label="Active status"
                value={values.isActive || ALL_FILTER_VALUE}
                onChange={(value) =>
                  onChange({ isActive: value === ALL_FILTER_VALUE ? '' : String(value) })
                }
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <CustomSelect
                options={[
                  { value: ALL_FILTER_VALUE, label: 'All configuration statuses' },
                  { value: '1', label: 'Ready' },
                  { value: '0', label: 'Missing configuration' },
                ]}
                label="Configuration"
                value={values.configurationStatus || ALL_FILTER_VALUE}
                onChange={(value) =>
                  onChange({
                    configurationStatus: value === ALL_FILTER_VALUE ? '' : String(value),
                  })
                }
              />
            </Grid>
          </>
        )}
      </Grid>
    </Paper>
  );
}
