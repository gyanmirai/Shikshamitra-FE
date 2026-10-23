'use client';

import type { FormikProps } from 'formik';
import type {
  AdmissionIntakeProfile,
  IntakeCounsellorChoice,
  AdmissionIntakeProfileKind,
  AdmissionInquiryIntakeRules,
  AdmissionCounsellorAssignmentRules,
} from 'src/redux/student/admissions/admission-intake-profiles-api';

import * as Yup from 'yup';
import { Iconify } from 'src/components/iconify';
import { useRef, useMemo, useState } from 'react';
import { shikshaMitraToast } from 'src/components/toast';
import { ConfirmDialog } from 'src/components/confirm-dialog';
import ShakingTextField from 'src/components/shaking-text-field';
import { StudentFeedback } from 'src/components/student-feedback';
import { parseApiProblemDetail } from 'src/utils/api-problem-details';
import { CustomStepperWithFormik } from 'src/components/custom-stepper';
import { withStandardInquiryBehavior } from 'src/redux/student/admissions/admission-inquiry-policy';
import {
  useGetAdmissionIntakeCounsellorsQuery,
  useCreateAdmissionIntakeProfileMutation,
  useUpdateAdmissionIntakeProfileMutation,
} from 'src/redux/student/admissions/admission-intake-profiles-api';
import {
  Box,
  Grid,
  Stack,
  Radio,
  Button,
  Drawer,
  Divider,
  MenuItem,
  TextField,
  IconButton,
  Typography,
  RadioGroup,
  Autocomplete,
  FormHelperText,
  FormControlLabel,
} from '@mui/material';

import { AdmissionIntakeNotice } from './admission-intake-notice';
import { INQUIRY_SOURCE_OPTIONS } from './inquiry-management/admission-inquiry-list-options';

export const defaultInquiryRules: AdmissionInquiryIntakeRules = {
  version: 1,
  duplicateRule: 1,
  applicationStartRequirement: 0,
  firstContactDueInHours: 24,
  qualificationDueInDays: 7,
  followUpDueInDays: 3,
  maxOpenFollowUps: 3,
  requireGuardianEmail: false,
  requireApplicantDateOfBirth: false,
  allowedSources: [],
  requireSourceDetailFor: [],
};

export const defaultAssignmentRules: AdmissionCounsellorAssignmentRules = {
  version: 1,
  counsellorUserIds: [],
  maxActiveCasesPerCounsellor: 100,
  fallbackManagerUserId: null,
};

export type IntakeProfileValues = {
  kind: AdmissionIntakeProfileKind | null;
  name: string;
  code: string;
  inquiry: AdmissionInquiryIntakeRules;
  assignment: AdmissionCounsellorAssignmentRules;
};

export const profileKindLabel = (kind: AdmissionIntakeProfileKind) =>
  kind === 0 ? 'Inquiry setup' : 'Counsellor assignment';

export function readProfileRules(profile: AdmissionIntakeProfile): Record<string, unknown> | null {
  try {
    const value: unknown = JSON.parse(profile.configurationJson);
    return value && typeof value === 'object' && !Array.isArray(value)
      ? (value as Record<string, unknown>)
      : null;
  } catch {
    return null;
  }
}

export function getInitialProfileValues(
  profile: AdmissionIntakeProfile | null
): IntakeProfileValues {
  const rules = profile ? readProfileRules(profile) : null;
  return {
    kind: profile?.kind ?? null,
    name: profile?.name ?? '',
    code: profile?.code ?? '',
    inquiry: withStandardInquiryBehavior(
      profile?.kind === 0 && rules
        ? { ...defaultInquiryRules, ...rules }
        : { ...defaultInquiryRules }
    ),
    assignment:
      profile?.kind === 1 && rules
        ? { ...defaultAssignmentRules, ...rules }
        : { ...defaultAssignmentRules },
  };
}

const typeSchema = Yup.object({
  kind: Yup.number().oneOf([0, 1], 'Choose a profile type').required('Choose a profile type'),
});

const identitySchema = Yup.object({
  name: Yup.string()
    .trim()
    .required('Enter a profile name')
    .max(128, 'Use 128 characters or fewer'),
});

const inquiryRulesSchema = Yup.object({
  inquiry: Yup.object({
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

const assignmentRulesSchema = Yup.object({
  assignment: Yup.object({
    counsellorUserIds: Yup.array()
      .of(Yup.string().required())
      .min(1, 'Choose at least one counsellor')
      .max(50, 'Choose at most 50 counsellors'),
    maxActiveCasesPerCounsellor: Yup.number()
      .integer('Use a whole number')
      .min(1, 'Allow at least 1 active case')
      .max(10000, 'Allow at most 10,000 active cases')
      .required('Enter a workload limit'),
  }),
});

export function getProfileStepSchema(
  step: number,
  isEdit: boolean,
  kind: AdmissionIntakeProfileKind | null
) {
  const actualStep = isEdit ? step + 1 : step;
  if (actualStep === 0) return typeSchema;
  if (actualStep === 1) return identitySchema;
  return kind === 1 ? assignmentRulesSchema : inquiryRulesSchema;
}

type Props = {
  profile: AdmissionIntakeProfile | null;
  onClose: () => void;
};

export function AdmissionIntakeProfileEditor({ profile, onClose }: Props) {
  const [step, setStep] = useState(0);
  const [confirmClose, setConfirmClose] = useState(false);
  const formikRef = useRef<FormikProps<IntakeProfileValues> | null>(null);
  const counsellors = useGetAdmissionIntakeCounsellorsQuery(undefined, {
    refetchOnMountOrArgChange: true,
  });
  const [createProfile, createState] = useCreateAdmissionIntakeProfileMutation();
  const [updateProfile, updateState] = useUpdateAdmissionIntakeProfileMutation();
  const saving = createState.isLoading || updateState.isLoading;
  const initialValues = useMemo(() => getInitialProfileValues(profile), [profile]);
  const invalidSavedRules = Boolean(profile && !readProfileRules(profile));
  const steps = profile ? ['Profile', 'Rules'] : ['Type', 'Profile', 'Rules'];
  const kind = formikRef.current?.values.kind ?? profile?.kind ?? null;

  const requestClose = () => {
    if (saving) return;
    if (formikRef.current?.dirty) {
      setConfirmClose(true);
      return;
    }
    onClose();
  };

  const save = async (values: IntakeProfileValues, setIsLoading: (loading: boolean) => void) => {
    if (values.kind === null || saving) return;
    setIsLoading(true);
    const body = {
      kind: values.kind,
      name: values.name.trim(),
      code: values.code.trim().toUpperCase(),
      configurationJson: JSON.stringify(
        values.kind === 0 ? withStandardInquiryBehavior(values.inquiry) : values.assignment
      ),
      concurrencyStamp: profile?.concurrencyStamp ?? '',
    };
    try {
      if (profile) await updateProfile({ id: profile.id, body }).unwrap();
      else await createProfile(body).unwrap();
      shikshaMitraToast.success({
        message: profile ? 'Profile updated.' : 'Profile created.',
      });
      formikRef.current?.resetForm();
      onClose();
    } catch (error) {
      shikshaMitraToast.error({
        message: parseApiProblemDetail(error).detail || 'Unable to save this profile.',
      });
      setIsLoading(false);
    }
  };

  return (
    <>
      <Drawer
        anchor="right"
        open
        onClose={requestClose}
        PaperProps={{
          sx: {
            width: { xs: 1, sm: 640 },
            maxWidth: 1,
            height: '100dvh',
            display: 'flex',
            overflow: 'hidden',
          },
          role: 'dialog',
          'aria-labelledby': 'intake-profile-editor-title',
        }}
      >
        <Stack direction="row" spacing={1} alignItems="flex-start" sx={{ px: 2, py: 1.5 }}>
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography id="intake-profile-editor-title" variant="h6">
              {profile ? `Edit ${profileKindLabel(profile.kind).toLowerCase()}` : 'Add profile'}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Create reusable settings that admission offerings can select.
            </Typography>
          </Box>
          <IconButton
            size="small"
            aria-label="Close profile editor"
            onClick={requestClose}
            disabled={saving}
            sx={{ width: { xs: 44, sm: 36 }, height: { xs: 44, sm: 36 } }}
          >
            <Iconify icon="mdi:close" />
          </IconButton>
        </Stack>
        <Divider />
        <Box sx={{ flex: 1, minHeight: 0, '& button': { minHeight: { xs: 44, sm: 36 } } }}>
          <CustomStepperWithFormik
            initialValues={initialValues}
            steps={steps}
            activeStep={step}
            validationSchema={getProfileStepSchema(step, Boolean(profile), kind)}
            validateOnChange
            showSaveButton={false}
            validateForwardStepClick
            isStepClickable={(index) => index <= step}
            onStepClick={(index) => setStep(index)}
            nextButtonLabel="Next"
            finalButtonLabel={profile ? 'Update profile' : 'Create profile'}
            handleBack={() => setStep((current) => Math.max(0, current - 1))}
            handleNext={(isLastStep, values: IntakeProfileValues, _formik, setIsLoading) => {
              if (isLastStep) save(values, setIsLoading);
              else setStep((current) => Math.min(steps.length - 1, current + 1));
            }}
            renderItem={({ formik, activeStep }) => {
              const form = formik as FormikProps<IntakeProfileValues>;
              formikRef.current = form;
              const actualStep = profile ? activeStep + 1 : activeStep;
              return (
                <Stack spacing={2} sx={{ p: 2 }}>
                  {actualStep === 0 && <ProfileTypeFields formik={form} />}
                  {actualStep === 1 && <ProfileIdentityFields formik={form} />}
                  {actualStep === 1 && invalidSavedRules && (
                    <AdmissionIntakeNotice
                      notificationKey="STU-0088"
                      presentation="persistent"
                      severity="warning"
                    >
                      The saved rules could not be read. Review every rule before updating this
                      profile.
                    </AdmissionIntakeNotice>
                  )}
                  {actualStep === 2 &&
                    (form.values.kind === 0 ? (
                      <InquiryFields
                        value={form.values.inquiry}
                        formik={form}
                        onChange={(value) => form.setFieldValue('inquiry', value)}
                      />
                    ) : (
                      <AssignmentFields
                        value={form.values.assignment}
                        formik={form}
                        counsellors={counsellors.data ?? []}
                        loading={counsellors.isLoading}
                        loadError={counsellors.isError}
                        onRetry={() => counsellors.refetch()}
                        onChange={(value) => form.setFieldValue('assignment', value)}
                      />
                    ))}
                </Stack>
              );
            }}
          />
        </Box>
      </Drawer>
      <ConfirmDialog
        open={confirmClose}
        onClose={() => setConfirmClose(false)}
        title="Discard profile changes?"
        content="The information entered in this profile will be lost."
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
    </>
  );
}

function ProfileTypeFields({ formik }: { formik: FormikProps<IntakeProfileValues> }) {
  return (
    <>
      <Box>
        <Typography variant="subtitle1">What do you want to set up?</Typography>
        <Typography variant="body2" color="text.secondary">
          Choose one type. Both can be reused across admission offerings.
        </Typography>
      </Box>
      <RadioGroup
        aria-label="Profile type"
        value={formik.values.kind === null ? '' : String(formik.values.kind)}
        onChange={(_, value) => formik.setFieldValue('kind', Number(value))}
      >
        {([0, 1] as const).map((kind) => (
          <Box
            key={kind}
            sx={{
              mb: 1,
              px: 1.5,
              py: 1,
              border: 1,
              borderColor: formik.values.kind === kind ? 'primary.main' : 'divider',
              borderRadius: 1.5,
              bgcolor: formik.values.kind === kind ? 'action.selected' : 'background.paper',
            }}
          >
            <FormControlLabel
              value={String(kind)}
              control={<Radio />}
              label={
                <Box>
                  <Typography variant="subtitle2">{profileKindLabel(kind)}</Typography>
                  <Typography variant="body2" color="text.secondary">
                    {kind === 0
                      ? 'Set inquiry sources and follow-up timing.'
                      : 'Choose counsellors, workload limits, and a fallback manager.'}
                  </Typography>
                </Box>
              }
              sx={{ width: 1, minHeight: 56, m: 0 }}
            />
          </Box>
        ))}
      </RadioGroup>
      {formik.touched.kind && formik.errors.kind && (
        <FormHelperText error>{formik.errors.kind}</FormHelperText>
      )}
    </>
  );
}

function ProfileIdentityFields({ formik }: { formik: FormikProps<IntakeProfileValues> }) {
  return (
    <>
      <Typography variant="body2" color="text.secondary">
        {profileKindLabel(formik.values.kind ?? 0)} profiles can be selected by multiple offerings.
      </Typography>
      <ShakingTextField error={Boolean(formik.touched.name && formik.errors.name)}>
        <TextField
          fullWidth
          size="small"
          name="name"
          label="Profile name *"
          value={formik.values.name}
          onChange={formik.handleChange}
          onBlur={formik.handleBlur}
          error={Boolean(formik.touched.name && formik.errors.name)}
          helperText={formik.touched.name && formik.errors.name}
        />
      </ShakingTextField>
    </>
  );
}

function InquiryFields({
  value,
  formik,
  onChange,
}: {
  value: AdmissionInquiryIntakeRules;
  formik: FormikProps<IntakeProfileValues>;
  onChange: (value: AdmissionInquiryIntakeRules) => void;
}) {
  const set = <K extends keyof AdmissionInquiryIntakeRules>(
    key: K,
    next: AdmissionInquiryIntakeRules[K]
  ) => onChange({ ...value, [key]: next });
  const feedback = (name: string) => {
    const meta = formik.getFieldMeta(name);
    return {
      error: Boolean(meta.touched && meta.error),
      helperText: meta.touched ? meta.error : '',
    };
  };

  return (
    <>
      <Typography variant="subtitle1">Inquiry rules</Typography>
      <Autocomplete
        multiple
        size="small"
        slotProps={{ chip: { color: 'default', variant: 'soft', size: 'small' } }}
        options={INQUIRY_SOURCE_OPTIONS}
        getOptionLabel={(option) => option.label}
        value={INQUIRY_SOURCE_OPTIONS.filter((option) =>
          value.allowedSources.includes(option.value)
        )}
        onChange={(_, selected) =>
          set(
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
      <Grid container spacing={1.5}>
        <Grid size={{ xs: 12, sm: 6 }}>
          <TextField
            fullWidth
            size="small"
            type="number"
            label="First contact within hours"
            value={value.firstContactDueInHours ?? ''}
            onChange={(event) =>
              set('firstContactDueInHours', event.target.value ? Number(event.target.value) : null)
            }
            {...feedback('inquiry.firstContactDueInHours')}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6 }}>
          <TextField
            fullWidth
            size="small"
            type="number"
            label="Qualify within days"
            value={value.qualificationDueInDays ?? ''}
            onChange={(event) =>
              set('qualificationDueInDays', event.target.value ? Number(event.target.value) : null)
            }
            {...feedback('inquiry.qualificationDueInDays')}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6 }}>
          <TextField
            fullWidth
            size="small"
            type="number"
            label="Follow-up after days"
            value={value.followUpDueInDays}
            onChange={(event) => set('followUpDueInDays', Number(event.target.value))}
            {...feedback('inquiry.followUpDueInDays')}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6 }}>
          <TextField
            fullWidth
            size="small"
            type="number"
            label="Maximum open follow-ups"
            value={value.maxOpenFollowUps}
            onChange={(event) => set('maxOpenFollowUps', Number(event.target.value))}
            {...feedback('inquiry.maxOpenFollowUps')}
          />
        </Grid>
      </Grid>
    </>
  );
}

function AssignmentFields({
  value,
  formik,
  counsellors,
  loading,
  loadError,
  onRetry,
  onChange,
}: {
  value: AdmissionCounsellorAssignmentRules;
  formik: FormikProps<IntakeProfileValues>;
  counsellors: IntakeCounsellorChoice[];
  loading: boolean;
  loadError: boolean;
  onRetry: () => void;
  onChange: (value: AdmissionCounsellorAssignmentRules) => void;
}) {
  const counsellorMeta = formik.getFieldMeta('assignment.counsellorUserIds');
  const limitMeta = formik.getFieldMeta('assignment.maxActiveCasesPerCounsellor');

  return (
    <>
      <Typography variant="subtitle1">Counsellor assignment rules</Typography>
      <AdmissionIntakeNotice notificationKey="STU-0090" presentation="inline" severity="info">
        New inquiries and direct registrations go to the counsellor with the fewest active cases.
        That counsellor stays the student&apos;s journey owner through admission and becomes the
        onboarding owner at finalization. A specialist completing one stage does not replace the
        journey owner.
      </AdmissionIntakeNotice>
      {loadError && (
        <StudentFeedback
          notificationKey="STU-0091"
          presentation="toast"
          severity="error"
          action={
            <Button size="small" onClick={onRetry} loading={loading}>
              Retry
            </Button>
          }
        >
          Unable to load counsellors.
        </StudentFeedback>
      )}
      {!loading && !loadError && counsellors.length === 0 && (
        <AdmissionIntakeNotice notificationKey="STU-0092" presentation="inline" severity="info">
          Add eligible counsellors before saving this profile.
        </AdmissionIntakeNotice>
      )}
      <Autocomplete
        multiple
        loading={loading}
        disabled={loading || loadError}
        options={counsellors}
        getOptionLabel={(option) => option.name || option.userName}
        isOptionEqualToValue={(option, selected) => option.id === selected.id}
        value={counsellors.filter((option) => value.counsellorUserIds.includes(option.id))}
        onChange={(_, selected) =>
          onChange({ ...value, counsellorUserIds: selected.map((option) => option.id) })
        }
        renderInput={(params) => (
          <TextField
            {...params}
            size="small"
            label="Counsellor pool *"
            error={Boolean(counsellorMeta.touched && counsellorMeta.error)}
            helperText={counsellorMeta.touched ? counsellorMeta.error : ''}
          />
        )}
      />
      <TextField
        fullWidth
        size="small"
        type="number"
        label="Maximum active cases per counsellor *"
        value={value.maxActiveCasesPerCounsellor}
        onChange={(event) =>
          onChange({ ...value, maxActiveCasesPerCounsellor: Number(event.target.value) })
        }
        error={Boolean(limitMeta.touched && limitMeta.error)}
        helperText={limitMeta.touched ? limitMeta.error : ''}
      />
      <TextField
        select
        fullWidth
        size="small"
        label="Fallback manager"
        disabled={loading || loadError}
        value={value.fallbackManagerUserId ?? ''}
        onChange={(event) =>
          onChange({ ...value, fallbackManagerUserId: event.target.value || null })
        }
      >
        <MenuItem value="">No fallback</MenuItem>
        {counsellors.map((person) => (
          <MenuItem key={person.id} value={person.id}>
            {person.name || person.userName}
          </MenuItem>
        ))}
      </TextField>
    </>
  );
}
