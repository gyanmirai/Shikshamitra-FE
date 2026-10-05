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
import { useRouter } from 'src/routes/hooks';
import { Iconify } from 'src/components/iconify';
import { useRef, useMemo, useState } from 'react';
import { shikshaMitraToast } from 'src/components/toast';
import { studentPaths } from 'src/constants/student-menu';
import CustomTooltip from 'src/components/custom-tooltip';
import { ConfirmDialog } from 'src/components/confirm-dialog';
import ShakingTextField from 'src/components/shaking-text-field';
import { FormSectionCard } from 'src/components/form-section-card';
import { parseApiProblemDetail } from 'src/utils/api-problem-details';
import { CustomStepperWithFormik } from 'src/components/custom-stepper';
import { withStandardInquiryBehavior } from 'src/redux/student/admissions/admission-inquiry-policy';
import {
  Box,
  Grid,
  Stack,
  Alert,
  Button,
  Drawer,
  Divider,
  MenuItem,
  TextField,
  IconButton,
  Typography,
  Autocomplete,
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

export const getAdmissionIntakeSetupStepSchema = (step: number) => {
  if (step === 0) return inquirySchema;
  if (step === 1) return assignmentSchema;
  return completeSchema;
};

type Props = {
  setup: AdmissionIntakeSetup | null;
  onClose: () => void;
  onReloadLatest?: () => Promise<void>;
};

export function AdmissionIntakeSetupEditor({ setup, onClose, onReloadLatest }: Props) {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [confirmClose, setConfirmClose] = useState(false);
  const [confirmSharedUpdate, setConfirmSharedUpdate] = useState(false);
  const [savedSetup, setSavedSetup] = useState<AdmissionIntakeSetup | null>(null);
  const [staleConflict, setStaleConflict] = useState(false);
  const [reloadError, setReloadError] = useState('');
  const [reloadingLatest, setReloadingLatest] = useState(false);
  const formikRef = useRef<FormikProps<AdmissionIntakeSetupValues> | null>(null);
  const pendingValues = useRef<AdmissionIntakeSetupValues | null>(null);
  const counsellors = useGetAdmissionIntakeCounsellorsQuery(undefined, {
    refetchOnMountOrArgChange: true,
  });
  const usage = useGetAdmissionIntakeSetupUsageQuery(setup?.id ?? '', { skip: !setup });
  const [createSetup, createState] = useCreateAdmissionIntakeSetupMutation();
  const [updateSetup, updateState] = useUpdateAdmissionIntakeSetupMutation();
  const saving = createState.isLoading || updateState.isLoading;
  const initialValues = useMemo(() => getInitialAdmissionIntakeSetupValues(setup), [setup]);
  const usageCount =
    (usage.data?.offerings.length ?? setup?.activeOfferingCount ?? 0) +
    (usage.data?.publicInquiryLinks.length ?? setup?.activePublicInquiryLinkCount ?? 0);

  const requestClose = () => {
    if (saving) return;
    if (formikRef.current?.dirty && !savedSetup) {
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
      const result = setup
        ? await updateSetup({ id: setup.id, body }).unwrap()
        : await createSetup(body).unwrap();
      shikshaMitraToast.success({
        message: setup ? 'Admission intake setup updated.' : 'Admission intake setup created.',
      });
      formikRef.current?.resetForm({ values });
      if (setup) onClose();
      else setSavedSetup(result);
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

  const openOffering = () => {
    if (!savedSetup) return;
    onClose();
    router.push(
      `${studentPaths.enrollment.settings.offerings}?intakeSetupId=${encodeURIComponent(savedSetup.id)}`
    );
  };

  const openInquiryLink = () => {
    if (!savedSetup) return;
    onClose();
    router.push(
      `${studentPaths.enrollment.settings.intakeAssignment}?view=links&intakeSetupId=${encodeURIComponent(savedSetup.id)}`
    );
  };

  return (
    <>
      <Drawer
        anchor="right"
        open
        onClose={requestClose}
        PaperProps={{
          sx: {
            width: { xs: 1, md: 760 },
            maxWidth: 1,
            height: '100dvh',
            display: 'flex',
            overflow: 'hidden',
          },
          role: 'dialog',
          'aria-labelledby': 'intake-setup-editor-title',
        }}
      >
        <Stack direction="row" spacing={1} alignItems="center" sx={{ px: 2, py: 1.5 }}>
          <Stack direction="row" spacing={0.5} alignItems="center" sx={{ flex: 1, minWidth: 0 }}>
            <Typography id="intake-setup-editor-title" variant="h6">
              {setup ? 'Edit admission intake setup' : 'Create admission intake setup'}
            </Typography>
            <CustomTooltip
              title="Configure inquiry handling and counsellor routing together."
              arrow
              placement="right"
            >
              <IconButton size="small" color="info" aria-label="Admission intake setup information">
                <Iconify icon="lucide:info" width={16} />
              </IconButton>
            </CustomTooltip>
          </Stack>
          <IconButton
            size="small"
            aria-label="Close admission intake setup editor"
            onClick={requestClose}
            disabled={saving}
            sx={{ width: { xs: 44, sm: 36 }, height: { xs: 44, sm: 36 } }}
          >
            <Iconify icon="mdi:close" />
          </IconButton>
        </Stack>
        <Divider />

        {savedSetup ? (
          <Stack spacing={2} sx={{ flex: 1, minHeight: 0, overflowY: 'auto', p: 2 }}>
            <Alert severity="success">
              <strong>{savedSetup.name}</strong> is ready to use. Choose the next task, or close
              this drawer and return later.
            </Alert>
            <FormSectionCard
              icon="mdi:school-outline"
              title="Use in Admission Offering"
              descriptionTooltip="Connect this setup to classes and an admission period."
              action={
                <Button size="small" variant="contained" onClick={openOffering}>
                  Use in Offering
                </Button>
              }
            />
            <FormSectionCard
              icon="mdi:link-variant-plus"
              title="Create public inquiry link"
              descriptionTooltip="Create a website, QR-code, referral, or school-event link with this routing setup."
              action={
                <Button size="small" variant="outlined" onClick={openInquiryLink}>
                  Create link
                </Button>
              }
            />
            <Box sx={{ flex: 1 }} />
            <Box sx={{ pt: 2, borderTop: 1, borderColor: 'divider' }}>
              <Button variant="outlined" size="small" onClick={onClose}>
                Done
              </Button>
            </Box>
          </Stack>
        ) : (
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
                steps={['Inquiry handling', 'Counsellor routing', 'Review & create']}
                activeStep={step}
                validationSchema={getAdmissionIntakeSetupStepSchema(step)}
                validateOnChange
                showSaveButton={false}
                validateForwardStepClick
                isStepClickable={(index) => index <= step}
                completedSteps={Array.from({ length: step }, (_, index) => index)}
                onStepClick={(index) => setStep(index)}
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
                handleBack={() => setStep((current) => Math.max(0, current - 1))}
                handleNext={(isLastStep, values: AdmissionIntakeSetupValues) => {
                  if (isLastStep) finish(values);
                  else setStep((current) => Math.min(2, current + 1));
                }}
                renderItem={({ formik, activeStep }) => {
                  const form = formik as FormikProps<AdmissionIntakeSetupValues>;
                  formikRef.current = form;
                  return (
                    <Stack spacing={2} sx={{ p: { xs: 1.5, sm: 2 } }}>
                      {activeStep === 0 && <InquiryHandlingStep formik={form} />}
                      {activeStep === 1 && (
                        <CounsellorRoutingStep
                          formik={form}
                          counsellors={counsellors.data ?? []}
                          loading={counsellors.isLoading || counsellors.isFetching}
                          loadError={counsellors.isError}
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
                        />
                      )}
                    </Stack>
                  );
                }}
              />
            </Box>
          </Box>
        )}
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

function InquiryHandlingStep({ formik }: { formik: FormikProps<AdmissionIntakeSetupValues> }) {
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
          <Autocomplete
            multiple
            size="small"
            slotProps={{ chip: { color: 'default', variant: 'soft', size: 'small' } }}
            options={INQUIRY_SOURCE_OPTIONS}
            getOptionLabel={(option) => option.label}
            value={INQUIRY_SOURCE_OPTIONS.filter((option) =>
              rules.allowedSources.includes(option.value)
            )}
            onChange={(_, selected) =>
              setRule(
                'allowedSources',
                selected.map((option) => option.value)
              )
            }
            renderInput={(params) => (
              <TextField
                {...params}
                size="small"
                label="Allowed sources"
                helperText="Leave empty to accept all sources. Source details are optional."
              />
            )}
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
}: {
  formik: FormikProps<AdmissionIntakeSetupValues>;
  counsellors: IntakeCounsellorChoice[];
  loading: boolean;
  loadError: boolean;
  onRetry: () => void;
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
        <AdmissionIntakeNotice severity="info">
          New inquiries and direct registrations go to the eligible counsellor with the fewest
          active cases. That counsellor remains the journey owner through admission and onboarding.
        </AdmissionIntakeNotice>
        {loadError && (
          <Alert
            severity="error"
            action={
              <Button size="small" onClick={onRetry} loading={loading}>
                Retry
              </Button>
            }
          >
            Unable to load eligible counsellors.
          </Alert>
        )}
        {!loading && !loadError && counsellors.length === 0 && (
          <AdmissionIntakeNotice severity="warning">
            Add eligible admission staff before creating this setup.
          </AdmissionIntakeNotice>
        )}
        <Autocomplete
          multiple
          size="small"
          loading={loading}
          disabled={loading || loadError}
          options={counsellors}
          getOptionLabel={(option) => option.name || option.userName}
          isOptionEqualToValue={(option, value) => option.id === value.id}
          noOptionsText="No eligible admission staff found"
          value={counsellors.filter((option) => rules.counsellorUserIds.includes(option.id))}
          onChange={(_, selected) =>
            setRule(
              'counsellorUserIds',
              selected.map((option) => option.id)
            )
          }
          renderInput={(params) => (
            <TextField
              {...params}
              size="small"
              label="Counsellor pool *"
              error={Boolean(poolMeta.touched && poolMeta.error)}
              helperText={poolMeta.touched ? String(poolMeta.error ?? '') : undefined}
            />
          )}
        />
        <Grid container spacing={1}>
          <Grid size={{ xs: 12, sm: 6 }}>
            <TextField
              fullWidth
              size="small"
              type="number"
              label="Maximum active cases per counsellor *"
              value={rules.maxActiveCasesPerCounsellor}
              onChange={(event) =>
                setRule('maxActiveCasesPerCounsellor', Number(event.target.value))
              }
              error={Boolean(limitMeta.touched && limitMeta.error)}
              helperText={limitMeta.touched ? String(limitMeta.error ?? '') : undefined}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <TextField
              select
              fullWidth
              size="small"
              label="Fallback manager *"
              disabled={loading || loadError}
              value={rules.fallbackManagerUserId ?? ''}
              onChange={(event) => setRule('fallbackManagerUserId', event.target.value || '')}
              onBlur={() =>
                formik.setFieldTouched('counsellorAssignmentRules.fallbackManagerUserId', true)
              }
              error={Boolean(fallbackMeta.touched && fallbackMeta.error)}
              helperText={fallbackMeta.touched ? String(fallbackMeta.error ?? '') : undefined}
            >
              <MenuItem value="">Choose fallback manager</MenuItem>
              {counsellors.map((person) => (
                <MenuItem key={person.id} value={person.id}>
                  {person.name || person.userName}
                </MenuItem>
              ))}
            </TextField>
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
}: {
  values: AdmissionIntakeSetupValues;
  counsellors: IntakeCounsellorChoice[];
  editing: boolean;
  usageCount: number;
  usage?: AdmissionIntakeSetupUsage;
  usageError: boolean;
  onRetryUsage: () => void;
}) {
  const assignment = values.counsellorAssignmentRules;
  const fallback = counsellors.find((person) => person.id === assignment.fallbackManagerUserId);
  return (
    <>
      {usageError && editing && (
        <Alert
          severity="error"
          action={
            <Button size="small" onClick={onRetryUsage}>
              Retry
            </Button>
          }
        >
          Usage impact could not be loaded. Retry before updating this shared setup.
        </Alert>
      )}
      {editing && usageCount > 0 && (
        <AdmissionIntakeNotice severity="warning" key={usageCount}>
          Used by {usageCount} {usageCount === 1 ? 'Offering or link' : 'Offerings or links'}.
          Offering-linked inquiries keep their captured policy and owner. Public inquiries without a
          confirmed Offering use the current Offering policy when staff confirm one later.
        </AdmissionIntakeNotice>
      )}
      {editing && usage && <UsageNames usage={usage} />}
      <FormSectionCard
        icon="mdi:clipboard-text-outline"
        title="Inquiry handling"
        titleTypographyProps={sectionTitleProps}
      >
        <Stack spacing={0.75}>
          <SummaryRow label="Setup name" value={values.name} />
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
            value={`Every ${values.inquiryRules.followUpDueInDays} days · Up to ${values.inquiryRules.maxOpenFollowUps} open`}
          />
        </Stack>
      </FormSectionCard>
      <FormSectionCard
        icon="mdi:account-switch-outline"
        title="Counsellor routing"
        titleTypographyProps={sectionTitleProps}
      >
        <Stack spacing={0.75}>
          <SummaryRow
            label="Counsellor pool"
            value={`${assignment.counsellorUserIds.length} counsellor${assignment.counsellorUserIds.length === 1 ? '' : 's'}`}
          />
          <SummaryRow
            label="Capacity"
            value={`${assignment.maxActiveCasesPerCounsellor} active cases each`}
          />
          <SummaryRow label="Fallback manager" value={fallback?.name ?? 'Unavailable'} />
        </Stack>
      </FormSectionCard>
    </>
  );
}

function SummaryRow({ label, value }: { label: string; value: string }) {
  return (
    <Stack direction={{ xs: 'column', sm: 'row' }} spacing={0.5} justifyContent="space-between">
      <Typography variant="body2" color="text.secondary">
        {label}
      </Typography>
      <Typography variant="body2" fontWeight={600} textAlign={{ sm: 'right' }}>
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
