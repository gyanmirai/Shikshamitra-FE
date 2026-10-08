import type { FormikProps } from 'formik';
import type { AdmissionCycle } from 'src/redux/student/admissions/admission-cycles-api';
import type {
  AdmissionTrack,
  AdmissionEntryMode,
} from 'src/redux/student/admissions/admission-offerings-api';

import dayjs from 'dayjs';
import { Grid, TextField } from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers';
import CustomSelect from 'src/components/custom-select';
import { useGetAdmissionIntakeSetupsQuery } from 'src/redux/student/admissions/admission-intake-profiles-api';

import { ADMISSION_DATE_FORMAT } from './admission-date-formats';
import { AdmissionDefinitionSelect } from './admission-definition-select';
import {
  getIntakeSetupSelection,
  findSelectedIntakeSetup,
  hasLegacyIntakeSelection,
} from './admission-intake-setup-selection';

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
  const setups = useGetAdmissionIntakeSetupsQuery();
  const startsWithInquiry = values.entryMode !== 1;
  const selectedSetup = findSelectedIntakeSetup(
    setups.data ?? [],
    values.inquiryIntakeProfileId,
    values.counsellorAssignmentProfileId,
    startsWithInquiry
  );
  const legacySelection = hasLegacyIntakeSelection(
    selectedSetup,
    values.inquiryIntakeProfileId,
    values.counsellorAssignmentProfileId,
    startsWithInquiry
  );
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
          helperText={touched.codePrefix ? errors.codePrefix : undefined}
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
            } else if (!values.inquiryIntakeProfileId) {
              const setup = (setups.data ?? []).find(
                (item) =>
                  item.counsellorAssignmentProfileId === values.counsellorAssignmentProfileId
              );
              if (setup) change('inquiryIntakeProfileId', setup.inquiryIntakeProfileId);
            }
          }}
        />
      </Grid>
      <Grid size={{ xs: 12, sm: values.entryMode !== 1 ? 4 : 6 }}>
        <AdmissionDefinitionSelect
          label="Published workflow"
          valueId={values.workflowDefinitionId || null}
          fetchOptions={fetchWorkflows}
          onChange={(id) => change('workflowDefinitionId', id)}
          error={touched.workflowDefinitionId && Boolean(errors.workflowDefinitionId)}
          helperText={touched.workflowDefinitionId ? errors.workflowDefinitionId : undefined}
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
              touched.inquiryFormDefinitionId ? errors.inquiryFormDefinitionId : undefined
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
            touched.applicationFormDefinitionId ? errors.applicationFormDefinitionId : undefined
          }
          noOptionsText="No published forms found"
        />
      </Grid>
      <Grid size={12}>
        <CustomSelect
          label="Intake & assignment setup (required for activation)"
          isLoading={setups.isFetching}
          value={selectedSetup?.id ?? (legacySelection ? '__legacy__' : '')}
          options={[
            ...(legacySelection
              ? [{ value: '__legacy__', label: 'Legacy profile selection' }]
              : []),
            ...(setups.data ?? []).map((setup) => ({ value: setup.id, label: setup.name })),
          ]}
          onChange={(id) => {
            if (id === '__legacy__') return;
            const setup = (setups.data ?? []).find((item) => item.id === id);
            if (!setup) {
              change('inquiryIntakeProfileId', '');
              change('counsellorAssignmentProfileId', '');
              return;
            }
            const selection = getIntakeSetupSelection(setup, startsWithInquiry);
            change('inquiryIntakeProfileId', selection.inquiryIntakeProfileId ?? '');
            change('counsellorAssignmentProfileId', selection.counsellorAssignmentProfileId);
          }}
          error={
            (touched.inquiryIntakeProfileId && Boolean(errors.inquiryIntakeProfileId)) ||
            (touched.counsellorAssignmentProfileId &&
              Boolean(errors.counsellorAssignmentProfileId)) ||
            setups.isError
          }
          helperText={
            setups.isError
              ? 'Unable to load admission intake setups.'
              : legacySelection
                ? 'Legacy profiles are preserved until you choose a combined setup.'
                : touched.inquiryIntakeProfileId || touched.counsellorAssignmentProfileId
                  ? errors.inquiryIntakeProfileId || errors.counsellorAssignmentProfileId
                  : startsWithInquiry
                    ? 'Required for activation. Applies inquiry handling and counsellor routing together.'
                    : 'Required for activation. Direct registration uses this setup’s counsellor routing.'
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
    </Grid>
  );
}
