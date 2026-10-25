/* eslint-disable react/no-this-in-sfc */
import type { Dayjs } from 'dayjs';
import type { RootState } from 'src/redux/store';

import dayjs from 'dayjs';
import * as Yup from 'yup';
import { useFormik } from 'formik';
import { LoadingButton } from '@mui/lab';
import { useSelector } from 'react-redux';
import { useSession } from 'next-auth/react';
import { GlobalIcons } from 'src/utils/icons';
import { Iconify } from 'src/components/iconify';
import { DatePicker } from '@mui/x-date-pickers';
import React, { useMemo, useEffect } from 'react';
import CustomSelect from 'src/components/custom-select';
import FileUploader from 'src/components/custom-upload';
import { useGetYearQuery } from 'src/redux/year/yearApi';
import ShakingTextField from 'src/components/shaking-text-field';
import { DialogScrollContent } from 'src/components/customDialog';
import useQueryAndMutation from 'src/redux/customQueryAndMutation';
import { useLazyGetEmployeeQuery } from 'src/redux/hr/employeeApi';
import { EmployeeStatusType } from 'src/enums/employee-status-type';
import { useFormikErrorFocus } from 'src/hooks/use-formik-error-focus';
import { PaginatedSearchSelect } from 'src/components/paginated-search-select';
import { useGetPolicyAssignmentPreviewQuery } from 'src/redux/hr/hr-policy-api';
import { BackPopUpChecked } from 'src/components/back-popup-check/BackPopUpCheck';
import { info, error, primary, success, warning, secondary } from 'src/theme/core/palette';
import {
  Box,
  Grid,
  Chip,
  Stack,
  Alert,
  Switch,
  Button,
  Backdrop,
  TextField,
  Typography,
  DialogActions,
  CircularProgress,
  FormControlLabel,
} from '@mui/material';
import {
  useGetMyLeaveBalanceQuery,
  useGetSelfLeaveBalanceQuery,
  useCreateLeaveRequestMutation,
  useRejectLeaveRequestMutation,
  useApproveLeaveRequestMutation,
  useCreateMyLeaveRequestMutation,
} from 'src/redux/hr/leaveApi';

import { normalizeLeaveStatus } from './leave-status.utils';
import {
  SELF_OPTION,
  countLeaveUnits,
  LEAVE_PAST_DATE,
  isAdminFromProfile,
  type EmployeeOption,
  LEAVE_NOTICE_PERIOD,
  parseApiProblemDetail,
  LEAVE_POLICY_INACTIVE,
  LEAVE_POLICY_NOT_FOUND,
  LEAVE_MAX_DAYS_EXCEEDED,
  getMinimumLeaveStartDate,
  isDateWithinAcademicYear,
  isSelectedPaidTypeVisible,
  LEAVE_INSUFFICIENT_BALANCE,
  buildEmployeeSelectOptions,
  getLeaveNoticePeriodMessage,
  isLeaveNoticePeriodSatisfied,
  getLeaveRequestBalanceWarning,
  shouldEnforceLeaveNoticePeriod,
  LEAVE_TARGET_EMPLOYEE_REQUIRED,
  LEAVE_NO_BUSINESS_DAYS_IN_RANGE,
  buildCreateLeaveRequestFormData,
  LEAVE_DATES_OUTSIDE_ACADEMIC_YEAR,
  isEmployeeSelectionValidForCreate,
  resolveAcademicYearIdForLeaveDate,
  resolveLeavePolicyPreviewEmployeeId,
  getVisiblePaidTypeOptionsForEffectivePolicy,
  isLeavePolicyPreviewEmployeeResolutionBlocked,
} from './leave-request.utils';

// ----------------------------------------------------------------------

export const CALENDAR_COLOR_OPTIONS = [
  primary.main,
  secondary.main,
  info.main,
  info.darker,
  success.main,
  warning.main,
  error.main,
  error.darker,
];
type AddLeaveRequestProps = {
  editData?: any;
  mode?: 'hr' | 'self';
  handleClose?: (e: any, isSubmit: boolean) => void;
};

interface FormValues {
  employee: { id: string; label: string } | null;
  paidType: string;
  startDate: Dayjs | null;
  endDate: Dayjs | null;
  halfDay: boolean;
  reason: string;
  status?: string | number;
  rejectionReason: string;
  docs: unknown;
}

const AddLeaveRequest = (props: AddLeaveRequestProps) => {
  // Destructure props to get editData and handleClose
  const { editData, handleClose, mode = 'hr' } = props;
  const isSelfMode = mode === 'self';
  const [getEmployees] = useQueryAndMutation({
    type: 'mutation',
    currentQueryAndMutation: useLazyGetEmployeeQuery,
  });

  // Mutation hook for adding new leave request
  const [addLeave, { isLoading }] = useQueryAndMutation({
    type: 'mutation',
    currentQueryAndMutation: isSelfMode
      ? useCreateMyLeaveRequestMutation
      : useCreateLeaveRequestMutation,
  });

  // Mutation hooks for approving / rejecting an existing leave request
  const [approveLeave, { isLoading: isApproveLoading }] = useQueryAndMutation({
    type: 'mutation',
    currentQueryAndMutation: useApproveLeaveRequestMutation,
  });
  const [rejectLeave, { isLoading: isRejectLoading }] = useQueryAndMutation({
    type: 'mutation',
    currentQueryAndMutation: useRejectLeaveRequestMutation,
  });

  const { currentYear } = useSelector((state: RootState) => state.globalState);
  const authEmployeeId = useSelector((state: any) => state.auth?.employee?.id);
  const { data: yearsData } = useGetYearQuery(undefined, {
    refetchOnMountOrArgChange: false,
    refetchOnFocus: false,
    refetchOnReconnect: false,
  });
  const { data: session } = useSession();
  const isAdminUser = isAdminFromProfile((session as any)?.profile);
  const shouldUseAdminSelectionRules = isAdminUser && !isSelfMode;

  const minimumLeaveStartDate = getMinimumLeaveStartDate();
  const leaveNoticePeriodMessage = getLeaveNoticePeriodMessage();

  const {
    initialValues,
    errors,
    touched,
    setFieldValue,
    values,
    handleSubmit,
    resetForm,
    isSubmitting,
    isValidating,
    submitCount,
    setFieldError,
  } = useFormik({
    enableReinitialize: true,
    initialValues: {
      employee: editData?.employeeId
        ? { id: editData.employeeId, label: editData.employeeName || '' }
        : shouldUseAdminSelectionRules
          ? null
          : SELF_OPTION,
      paidType: editData?.paidType || '',
      reason: editData?.reason || editData?.description || '',
      startDate: editData?.startDate ? dayjs(editData?.startDate) : null,
      endDate: editData?.endDate ? dayjs(editData?.endDate) : null,
      halfDay: Boolean(editData?.halfDay),
      rejectionReason: editData?.rejectionReason || '',
      status: editData?.status,
      docs: editData?.attachmentUrl || '',
    },
    validationSchema: Yup.object().shape({
      employee: Yup.object().nullable().required('Staff is required'),
      startDate: Yup.mixed()
        .required('Start Date is required')
        .test(
          'is-valid-dayjs',
          'Start Date must be a valid date',
          (value) => value && dayjs(value as any).isValid()
        )
        // eslint-disable-next-line func-names
        .test('minimum-notice-period', leaveNoticePeriodMessage, function (value) {
          if (
            !shouldEnforceLeaveNoticePeriod(
              mode,
              isAdminUser,
              this.parent.employee as EmployeeOption | null
            )
          ) {
            return true;
          }

          return isLeaveNoticePeriodSatisfied(value ? dayjs(value as any) : null);
        }),

      endDate: Yup.mixed()
        .required('End Date is required')
        .test(
          'is-valid-dayjs',
          'End Date must be a valid date',
          (value) => value && dayjs(value as any).isValid()
        )
        // eslint-disable-next-line func-names
        .test('is-after-start-date', 'End Date cannot be before Start Date', function (value) {
          const { startDate } = this.parent;
          if (!value || !startDate) return true;
          return dayjs(value as any).valueOf() >= dayjs(startDate as any).valueOf();
        })
        // eslint-disable-next-line func-names
        .test('half-day-single-date', 'Half-day leave must be for one date', function (value) {
          const { startDate, halfDay } = this.parent;
          if (!halfDay || !value || !startDate) return true;
          return dayjs(value as any).isSame(dayjs(startDate as any), 'day');
        }),
      halfDay: Yup.boolean(),
      paidType: Yup.string().required('Paid type is required'),
      reason: Yup.string()
        .min(5, 'Reason must be at least 5 characters')
        .max(500, 'Reason must not exceed 500 characters')
        .required('Reason for leave is required'),
      status: Yup.string().nullable(),
      rejectionReason: Yup.string().when('status', {
        is: (status: unknown) => normalizeLeaveStatus(status) === 'REJECTED',
        then: (schema) => schema.required('Rejection reason is required'),
        otherwise: (schema) => schema.nullable(),
      }),
    }),
    onSubmit: async (formValues: FormValues, { setSubmitting }) => {
      try {
        setSubmitting(true);

        if (editData) {
          // --- Update flow: approve or reject the existing leave request ---
          if (normalizeLeaveStatus(formValues.status) === 'REJECTED') {
            await rejectLeave({
              id: editData.id,
              body: { rejectionReason: formValues.rejectionReason },
            });
          } else {
            // Covers Pending → Approve and re-approving a previously Rejected leave
            await approveLeave({ id: editData.id, body: {} });
          }
        } else {
          if (
            !isEmployeeSelectionValidForCreate(
              formValues.employee as EmployeeOption | null,
              shouldUseAdminSelectionRules
            )
          ) {
            setFieldError('employee', 'Please select a staff member to create leave.');
            return;
          }

          const isWithinCurrentAcademicYear = isDateWithinAcademicYear(
            formValues.startDate,
            currentYear as any
          );
          const availableAcademicYears = yearsData?.items || [];

          if (!isWithinCurrentAcademicYear && availableAcademicYears.length === 0) {
            setFieldError(
              'startDate',
              'Academic years are still loading. Please try again in a moment.'
            );
            return;
          }

          const resolvedAcademicYearId = resolveAcademicYearIdForLeaveDate(
            formValues.startDate,
            availableAcademicYears,
            isWithinCurrentAcademicYear ? currentYear?.id : undefined
          );

          if (!resolvedAcademicYearId) {
            setFieldError('startDate', 'Unable to resolve academic year for selected start date.');
            return;
          }
          if (isEffectivePreviewEmployeeResolutionBlocked) {
            setFieldError(
              'paidType',
              'Resolving staff profile for leave policy preview. Please wait.'
            );
            return;
          }
          if (hasBlockingEffectivePolicyState) {
            setFieldError(
              'paidType',
              'No effective leave policy is assigned to this staff member for the selected date.'
            );
            return;
          }
          if (isEffectivePolicyFetching || effectivePolicyError || hasNoAllowedPaidTypes) {
            setFieldError(
              'paidType',
              isEffectivePolicyFetching
                ? 'Resolving effective leave policy. Please wait.'
                : effectivePolicyError
                  ? 'Resolve the effective leave policy before submitting.'
                  : 'No active paid or unpaid buckets are available from the effective leave policy.'
            );
            return;
          }
          if (!isSelectedPaidTypeVisible(formValues.paidType, visiblePaidTypeOptions)) {
            setFieldError(
              'paidType',
              'Selected paid type is not available for the effective leave policy.'
            );
            return;
          }
          if (leaveBalanceWarning) {
            setFieldError('paidType', leaveBalanceWarning);
            return;
          }

          // --- Create flow: build multipart/form-data body as per API contract ---
          const formData = buildCreateLeaveRequestFormData({
            employee: formValues.employee as EmployeeOption | null,
            paidType: formValues.paidType,
            startDate: formValues.startDate,
            endDate: formValues.endDate,
            halfDay: formValues.halfDay,
            reason: formValues.reason,
            docs: formValues.docs,
          });

          const createResult: any = await addLeave({
            academicYearId: resolvedAcademicYearId,
            body: formData,
          });

          if (createResult?.error) {
            const parsedError = parseApiProblemDetail(createResult.error);
            if (parsedError.errorCode === LEAVE_TARGET_EMPLOYEE_REQUIRED) {
              setFieldError('employee', 'Please select a staff member to create leave.');
            }
            if (
              parsedError.errorCode === LEAVE_PAST_DATE ||
              parsedError.errorCode === LEAVE_NOTICE_PERIOD ||
              parsedError.errorCode === LEAVE_DATES_OUTSIDE_ACADEMIC_YEAR
            ) {
              setFieldError('startDate', parsedError.detail || leaveNoticePeriodMessage);
            }
            if (
              parsedError.errorCode === LEAVE_POLICY_NOT_FOUND ||
              parsedError.errorCode === LEAVE_POLICY_INACTIVE ||
              parsedError.errorCode === LEAVE_INSUFFICIENT_BALANCE
            ) {
              setFieldError('paidType', parsedError.detail || 'Please select a valid paid type.');
            }
            if (
              parsedError.errorCode === LEAVE_MAX_DAYS_EXCEEDED ||
              parsedError.errorCode === LEAVE_NO_BUSINESS_DAYS_IN_RANGE
            ) {
              setFieldError(
                'endDate',
                parsedError.detail || 'Please check the selected leave dates.'
              );
            }
            return;
          }
        }

        handleClose?.(null, true);
        resetForm();
      } catch (e) {
        console.error(e);
      } finally {
        setSubmitting(false);
      }
    },
  });
  useEffect(() => {
    if (!editData) {
      resetForm();
    }
  }, [editData, resetForm]);

  const catalogAcademicYearId = useMemo(() => {
    if (editData || !currentYear?.id) {
      return currentYear?.id as string | undefined;
    }

    if (!values.startDate) {
      return currentYear.id;
    }

    const resolvedAcademicYearId = resolveAcademicYearIdForLeaveDate(
      values.startDate,
      yearsData?.items || [],
      currentYear.id
    );

    return resolvedAcademicYearId || currentYear.id;
  }, [currentYear, editData, values.startDate, yearsData?.items]);

  const effectivePreviewEmployeeId = resolveLeavePolicyPreviewEmployeeId(
    values.employee,
    authEmployeeId,
    mode
  );
  const isEffectivePreviewEmployeeResolutionBlocked = isLeavePolicyPreviewEmployeeResolutionBlocked(
    values.employee,
    authEmployeeId,
    mode
  );
  const effectivePreviewDate =
    values.startDate?.isValid?.() && values.startDate
      ? values.startDate.format('YYYY-MM-DD')
      : dayjs().format('YYYY-MM-DD');
  const {
    data: effectivePolicyPreview,
    isFetching: isEffectivePolicyFetching,
    error: effectivePolicyError,
  } = useGetPolicyAssignmentPreviewQuery(
    {
      academicYearId: catalogAcademicYearId,
      date: effectivePreviewDate,
      employeeId: effectivePreviewEmployeeId,
    },
    {
      skip: !catalogAcademicYearId || !effectivePreviewEmployeeId || Boolean(editData),
    }
  );

  const hasResolvedEffectivePreviewEmployee =
    Boolean(effectivePreviewEmployeeId) || isEffectivePreviewEmployeeResolutionBlocked;
  const visiblePaidTypeOptions = useMemo(
    () =>
      getVisiblePaidTypeOptionsForEffectivePolicy(
        effectivePolicyPreview?.leavePolicy || null,
        hasResolvedEffectivePreviewEmployee,
        isEffectivePolicyFetching,
        Boolean(effectivePolicyError)
      ),
    [
      effectivePolicyError,
      effectivePolicyPreview?.leavePolicy,
      hasResolvedEffectivePreviewEmployee,
      isEffectivePolicyFetching,
    ]
  );
  const hasBlockingEffectivePolicyState =
    hasResolvedEffectivePreviewEmployee &&
    !isEffectivePreviewEmployeeResolutionBlocked &&
    !isEffectivePolicyFetching &&
    !effectivePolicyError &&
    !effectivePolicyPreview?.leavePolicy;
  const hasNoAllowedPaidTypes =
    hasResolvedEffectivePreviewEmployee &&
    !isEffectivePreviewEmployeeResolutionBlocked &&
    !isEffectivePolicyFetching &&
    !effectivePolicyError &&
    Boolean(effectivePolicyPreview?.leavePolicy) &&
    visiblePaidTypeOptions.length === 0;
  const shouldUseSelfBalance = isSelfMode || values.employee?.id === SELF_OPTION.id;
  const { data: selfLeaveBalanceData, isFetching: isSelfLeaveBalanceFetching } =
    useGetSelfLeaveBalanceQuery(
      { academicYearId: catalogAcademicYearId },
      {
        skip:
          Boolean(editData) ||
          !catalogAcademicYearId ||
          !effectivePreviewEmployeeId ||
          !shouldUseSelfBalance,
      }
    );
  const { data: employeeLeaveBalanceData, isFetching: isEmployeeLeaveBalanceFetching } =
    useGetMyLeaveBalanceQuery(
      { academicYearId: catalogAcademicYearId, employeeId: effectivePreviewEmployeeId },
      {
        skip:
          Boolean(editData) ||
          !catalogAcademicYearId ||
          !effectivePreviewEmployeeId ||
          shouldUseSelfBalance,
      }
    );

  useEffect(() => {
    if (editData) return;
    if (!values.paidType) return;
    if (isEffectivePreviewEmployeeResolutionBlocked || isEffectivePolicyFetching) return;
    const existsInPolicy = visiblePaidTypeOptions.some((item: any) => item?.id === values.paidType);
    if (!existsInPolicy) {
      setFieldValue('paidType', '');
      setFieldError(
        'paidType',
        'Selected paid type is no longer available. Please choose another paid type.'
      );
    }
  }, [
    editData,
    isEffectivePolicyFetching,
    isEffectivePreviewEmployeeResolutionBlocked,
    setFieldError,
    setFieldValue,
    values.paidType,
    visiblePaidTypeOptions,
  ]);

  useEffect(() => {
    if (!values.halfDay || !values.startDate) {
      return;
    }

    if (!values.endDate || !values.endDate.isSame(values.startDate, 'day')) {
      setFieldValue('endDate', values.startDate, false);
    }
  }, [setFieldValue, values.endDate, values.halfDay, values.startDate]);

  const requestedUnits = countLeaveUnits(values.startDate, values.endDate, values.halfDay);
  const selectedLeaveBalanceData = shouldUseSelfBalance
    ? selfLeaveBalanceData
    : employeeLeaveBalanceData;
  const isSelectedLeaveBalanceFetching = shouldUseSelfBalance
    ? isSelfLeaveBalanceFetching
    : isEmployeeLeaveBalanceFetching;
  const leaveBalanceWarning =
    isSelectedLeaveBalanceFetching || editData
      ? null
      : getLeaveRequestBalanceWarning(selectedLeaveBalanceData, values.paidType, requestedUnits);
  const isLeaveRequestSubmitting = isSubmitting || isLoading || isApproveLoading || isRejectLoading;
  useFormikErrorFocus({ errors, submitCount, isSubmitting, isValidating });
  const enforceLeaveNoticePeriod = shouldEnforceLeaveNoticePeriod(
    mode,
    isAdminUser,
    values.employee as EmployeeOption | null
  );
  const hasLeaveNoticePeriodError =
    !editData && enforceLeaveNoticePeriod && !isLeaveNoticePeriodSatisfied(values.startDate);

  return (
    <Box
      component="form"
      noValidate
      onSubmit={(event) => {
        event.preventDefault();
        if (
          !editData &&
          !isLeaveRequestSubmitting &&
          !hasLeaveNoticePeriodError &&
          !leaveBalanceWarning
        )
          handleSubmit(event);
      }}
      sx={{ display: 'flex', flexDirection: 'column', minHeight: 0, height: '100%' }}
    >
      <Backdrop
        open={isLeaveRequestSubmitting}
        sx={{
          zIndex: (theme) => theme.zIndex.modal + 1,
          color: 'primary.main',
          backgroundColor: 'rgba(255, 255, 255, 0.45)',
          backdropFilter: 'blur(2px)',
        }}
      >
        <Stack spacing={1.5} alignItems="center">
          <CircularProgress color="inherit" />
          <Typography variant="body2" fontWeight={600} color="text.primary">
            Submitting...
          </Typography>
        </Stack>
      </Backdrop>
      <DialogScrollContent>
        <BackPopUpChecked initialValues={initialValues} currentValues={values}>
          <Grid container spacing={3}>
            {!isSelfMode && (
              <Grid size={{ xs: 12 }}>
                <ShakingTextField error={!!touched.employee && !!errors.employee}>
                  <PaginatedSearchSelect
                    label="Staff *"
                    fetchOptions={async (query, page) => {
                      if (page > 1) return { data: [], hasMore: false };
                      const res = await getEmployees({
                        page: 1,
                        pageSize: 500,
                        search: query,
                        status: EmployeeStatusType.Active,
                      }).unwrap();
                      const items: EmployeeOption[] = (
                        Array.isArray(res) ? res : res?.items || []
                      ).map((item: any) => ({
                        label: item.fullName,
                        id: item.id,
                        status: item.status ?? item.employeeStatusType,
                      }));
                      return {
                        data: buildEmployeeSelectOptions(items, shouldUseAdminSelectionRules),
                        hasMore: false,
                      };
                    }}
                    value={values.employee}
                    isOptionEqualToValue={(option, value) => option.id === value.id}
                    renderOption={(prop, option: any) => (
                      <li {...prop} key={option.id}>
                        {option.label}
                      </li>
                    )}
                    getOptionLabel={(option: any) => option?.label || ''}
                    minChars={0}
                    onChange={(_, value) => setFieldValue('employee', value)}
                    debounceMs={400}
                    error={!!touched.employee && !!errors.employee}
                    helperText={(touched.employee && (errors.employee as string)) || ''}
                    disabled={!!editData}
                    size="small"
                  />
                </ShakingTextField>
              </Grid>
            )}

            {!editData &&
            (effectivePreviewEmployeeId || isEffectivePreviewEmployeeResolutionBlocked) ? (
              <Grid size={{ xs: 12 }}>
                <Stack spacing={1}>
                  {isEffectivePreviewEmployeeResolutionBlocked ? (
                    <Alert severity="warning">
                      Resolving staff profile for leave policy preview. Please wait.
                    </Alert>
                  ) : null}
                  {effectivePolicyPreview?.leavePolicy ? (
                    <Chip
                      size="small"
                      color="primary"
                      variant="outlined"
                      sx={{ alignSelf: 'flex-start' }}
                      label={`Effective leave policy: ${
                        effectivePolicyPreview.leavePolicy.name ||
                        effectivePolicyPreview.leavePolicy.policyTitle ||
                        effectivePolicyPreview.leavePolicy.title ||
                        '-'
                      }`}
                    />
                  ) : null}
                  {hasBlockingEffectivePolicyState ? (
                    <Alert severity="warning">
                      No effective leave policy is assigned to this staff member for the selected
                      date.
                    </Alert>
                  ) : null}
                  {effectivePolicyError ? (
                    <Alert severity="warning">
                      Could not resolve the staff leave policy. Resolve the effective leave policy
                      before submitting.
                    </Alert>
                  ) : null}
                  {hasNoAllowedPaidTypes ? (
                    <Alert severity="warning">
                      The effective leave policy has no active paid or unpaid buckets for the
                      selected date.
                    </Alert>
                  ) : null}
                </Stack>
              </Grid>
            ) : null}

            <Grid size={{ xs: 12 }}>
              <ShakingTextField error={!!touched.paidType && !!errors.paidType}>
                <CustomSelect
                  isLoading={
                    isEffectivePreviewEmployeeResolutionBlocked || isEffectivePolicyFetching
                  }
                  options={visiblePaidTypeOptions}
                  label="Paid Type *"
                  value={values.paidType}
                  name="paidType"
                  valueKey="id"
                  disabled={
                    !!editData ||
                    isEffectivePreviewEmployeeResolutionBlocked ||
                    isEffectivePolicyFetching ||
                    Boolean(effectivePolicyError) ||
                    hasBlockingEffectivePolicyState ||
                    hasNoAllowedPaidTypes
                  }
                  labelKey="name"
                  error={!!touched.paidType && !!errors.paidType}
                  helperText={(touched.paidType && errors.paidType) || ''}
                  onChange={(value) => {
                    const paidType = typeof value === 'string' ? value : '';
                    setFieldValue('paidType', paidType);
                  }}
                />
              </ShakingTextField>
            </Grid>

            <Grid size={{ xs: 12, md: 6 }}>
              <ShakingTextField error={!!touched.startDate && !!errors.startDate}>
                <DatePicker
                  label="Start Date *"
                  value={values.startDate}
                  disabled={!!editData}
                  format="DD/MM/YYYY"
                  disablePast
                  minDate={enforceLeaveNoticePeriod ? minimumLeaveStartDate : undefined}
                  onChange={(value) => {
                    setFieldValue('startDate', value);
                    if (values.halfDay) {
                      setFieldValue('endDate', value);
                    }
                  }}
                  slotProps={{
                    textField: {
                      fullWidth: true,
                      size: 'small',
                      error: !!touched.startDate && !!errors.startDate,
                      helperText: touched.startDate && (errors.startDate as string),
                    },
                  }}
                />
              </ShakingTextField>
            </Grid>

            <Grid size={{ xs: 12, md: 6 }}>
              <ShakingTextField error={!!touched.endDate && !!errors.endDate}>
                <DatePicker
                  label="End Date *"
                  value={values.endDate}
                  disabled={!!editData || values.halfDay}
                  format="DD/MM/YYYY"
                  disablePast
                  minDate={values.startDate || undefined}
                  onChange={(value) => setFieldValue('endDate', value)}
                  slotProps={{
                    textField: {
                      fullWidth: true,
                      size: 'small',
                      error: !!touched.endDate && !!errors.endDate,
                      helperText: touched.endDate && (errors.endDate as string),
                    },
                  }}
                />
              </ShakingTextField>
            </Grid>

            <Grid size={{ xs: 12 }}>
              <Stack
                direction={{ xs: 'column', sm: 'row' }}
                spacing={1.5}
                alignItems={{ xs: 'flex-start', sm: 'center' }}
                justifyContent="space-between"
                sx={{
                  border: '1px solid',
                  borderColor: 'divider',
                  borderRadius: 1,
                  px: 1.5,
                  py: 1,
                }}
              >
                <FormControlLabel
                  control={
                    <Switch
                      checked={values.halfDay}
                      disabled={!!editData}
                      onChange={(event) => {
                        const { checked } = event.target;
                        setFieldValue('halfDay', checked);
                        if (checked && values.startDate) {
                          setFieldValue('endDate', values.startDate);
                        }
                      }}
                    />
                  }
                  label="Half day"
                />
                <Typography variant="body2" color="text.secondary">
                  Total requested days: {requestedUnits}
                </Typography>
              </Stack>
            </Grid>

            {leaveBalanceWarning ? (
              <Grid size={{ xs: 12 }}>
                <Alert severity="warning">{leaveBalanceWarning}</Alert>
              </Grid>
            ) : null}

            <Grid size={{ xs: 12 }}>
              <ShakingTextField error={touched.reason && Boolean(errors.reason)}>
                <TextField
                  fullWidth
                  multiline
                  rows={4}
                  name="reason"
                  label="Reason for leave *"
                  value={values.reason}
                  onChange={(e) => setFieldValue('reason', e.target.value)}
                  disabled={!!editData}
                  error={touched.reason && Boolean(errors.reason)}
                  helperText={touched.reason && errors.reason}
                />
              </ShakingTextField>
            </Grid>
            <Grid size={{ xs: 12 }}>
              <FileUploader
                // disabled={!!editData}
                // @ts-ignore
                value={values.docs}
                multiple={false}
                onChange={(value) => {
                  setFieldValue('docs', value);
                }}
                primaryText="Upload Supporting Document (Optional)"
                secondaryText="Accepted: PNG, JPG, PDF (max 5MB)"
              />
              {/* <UploadBox
                value={values.docs}
                disabled={editData}
                // onRemove={() => handleRemoveFile(setFieldValue)}
                isPreview
                placeholder={
                  <Stack spacing={0.5} alignItems="center">
                    <Iconify icon="eva:cloud-upload-fill" width={40} />
                    <Typography variant="body2">Upload Document</Typography>
                    <Typography variant="body2" sx={{ fontSize: '12px' }}>
                      Please upload an image or PDF file (maximum size: 5MB)
                    </Typography>
                  </Stack>
                }
                sx={{ py: 1, flexGrow: 1, height: 'auto', width: '100%', mb: 2 }}
                onDrop={(acceptedFiles) => {
                  const file = acceptedFiles?.[0];

                  if (!file) return;
                  const reader = new FileReader();
                  reader.readAsDataURL(file);
                  reader.onload = () => {
                    const base64String = reader.result;
                    setFieldValue('docs', base64String);
                  };
                }}
              /> */}
              {/* <UploadButton
                onChange={(e) => {
                  const file = e?.target?.files?.[0];
                  
                  if (!file) return;
                  const reader = new FileReader();
                  reader.readAsDataURL(file);
                  reader.onload = () => {
                    const base64String = reader.result;
                    setFieldValue('docs', base64String);
                  };
                }}
                fileInputProps={{
                  accept: 'image/*,.pdf',
                }}
                variant="outlined"
                fullWidth
                disabled={editData}
              >
                Upload Document
              </UploadButton> */}
              {/* {values.docs && (
                <Box
                  sx={{
                    display: 'flex',
                    flexDirection: 'row',
                    alignItems: 'center',
                    height: 70,
                    width: 70,
                    borderRadius: 1,
                    boxShadow: 'var(--shadows-2)',
                    gap: 1,
                    mt: 1,
                    position: 'relative',
                  }}
                >
                  <Box height="100%" width="100%">
                    {values.docs.includes('data:image') ? (
                      <img
                        src={values.docs}
                        alt="imagefile"
                        style={{ height: '100%', width: '100%' }}
                      />
                    ) : (
                      <Iconify
                        icon="mdi:file-pdf"
                        sx={{
                          color: 'error.main',
                          cursor: 'pointer',
                          width: '100%',
                          height: '100%',
                        }}
                        onClick={() => {
                          window.open(values.docs, '_blank');
                        }}
                      />
                    )}
                  </Box>
                  <Iconify
                    icon="mdi:close"
                    width={16}
                    sx={{
                      position: 'absolute',
                      top: -8,
                      right: -8,
                      cursor: 'pointer',
                      color: 'grey.600',
                    }}
                    onClick={() => handleRemoveFile(setFieldValue)}
                  />
                </Box>
              )} */}

              {/* <Upload
                {...uploadProps}
                thumbnail
                value={values.docs}
                onDrop={(acceptedFiles) => {
                  const file = acceptedFiles[0];
                  const reader = new FileReader();
                  reader.readAsDataURL(file);
                  reader.onload = () => {
                    const base64String = reader.result;
                    setFieldValue('docs', base64String);
                  };
                }}
                multiple={false}
                onDelete={() => handleRemoveFile(setFieldValue)}
                onRemoveAll={() => handleRemoveAllFiles(values, setFieldValue)}
                disabled={editData}
              /> */}
            </Grid>
          </Grid>
        </BackPopUpChecked>
      </DialogScrollContent>
      <DialogActions>
        <Button
          variant="outlined"
          size="small"
          startIcon={<Iconify icon={GlobalIcons.cancel} />}
          disabled={isLeaveRequestSubmitting}
          onClick={(e) => {
            handleClose?.(e, false);
            resetForm();
          }}
        >
          Cancel
        </Button>
        {!editData && (
          <LoadingButton
            loading={isLeaveRequestSubmitting}
            startIcon={<Iconify icon={GlobalIcons.submit} width={20} height={20} />}
            disabled={
              isLeaveRequestSubmitting || hasLeaveNoticePeriodError || Boolean(leaveBalanceWarning)
            }
            type="submit"
            size="small"
            variant="contained"
          >
            Submit
          </LoadingButton>
        )}

        {editData && normalizeLeaveStatus(values.status) !== 'APPROVED' && (
          <LoadingButton
            loading={isLeaveRequestSubmitting}
            onClick={(e: any) => {
              handleSubmit(e);
            }}
            startIcon={<Iconify icon={GlobalIcons.submit} />}
            disabled={isLeaveRequestSubmitting}
            size="small"
          >
            {normalizeLeaveStatus(values.status) === 'REJECTED' ? 'Approve' : 'Update Status'}
          </LoadingButton>
        )}
      </DialogActions>
    </Box>
  );
};

export default AddLeaveRequest;
