import React from 'react';
import { useFormik } from 'formik';

import { LoadingButton } from '@mui/lab';
import { Box, Button, DialogActions } from '@mui/material';

import { ConvertRtkResponse } from 'src/utils/convrtRtkResponse';

import useQueryAndMutation from 'src/redux/customQueryAndMutation';
import { useUpdateEmployeeStatusMutation } from 'src/redux/employee/employeeApi';
import { EmployeeStatusType, EmployeeStatusTypeArray } from 'src/enums/employee-status-type';

import { Scrollbar } from 'src/components/scrollbar';
import CustomSelect from 'src/components/custom-select';

const ChangeStatusForm = ({
  handleClose,
  employeeId,
  status,
}: {
  handleClose: () => void;
  employeeId: string;
  status: EmployeeStatusType;
}) => {
  const [updateStatus, { isLoading }] = useQueryAndMutation({
    type: 'mutation',
    currentQueryAndMutation: useUpdateEmployeeStatusMutation,
  });
  const formik = useFormik({
    initialValues: {
      status: status || EmployeeStatusType.Active,
    },
    onSubmit: async (values) => {
      try {
        const res = await updateStatus({
          id: employeeId,
          employeeStatusType: values.status,
        });
        ConvertRtkResponse(res);
        handleClose();
      } catch (error) {
        console.log(error);
      }
    },
  });

  return (
    <Box component="form" onSubmit={formik.handleSubmit}>
      <Scrollbar sx={{ p: 2, bgcolor: 'background.neutral' }}>
        <CustomSelect
          options={EmployeeStatusTypeArray.map((item, index) => ({
            label: EmployeeStatusType[index],
            value: index,
          }))}
          value={formik.values.status}
          onChange={(val) => {
            formik.setFieldValue('status', val);
          }}
          label="Change Status"
          formControlProps={{
            fullWidth: true,
            sx: {
              maxWidth: 'unset',
            },
          }}
        />
      </Scrollbar>
      <DialogActions>
        <Button variant="outlined" onClick={handleClose}>
          Cancel
        </Button>
        <LoadingButton loading={isLoading} variant="contained" type="submit">
          Change Status
        </LoadingButton>
      </DialogActions>
    </Box>
  );
};

export default ChangeStatusForm;
