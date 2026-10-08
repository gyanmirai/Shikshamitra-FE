import type { FormikProps } from 'formik';
import type { AdmissionCycle } from 'src/redux/student/admissions/admission-cycles-api';

import dayjs from 'dayjs';
import { Grid } from '@mui/material';
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
  change: (field: keyof BulkOfferingValues, value: unknown) => void;
};

export function BulkAdmissionConfigurationFields({
  formik,
  cycle,
  fetchWorkflows,
  fetchInquiryForms,
  change,
}: Props) {
  const { values, errors, touched } = formik;
  const setups = useGetAdmissionIntakeSetupsQuery();
  const startsWithInquiry = true;
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
      <Grid size={{ xs: 12, sm: 6 }}>
        <AdmissionDefinitionSelect
          label="Published workflow"
          valueId={values.workflowDefinitionId || null}
          fetchOptions={fetchWorkflows}
          onChange={(id) => change('workflowDefinitionId', id ?? '')}
          error={touched.workflowDefinitionId && Boolean(errors.workflowDefinitionId)}
          helperText={
            touched.workflowDefinitionId
              ? errors.workflowDefinitionId
              : 'Application form comes from the workflow’s Form stage.'
          }
          noOptionsText="No published workflows found"
        />
      </Grid>
      <Grid size={{ xs: 12, sm: 6 }}>
        <AdmissionDefinitionSelect
          label="Inquiry form"
          valueId={values.inquiryFormDefinitionId || null}
          fetchOptions={fetchInquiryForms}
          onChange={(id) => change('inquiryFormDefinitionId', id ?? '')}
          error={touched.inquiryFormDefinitionId && Boolean(errors.inquiryFormDefinitionId)}
          helperText={touched.inquiryFormDefinitionId ? errors.inquiryFormDefinitionId : undefined}
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
