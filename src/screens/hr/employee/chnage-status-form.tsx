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

import {
  getEmployeeStatusOptions,
  isNonActiveEmployeeStatus,
  changeStatusValidationSchema,
} from './change-status-utils';

const MANAGER_DEACTIVATION_WARNING =
  'This employee is currently assigned as a Reporting Manager for active staff members. Please assign a new manager to their team before making this employee inactive.';

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
    initialValues: {
      status: { label: EmployeeStatusType[status || 0], value: status, description: '' },
      effectiveDate: status === EmployeeStatusType.Active ? null : defaultEffectiveDate,
      remarks: '',
    },
    validationSchema: changeStatusValidationSchema,
    onSubmit: async (values) => {
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

        console.error(error);
        shikshaMitraToast.error({
          message:
            (error as any)?.data?.message ||
            (error as any)?.error ||
            `Failed to update status of ${employeeName}.`,
        });
      }
    },
  });
  const theme = useTheme();
  const selectedStatus = formik.values.status?.value;
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
    hasActiveReports || isCheckingManagerReports || hasDeactivationCheckError;

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
              formik.setFieldValue('status', newValue);
              if (newValue.value === EmployeeStatusType.Active) {
                formik.setFieldValue('effectiveDate', null);
              } else if (!formik.values.effectiveDate) {
                formik.setFieldValue('effectiveDate', defaultEffectiveDate);
              }
            }}
            size="small"
            disableClearable
            getOptionLabel={(option) => String(option.label)}
            renderOption={(props, option) => (
              <Box
                component="li"
                {...props}
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
                            ? theme.vars.palette.success.main
                            : option.value === EmployeeStatusType.Inactive
                              ? theme.palette.error.main
                              : option.value === EmployeeStatusType.Left
                                ? theme.vars.palette.info.main
                                : option.value === EmployeeStatusType.Retired
                                  ? theme.vars.palette.grey[500]
                                  : theme.vars.palette.grey[500],
                      }}
                    >
                      <Iconify icon="mdi:information" width={20} />
                    </IconButton>
                  </CustomTooltip>
                </Box>
              </Box>
            )}
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
          disabled={disableStatusUpdate}
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
