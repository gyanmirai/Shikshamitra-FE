import type { FormikProps } from 'formik';
import type { AdmissionForm } from 'src/redux/student/admissions/admission-forms-api';
import type { AdmissionCycle } from 'src/redux/student/admissions/admission-cycles-api';
import type { AdmissionWorkflow } from 'src/redux/student/admissions/admission-workflows-api';

import dayjs from 'dayjs';
import { DatePicker } from '@mui/x-date-pickers';
import CustomSelect from 'src/components/custom-select';
import { Grid, Switch, FormControlLabel } from '@mui/material';

import type { BulkOfferingValues } from './bulk-admission-offering-model';

type Props = {
  formik: FormikProps<BulkOfferingValues>;
  cycle: AdmissionCycle;
  workflows: AdmissionWorkflow[];
  forms: AdmissionForm[];
  loading: boolean;
  change: (field: keyof BulkOfferingValues, value: unknown) => void;
};

export function BulkAdmissionConfigurationFields({
  formik,
  cycle,
  workflows,
  forms,
  loading,
  change,
}: Props) {
  const { values, errors, touched } = formik;
  return (
    <Grid container spacing={1.5}>
      <Grid size={{ xs: 12, sm: 4 }}>
        <CustomSelect
          options={workflows}
          label="Published workflow *"
          labelKey="name"
          valueKey="id"
          value={values.workflowDefinitionId}
          isLoading={loading}
          onChange={(id) => change('workflowDefinitionId', id)}
          error={touched.workflowDefinitionId && Boolean(errors.workflowDefinitionId)}
          helperText={touched.workflowDefinitionId ? errors.workflowDefinitionId : undefined}
        />
      </Grid>
      <Grid size={{ xs: 12, sm: 4 }}>
        <CustomSelect
          options={forms}
          label="Inquiry form *"
          labelKey="name"
          valueKey="id"
          value={values.inquiryFormDefinitionId}
          isLoading={loading}
          onChange={(id) => change('inquiryFormDefinitionId', id)}
          error={touched.inquiryFormDefinitionId && Boolean(errors.inquiryFormDefinitionId)}
          helperText={touched.inquiryFormDefinitionId ? errors.inquiryFormDefinitionId : undefined}
        />
      </Grid>
      <Grid size={{ xs: 12, sm: 4 }}>
        <CustomSelect
          options={forms}
          label="Application form *"
          labelKey="name"
          valueKey="id"
          value={values.applicationFormDefinitionId}
          isLoading={loading}
          onChange={(id) => change('applicationFormDefinitionId', id)}
          error={touched.applicationFormDefinitionId && Boolean(errors.applicationFormDefinitionId)}
          helperText={
            touched.applicationFormDefinitionId ? errors.applicationFormDefinitionId : undefined
          }
        />
      </Grid>
      <Grid size={12}>
        <FormControlLabel
          control={
            <Switch
              checked={values.useCycleDates}
              onChange={(_, checked) => change('useCycleDates', checked)}
            />
          }
          label="Use Admission Cycle dates"
        />
      </Grid>
      {!values.useCycleDates && (
        <>
          <Grid size={{ xs: 12, sm: 6 }}>
            <DatePicker
              label="Applications open *"
              value={values.openDate}
              minDate={dayjs(cycle.startDate)}
              maxDate={dayjs(cycle.endDate)}
              onChange={(value) => change('openDate', value)}
              slotProps={{
                textField: {
                  fullWidth: true,
                  size: 'small',
                  error: touched.openDate && Boolean(errors.openDate),
                  helperText: touched.openDate ? String(errors.openDate ?? '') : undefined,
                },
              }}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <DatePicker
              label="Applications close *"
              value={values.closeDate}
              minDate={values.openDate ?? dayjs(cycle.startDate)}
              maxDate={dayjs(cycle.endDate)}
              onChange={(value) => change('closeDate', value)}
              slotProps={{
                textField: {
                  fullWidth: true,
                  size: 'small',
                  error: touched.closeDate && Boolean(errors.closeDate),
                  helperText: touched.closeDate ? String(errors.closeDate ?? '') : undefined,
                },
              }}
            />
          </Grid>
        </>
      )}
      <Grid size={12}>
        <FormControlLabel
          control={
            <Switch
              checked={values.isActive}
              onChange={(_, checked) => change('isActive', checked)}
            />
          }
          label="Create as active"
        />
      </Grid>
    </Grid>
  );
}
