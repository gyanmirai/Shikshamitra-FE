import type { FormikProps } from 'formik';
import type { AdmissionCycle } from 'src/redux/student/admissions/admission-cycles-api';

import dayjs from 'dayjs';
import { DatePicker } from '@mui/x-date-pickers';
import CustomSelect from 'src/components/custom-select';
import { Grid, Typography } from '@mui/material';

import { AdmissionDefinitionSelect } from './admission-definition-select';

import type { BulkOfferingValues } from './bulk-admission-offering-model';
import type { AdmissionDefinitionFetcher } from './use-admission-definition-options';

type Props = {
  formik: FormikProps<BulkOfferingValues>;
  cycle: AdmissionCycle;
  fetchWorkflows: AdmissionDefinitionFetcher;
  fetchForms: AdmissionDefinitionFetcher;
  change: (field: keyof BulkOfferingValues, value: unknown) => void;
};

export function BulkAdmissionConfigurationFields({
  formik,
  cycle,
  fetchWorkflows,
  fetchForms,
  change,
}: Props) {
  const { values, errors, touched } = formik;
  return (
    <Grid container spacing={1.5}>
      <Grid size={{ xs: 12, sm: 4 }}>
        <AdmissionDefinitionSelect
          label="Published workflow"
          valueId={values.workflowDefinitionId || null}
          fetchOptions={fetchWorkflows}
          onChange={(id) => change('workflowDefinitionId', id)}
          error={touched.workflowDefinitionId && Boolean(errors.workflowDefinitionId)}
          helperText={
            touched.workflowDefinitionId && errors.workflowDefinitionId
              ? errors.workflowDefinitionId
              : 'Required to activate.'
          }
          noOptionsText="No published workflows found"
        />
      </Grid>
      <Grid size={{ xs: 12, sm: 4 }}>
        <AdmissionDefinitionSelect
          label="Inquiry form"
          valueId={values.inquiryFormDefinitionId || null}
          fetchOptions={fetchForms}
          onChange={(id) => change('inquiryFormDefinitionId', id)}
          error={touched.inquiryFormDefinitionId && Boolean(errors.inquiryFormDefinitionId)}
          helperText={
            touched.inquiryFormDefinitionId && errors.inquiryFormDefinitionId
              ? errors.inquiryFormDefinitionId
              : 'Required to activate.'
          }
          noOptionsText="No published forms found"
        />
      </Grid>
      <Grid size={{ xs: 12, sm: 4 }}>
        <AdmissionDefinitionSelect
          label="Application form"
          valueId={values.applicationFormDefinitionId || null}
          fetchOptions={fetchForms}
          onChange={(id) => change('applicationFormDefinitionId', id)}
          error={touched.applicationFormDefinitionId && Boolean(errors.applicationFormDefinitionId)}
          helperText={
            touched.applicationFormDefinitionId && errors.applicationFormDefinitionId
              ? errors.applicationFormDefinitionId
              : 'Required to activate.'
          }
          noOptionsText="No published forms found"
        />
      </Grid>
      <Grid size={12}>
        <CustomSelect
          options={[
            { value: 'cycle', label: 'Use Admission Cycle dates' },
            { value: 'custom', label: 'Use custom Offering dates' },
          ]}
          label="Admission window"
          value={values.useCycleDates ? 'cycle' : 'custom'}
          onChange={(value) => change('useCycleDates', value === 'cycle')}
          helperText="Custom dates must remain inside the selected cycle."
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
        <Typography variant="caption" color="text.secondary">
          Preview checks whether each Offering can be saved inactive and whether it is ready to
          activate.
        </Typography>
      </Grid>
    </Grid>
  );
}
