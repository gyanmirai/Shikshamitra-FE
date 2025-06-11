import React from 'react';
import { useFormik } from 'formik';

import { LoadingButton } from '@mui/lab';
import { Box, Stack, Button, TextField, DialogActions } from '@mui/material';

import { GlobalIcons } from 'src/utils/icons';

import useQueryAndMutation from 'src/redux/customQueryAndMutation';
import { useUpdateEmployeeStatusMutation } from 'src/redux/employee/employeeApi';
import { EmployeeStatusType, EmployeeStatusTypeArray } from 'src/enums/employee-status-type';

import { Iconify } from 'src/components/iconify';
import { Scrollbar } from 'src/components/scrollbar';
import CustomSelect from 'src/components/custom-select';
import { shikshaMitraToast } from 'src/components/toast';

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
  const [updateStatus, { isLoading }] = useQueryAndMutation({
    type: 'mutation',
    currentQueryAndMutation: useUpdateEmployeeStatusMutation,
  });
  const formik = useFormik({
    initialValues: {
      status: status || EmployeeStatusType.Active,
      remarks: '',
    },
    onSubmit: async (values) => {
      try {
        const res = await updateStatus({
          id: employeeId,
          employeeStatusType: values.status,
        }).unwrap();
        shikshaMitraToast.success({
          message: `Status of ${employeeName} has been updated successfully.`,
        });
        handleClose();
      } catch (error) {
        console.log(error);
      }
    },
  });

  return (
    <Box component="form" onSubmit={formik.handleSubmit}>
      <Scrollbar sx={{ p: 2, bgcolor: 'background.neutral' }}>
        <Stack spacing={2}>
          <CustomSelect
            options={EmployeeStatusTypeArray.map((item, index) => ({
              label: EmployeeStatusType[index],
              value: index,
            }))}
            value={formik.values.status}
            onChange={(val) => {
              formik.setFieldValue('status', val);
            }}
            label="Select Status"
            formControlProps={{
              fullWidth: true,
              sx: {
                maxWidth: 'unset',
              },
            }}
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
          startIcon={<Iconify icon={GlobalIcons.cancel} />}
        >
          Cancel
        </Button>
        <LoadingButton
          startIcon={<Iconify icon={GlobalIcons.submit} />}
          loading={isLoading}
          variant="contained"
          type="submit"
        >
          Update
        </LoadingButton>
      </DialogActions>
    </Box>
  );
};

export default ChangeStatusForm;
