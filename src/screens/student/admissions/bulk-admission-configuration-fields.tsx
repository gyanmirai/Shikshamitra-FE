import type { FormikProps } from 'formik';
import type { AdmissionCycle } from 'src/redux/student/admissions/admission-cycles-api';
import type {
  AdmissionTrack,
  AdmissionEntryMode,
} from 'src/redux/student/admissions/admission-offerings-api';

import dayjs from 'dayjs';
import { DatePicker } from '@mui/x-date-pickers';
import CustomSelect from 'src/components/custom-select';
import { Grid, TextField, Typography } from '@mui/material';
import { useGetAdmissionIntakeProfilesQuery } from 'src/redux/student/admissions/admission-intake-profiles-api';

import { ADMISSION_DATE_FORMAT } from './admission-date-formats';
import { AdmissionDefinitionSelect } from './admission-definition-select';

import type { BulkOfferingValues } from './bulk-admission-offering-model';
import type { AdmissionDefinitionFetcher } from './use-admission-definition-options';

type Props = {
  formik: FormikProps<BulkOfferingValues>;
  cycle: AdmissionCycle;
  fetchWorkflows: AdmissionDefinitionFetcher;
  fetchInquiryForms: AdmissionDefinitionFetcher;
  fetchRegistrationForms: AdmissionDefinitionFetcher;
  change: (field: keyof BulkOfferingValues, value: unknown) => void;
};

export function BulkAdmissionConfigurationFields({
  formik,
  cycle,
  fetchWorkflows,
  fetchInquiryForms,
  fetchRegistrationForms,
  change,
}: Props) {
  const { values, errors, touched } = formik;
  const profiles = useGetAdmissionIntakeProfilesQuery();
  return (
    <Grid container spacing={1.5}>
      <Grid size={{ xs: 12, sm: 4 }}>
        <TextField
          fullWidth
          size="small"
          label="Code prefix *"
          {...formik.getFieldProps('codePrefix')}
          onChange={(event) => change('codePrefix', event.target.value)}
          error={touched.codePrefix && Boolean(errors.codePrefix)}
          helperText={
            touched.codePrefix ? errors.codePrefix : 'Codes are generated as PREFIX-STANDARD.'
          }
        />
      </Grid>
      <Grid size={{ xs: 12, sm: 4 }}>
        <CustomSelect
          label="Admission track *"
          options={[
            { value: 0, label: 'General' },
            { value: 1, label: 'RTE' },
            { value: 2, label: 'Management' },
            { value: 3, label: 'Staff' },
          ]}
          value={values.track}
          onChange={(value) => {
            const track = Number(value) as AdmissionTrack;
            change('track', track);
            if (track === 1) {
              change('entryMode', 1);
              change('inquiryFormDefinitionId', '');
              change('inquiryIntakeProfileId', '');
            }
          }}
          helperText="Each class may have one offering per track in the same cycle."
        />
      </Grid>
      <Grid size={{ xs: 12, sm: 4 }}>
        <CustomSelect
          label="Entry mode *"
          options={
            values.track === 1
              ? [{ value: 1, label: 'Start with registration' }]
              : [
                  { value: 0, label: 'Start with inquiry' },
                  { value: 1, label: 'Start with registration' },
                  { value: 2, label: 'Inquiry or direct registration' },
                ]
          }
          value={values.entryMode}
          onChange={(value) => {
            const entryMode = Number(value) as AdmissionEntryMode;
            change('entryMode', entryMode);
            if (entryMode === 1) {
              change('inquiryFormDefinitionId', '');
              change('inquiryIntakeProfileId', '');
            }
          }}
          helperText="The workflow controls the later admission steps."
        />
      </Grid>
      <Grid size={{ xs: 12, sm: values.entryMode !== 1 ? 4 : 6 }}>
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
      {values.entryMode !== 1 && (
        <Grid size={{ xs: 12, sm: 4 }}>
          <AdmissionDefinitionSelect
            label="Inquiry form"
            valueId={values.inquiryFormDefinitionId || null}
            fetchOptions={fetchInquiryForms}
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
      )}
      <Grid size={{ xs: 12, sm: values.entryMode !== 1 ? 4 : 6 }}>
        <AdmissionDefinitionSelect
          label="Application form"
          valueId={values.applicationFormDefinitionId || null}
          fetchOptions={fetchRegistrationForms}
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
      {values.entryMode !== 1 && (
        <Grid size={{ xs: 12, sm: 6 }}>
          <CustomSelect
            label="Inquiry setup"
            value={values.inquiryIntakeProfileId}
            options={(profiles.data ?? [])
              .filter((profile) => profile.kind === 0)
              .map((profile) => ({ value: profile.id, label: profile.name }))}
            onChange={(id) => change('inquiryIntakeProfileId', id)}
            helperText={
              touched.inquiryIntakeProfileId && errors.inquiryIntakeProfileId
                ? errors.inquiryIntakeProfileId
                : 'Required to activate.'
            }
          />
        </Grid>
      )}
      <Grid size={{ xs: 12, sm: 6 }}>
        <CustomSelect
          label="Counsellor assignment"
          value={values.counsellorAssignmentProfileId}
          options={(profiles.data ?? [])
            .filter((profile) => profile.kind === 1)
            .map((profile) => ({ value: profile.id, label: profile.name }))}
          onChange={(id) => change('counsellorAssignmentProfileId', id)}
          helperText={
            touched.counsellorAssignmentProfileId && errors.counsellorAssignmentProfileId
              ? errors.counsellorAssignmentProfileId
              : 'Required to activate.'
          }
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
              format={ADMISSION_DATE_FORMAT}
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
              format={ADMISSION_DATE_FORMAT}
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
