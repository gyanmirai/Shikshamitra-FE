import type { HrPolicyImpactPreview, EffectiveEmployeePolicies } from 'src/redux/hr/hr-policy-api';

import dayjs from 'dayjs';
import * as Yup from 'yup';
import { useState } from 'react';
import { useFormik } from 'formik';
import { useRouter } from 'src/routes/hooks';
import { shikshaMitraToast } from 'src/components/toast';
import { HrNotice } from 'src/screens/hr/components/hr-notice';
import { useGetLeavePoliciesQuery } from 'src/redux/hr/leaveApi';
import { parseApiProblemDetail } from 'src/utils/api-problem-details';
import { useUnsavedNavigation } from 'src/hooks/use-unsaved-navigation';
import {
  useGetPayrollPoliciesQuery,
  useGetAttendancePoliciesQuery,
  useUpsertEmployeePolicyOverrideMutation,
  usePreviewPolicyAssignmentImpactMutation,
  useDisableEmployeePolicyOverrideMutation,
} from 'src/redux/hr/hr-policy-api';
import {
  Box,
  Alert,
  Radio,
  Stack,
  Button,
  Drawer,
  Divider,
  Backdrop,
  MenuItem,
  FormLabel,
  TextField,
  RadioGroup,
  Typography,
  FormControl,
  CircularProgress,
  FormControlLabel,
} from '@mui/material';

import { DrawerHeader } from '../policies/components/HRPolicySharedUI';
import {
  buildEmployeePolicyOverride,
  hydrateEmployeePolicyOverrideFromPreview,
  buildEmployeePolicyOverridePreviewRequest,
} from './employee-policy-override-utils';

export function PayrollProfilePolicyEditor({
  employeeId,
  academicYearId,
  preview,
  onClose,
}: {
  employeeId: string;
  academicYearId: string;
  preview: EffectiveEmployeePolicies;
  onClose: () => void;
}) {
  const router = useRouter();
  const [error, setError] = useState('');
  const [impact, setImpact] = useState<HrPolicyImpactPreview | null>(null);
  const [previewImpact, previewState] = usePreviewPolicyAssignmentImpactMutation();
  const [upsert, upsertState] = useUpsertEmployeePolicyOverrideMutation();
  const [disable, disableState] = useDisableEmployeePolicyOverrideMutation();
  const payroll = useGetPayrollPoliciesQuery({ academicYearId, maxResultCount: 100 });
  const attendance = useGetAttendancePoliciesQuery({ academicYearId, maxResultCount: 100 });
  const leave = useGetLeavePoliciesQuery({ academicYearId, page: 1, pageSize: 100 });
  const formik = useFormik({
    initialValues: {
      ...hydrateEmployeePolicyOverrideFromPreview(preview, dayjs().format('YYYY-MM-DD')),
      policyOverrideEffectiveFrom: dayjs().format('YYYY-MM-DD'),
      policyOverrideAssignmentReason: '',
    },
    validationSchema: Yup.object({
      policyOverridePayrollPolicyId: Yup.string().when('policyOverrideEnabled', {
        is: true,
        then: (schema) => schema.required('Select a payroll policy'),
      }),
      policyOverrideAttendancePolicyId: Yup.string().when('policyOverrideEnabled', {
        is: true,
        then: (schema) => schema.required('Select an attendance policy'),
      }),
      policyOverrideLeavePolicyId: Yup.string().when('policyOverrideEnabled', {
        is: true,
        then: (schema) => schema.required('Select a leave policy'),
      }),
      policyOverrideEffectiveFrom: Yup.string()
        .required('Select an effective date')
        .test('date', 'Enter a valid date', (value) => Boolean(value && dayjs(value).isValid())),
      policyOverrideAssignmentReason: Yup.string()
        .trim()
        .required('Enter a reason for this change'),
    }),
    onSubmit: async (values) => {
      setError('');
      try {
        const request = buildEmployeePolicyOverridePreviewRequest(
          values,
          academicYearId,
          employeeId
        );
        if (!request) {
          setError(
            'Choose an employee-specific assignment to change the current organization policies.'
          );
          return;
        }
        const result = await previewImpact(request).unwrap();
        setImpact(result);
      } catch (err) {
        setError(parseApiProblemDetail(err).detail);
      }
    },
  });
  const busy =
    formik.isSubmitting ||
    previewState.isLoading ||
    upsertState.isLoading ||
    disableState.isLoading;
  const { requestNavigation, confirmation } = useUnsavedNavigation(formik.dirty, {
    push: router.push,
  });
  const close = () => {
    if (!busy) requestNavigation(onClose);
  };
  const save = async () => {
    if (!impact || busy || impact.blockingWarnings?.length) return;
    setError('');
    try {
      if (impact.requiresConfirmation && !impact.confirmationToken)
        throw new Error('Impact confirmation is unavailable. Review the assignment again.');
      if (formik.values.policyOverrideEnabled) {
        const body = buildEmployeePolicyOverride(
          formik.values,
          academicYearId,
          impact.confirmationToken
        );
        if (!body) throw new Error('Select all required policies.');
        await upsert({ ...body, employeeId }).unwrap();
      } else {
        await disable({
          employeeId,
          academicYearId,
          assignmentId: formik.values.policyOverrideAssignmentId || undefined,
          effectiveDate: formik.values.policyOverrideEffectiveFrom,
          assignmentReason: formik.values.policyOverrideAssignmentReason,
          confirmationToken: impact.confirmationToken,
        }).unwrap();
      }
      formik.resetForm();
      shikshaMitraToast.success({ message: 'Policy assignment saved.' });
      onClose();
    } catch (err) {
      setError(parseApiProblemDetail(err).detail);
      setImpact(null);
    }
  };
  const choicesUnavailable =
    payroll.isFetching ||
    attendance.isFetching ||
    leave.isFetching ||
    payroll.isError ||
    attendance.isError ||
    leave.isError;
  const select = (
    field: string,
    label: string,
    items: Array<{
      id: string;
      name?: string;
      policyTitle?: string;
      status?: string;
      isActive?: boolean;
    }>
  ) => {
    const meta = formik.getFieldMeta(field);
    return (
      <TextField
        {...formik.getFieldProps(field)}
        select
        fullWidth
        size="small"
        label={label}
        disabled={busy || Boolean(impact) || choicesUnavailable}
        error={meta.touched && Boolean(meta.error)}
        helperText={meta.touched && meta.error}
      >
        {items
          .filter((item) => item.status?.toLowerCase() === 'active' || item.isActive)
          .map((item) => (
            <MenuItem key={item.id} value={item.id}>
              {item.name || item.policyTitle}
            </MenuItem>
          ))}
      </TextField>
    );
  };
  const blocked = Boolean(impact?.blockingWarnings?.length);
  return (
    <Drawer
      anchor="right"
      open
      onClose={close}
      slotProps={{
        paper: {
          sx: { width: { xs: '100%', sm: 560 } },
          role: 'dialog',
          'aria-label': 'Change assignment',
        },
      }}
    >
      <Box
        component="form"
        onSubmit={(event) => {
          event.preventDefault();
          event.stopPropagation();
          formik.submitForm();
        }}
        sx={{ display: 'flex', flexDirection: 'column', height: 1 }}
      >
        <DrawerHeader title="Change assignment" onClose={close} closeDisabled={busy} />
        <Divider />
        <Stack
          spacing={2}
          sx={{ p: 2, flex: 1, overflow: 'auto', position: 'relative' }}
          useFlexGap
          aria-busy={busy}
        >
          <Backdrop
            open={busy}
            sx={{ position: 'absolute', zIndex: 1, bgcolor: 'action.disabledBackground' }}
          >
            <CircularProgress size={24} aria-label="Saving or reviewing changes" />
          </Backdrop>
          <FormControl disabled={busy || Boolean(impact)}>
            <FormLabel id="staff-policy-mode">Policy assignment</FormLabel>
            <RadioGroup
              aria-labelledby="staff-policy-mode"
              value={formik.values.policyOverrideEnabled ? 'employee' : 'organization'}
              onChange={(_, value) =>
                formik.setFieldValue('policyOverrideEnabled', value === 'employee')
              }
            >
              <FormControlLabel
                value="organization"
                control={<Radio />}
                label="Use organization policies"
              />
              <FormControlLabel
                value="employee"
                control={<Radio />}
                label="Assign employee-specific policies"
              />
            </RadioGroup>
          </FormControl>
          {formik.values.policyOverrideEnabled ? (
            <>
              {(payroll.isError || attendance.isError || leave.isError) && (
                <Alert
                  severity="error"
                  action={
                    <Button
                      size="small"
                      onClick={() => {
                        payroll.refetch();
                        attendance.refetch();
                        leave.refetch();
                      }}
                    >
                      Retry
                    </Button>
                  }
                >
                  Unable to load policy choices.
                </Alert>
              )}
              {select(
                'policyOverridePayrollPolicyId',
                'Payroll policy *',
                payroll.data?.items || []
              )}
              {select(
                'policyOverrideAttendancePolicyId',
                'Attendance policy *',
                attendance.data?.items || []
              )}
              {select('policyOverrideLeavePolicyId', 'Leave policy *', leave.data?.items || [])}
            </>
          ) : (
            <Typography variant="body2" color="text.secondary">
              Policies will follow the applicable organization assignment from the effective date.
            </Typography>
          )}
          <TextField
            {...formik.getFieldProps('policyOverrideEffectiveFrom')}
            label="Effective from *"
            type="date"
            size="small"
            slotProps={{ inputLabel: { shrink: true } }}
            disabled={busy || Boolean(impact)}
            error={
              formik.touched.policyOverrideEffectiveFrom &&
              Boolean(formik.errors.policyOverrideEffectiveFrom)
            }
            helperText={
              formik.touched.policyOverrideEffectiveFrom &&
              formik.errors.policyOverrideEffectiveFrom
            }
          />
          <TextField
            {...formik.getFieldProps('policyOverrideAssignmentReason')}
            label="Reason *"
            size="small"
            multiline
            minRows={2}
            disabled={busy || Boolean(impact)}
            error={
              formik.touched.policyOverrideAssignmentReason &&
              Boolean(formik.errors.policyOverrideAssignmentReason)
            }
            helperText={
              formik.touched.policyOverrideAssignmentReason &&
              formik.errors.policyOverrideAssignmentReason
            }
          />
          {impact && (
            <Stack spacing={1}>
              <Typography variant="subtitle2">Review assignment impact</Typography>
              <Typography variant="body2">
                {impact.resolutionSummary || 'Review the impact before saving this assignment.'}
              </Typography>
              {[...(impact.blockingWarnings || []), ...(impact.warnings || [])].map(
                (warning, index) => (
                  <HrNotice
                    key={`${warning.code}-${index}`}
                    severity={warning.severity === 'blocking' ? 'error' : warning.severity}
                  >
                    {warning.message}
                  </HrNotice>
                )
              )}
              {impact.affectedPayrollMonths?.length > 0 && (
                <Typography variant="body2">
                  Affected payroll:{' '}
                  {impact.affectedPayrollMonths.map((month) => month.label).join(', ')}
                </Typography>
              )}
            </Stack>
          )}
        </Stack>
        <Divider />
        <Stack spacing={1} sx={{ p: 2 }}>
          {error && <Alert severity="error">{error}</Alert>}
          <Stack direction="row" justifyContent="flex-end" spacing={1} useFlexGap flexWrap="wrap">
            <Button size="small" variant="outlined" onClick={close} disabled={busy}>
              Cancel
            </Button>
            {impact ? (
              <>
                <Button
                  size="small"
                  variant="outlined"
                  onClick={() => setImpact(null)}
                  disabled={busy}
                >
                  Back
                </Button>
                <Button
                  size="small"
                  onClick={save}
                  variant="contained"
                  color="inherit"
                  disabled={blocked}
                  loading={busy}
                >
                  Confirm assignment
                </Button>
              </>
            ) : (
              <Button
                size="small"
                type="submit"
                variant="contained"
                color="inherit"
                disabled={
                  !formik.dirty || (formik.values.policyOverrideEnabled && choicesUnavailable)
                }
                loading={busy}
              >
                Review assignment
              </Button>
            )}
          </Stack>
        </Stack>
        {confirmation}
      </Box>
    </Drawer>
  );
}
