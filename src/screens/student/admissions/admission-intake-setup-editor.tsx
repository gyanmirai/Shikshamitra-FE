'use client';

import type { FormikProps } from 'formik';
import type {
  AdmissionIntakeSetup,
  IntakeCounsellorChoice,
  AdmissionIntakeSetupUsage,
  AdmissionIntakeSetupInquiryRules,
  AdmissionIntakeSetupAssignmentRules,
} from 'src/redux/student/admissions/admission-intake-profiles-api';

import * as Yup from 'yup';
import { Iconify } from 'src/components/iconify';
import { useRef, useMemo, useState } from 'react';
import CustomSelect from 'src/components/custom-select';
import { shikshaMitraToast } from 'src/components/toast';
import CustomTooltip from 'src/components/custom-tooltip';
import { ConfirmDialog } from 'src/components/confirm-dialog';
import ShakingTextField from 'src/components/shaking-text-field';
import { StudentFeedback } from 'src/components/student-feedback';
import { FormSectionCard } from 'src/components/form-section-card';
import { parseApiProblemDetail } from 'src/utils/api-problem-details';
import { CustomStepperWithFormik } from 'src/components/custom-stepper';
import { withStandardInquiryBehavior } from 'src/redux/student/admissions/admission-inquiry-policy';
import {
  Box,
  Grid,
  Chip,
  Stack,
  Button,
  Drawer,
  Divider,
  TextField,
  IconButton,
  Typography,
} from '@mui/material';
import {
  useGetAdmissionIntakeSetupUsageQuery,
  useGetAdmissionIntakeCounsellorsQuery,
  useCreateAdmissionIntakeSetupMutation,
  useUpdateAdmissionIntakeSetupMutation,
} from 'src/redux/student/admissions/admission-intake-profiles-api';

import { AdmissionIntakeNotice } from './admission-intake-notice';
import { defaultInquiryRules } from './admission-intake-profile-editor';
import { isAdmissionIntakeSetupConcurrencyError } from './admission-intake-setup-state';
import { INQUIRY_SOURCE_OPTIONS } from './inquiry-management/admission-inquiry-list-options';

export type AdmissionIntakeSetupValues = {
  name: string;
  inquiryRules: AdmissionIntakeSetupInquiryRules;
  counsellorAssignmentRules: AdmissionIntakeSetupAssignmentRules;
};

const { version: _inquiryRulesVersion, ...defaultSetupInquiryRules } = defaultInquiryRules;
const defaultSetupAssignmentRules: AdmissionIntakeSetupAssignmentRules = {
  counsellorUserIds: [],
  maxActiveCasesPerCounsellor: 100,
  fallbackManagerUserId: '',
};

const sectionTitleProps = {
  sx: { fontSize: { xs: '1rem', sm: '1.05rem' }, fontWeight: 700 },
};

export const getInitialAdmissionIntakeSetupValues = (
  setup: AdmissionIntakeSetup | null
): AdmissionIntakeSetupValues => ({
  name: setup?.name ?? '',
  inquiryRules: withStandardInquiryBehavior(
    setup?.inquiryRules
      ? { ...defaultSetupInquiryRules, ...setup.inquiryRules }
      : { ...defaultSetupInquiryRules }
  ),
  counsellorAssignmentRules: setup?.counsellorAssignmentRules
    ? { ...defaultSetupAssignmentRules, ...setup.counsellorAssignmentRules }
    : { ...defaultSetupAssignmentRules },
});

const inquirySchema = Yup.object({
  name: Yup.string().trim().required('Enter a setup name').max(128, 'Use 128 characters or fewer'),
  inquiryRules: Yup.object({
    firstContactDueInHours: Yup.number()
      .nullable()
      .integer('Use a whole number of hours')
      .min(1, 'Use at least 1 hour')
      .max(720, 'Use at most 720 hours'),
    qualificationDueInDays: Yup.number()
      .nullable()
      .integer('Use a whole number of days')
      .min(1, 'Use at least 1 day')
      .max(365, 'Use at most 365 days'),
    followUpDueInDays: Yup.number()
      .integer('Use a whole number of days')
      .min(1, 'Use at least 1 day')
      .max(90, 'Use at most 90 days')
      .required('Enter a follow-up period'),
    maxOpenFollowUps: Yup.number()
      .integer('Use a whole number')
      .min(1, 'Allow at least 1 follow-up')
      .max(20, 'Allow at most 20 follow-ups')
      .required('Enter a follow-up limit'),
  }),
});

const assignmentSchema = Yup.object({
  counsellorAssignmentRules: Yup.object({
    counsellorUserIds: Yup.array()
      .of(Yup.string().required())
      .min(1, 'Choose at least one counsellor')
      .max(50, 'Choose at most 50 counsellors'),
    maxActiveCasesPerCounsellor: Yup.number()
      .integer('Use a whole number')
      .min(1, 'Allow at least 1 active case')
      .max(10000, 'Allow at most 10,000 active cases')
      .required('Enter a workload limit'),
    fallbackManagerUserId: Yup.string().required('Choose a fallback manager'),
  }),
});

const completeSchema = inquirySchema.concat(assignmentSchema);

export const getAdmissionIntakeSetupStepSchema = (step: number, activeStaffIds?: string[]) => {
  if (step === 0) return inquirySchema;
  const schema = step === 1 ? assignmentSchema : completeSchema;
  if (!activeStaffIds) return schema;
  return schema.test('active-admission-staff', function validateActiveStaff(values) {
    const rules = values.counsellorAssignmentRules;
    if (rules?.counsellorUserIds?.some((id) => !id || !activeStaffIds.includes(id))) {
      return this.createError({
        path: 'counsellorAssignmentRules.counsellorUserIds',
        message: 'Remove unavailable counsellors and choose active admission staff',
      });
    }
    if (rules?.fallbackManagerUserId && !activeStaffIds.includes(rules.fallbackManagerUserId)) {
      return this.createError({
        path: 'counsellorAssignmentRules.fallbackManagerUserId',
        message: 'Choose an active fallback manager',
      });
    }
    return true;
  });
};

type Props = {
  setup: AdmissionIntakeSetup | null;
  onClose: () => void;
  onReloadLatest?: () => Promise<void>;
};

export function AdmissionIntakeSetupEditor({ setup, onClose, onReloadLatest }: Props) {
  const [step, setStep] = useState(0);
  const [confirmClose, setConfirmClose] = useState(false);
  const [confirmSharedUpdate, setConfirmSharedUpdate] = useState(false);
  const [staleConflict, setStaleConflict] = useState(false);
  const [reloadError, setReloadError] = useState('');
  const [reloadingLatest, setReloadingLatest] = useState(false);
  const formikRef = useRef<FormikProps<AdmissionIntakeSetupValues> | null>(null);
  const pendingValues = useRef<AdmissionIntakeSetupValues | null>(null);
  const routingGuidanceShown = useRef(false);
  const changeStep = (nextStep: number) => {
    if (nextStep === 1 && !routingGuidanceShown.current) {
      shikshaMitraToast.info({
        message:
          'New inquiries go to the eligible counsellor with the fewest active cases. That counsellor remains the journey owner through admission and onboarding.',
      });
      routingGuidanceShown.current = true;
    }
    setStep(nextStep);
  };
  const counsellors = useGetAdmissionIntakeCounsellorsQuery(
    { counsellorOnly: true },
    { refetchOnMountOrArgChange: true }
  );
  const usage = useGetAdmissionIntakeSetupUsageQuery(setup?.id ?? '', { skip: !setup });
  const [createSetup, createState] = useCreateAdmissionIntakeSetupMutation();
  const [updateSetup, updateState] = useUpdateAdmissionIntakeSetupMutation();
  const saving = createState.isLoading || updateState.isLoading || reloadingLatest;
  const initialValues = useMemo(() => getInitialAdmissionIntakeSetupValues(setup), [setup]);
  const usageCount =
    (usage.data?.offerings.length ?? setup?.activeOfferingCount ?? 0) +
    (usage.data?.publicInquiryLinks.length ?? setup?.activePublicInquiryLinkCount ?? 0);

  const requestClose = () => {
    if (saving || reloadingLatest) return;
    if (formikRef.current?.dirty) {
      setConfirmClose(true);
      return;
    }
    onClose();
  };

  const persist = async (values: AdmissionIntakeSetupValues) => {
    const body = {
      name: values.name.trim(),
      inquiryRules: withStandardInquiryBehavior(values.inquiryRules),
      counsellorAssignmentRules: values.counsellorAssignmentRules,
      concurrencyStamp: setup?.concurrencyStamp,
    };
    try {
      if (setup) await updateSetup({ id: setup.id, body }).unwrap();
      else await createSetup(body).unwrap();
      shikshaMitraToast.success({
        message: setup ? 'Admission intake setup updated.' : 'Admission intake setup created.',
      });
      formikRef.current?.resetForm({ values });
      onClose();
    } catch (error) {
      if (setup && isAdmissionIntakeSetupConcurrencyError(error)) {
        setStaleConflict(true);
        setReloadError('');
        return;
      }
      shikshaMitraToast.error({
        message:
          parseApiProblemDetail(error).detail ||
          `Unable to ${setup ? 'update' : 'create'} this admission intake setup.`,
      });
    }
  };

  const finish = (values: AdmissionIntakeSetupValues) => {
    if (saving || staleConflict || confirmSharedUpdate) return;
    if (setup && usageCount > 0) {
      pendingValues.current = values;
      setConfirmSharedUpdate(true);
      return;
    }
    persist(values);
  };

  const reloadLatest = async () => {
    if (!onReloadLatest || reloadingLatest) return;
    setReloadingLatest(true);
    setReloadError('');
    try {
      await onReloadLatest();
    } catch (error) {
      setReloadError(parseApiProblemDetail(error).detail || 'Unable to reload this setup.');
      setReloadingLatest(false);
    }
  };

  return (
    <>
      <Drawer
        anchor="right"
        open
        onClose={requestClose}
        PaperProps={{
          role: 'dialog',
          'aria-modal': true,
          'aria-labelledby': 'intake-setup-editor-title',
          sx: { width: { xs: 1, md: 960 }, maxWidth: 1 },
        }}
      >
        <Box
          component="section"
          aria-labelledby="intake-setup-editor-title"
          sx={{
            flex: 1,
            minHeight: 0,
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
            bgcolor: 'background.paper',
          }}
        >
          <Stack direction="row" spacing={1} alignItems="center" sx={{ px: 2, py: 1.5 }}>
            <Stack direction="row" spacing={0.5} alignItems="center" sx={{ flex: 1, minWidth: 0 }}>
              <Typography id="intake-setup-editor-title" variant="h6">
                {setup ? 'Edit Admission Intake Setup' : 'Create Admission Intake Setup'}
              </Typography>
              <CustomTooltip
                title="Configure inquiry handling and counsellor routing together."
                arrow
                placement="right"
              >
                <IconButton
                  size="small"
                  color="info"
                  aria-label="Admission intake setup information"
                >
                  <Iconify icon="lucide:info" width={16} />
                </IconButton>
              </CustomTooltip>
            </Stack>
            <IconButton
              size="small"
              aria-label="Close admission intake setup editor"
              onClick={requestClose}
              disabled={saving || reloadingLatest}
              sx={{ width: { xs: 44, sm: 36 }, height: { xs: 44, sm: 36 } }}
            >
              <Iconify icon="mdi:close" />
            </IconButton>
          </Stack>
          <Divider />

          <Box
            sx={{
              flex: 1,
              minHeight: 0,
              overflow: 'hidden',
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            {staleConflict && (
              <AdmissionIntakeNotice
                notificationKey="STU-0096"
                presentation="persistent"
                severity="warning"
                closeDisabled={reloadingLatest}
                sx={{ m: 2, mb: 0, flexShrink: 0 }}
                action={
                  <Button
                    size="small"
                    color="warning"
                    loading={reloadingLatest}
                    onClick={reloadLatest}
                  >
                    Reload latest
                  </Button>
                }
              >
                This setup changed in another session. Reload the latest version before editing
                again. Reloading replaces the values currently entered here.
                {reloadError && (
                  <Typography variant="caption" component="div" sx={{ mt: 0.5 }}>
                    {reloadError}
                  </Typography>
                )}
              </AdmissionIntakeNotice>
            )}
            <Box sx={{ flex: 1, minHeight: 0, overflow: 'hidden' }}>
              <CustomStepperWithFormik
                initialValues={initialValues}
                steps={[
                  'Inquiry handling',
                  'Counsellor routing',
                  setup ? 'Review & update' : 'Review & create',
                ]}
                activeStep={step}
                validationSchema={getAdmissionIntakeSetupStepSchema(
                  step,
                  !counsellors.isLoading && !counsellors.isFetching && !counsellors.isError
                    ? (counsellors.data ?? []).map((person) => person.id)
                    : undefined
                )}
                validateOnChange
                showSaveButton={false}
                validateForwardStepClick
                isStepClickable={(index) => index <= step}
                completedSteps={Array.from({ length: step }, (_, index) => index)}
                onStepClick={changeStep}
                nextButtonLabel="Next"
                finalButtonLabel={setup ? 'Update setup' : 'Create setup'}
                disableSubmit={Boolean(
                  staleConflict ||
                  counsellors.isLoading ||
                  counsellors.isFetching ||
                  counsellors.isError ||
                  (setup && (usage.isLoading || usage.isError))
                )}
                saveAndNextButtonProps={{ loading: saving }}
                onCancel={requestClose}
                handleBack={() => changeStep(Math.max(0, step - 1))}
                handleNext={(isLastStep, values: AdmissionIntakeSetupValues) => {
                  if (isLastStep) finish(values);
                  else changeStep(Math.min(2, step + 1));
                }}
                renderItem={({ formik, activeStep }) => {
                  const form = formik as FormikProps<AdmissionIntakeSetupValues>;
                  formikRef.current = form;
                  return (
                    <Stack spacing={2} sx={{ p: { xs: 1.5, sm: 2 } }}>
                      {activeStep === 0 && <InquiryHandlingStep formik={form} saving={saving} />}
                      {activeStep === 1 && (
                        <CounsellorRoutingStep
                          formik={form}
                          counsellors={counsellors.data ?? []}
                          loading={counsellors.isLoading || counsellors.isFetching}
                          loadError={counsellors.isError}
                          saving={saving}
                          onRetry={() => counsellors.refetch()}
                        />
                      )}
                      {activeStep === 2 && (
                        <ReviewStep
                          values={form.values}
                          counsellors={counsellors.data ?? []}
                          editing={Boolean(setup)}
                          usageCount={usageCount}
                          usage={usage.data}
                          usageError={usage.isError}
                          onRetryUsage={() => usage.refetch()}
                          onEdit={changeStep}
                          saving={saving}
                        />
                      )}
                    </Stack>
                  );
                }}
              />
            </Box>
          </Box>
        </Box>
      </Drawer>

      <ConfirmDialog
        open={confirmClose}
        onClose={() => setConfirmClose(false)}
        title="Discard setup changes?"
        content="The information entered in this admission intake setup will be lost."
        action={
          <Button
            size="small"
            color="error"
            variant="contained"
            onClick={() => {
              setConfirmClose(false);
              onClose();
            }}
          >
            Discard changes
          </Button>
        }
      />
      <ConfirmDialog
        open={confirmSharedUpdate}
        onClose={() => !saving && setConfirmSharedUpdate(false)}
        disableBackdropClick
        disableCancel={saving}
        icon="warning"
        title="Update shared admission setup?"
        content={<SharedUpdateImpact usage={usage.data} fallbackCount={usageCount} />}
        action={
          <Button
            size="small"
            variant="contained"
            loading={saving}
            disabled={saving}
            onClick={async () => {
              if (!pendingValues.current) return;
              await persist(pendingValues.current);
              pendingValues.current = null;
              setConfirmSharedUpdate(false);
            }}
          >
            Update setup
          </Button>
        }
      />
    </>
  );
}

function InquiryHandlingStep({
  formik,
  saving,
}: {
  formik: FormikProps<AdmissionIntakeSetupValues>;
  saving: boolean;
}) {
  const rules = formik.values.inquiryRules;
  const setRule = <K extends keyof AdmissionIntakeSetupInquiryRules>(
    key: K,
    value: AdmissionIntakeSetupInquiryRules[K]
  ) => formik.setFieldValue(`inquiryRules.${key}`, value);
  const feedback = (name: string) => {
    const meta = formik.getFieldMeta(name);
    return {
      error: Boolean(meta.touched && meta.error),
      helperText: meta.touched ? String(meta.error ?? '') : undefined,
    };
  };

  return (
    <>
      <FormSectionCard
        icon="mdi:clipboard-text-outline"
        title="Inquiry handling"
        titleTypographyProps={sectionTitleProps}
        descriptionTooltip="Recommended school defaults are already filled. Change only the rules your intake needs."
      >
        <Stack spacing={2}>
          <ShakingTextField error={Boolean(formik.touched.name && formik.errors.name)}>
            <TextField
              fullWidth
              size="small"
              name="name"
              disabled={saving}
              label="Setup name *"
              placeholder="For example, General admission intake"
              value={formik.values.name}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              error={Boolean(formik.touched.name && formik.errors.name)}
              helperText={formik.touched.name ? formik.errors.name : undefined}
            />
          </ShakingTextField>
          <Grid container spacing={1}>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                fullWidth
                size="small"
                type="number"
                label="First contact within hours"
                disabled={saving}
                value={rules.firstContactDueInHours ?? ''}
                onChange={(event) =>
                  setRule(
                    'firstContactDueInHours',
                    event.target.value ? Number(event.target.value) : null
                  )
                }
                {...feedback('inquiryRules.firstContactDueInHours')}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                fullWidth
                size="small"
                type="number"
                label="Qualify within days"
                disabled={saving}
                value={rules.qualificationDueInDays ?? ''}
                onChange={(event) =>
                  setRule(
                    'qualificationDueInDays',
                    event.target.value ? Number(event.target.value) : null
                  )
                }
                {...feedback('inquiryRules.qualificationDueInDays')}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                fullWidth
                size="small"
                type="number"
                label="Follow-up after days"
                disabled={saving}
                value={rules.followUpDueInDays}
                onChange={(event) => setRule('followUpDueInDays', Number(event.target.value))}
                {...feedback('inquiryRules.followUpDueInDays')}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                fullWidth
                size="small"
                type="number"
                label="Maximum open follow-ups"
                disabled={saving}
                value={rules.maxOpenFollowUps}
                onChange={(event) => setRule('maxOpenFollowUps', Number(event.target.value))}
                {...feedback('inquiryRules.maxOpenFollowUps')}
              />
            </Grid>
          </Grid>
        </Stack>
      </FormSectionCard>
      <FormSectionCard
        icon="mdi:source-branch"
        title="Inquiry sources"
        titleTypographyProps={sectionTitleProps}
        descriptionTooltip="Leave allowed sources empty when every source may create an inquiry."
      >
        <Stack spacing={1}>
          <CustomSelect
            multiple
            size="small"
            label="Allowed sources"
            disabled={saving}
            options={INQUIRY_SOURCE_OPTIONS}
            value={rules.allowedSources}
            onChange={(selected) => setRule('allowedSources', selected as number[])}
            helperText="Leave empty to accept all sources. Source details are optional."
          />
        </Stack>
      </FormSectionCard>
    </>
  );
}

function CounsellorRoutingStep({
  formik,
  counsellors,
  loading,
  loadError,
  onRetry,
  saving,
}: {
  formik: FormikProps<AdmissionIntakeSetupValues>;
  counsellors: IntakeCounsellorChoice[];
  loading: boolean;
  loadError: boolean;
  onRetry: () => void;
  saving: boolean;
}) {
  const rules = formik.values.counsellorAssignmentRules;
  const setRule = <K extends keyof AdmissionIntakeSetupAssignmentRules>(
    key: K,
    value: AdmissionIntakeSetupAssignmentRules[K]
  ) => formik.setFieldValue(`counsellorAssignmentRules.${key}`, value);
  const poolMeta = formik.getFieldMeta('counsellorAssignmentRules.counsellorUserIds');
  const limitMeta = formik.getFieldMeta('counsellorAssignmentRules.maxActiveCasesPerCounsellor');
  const fallbackMeta = formik.getFieldMeta('counsellorAssignmentRules.fallbackManagerUserId');

  return (
    <FormSectionCard
      icon="mdi:account-switch-outline"
      title="Counsellor routing"
      titleTypographyProps={sectionTitleProps}
      descriptionTooltip="Choose who may own cases and who receives overflow when everyone reaches capacity. Capacity includes open inquiries, applications, and onboarding cases."
    >
      <Stack spacing={2}>
        {loadError && (
          <StudentFeedback
            notificationKey="STU-0099"
            presentation="toast"
            severity="error"
            action={
              <Button size="small" onClick={onRetry} loading={loading}>
                Retry
              </Button>
            }
          >
            Unable to load eligible counsellors.
          </StudentFeedback>
        )}
        {!loading && !loadError && counsellors.length === 0 && (
          <AdmissionIntakeNotice
            notificationKey="STU-0100"
            presentation="persistent"
            severity="warning"
          >
            Add active staff with the Counsellor role and admission access before creating this
            setup.
          </AdmissionIntakeNotice>
        )}
        <ShakingTextField error={Boolean(poolMeta.touched && poolMeta.error)}>
          <CustomSelect
            multiple
            isSearch
            size="small"
            label="Counsellor pool *"
            options={counsellors.map((person) => ({
              value: person.id,
              label: person.name || person.userName,
            }))}
            disabled={saving || loading || loadError}
            isLoading={loading}
            noOptionsMessage="No active admission staff found"
            value={rules.counsellorUserIds.filter((id) =>
              counsellors.some((person) => person.id === id)
            )}
            onChange={(selected) => setRule('counsellorUserIds', selected as string[])}
            onBlur={() =>
              formik.setFieldTouched('counsellorAssignmentRules.counsellorUserIds', true)
            }
            error={Boolean(poolMeta.touched && poolMeta.error)}
            helperText={poolMeta.touched ? String(poolMeta.error ?? '') : undefined}
          />
        </ShakingTextField>
        {!loading &&
          !loadError &&
          rules.counsellorUserIds.some((id) => !counsellors.some((person) => person.id === id)) && (
            <StudentFeedback
              notificationKey="STU-0101"
              presentation="persistent"
              severity="warning"
              action={
                <Button
                  size="small"
                  disabled={saving}
                  onClick={() =>
                    setRule(
                      'counsellorUserIds',
                      rules.counsellorUserIds.filter((id) =>
                        counsellors.some((person) => person.id === id)
                      )
                    )
                  }
                >
                  Remove unavailable
                </Button>
              }
            >
              Some saved counsellors are no longer available. Remove them and choose active
              admission staff.
            </StudentFeedback>
          )}
        <Grid container spacing={1}>
          <Grid size={{ xs: 12, sm: 6 }}>
            <TextField
              fullWidth
              size="small"
              type="number"
              label="Maximum active cases per counsellor *"
              disabled={saving}
              value={rules.maxActiveCasesPerCounsellor}
              onChange={(event) =>
                setRule('maxActiveCasesPerCounsellor', Number(event.target.value))
              }
              error={Boolean(limitMeta.touched && limitMeta.error)}
              helperText={limitMeta.touched ? String(limitMeta.error ?? '') : undefined}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <ShakingTextField error={Boolean(fallbackMeta.touched && fallbackMeta.error)}>
              <CustomSelect
                size="small"
                label="Fallback manager *"
                options={counsellors.map((person) => ({
                  value: person.id,
                  label: person.name || person.userName,
                }))}
                disabled={saving || loading || loadError}
                isLoading={loading}
                noOptionsMessage="No active admission staff found"
                value={
                  counsellors.some((person) => person.id === rules.fallbackManagerUserId)
                    ? (rules.fallbackManagerUserId ?? '')
                    : ''
                }
                onChange={(selected) => setRule('fallbackManagerUserId', String(selected))}
                onBlur={() =>
                  formik.setFieldTouched('counsellorAssignmentRules.fallbackManagerUserId', true)
                }
                error={Boolean(fallbackMeta.touched && fallbackMeta.error)}
                helperText={fallbackMeta.touched ? String(fallbackMeta.error ?? '') : undefined}
              />
            </ShakingTextField>
          </Grid>
        </Grid>
      </Stack>
    </FormSectionCard>
  );
}

function ReviewStep({
  values,
  counsellors,
  editing,
  usageCount,
  usage,
  usageError,
  onRetryUsage,
  onEdit,
  saving,
}: {
  values: AdmissionIntakeSetupValues;
  counsellors: IntakeCounsellorChoice[];
  editing: boolean;
  usageCount: number;
  usage?: AdmissionIntakeSetupUsage;
  usageError: boolean;
  onRetryUsage: () => void;
  onEdit: (step: number) => void;
  saving: boolean;
}) {
  const assignment = values.counsellorAssignmentRules;
  const fallback = counsellors.find((person) => person.id === assignment.fallbackManagerUserId);
  return (
    <>
      {usageError && editing && (
        <StudentFeedback
          notificationKey="STU-0102"
          presentation="toast"
          severity="error"
          action={
            <Button size="small" onClick={onRetryUsage}>
              Retry
            </Button>
          }
        >
          Usage impact could not be loaded. Retry before updating this shared setup.
        </StudentFeedback>
      )}
      {editing && usageCount > 0 && (
        <AdmissionIntakeNotice
          notificationKey="STU-0103"
          presentation="persistent"
          severity="warning"
          key={usageCount}
        >
          Used by {usageCount} {usageCount === 1 ? 'Offering or link' : 'Offerings or links'}.
          Offering-linked inquiries keep their captured policy and owner. Public inquiries without a
          confirmed Offering use the current Offering policy when staff confirm one later.
        </AdmissionIntakeNotice>
      )}
      {editing && usage && <UsageNames usage={usage} />}
      <Box sx={{ minWidth: 0, overflowWrap: 'anywhere' }}>
        <Typography variant="body2" color="text.secondary">
          Setup name
        </Typography>
        <Typography variant="subtitle1" component="h2">
          {values.name}
        </Typography>
      </Box>
      <Grid container spacing={1} alignItems="stretch">
        <Grid
          size={{ xs: 12, md: 6 }}
          sx={{ display: 'flex', '& > .MuiCard-root': { flex: 1, minWidth: 0 } }}
        >
          <FormSectionCard
            icon="mdi:clipboard-text-outline"
            title="Inquiry handling"
            titleTypographyProps={{ ...sectionTitleProps, id: 'intake-review-inquiry' }}
            action={
              <Button
                size="small"
                variant="outlined"
                disabled={saving}
                aria-label="Edit inquiry handling"
                onClick={() => onEdit(0)}
                startIcon={<Iconify icon="solar:pen-bold" />}
              >
                Edit
              </Button>
            }
          >
            <Stack spacing={1.5}>
              <SummaryRow
                label="First contact"
                value={
                  values.inquiryRules.firstContactDueInHours
                    ? `Within ${values.inquiryRules.firstContactDueInHours} hours`
                    : 'No deadline'
                }
              />
              <SummaryRow
                label="Qualification"
                value={
                  values.inquiryRules.qualificationDueInDays
                    ? `Within ${values.inquiryRules.qualificationDueInDays} days`
                    : 'No deadline'
                }
              />
              <SummaryRow
                label="Follow-up"
                value={`Every ${values.inquiryRules.followUpDueInDays} days`}
              />
              <SummaryRow
                label="Open follow-ups"
                value={`Up to ${values.inquiryRules.maxOpenFollowUps}`}
              />
              <Divider />
              <Typography variant="body2" color="text.secondary">
                Allowed sources
              </Typography>
              <Stack direction="row" spacing={0.5} useFlexGap flexWrap="wrap">
                {values.inquiryRules.allowedSources.length ? (
                  INQUIRY_SOURCE_OPTIONS.filter((source) =>
                    values.inquiryRules.allowedSources.includes(source.value)
                  ).map((source) => (
                    <Chip
                      key={source.value}
                      size="small"
                      variant="soft"
                      color="default"
                      label={source.label}
                    />
                  ))
                ) : (
                  <Typography variant="body2">All sources</Typography>
                )}
              </Stack>
            </Stack>
          </FormSectionCard>
        </Grid>
        <Grid
          size={{ xs: 12, md: 6 }}
          sx={{ display: 'flex', '& > .MuiCard-root': { flex: 1, minWidth: 0 } }}
        >
          <FormSectionCard
            icon="mdi:account-switch-outline"
            title="Counsellor routing"
            titleTypographyProps={{ ...sectionTitleProps, id: 'intake-review-routing' }}
            action={
              <Button
                size="small"
                variant="outlined"
                disabled={saving}
                aria-label="Edit counsellor routing"
                onClick={() => onEdit(1)}
                startIcon={<Iconify icon="solar:pen-bold" />}
              >
                Edit
              </Button>
            }
          >
            <Stack spacing={1.5}>
              <Typography variant="body2" color="text.secondary">
                Counsellor pool
              </Typography>
              <Stack direction="row" spacing={0.5} useFlexGap flexWrap="wrap">
                {assignment.counsellorUserIds.map((id) => {
                  const person = counsellors.find((staff) => staff.id === id);
                  return (
                    <Chip
                      key={id}
                      size="small"
                      variant="soft"
                      color="default"
                      label={person ? person.name || person.userName : 'Unavailable counsellor'}
                      sx={{
                        maxWidth: 1,
                        height: 'auto',
                        '& .MuiChip-label': { whiteSpace: 'normal', py: 0.5 },
                      }}
                    />
                  );
                })}
              </Stack>
              <Divider />
              <SummaryRow
                label="Capacity"
                value={`${assignment.maxActiveCasesPerCounsellor} active cases each`}
              />
              <SummaryRow
                label="Fallback manager"
                value={fallback ? fallback.name || fallback.userName : 'Unavailable'}
              />
            </Stack>
          </FormSectionCard>
        </Grid>
      </Grid>
    </>
  );
}

function SummaryRow({ label, value }: { label: string; value: string }) {
  return (
    <Stack component="dl" spacing={0.5} sx={{ m: 0, minWidth: 0, overflowWrap: 'anywhere' }}>
      <Typography component="dt" variant="body2" color="text.secondary">
        {label}
      </Typography>
      <Typography component="dd" variant="body2" fontWeight={600} sx={{ m: 0 }}>
        {value}
      </Typography>
    </Stack>
  );
}

function UsageNames({ usage }: { usage: AdmissionIntakeSetupUsage }) {
  const items = [
    ...usage.offerings.map((item) => ({
      id: `offering-${item.id}`,
      label: `Offering · ${item.name}${item.code ? ` (${item.code})` : ''}`,
      active: item.isActive,
    })),
    ...usage.publicInquiryLinks.map((item) => ({
      id: `link-${item.id}`,
      label: `Public link · ${item.name}`,
      active: item.isOperational,
    })),
  ];
  if (!items.length) return null;
  return (
    <FormSectionCard icon="mdi:link-variant" title="Affected Offerings and links">
      <Stack spacing={0.75}>
        {items.map((item) => (
          <Stack key={item.id} direction="row" spacing={1} justifyContent="space-between">
            <Typography variant="body2">{item.label}</Typography>
            <Typography variant="caption" color={item.active ? 'success.main' : 'text.secondary'}>
              {item.active ? 'Active' : 'Inactive'}
            </Typography>
          </Stack>
        ))}
      </Stack>
    </FormSectionCard>
  );
}

function SharedUpdateImpact({
  usage,
  fallbackCount,
}: {
  usage?: AdmissionIntakeSetupUsage;
  fallbackCount: number;
}) {
  return (
    <Stack spacing={1}>
      <Typography variant="body2">
        This setup is used by {fallbackCount}{' '}
        {fallbackCount === 1 ? 'Offering or link' : 'Offerings or links'}. The new rules apply to
        future work. Public inquiries without a confirmed Offering will use the current Offering
        policy when staff confirm one.
      </Typography>
      {usage && <UsageNames usage={usage} />}
    </Stack>
  );
}
