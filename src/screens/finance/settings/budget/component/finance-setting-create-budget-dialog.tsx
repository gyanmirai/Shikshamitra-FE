import React from 'react';
import * as Yup from 'yup';
import { useFormik } from 'formik';

import { Box, Button, TextField, DialogActions } from '@mui/material';

import { Scrollbar } from 'src/components/scrollbar';
import CustomDialog from 'src/components/customDialog';
import CustomSelect from 'src/components/custom-select';

interface FinanceSettingCreateBudgetDialogProps {
  dialogValue: boolean;
  data: any;
  onSave: (values: any) => void;
  onClose: () => void;
  isEdit: boolean;
}

interface FormikValue {
  departmentName: string;
  allocatedAmount: string;
  startDate: string;
  endDate: string;
}

const validationSchema = Yup.object({
  departmentName: Yup.string().required("Department Name can't be empty"),
  allocatedAmount: Yup.string().required("Allocated Amount Percentage can't be empty"),
  // startDate: Yup.array().min(1, "Please select at least one region").required(),
  // endDate: Yup.array().min(1, "Please select at least one category").required(),
});

const FinanceSettingCreateBudgetDialog: React.FC<FinanceSettingCreateBudgetDialogProps> = ({
  dialogValue,
  data,
  onClose,
  onSave,
  isEdit,
}) => {
  const formik = useFormik<FormikValue>({
    initialValues: {
      departmentName: isEdit ? (data.departmentName ?? '') : '',
      allocatedAmount: isEdit ? (data.allocatedAmount ?? '') : '',
      startDate: isEdit ? (data.incomeType ?? '') : '',
      endDate: isEdit ? (data.effectiveDate ?? '') : '',
    },
    validationSchema,
    onSubmit: (values) => {
      onSave(values);
      console.log('Form Submitted type', values);
    },
  });
  return (
    <CustomDialog
      title={`${isEdit ? 'Allocate Budget to Categories' : ' Create New Budget'}`}
      open={dialogValue}
      handleClose={onClose}
    >
      <Scrollbar>
        <Box px="15px">
          <form onSubmit={formik.handleSubmit}>
            <Box pt="10px" display="flex" flexDirection="column" gap={3}>
              <CustomSelect
                label="Department/Project Name"
                options={[
                  { value: 'IT', label: 'IT' },
                  { value: 'HR', label: 'HR' },
                  { value: 'XYZ', label: 'XYZ' },
                ]}
                value={formik.values.departmentName}
                onChange={(e) => formik.setFieldValue('departmentName', e)}
                formControlProps={{ sx: { minWidth: 195 } }}
                disabled={isEdit}
                error={formik.touched.departmentName && Boolean(formik.errors.departmentName)}
                // @ts-ignore
                helperText={formik.touched.departmentName && formik.errors.departmentName}
              />
              <TextField
                name="allocatedAmount"
                label="Allocated Amount"
                value={formik.values.allocatedAmount}
                onChange={formik.handleChange}
                size="small"
                error={formik.touched.allocatedAmount && Boolean(formik.errors.allocatedAmount)}
                helperText={formik.touched.allocatedAmount && formik.errors.allocatedAmount}
              />
              {/* <DatePicker
                label="Start Date"
                name="startDate"
                // @ts-ignore
                value={formik.values.startDate}
                onChange={(value) => formik.setFieldValue('startDate', value)}
                format="DD-MM-YYYY"
                slotProps={{ textField: { fullWidth: true } }}
              />
              <DatePicker
                label="End Date"
                name="endDate"
                // @ts-ignore
                value={formik.values.endDate}
                onChange={(value) => formik.setFieldValue('endDate', value)}
                format="DD-MM-YYYY"
                slotProps={{ textField: { fullWidth: true } }}
              /> */}
            </Box>
            <DialogActions>
              <Button onClick={onClose} variant="contained" size="small">
                Cancel
              </Button>
              <Button type="submit" variant="contained" size="small">
                Save
              </Button>
            </DialogActions>
          </form>
        </Box>
      </Scrollbar>
    </CustomDialog>
  );
};

export default FinanceSettingCreateBudgetDialog;
