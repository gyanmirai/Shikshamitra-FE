'use client';

import type { Standards } from 'src/types/school';
import type { AdmissionCycle } from 'src/redux/student/admissions/admission-cycles-api';

import { Grid } from '@mui/material';
import CustomSelect from 'src/components/custom-select';
import { useGetClassByMediumQuery } from 'src/redux/class/classApi';
import { useGetAcademicOrganizationOptionsQuery } from 'src/redux/academicOrganizationOptions/academicOrganizationOptionsApi';

import { getAdmissionHierarchyOptions } from './admission-hierarchy-options';

import type { AdmissionOfferingFilters as FilterValues } from './use-admission-offering-filters';

type Props = {
  cycles: AdmissionCycle[];
  cycle: AdmissionCycle | null;
  values: FilterValues;
  onChange: (changes: Partial<FilterValues>) => void;
};

export function AdmissionOfferingFilters({ cycles, cycle, values, onChange }: Props) {
  const hierarchyQuery = useGetAcademicOrganizationOptionsQuery(
    { academicYearId: cycle?.academicYearId ?? '' },
    { skip: !cycle }
  );
  const standardsQuery = useGetClassByMediumQuery(values.mediumId, { skip: !values.mediumId });
  const hierarchy = hierarchyQuery.data?.items ?? [];
  const { boards, mediums, stages } = getAdmissionHierarchyOptions(
    hierarchy,
    values.boardId,
    values.mediumId
  );
  const standards = ((standardsQuery.data ?? []) as Standards[]).filter(
    (item) => item.educationMediumStageId === values.stageId
  );

  return (
    <Grid container spacing={1}>
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
              boardId: '',
              mediumId: '',
              stageId: '',
              standardId: '',
            })
          }
        />
      </Grid>
      <Grid size={{ xs: 12, sm: 6, md: 3 }}>
        <CustomSelect
          options={boards}
          label="Board"
          labelKey="name"
          valueKey="id"
          value={values.boardId}
          isLoading={hierarchyQuery.isFetching}
          onChange={(id) =>
            onChange({ boardId: String(id), mediumId: '', stageId: '', standardId: '' })
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
          disabled={!values.boardId}
          onChange={(id) => onChange({ mediumId: String(id), stageId: '', standardId: '' })}
        />
      </Grid>
      <Grid size={{ xs: 12, sm: 6, md: 3 }}>
        <CustomSelect
          options={stages}
          label="Stage"
          labelKey="name"
          valueKey="id"
          value={values.stageId}
          disabled={!values.mediumId}
          onChange={(id) => onChange({ stageId: String(id), standardId: '' })}
        />
      </Grid>
      <Grid size={{ xs: 12, sm: 6, md: 3 }}>
        <CustomSelect
          options={standards}
          label="Standard"
          labelKey="name"
          valueKey="id"
          value={values.standardId}
          isLoading={standardsQuery.isFetching}
          disabled={!values.stageId}
          onChange={(id) => onChange({ standardId: String(id) })}
        />
      </Grid>
      <Grid size={{ xs: 12, sm: 6, md: 3 }}>
        <CustomSelect
          options={[
            { value: '', label: 'All' },
            { value: 'true', label: 'Active' },
            { value: 'false', label: 'Inactive' },
          ]}
          label="Active status"
          value={values.isActive}
          onChange={(value) => onChange({ isActive: String(value) })}
        />
      </Grid>
      <Grid size={{ xs: 12, sm: 6, md: 3 }}>
        <CustomSelect
          options={[
            { value: '', label: 'All' },
            { value: '0', label: 'Configuration incomplete' },
            { value: '1', label: 'Not open yet' },
            { value: '2', label: 'Open' },
            { value: '3', label: 'Closed' },
            { value: '4', label: 'Inactive' },
          ]}
          label="Availability"
          value={values.availabilityStatus}
          onChange={(value) => onChange({ availabilityStatus: String(value) })}
        />
      </Grid>
      <Grid size={{ xs: 12, sm: 6, md: 3 }}>
        <CustomSelect
          options={[
            { value: '', label: 'All' },
            { value: '1', label: 'Ready' },
            { value: '0', label: 'Missing configuration' },
          ]}
          label="Configuration"
          value={values.configurationStatus}
          onChange={(value) => onChange({ configurationStatus: String(value) })}
        />
      </Grid>
    </Grid>
  );
}
