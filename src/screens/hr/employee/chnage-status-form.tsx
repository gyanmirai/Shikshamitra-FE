import React from 'react';
import { useFormik } from 'formik';
import { LoadingButton } from '@mui/lab';
import { GlobalIcons } from 'src/utils/icons';
import { useTheme } from '@mui/material/styles';
import { Iconify } from 'src/components/iconify';
import { shikshaMitraToast } from 'src/components/toast';
import CustomTooltip from 'src/components/custom-tooltip';
import { DialogScrollContent } from 'src/components/customDialog';
import useQueryAndMutation from 'src/redux/customQueryAndMutation';
import { EmployeeStatusType } from 'src/enums/employee-status-type';
import { useUpdateEmployeeStatusMutation } from 'src/redux/hr/employeeApi';
import {
  Box,
  Stack,
  Button,
  TextField,
  IconButton,
  Autocomplete,
  DialogActions,
} from '@mui/material';

import { getEmployeeStatusOptions, changeStatusValidationSchema } from './change-status-utils';

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
  const [updateStatus, { isLoading }] = useQueryAndMutation({
    type: 'mutation',
    currentQueryAndMutation: useUpdateEmployeeStatusMutation,
  });
  const formik = useFormik<{
    status: { label: EmployeeStatusType | string; value: number; description: string };
    remarks: string;
  }>({
    initialValues: {
      status: { label: EmployeeStatusType[status || 0], value: status, description: '' },
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
          },
        }).unwrap();
        shikshaMitraToast.success({
          message: `Status of ${employeeName} has been updated successfully.`,
        });
        handleClose();
      } catch (error) {
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

  return (
    <>
      <DialogScrollContent>
        <Stack spacing={2}>
          <Autocomplete
            options={options}
            value={formik.values.status}
            onChange={(_, newValue) => {
              formik.setFieldValue('status', newValue);
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
          startIcon={<Iconify icon={GlobalIcons.edit} width={16} height={16} />}
          loading={isLoading}
          variant="contained"
          type="submit"
          size="small"
          onClick={(e: any) => formik.handleSubmit(e)}
        >
          Update
        </LoadingButton>
      </DialogActions>
    </>
  );
};

export default ChangeStatusForm;
