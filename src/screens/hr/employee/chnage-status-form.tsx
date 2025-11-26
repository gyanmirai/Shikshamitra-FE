import React from 'react';
import { useFormik } from 'formik';
import { LoadingButton } from '@mui/lab';
import { GlobalIcons } from 'src/utils/icons';
import { useTheme } from '@mui/material/styles';
import { Iconify } from 'src/components/iconify';
import { Scrollbar } from 'src/components/scrollbar';
import { shikshaMitraToast } from 'src/components/toast';
import CustomTooltip from 'src/components/custom-tooltip';
import useQueryAndMutation from 'src/redux/customQueryAndMutation';
import { useUpdateEmployeeStatusMutation } from 'src/redux/employee/employeeApi';
import {
  Box,
  Stack,
  Button,
  TextField,
  IconButton,
  Autocomplete,
  DialogActions,
} from '@mui/material';
import {
  EmployeeStatusType,
  EmployeeStatusTypeArray,
  EmployeeStatusTypeInformation,
} from 'src/enums/employee-status-type';

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
  const options = EmployeeStatusTypeArray.map((item, index) => ({
    label: EmployeeStatusType[index],
    value: index,
    description: EmployeeStatusTypeInformation[item as keyof typeof EmployeeStatusTypeInformation], // Helper function to get status description
  }));
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
    onSubmit: async (values) => {
      try {
        await updateStatus({
          id: employeeId,
          employeeStatusType: values.status.value,
        }).unwrap();
        shikshaMitraToast.success({
          message: `Status of ${employeeName} has been updated successfully.`,
        });
        handleClose();
      } catch (error) {
        console.error(error);
      }
    },
  });
  const theme = useTheme();

  return (
    <Box component="form" onSubmit={formik.handleSubmit}>
      <Scrollbar sx={{ p: 2, bgcolor: 'background.neutral' }}>
        <Stack spacing={2}>
          <Autocomplete
            options={options}
            value={formik.values.status}
            onChange={(_, newValue) => {
              formik.setFieldValue('status', newValue || 0);
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
              <TextField {...params} size="small" label="Select Status" fullWidth />
            )}
          />
          <TextField
            fullWidth
            label="Remarks"
            name="remarks"
            value={formik.values.remarks}
            onChange={formik.handleChange}
            multiline
            rows={4}
          />
        </Stack>
      </Scrollbar>
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
        >
          Update
        </LoadingButton>
      </DialogActions>
    </Box>
  );
};

export default ChangeStatusForm;
