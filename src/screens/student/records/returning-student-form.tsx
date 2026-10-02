import type { RootState } from 'src/redux/store';
import type { TransitionPreviewRow } from 'src/redux/student/records/student-record-transitions-api';
import type {
  RecordsReturnRoute,
  StudentDirectoryItem,
} from 'src/redux/student/records/student-records-types';

import dayjs from 'dayjs';
import * as Yup from 'yup';
import { useFormik } from 'formik';
import { useSelector } from 'react-redux';
import { useRef, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { RouterLink } from 'src/routes/components';
import CustomSelect from 'src/components/custom-select';
import { shikshaMitraToast } from 'src/components/toast';
import { studentPaths } from 'src/constants/student-menu';
import { hasGrantedPermission } from 'src/utils/permissions';
import { FormSectionCard } from 'src/components/form-section-card';
import { varAlpha } from 'src/theme/styles';
import { useUnsavedNavigation } from 'src/hooks/use-unsaved-navigation';
import { Box, Stack, Alert, Button, TextField, Typography, CircularProgress } from '@mui/material';
import {
  useReturnStudentRecordMutation,
  usePreviewReturningStudentRecordMutation,
  useGetStudentRecordTransitionOptionsQuery,
} from 'src/redux/student/records/student-record-transitions-api';

import RecordsStudentPicker from './records-student-picker';
import RollAssignmentControl from './roll-assignment-control';
import ReturningInquiryIntake from './returning-inquiry-intake';
import {
  buildReturningInquiry,
  emptyReturningInquiry,
  returningInquiryDefaults,
  validateReturningInquiry,
  type ReturningInquiryValues,
} from './returning-inquiry-model';

type ReturnFormValues = {
  rollAssignmentMode?: 'manual' | 'automatic';
  schoolRollMode?: 'manual' | 'automatic' | 'both';
  studentId: string;
  targetAcademicYearId: string;
  targetStandardId: string;
  targetDivisionId: string;
  rollNumber: number | null;
  effectiveDate: string;
  route: string;
  reason: string;
  admissionOfferingId: string;
  entryPath: '' | 0 | 1;
  inquiryValues: ReturningInquiryValues;
  resumeApplicationId: string;
  guardianFirstName: string;
  guardianLastName: string;
  guardianMobile: string;
  guardianEmail: string;
  guardianRelationship: number;
};
const routes: Record<RecordsReturnRoute, { title: string; detail: string }> = {
  ReuseProfile: {
    title: 'Reuse permanent profile',
    detail:
      'Submit a governed return request. After approval, complete short onboarding for the new enrollment.',
  },
  FreshApplication: {
    title: 'Fresh admission application',
    detail:
      'Submit for Records review, then follow the offering’s inquiry or direct registration path using the permanent student identity.',
  },
  ResumeStage: {
    title: 'Resume eligible application',
    detail: 'Submit for Records review before continuing an eligible existing application.',
  },
};
export default function ReturningStudentForm() {
  const router = useRouter();
  const currentYear = useSelector((state: RootState) => state.globalState.currentYear);
  const permissions = useSelector((state: RootState) => state.auth.permissions);
  const canViewApplications = hasGrantedPermission(
    permissions,
    'Students.Admissions.Applications.View'
  );
  const canViewInquiries = hasGrantedPermission(permissions, 'Students.Admissions.Inquiries.View');
  const [student, setStudent] = useState<StudentDirectoryItem | null>(null);
  const [failure, setFailure] = useState<string | null>(null);
  const [idempotencyKey] = useState(() => crypto.randomUUID());
  const inquiryContext = useRef('');
  const [returnStudent, returnState] = useReturnStudentRecordMutation();
  const [previewReturn, previewState] = usePreviewReturningStudentRecordMutation();
  const [preview, setPreview] = useState<{ data: TransitionPreviewRow; signature: string } | null>(
    null
  );
  const busy = returnState.isLoading || previewState.isLoading;
  const form = useFormik<ReturnFormValues>({
    initialValues: {
      studentId: '',
      targetAcademicYearId: currentYear?.id ?? '',
      targetStandardId: '',
      targetDivisionId: '',
      rollNumber: null,
      effectiveDate: dayjs().format('YYYY-MM-DD'),
      route: '',
      reason: '',
      admissionOfferingId: '',
      entryPath: '',
      inquiryValues: emptyReturningInquiry(),
      resumeApplicationId: '',
      guardianFirstName: '',
      guardianLastName: '',
      guardianMobile: '',
      guardianEmail: '',
      guardianRelationship: 0,
    },
    validationSchema: Yup.object({
      studentId: Yup.string().required('Choose a student.'),
      targetAcademicYearId: Yup.string().required('Choose the target academic year.'),
      reason: Yup.string().trim().min(3).max(1000).required('Enter a reason.'),
      route: Yup.string().oneOf(Object.keys(routes)).required('Choose an allowed return route.'),
      rollAssignmentMode: Yup.string()
        .oneOf(['manual', 'automatic'])
        .test(
          'school-numbering-rule',
          'Use the school numbering method.',
          (value, { parent }) =>
            parent.route !== 'ReuseProfile' ||
            !parent.schoolRollMode ||
            parent.schoolRollMode === 'both' ||
            value === parent.schoolRollMode
        )
        .when(['schoolRollMode', 'route'], {
          is: (schoolMode: string, route: string) =>
            schoolMode === 'both' && route === 'ReuseProfile',
          then: (field) => field.required('Choose manual or automatic roll numbering.'),
        }),
      rollNumber: Yup.number()
        .nullable()
        .when(['rollAssignmentMode', 'route'], {
          is: (mode: string, route: string) => mode === 'manual' && route === 'ReuseProfile',
          then: (field) =>
            field
              .required('Enter the target roll number.')
              .integer('Enter a whole number.')
              .min(1, 'Enter a positive roll number.'),
        }),
      targetStandardId: Yup.string().when('route', {
        is: 'ReuseProfile',
        then: (field) => field.required('Choose a class.'),
      }),
      targetDivisionId: Yup.string().when('route', {
        is: 'ReuseProfile',
        then: (field) => field.required('Choose a division.'),
      }),
      admissionOfferingId: Yup.string().when('route', {
        is: 'FreshApplication',
        then: (field) => field.required('Choose an admission offering.'),
      }),
      entryPath: Yup.mixed().when('route', {
        is: 'FreshApplication',
        then: (field) =>
          field
            .oneOf([0, 1], 'Choose an admission entry path.')
            .required('Choose an admission entry path.'),
      }),
      resumeApplicationId: Yup.string().when('route', {
        is: 'ResumeStage',
        then: (field) => field.required('Choose an eligible application.'),
      }),
    }),
    validate: (values) => {
      if (values.route !== 'FreshApplication' || values.entryPath !== 0) return {};
      const intake = options.currentData?.offerings.find(
        (item) => item.id === values.admissionOfferingId
      )?.inquiryIntake;
      const errors = validateReturningInquiry(values.inquiryValues, intake);
      return Object.keys(errors).length ? { inquiryValues: errors } : {};
    },
    onSubmit: async (values) => {
      setFailure(null);
      if (
        values.route === 'ReuseProfile' &&
        (!preview?.data.ready ||
          preview.signature !== JSON.stringify(values) ||
          (preview.data.rollAssignmentMode === 'automatic' &&
            (!Number.isInteger(preview.data.proposedRollNumber) ||
              Number(preview.data.proposedRollNumber) <= 0)))
      )
        return;
      if (
        values.route === 'FreshApplication' &&
        options.currentData?.freshApplicationRequiresRegistration
      ) {
        if (!values.guardianFirstName.trim()) {
          form.setFieldError('guardianFirstName', 'Enter the guardian first name.');
          form.setFieldTouched('guardianFirstName', true, false);
          return;
        }
        if (values.guardianMobile.trim().length < 7) {
          form.setFieldError('guardianMobile', 'Enter a valid guardian mobile number.');
          form.setFieldTouched('guardianMobile', true, false);
          return;
        }
        if (values.guardianEmail && !Yup.string().email().isValidSync(values.guardianEmail)) {
          form.setFieldError('guardianEmail', 'Enter a valid guardian email.');
          form.setFieldTouched('guardianEmail', true, false);
          return;
        }
      }
      try {
        const result = await returnStudent({
          studentId: values.studentId,
          targetAcademicYearId: values.targetAcademicYearId,
          route: values.route as RecordsReturnRoute,
          idempotencyKey,
          reason: values.reason.trim(),
          effectiveDate: values.effectiveDate,
          targetStandardId: values.route === 'ReuseProfile' ? values.targetStandardId : undefined,
          targetDivisionId: values.route === 'ReuseProfile' ? values.targetDivisionId : undefined,
          rollNumber:
            values.route === 'ReuseProfile'
              ? preview?.data.rollAssignmentMode === 'automatic'
                ? preview.data.proposedRollNumber
                : values.rollNumber
              : undefined,
          rollAssignmentMode:
            values.route === 'ReuseProfile'
              ? (preview?.data.rollAssignmentMode ?? values.rollAssignmentMode)
              : undefined,
          studentConcurrencyStamp:
            values.route === 'ReuseProfile' ? preview?.data.studentConcurrencyStamp : undefined,
          enrollmentConcurrencyStamp:
            values.route === 'ReuseProfile' ? preview?.data.enrollmentConcurrencyStamp : undefined,
          admissionOfferingId:
            values.route === 'FreshApplication' ? values.admissionOfferingId : undefined,
          entryPath:
            values.route === 'FreshApplication' && values.entryPath !== ''
              ? values.entryPath
              : undefined,
          resumeApplicationId:
            values.route === 'ResumeStage' ? values.resumeApplicationId : undefined,
          inquiry:
            values.route === 'FreshApplication' && values.entryPath === 0 && offering?.inquiryIntake
              ? buildReturningInquiry(values.inquiryValues, offering.inquiryIntake)
              : undefined,
          registration:
            values.route === 'FreshApplication' &&
            options.currentData?.freshApplicationRequiresRegistration
              ? {
                  guardianFirstName: values.guardianFirstName.trim(),
                  guardianLastName: values.guardianLastName.trim() || undefined,
                  guardianMobile: values.guardianMobile.trim(),
                  guardianEmail: values.guardianEmail.trim() || undefined,
                  guardianRelationship: values.guardianRelationship,
                }
              : undefined,
        }).unwrap();
        form.resetForm({ values });
        shikshaMitraToast.success({
          message: result.admissionInquiryId
            ? 'Approved return connected to the admission inquiry.'
            : result.admissionApplicationId
              ? 'Approved return connected to the admission application.'
              : 'Return submitted under school review rules.',
        });
        if (result.admissionInquiryId && canViewInquiries)
          router.push(
            `${studentPaths.enrollment.inquiries}?inquiryId=${encodeURIComponent(result.admissionInquiryId)}`
          );
        else if (result.admissionApplicationId && canViewApplications)
          router.push(`${studentPaths.enrollment.applications}/${result.admissionApplicationId}`);
        else
          router.push(
            `${studentPaths.records.transitions}?view=${result.renewalCaseId ? 'renewals' : 'history'}`
          );
      } catch (error) {
        if (
          (error as { data?: { error?: { code?: string } } })?.data?.error?.code ===
          'Students:Records:RollProposalChanged'
        )
          setPreview(null);
        setFailure(
          'The return could not be started. Check the student exit, allowed school route, target placement, and admission eligibility. Your details are still available.'
        );
      }
    },
  });
  const options = useGetStudentRecordTransitionOptionsQuery({
    academicYearId: form.values.targetAcademicYearId || undefined,
    studentId: student?.studentId,
    admissionOfferingId:
      form.values.route === 'FreshApplication'
        ? form.values.admissionOfferingId || undefined
        : undefined,
  });
  const selectedRoute = (form.values.route || options.currentData?.returnPolicy.defaultRoute) as
    RecordsReturnRoute | undefined;
  const schoolMode = options.isError ? undefined : options.currentData?.rollAssignmentMode;
  const offering = options.currentData?.offerings.find(
    (item) => item.id === form.values.admissionOfferingId
  );
  const setValue = form.setFieldValue;
  const intake = offering?.inquiryIntake;
  const inquiryContextKey = JSON.stringify([
    form.values.studentId,
    form.values.targetAcademicYearId,
    offering?.id,
    intake?.form?.id,
    intake?.form?.version,
  ]);
  useEffect(() => {
    if (
      !intake ||
      form.values.route !== 'FreshApplication' ||
      form.values.entryPath !== 0 ||
      inquiryContext.current === inquiryContextKey
    )
      return;
    inquiryContext.current = inquiryContextKey;
    setValue('inquiryValues', returningInquiryDefaults(intake));
  }, [intake, form.values.route, form.values.entryPath, inquiryContextKey, setValue]);
  useEffect(() => {
    if (form.values.route !== 'FreshApplication') return;
    if (offering?.entryMode === 0 || offering?.entryMode === 1) {
      if (form.values.entryPath !== offering.entryMode) setValue('entryPath', offering.entryMode);
    } else if (!offering && form.values.entryPath !== '') setValue('entryPath', '');
  }, [form.values.route, form.values.entryPath, offering, setValue]);
  useEffect(() => {
    if (form.values.route !== 'ReuseProfile') return;
    if (schoolMode && schoolMode !== form.values.schoolRollMode)
      setValue('schoolRollMode', schoolMode);
    if (schoolMode && schoolMode !== 'both' && !form.values.rollAssignmentMode)
      setValue('rollAssignmentMode', schoolMode === 'automatic' ? 'automatic' : 'manual');
  }, [
    schoolMode,
    form.values.route,
    form.values.schoolRollMode,
    form.values.rollAssignmentMode,
    setValue,
  ]);
  const signature = JSON.stringify(form.values);
  const currentPreview = preview?.signature === signature ? preview.data : undefined;
  const runPreview = async () => {
    if (form.values.route !== 'ReuseProfile' || busy) return;
    const errors = await form.validateForm();
    if (Object.keys(errors).length) {
      form.setTouched({
        studentId: true,
        targetAcademicYearId: true,
        targetStandardId: true,
        targetDivisionId: true,
        reason: true,
        route: true,
        rollAssignmentMode: true,
        rollNumber: true,
      });
      setFailure('Review the student, target placement, and reason before previewing.');
      return;
    }
    setFailure(null);
    try {
      const data = await previewReturn({
        studentId: form.values.studentId,
        targetAcademicYearId: form.values.targetAcademicYearId,
        targetStandardId: form.values.targetStandardId,
        targetDivisionId: form.values.targetDivisionId,
        rollNumber: form.values.rollNumber,
        rollAssignmentMode: form.values.rollAssignmentMode,
        effectiveDate: form.values.effectiveDate,
        reason: form.values.reason.trim(),
        route: 'ReuseProfile',
        idempotencyKey,
      }).unwrap();
      setPreview({ data, signature });
    } catch {
      setPreview(null);
      setFailure(
        'The return preview could not be prepared. Review the saved student, target placement, and school rules, then retry.'
      );
    }
  };
  const guard = useUnsavedNavigation(form.dirty, { push: router.push });
  const selectStudent = (value: StudentDirectoryItem | null) => {
    setStudent(value);
    form.setFieldValue('studentId', value?.studentId ?? '');
    form.setFieldValue('route', '');
    form.setFieldValue('admissionOfferingId', '');
    form.setFieldValue('entryPath', '');
    form.setFieldValue('inquiryValues', emptyReturningInquiry());
    inquiryContext.current = '';
    form.setFieldValue('resumeApplicationId', '');
    [
      'guardianFirstName',
      'guardianLastName',
      'guardianMobile',
      'guardianEmail',
      'targetStandardId',
      'targetDivisionId',
      'reason',
    ].forEach((field) => form.setFieldValue(field, ''));
    form.setFieldValue('rollNumber', null);
    form.setFieldValue('rollAssignmentMode', undefined);
    form.setFieldValue('schoolRollMode', undefined);
    form.setFieldValue('guardianRelationship', 0);
  };
  return (
    <Box
      component="form"
      onSubmit={form.handleSubmit}
      noValidate
      aria-busy={busy}
      sx={{ position: 'relative' }}
    >
      {busy && (
        <Stack
          role="status"
          aria-live="polite"
          alignItems="center"
          justifyContent="center"
          spacing={1}
          sx={{
            position: 'absolute',
            inset: 0,
            zIndex: 1,
            bgcolor: (theme) => varAlpha(theme.vars.palette.background.paperChannel, 0.8),
          }}
        >
          <CircularProgress size={28} />
          <Typography variant="body2">
            {returnState.isLoading ? 'Submitting return…' : 'Preparing return preview…'}
          </Typography>
        </Stack>
      )}
      <Stack spacing={2}>
        <Alert severity="info">
          The permanent profile stays visible. The school return route determines the next admission
          or short onboarding steps.
        </Alert>
        {failure && <Alert severity="error">{failure}</Alert>}
        <RecordsStudentPicker onSelect={selectStudent} disabled={busy} />
        {student && (
          <Button
            component={RouterLink}
            href={`${studentPaths.records.studentList}?student=${student.studentId}`}
            disabled={busy}
            sx={{ alignSelf: 'flex-start' }}
          >
            Open permanent profile
          </Button>
        )}
        {options.isError && (
          <Alert
            severity="error"
            action={
              <Button color="inherit" disabled={busy} onClick={() => options.refetch()}>
                Retry
              </Button>
            }
          >
            Allowed return routes and placements could not be loaded.
          </Alert>
        )}
        <Box component="fieldset" disabled={busy} sx={{ border: 0, p: 0, m: 0, minWidth: 0 }}>
          <FormSectionCard icon="mdi:account-arrow-left-outline" title="Return route and placement">
            <CustomSelect
              label="Target academic year"
              value={form.values.targetAcademicYearId}
              options={(options.currentData?.academicYears ?? []).map((year) => ({
                value: year.id,
                label: year.name,
              }))}
              onChange={(value) => {
                form.setFieldValue('targetAcademicYearId', value);
                form.setFieldValue('targetStandardId', '');
                form.setFieldValue('targetDivisionId', '');
                form.setFieldValue('route', '');
                form.setFieldValue('admissionOfferingId', '');
                form.setFieldValue('entryPath', '');
                form.setFieldValue('inquiryValues', emptyReturningInquiry());
                inquiryContext.current = '';
                form.setFieldValue('resumeApplicationId', '');
                form.setFieldValue('rollAssignmentMode', undefined);
                form.setFieldValue('schoolRollMode', undefined);
                form.setFieldValue('rollNumber', null);
              }}
              disabled={busy}
            />
            <CustomSelect
              label="Return route"
              value={form.values.route}
              options={(options.currentData?.returnPolicy.allowedRoutes ?? []).map((value) => ({
                value,
                label: routes[value].title,
              }))}
              onChange={(value) => {
                form.setFieldValue('route', value);
                form.setFieldValue('admissionOfferingId', '');
                form.setFieldValue('entryPath', '');
                form.setFieldValue('inquiryValues', emptyReturningInquiry());
                inquiryContext.current = '';
                form.setFieldValue('resumeApplicationId', '');
              }}
              disabled={busy || !student || options.isFetching}
              helperText={
                selectedRoute
                  ? `School default: ${routes[options.currentData?.returnPolicy.defaultRoute ?? selectedRoute].title}`
                  : undefined
              }
              error={Boolean(form.touched.route && form.errors.route)}
            />
            {selectedRoute && (
              <Typography variant="body2" color="text.secondary">
                {routes[selectedRoute].detail}
              </Typography>
            )}
            {form.values.route === 'ReuseProfile' && (
              <>
                <CustomSelect
                  label="Class"
                  disabled={busy || options.isFetching}
                  value={form.values.targetStandardId}
                  options={(options.currentData?.standards ?? []).map((option) => ({
                    value: option.id,
                    label: option.name,
                  }))}
                  onChange={(value) => {
                    form.setFieldValue('targetStandardId', value);
                    form.setFieldValue('targetDivisionId', '');
                  }}
                  error={Boolean(form.touched.targetStandardId && form.errors.targetStandardId)}
                  helperText={
                    form.touched.targetStandardId ? form.errors.targetStandardId : undefined
                  }
                />
                <CustomSelect
                  label="Division"
                  disabled={busy || options.isFetching}
                  value={form.values.targetDivisionId}
                  options={(options.currentData?.divisions ?? [])
                    .filter((option) => option.parentId === form.values.targetStandardId)
                    .map((option) => ({ value: option.id, label: option.name }))}
                  onChange={(value) => form.setFieldValue('targetDivisionId', value)}
                  error={Boolean(form.touched.targetDivisionId && form.errors.targetDivisionId)}
                  helperText={
                    form.touched.targetDivisionId ? form.errors.targetDivisionId : undefined
                  }
                />
                <RollAssignmentControl
                  schoolMode={schoolMode}
                  mode={form.values.rollAssignmentMode}
                  number={form.values.rollNumber}
                  proposal={currentPreview?.proposedRollNumber}
                  disabled={busy || options.isFetching || options.isError}
                  error={
                    form.touched.rollAssignmentMode ? form.errors.rollAssignmentMode : undefined
                  }
                  numberError={form.touched.rollNumber ? form.errors.rollNumber : undefined}
                  onModeChange={(mode) => {
                    form.setFieldValue('rollAssignmentMode', mode);
                    form.setFieldValue('rollNumber', null);
                  }}
                  onNumberChange={(number) => form.setFieldValue('rollNumber', number)}
                />
              </>
            )}
            {form.values.route === 'FreshApplication' && (
              <CustomSelect
                label="Admission offering"
                disabled={busy || options.isFetching}
                value={form.values.admissionOfferingId}
                options={(options.currentData?.offerings ?? []).map((option) => ({
                  value: option.id,
                  label: option.name,
                }))}
                onChange={(value) => {
                  form.setFieldValue('admissionOfferingId', value);
                  form.setFieldValue('entryPath', '');
                  form.setFieldValue('inquiryValues', emptyReturningInquiry());
                  inquiryContext.current = '';
                }}
                error={Boolean(form.touched.admissionOfferingId && form.errors.admissionOfferingId)}
                helperText={
                  form.touched.admissionOfferingId
                    ? form.errors.admissionOfferingId
                    : 'The existing student identity remains linked.'
                }
              />
            )}
            {form.values.route === 'FreshApplication' &&
              offering &&
              (offering.entryMode === 2 ? (
                <CustomSelect
                  label="Admission entry path"
                  value={form.values.entryPath}
                  options={[
                    { value: 0, label: 'Inquiry' },
                    { value: 1, label: 'Direct registration' },
                  ]}
                  onChange={(value) =>
                    form.setFieldValue('entryPath', value === '' ? '' : Number(value))
                  }
                  disabled={busy || options.isFetching}
                  error={Boolean(form.touched.entryPath && form.errors.entryPath)}
                  helperText={
                    form.touched.entryPath && form.errors.entryPath
                      ? String(form.errors.entryPath)
                      : 'This offering allows both paths. Choose how Admissions should start.'
                  }
                />
              ) : (
                <Alert severity={offering.entryMode == null ? 'warning' : 'info'}>
                  {offering.entryMode === 0
                    ? 'After Records approval, Admissions starts with an inquiry.'
                    : offering.entryMode === 1
                      ? 'After Records approval, Admissions starts with direct registration.'
                      : 'The offering entry path is unavailable. Reload the school options before submitting.'}
                </Alert>
              ))}
            {form.values.route === 'FreshApplication' &&
              options.currentData?.freshApplicationRequiresRegistration && (
                <FormSectionCard
                  icon="mdi:account-child-outline"
                  title="Admission guardian contact"
                  description="This historical student has no linked admission applicant. Supply the current guardian contact; the permanent student identity is reused."
                >
                  {(
                    [
                      'guardianFirstName',
                      'guardianLastName',
                      'guardianMobile',
                      'guardianEmail',
                    ] as const
                  ).map((field, index) => (
                    <TextField
                      key={field}
                      disabled={busy}
                      label={
                        [
                          'Guardian first name',
                          'Guardian last name (optional)',
                          'Guardian mobile',
                          'Guardian email (optional)',
                        ][index]
                      }
                      name={field}
                      value={form.values[field]}
                      onChange={form.handleChange}
                      onBlur={form.handleBlur}
                      error={Boolean(form.touched[field] && form.errors[field])}
                      helperText={form.touched[field] ? form.errors[field] : undefined}
                      inputProps={{
                        maxLength:
                          field === 'guardianMobile' ? 32 : field === 'guardianEmail' ? 256 : 128,
                      }}
                    />
                  ))}
                  <CustomSelect
                    label="Guardian relationship"
                    disabled={busy}
                    value={form.values.guardianRelationship}
                    options={[
                      { value: 0, label: 'Parent' },
                      { value: 1, label: 'Guardian' },
                      { value: 2, label: 'Relative' },
                      { value: 3, label: 'Other' },
                    ]}
                    onChange={(value) => form.setFieldValue('guardianRelationship', Number(value))}
                  />
                </FormSectionCard>
              )}
            {form.values.route === 'ResumeStage' && (
              <CustomSelect
                label="Eligible application"
                disabled={busy || options.isFetching}
                value={form.values.resumeApplicationId}
                options={(options.currentData?.resumeApplications ?? []).map((option) => ({
                  value: option.id,
                  label: option.name,
                }))}
                onChange={(value) => form.setFieldValue('resumeApplicationId', value)}
                error={Boolean(form.touched.resumeApplicationId && form.errors.resumeApplicationId)}
                helperText={
                  form.touched.resumeApplicationId ? form.errors.resumeApplicationId : undefined
                }
              />
            )}
            {form.values.route === 'FreshApplication' && form.values.entryPath === 0 && intake && (
              <ReturningInquiryIntake
                intake={intake}
                values={form.values.inquiryValues}
                disabled={busy || options.isFetching}
                onChange={(values) => form.setFieldValue('inquiryValues', values)}
                errors={
                  form.submitCount > 0 && typeof form.errors.inquiryValues === 'object'
                    ? form.errors.inquiryValues
                    : undefined
                }
              />
            )}
            <TextField
              type="date"
              disabled={busy}
              label="Effective date"
              name="effectiveDate"
              value={form.values.effectiveDate}
              onChange={form.handleChange}
              slotProps={{ inputLabel: { shrink: true } }}
            />
            <TextField
              label="Reason for return"
              disabled={busy}
              name="reason"
              value={form.values.reason}
              onChange={form.handleChange}
              onBlur={form.handleBlur}
              multiline
              minRows={2}
              error={Boolean(form.touched.reason && form.errors.reason)}
              helperText={form.touched.reason ? form.errors.reason : undefined}
            />
          </FormSectionCard>
        </Box>
        {form.values.route === 'ReuseProfile' && (
          <>
            <Button
              type="button"
              variant="outlined"
              loading={previewState.isLoading}
              disabled={busy || options.isFetching || options.isError}
              onClick={runPreview}
            >
              Preview return
            </Button>
            {preview && (
              <Alert severity={currentPreview?.ready ? 'info' : 'warning'}>
                {!currentPreview
                  ? 'The return details changed. Preview again before submitting.'
                  : currentPreview.ready
                    ? 'The return preview passed. Submit it for the configured Records review.'
                    : currentPreview.issues.map((issue) => issue.message).join('; ')}
              </Alert>
            )}
          </>
        )}
        <Button
          type="submit"
          variant="contained"
          loading={returnState.isLoading}
          disabled={
            busy ||
            (form.values.route === 'ReuseProfile' &&
              (!currentPreview?.ready ||
                (currentPreview.rollAssignmentMode === 'automatic' &&
                  (!Number.isInteger(currentPreview.proposedRollNumber) ||
                    Number(currentPreview.proposedRollNumber) <= 0)))) ||
            !student ||
            !form.values.route ||
            (form.values.route === 'FreshApplication' &&
              (!offering || offering.entryMode == null || form.values.entryPath === '')) ||
            (form.values.route === 'FreshApplication' && form.values.entryPath === 0 && !intake) ||
            options.isFetching ||
            !options.currentData ||
            options.isError
          }
          sx={{ alignSelf: 'flex-start' }}
        >
          Start selected return route
        </Button>
        {guard.confirmation}
      </Stack>
    </Box>
  );
}
