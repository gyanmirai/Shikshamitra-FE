import type { Dayjs } from 'dayjs';

import dayjs from 'dayjs';
import { useFormik } from 'formik';
import { LoadingButton } from '@mui/lab';
import { GlobalIcons } from 'src/utils/icons';
import { useTheme } from '@mui/material/styles';
import { Iconify } from 'src/components/iconify';
import React, { useState, useEffect } from 'react';
import { shikshaMitraToast } from 'src/components/toast';
import CustomTooltip from 'src/components/custom-tooltip';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { DialogScrollContent } from 'src/components/customDialog';
import useQueryAndMutation from 'src/redux/customQueryAndMutation';
import { EmployeeStatusType } from 'src/enums/employee-status-type';
import { useGetEmployeeActivationReadinessQuery } from 'src/redux/hr/compensation-revision-api';
import {
  useUpdateEmployeeStatusMutation,
  useGetEmployeeStatusDeactivationCheckQuery,
} from 'src/redux/hr/employeeApi';
import {
  Box,
  Alert,
  Stack,
  Dialog,
  Button,
  TextField,
  IconButton,
  Typography,
  Autocomplete,
  DialogActions,
  DialogContent,
} from '@mui/material';

import { HrSetupLink } from '../recovery/hr-setup-controls';
import { normalizeHrFailure } from '../recovery/hr-failure';
import {
  getEmployeeStatusOptions,
  isNonActiveEmployeeStatus,
  changeStatusValidationSchema,
} from './change-status-utils';

const MANAGER_DEACTIVATION_WARNING =
  'This staff member is currently assigned as a Reporting Manager for active staff members. Please assign a new manager to their team before making this staff member inactive.';

const MANAGER_DEACTIVATION_CHECK_ERROR =
  'Unable to verify reporting-manager assignments. Please try again.';

const REPORTING_MANAGER_ACTIVE_REPORTS_ERROR_CODE = 'HR:Employee:010032';

const ChangeStatusForm = ({
  handleClose,
  employeeId,
  status,
  employeeName,
}: {
  handleClose: () => void;
  employeeId: string;
  status: EmployeeStatusType;
  employeeName: string;
}) => {
  const options = getEmployeeStatusOptions(status);
  const defaultEffectiveDate = dayjs().endOf('month');
  const [warningOpen, setWarningOpen] = useState(false);
  const [activationError, setActivationError] = useState('');
  const [updateStatus, { isLoading }] = useQueryAndMutation({
    type: 'mutation',
    currentQueryAndMutation: useUpdateEmployeeStatusMutation,
    popupConfig: { error: false },
  });
  const formik = useFormik<{
    status: { label: EmployeeStatusType | string; value: number; description: string };
    effectiveDate: Dayjs | null;
    remarks: string;
  }>({
    validateOnMount: true,
    initialValues: {
      status: { label: EmployeeStatusType[status || 0], value: status, description: '' },
      effectiveDate: status === EmployeeStatusType.Active ? null : defaultEffectiveDate,
      remarks: '',
    },
    validationSchema: changeStatusValidationSchema,
    onSubmit: async (values) => {
      if (disableStatusUpdate) return;
      setActivationError('');
      try {
        await updateStatus({
          id: employeeId,
          body: {
            employeeStatusType: values.status.value,
            remarks: values.remarks,
            effectiveDate:
              values.status.value === EmployeeStatusType.Active
                ? null
                : values.effectiveDate?.format('YYYY-MM-DD'),
          },
        }).unwrap();
        shikshaMitraToast.success({
          message: `Status of ${employeeName} has been updated successfully.`,
        });
        handleClose();
      } catch (error) {
        const knownReportingManagerBlock =
          (error as any)?.data?.code === REPORTING_MANAGER_ACTIVE_REPORTS_ERROR_CODE ||
          (error as any)?.data?.error?.code === REPORTING_MANAGER_ACTIVE_REPORTS_ERROR_CODE ||
          String((error as any)?.data?.message || (error as any)?.error || '').includes(
            REPORTING_MANAGER_ACTIVE_REPORTS_ERROR_CODE
          );

        if (knownReportingManagerBlock) {
          setWarningOpen(true);
          return;
        }

        setActivationError(normalizeHrFailure(error).message);
        if (
          values.status.value === EmployeeStatusType.Active &&
          status !== EmployeeStatusType.Active
        )
          await activation.refetch();
      }
    },
  });
  const theme = useTheme();
  const selectedStatus = formik.values.status?.value;
  const activating =
    selectedStatus === EmployeeStatusType.Active && status !== EmployeeStatusType.Active;
  const activation = useGetEmployeeActivationReadinessQuery(employeeId, {
    skip: !activating || !employeeId,
    refetchOnMountOrArgChange: true,
    refetchOnFocus: true,
  });
  const activationBlocked =
    activating &&
    (activation.isFetching || activation.isError || !activation.currentData?.canActivate);
  const isNonActiveSelected = isNonActiveEmployeeStatus(selectedStatus);
  const {
    data: deactivationCheck,
    isLoading: deactivationCheckLoading,
    isFetching: deactivationCheckFetching,
    isError: deactivationCheckError,
  } = useGetEmployeeStatusDeactivationCheckQuery(employeeId, {
    skip: !employeeId || !isNonActiveSelected,
    refetchOnMountOrArgChange: true,
  });
  const isCheckingManagerReports = isNonActiveSelected
    ? deactivationCheckLoading || deactivationCheckFetching
    : false;
  const hasDeactivationCheckError = isNonActiveSelected && deactivationCheckError;
  const hasActiveReports =
    isNonActiveSelected &&
    !isCheckingManagerReports &&
    !hasDeactivationCheckError &&
    deactivationCheck?.canDeactivate === false;
  const disableStatusUpdate =
    hasActiveReports || isCheckingManagerReports || hasDeactivationCheckError || activationBlocked;

  useEffect(() => {
    if (hasActiveReports) {
      setWarningOpen(true);
      return;
    }

    if (hasDeactivationCheckError || !isNonActiveSelected || deactivationCheck?.canDeactivate) {
      setWarningOpen(false);
    }
  }, [
    deactivationCheck?.canDeactivate,
    hasActiveReports,
    hasDeactivationCheckError,
    isNonActiveSelected,
  ]);

  return (
    <>
      <DialogScrollContent>
        <Stack spacing={2}>
          <Autocomplete
            options={options}
            value={formik.values.status}
            onChange={(_, newValue) => {
              if (!newValue) {
                return;
              }

              formik.setValues(
                {
                  ...formik.values,
                  status: newValue,
                  effectiveDate:
                    newValue.value === EmployeeStatusType.Active
                      ? null
                      : formik.values.effectiveDate || defaultEffectiveDate,
                },
                true
              );
            }}
            size="small"
            disableClearable
            getOptionLabel={(option) => String(option.label)}
            renderOption={(props, option) => {
              const { key, ...optionProps } = props as typeof props & { key: React.Key };
              return (
                <Box
                  component="li"
                  key={key}
                  {...optionProps}
                  sx={{ display: 'flex', alignItems: 'center', gap: 1, width: '100%' }}
                >
                  {option.label}
                  <Box sx={{ marginLeft: 'auto' }}>
                    <CustomTooltip title={option.description} placement="right">
                      <IconButton
                        size="small"
                        sx={{
                          color:
                            option.value === EmployeeStatusType.Active
                              ? theme.palette.success.main
                              : option.value === EmployeeStatusType.Inactive
                                ? theme.palette.error.main
                                : option.value === EmployeeStatusType.Left
                                  ? theme.palette.info.main
                                  : option.value === EmployeeStatusType.Retired
                                    ? theme.palette.grey[500]
                                    : theme.palette.grey[500],
                        }}
                      >
                        <Iconify icon="mdi:information" width={20} />
                      </IconButton>
                    </CustomTooltip>
                  </Box>
                </Box>
              );
            }}
            renderInput={(params) => (
              <TextField
                {...params}
                size="small"
                label="Select Status"
                fullWidth
                error={formik.touched.status && Boolean(formik.errors.status)}
                helperText={formik.touched.status && (formik.errors.status as any)?.value}
              />
            )}
          />
          {formik.values.status.value !== EmployeeStatusType.Active && (
            <DatePicker
              label="Effective Date"
              value={formik.values.effectiveDate}
              onChange={(newValue) => formik.setFieldValue('effectiveDate', newValue)}
              slotProps={{
                textField: {
                  size: 'small',
                  fullWidth: true,
                  error: formik.touched.effectiveDate && Boolean(formik.errors.effectiveDate),
                  helperText:
                    formik.touched.effectiveDate && typeof formik.errors.effectiveDate === 'string'
                      ? formik.errors.effectiveDate
                      : undefined,
                },
              }}
            />
          )}
          <TextField
            fullWidth
            label="Remarks"
            name="remarks"
            value={formik.values.remarks}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            error={formik.touched.remarks && Boolean(formik.errors.remarks)}
            helperText={formik.touched.remarks && formik.errors.remarks}
            multiline
            rows={4}
          />
          {hasDeactivationCheckError && (
            <Alert severity="error" variant="outlined">
              {MANAGER_DEACTIVATION_CHECK_ERROR}
            </Alert>
          )}
          {activating && (
            <Alert severity={activation.isError ? 'error' : 'warning'} variant="outlined">
              <Stack spacing={1}>
                <Typography variant="body2">
                  {activation.isFetching
                    ? 'Checking activation requirements…'
                    : activation.isError
                      ? 'Unable to check activation requirements. Retry before activating this staff member.'
                      : activation.currentData?.canActivate
                        ? 'The current activation checks pass. The server will validate again when you update the status.'
                        : 'This staff member remains inactive until the required salary and statutory setup is complete.'}
                </Typography>
                {!activation.isFetching &&
                  !activation.isError &&
                  activation.currentData?.blockerCodes.map((code) => (
                    <Box key={code}>
                      <Typography variant="body2">{activationBlockerMessage(code)}</Typography>
                      <HrSetupLink
                        setup={code.startsWith('ESI_') ? 'staffPayroll' : 'salary'}
                        employeeId={employeeId}
                      />
                    </Box>
                  ))}
                <Button
                  size="small"
                  disabled={activation.isFetching || isLoading}
                  onClick={() => activation.refetch()}
                >
                  Recheck activation requirements
                </Button>
                <Typography variant="caption">
                  Setup opens in a new tab. Return here and recheck before activating.
                </Typography>
              </Stack>
            </Alert>
          )}
          {activationError && (
            <Alert severity="error" variant="outlined">
              {activationError}
            </Alert>
          )}
        </Stack>
      </DialogScrollContent>
      <DialogActions>
        <Button
          variant="outlined"
          onClick={handleClose}
          size="small"
          startIcon={<Iconify icon={GlobalIcons.cancel} />}
        >
          Cancel
        </Button>
        <LoadingButton
          data-testid="hr-employee-status-update-button"
          startIcon={<Iconify icon={GlobalIcons.edit} width={16} height={16} />}
          loading={isLoading}
          disabled={disableStatusUpdate || !formik.isValid}
          variant="contained"
          type="submit"
          size="small"
          onClick={(e: any) => formik.handleSubmit(e)}
        >
          Update
        </LoadingButton>
      </DialogActions>
      <Dialog
        data-testid="hr-employee-manager-deactivation-warning-dialog"
        open={warningOpen}
        onClose={() => setWarningOpen(false)}
        maxWidth="xs"
        fullWidth
      >
        <Box sx={{ px: 2, py: 1.75, borderBottom: (t) => `1px solid ${t.palette.divider}` }}>
          <Typography variant="h6" fontWeight={700}>
            Cannot Deactivate Manager
          </Typography>
        </Box>
        <DialogContent>
          <Typography variant="body2" color="text.secondary">
            {MANAGER_DEACTIVATION_WARNING}
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button variant="contained" size="small" onClick={() => setWarningOpen(false)}>
            OK
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default ChangeStatusForm;

export function activationBlockerMessage(code: string) {
  if (code === 'PAYROLL_SETUP_REQUIRED')
    return 'Salary structure is not configured for the required activation month. Complete salary setup, including PF membership review.';
  if (/^ESI_[A-Z0-9_]+$/.test(code))
    return `ESIC setup needs attention: ${code.slice(4).replaceAll('_', ' ').toLowerCase()}. Review statutory registration and salary setup.`;
  if (/^PF_[A-Z0-9_]+$/.test(code))
    return `PF enrollment needs attention: ${code.slice(3).replaceAll('_', ' ').toLowerCase()}. Review PF membership in salary setup.`;
  return 'A configured activation requirement needs review. Review salary and statutory setup or contact your HR administrator.';
}
