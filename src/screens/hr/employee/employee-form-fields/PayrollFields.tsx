import { Box, Grid, MenuItem, TextField } from '@mui/material';

import { useBoolean } from 'src/hooks/use-boolean';

import { RenderPfRules } from './RenderPfRules';
import { CardActions } from './InformationFields';

import type { FieldsType } from './types';

const RenderPayrollFields = (props: any) => {
  const { formik, isMainForm } = props;
  const { values, handleChange } = formik;
  const isEditable = useBoolean(isMainForm);
  const handleSave = async () => {
    await formik?.submitForm?.();
    formik.resetForm({ values: formik.values });
  };
  const handleCancel = () => {
    formik.resetForm();
  };
  return (
    <Box>
      {!isMainForm && (
        <Box display="flex" justifyContent="flex-end" p={1}>
          <CardActions
            isLoading={formik.isSubmitting}
            isEdit={isEditable}
            onSave={handleSave}
            onCancel={handleCancel}
          />
        </Box>
      )}
      <Grid container spacing={2}>
        <Grid item xs={12} sm={4}>
          <TextField
            size="small"
            fullWidth
            disabled={!isEditable.value}
            label="Bank Name"
            name="bankName"
            placeholder="Enter Bank Name"
            value={values.bankName || ''}
            onChange={handleChange}
          />
        </Grid>
        <Grid item xs={12} sm={4}>
          <TextField
            size="small"
            fullWidth
            disabled={!isEditable.value}
            label="Branch Name"
            name="branchName"
            placeholder="Enter Branch Name"
            value={values.branchName || ''}
            onChange={handleChange}
          />
        </Grid>
        <Grid item xs={12} sm={4}>
          <TextField
            size="small"
            fullWidth
            disabled={!isEditable.value}
            label="Account Holder Name"
            name="accountHolderName"
            placeholder="Enter Account Holder Name"
            value={values.accountHolderName || ''}
            onChange={handleChange}
          />
        </Grid>
        <Grid item xs={12} sm={4}>
          <TextField
            size="small"
            fullWidth
            disabled={!isEditable.value}
            label="Account Number"
            name="accountNumber"
            placeholder="Enter Account Number"
            value={values.accountNumber || ''}
            onChange={handleChange}
          />
        </Grid>
        <Grid item xs={12} sm={4}>
          <TextField
            size="small"
            fullWidth
            disabled={!isEditable.value}
            label="IFSC Code"
            name="ifscCode"
            placeholder="Enter IFSC Code"
            value={values.ifscCode || ''}
            onChange={handleChange}
          />
        </Grid>
        <Grid item xs={12} sm={4}>
          <TextField
            size="small"
            select
            fullWidth
            disabled={!isEditable.value}
            label="PF Type"
            name="pfType"
            placeholder="Select PF Type"
            value={values.pfType || ''}
            onChange={handleChange}
          >
            <MenuItem value="Type A">Type A</MenuItem>
            <MenuItem value="Type B">Type B</MenuItem>
          </TextField>
        </Grid>
        <Grid item xs={12} sm={4}>
          <RenderPfRules
          // value={values.pfRule || ''}
          // onChange={(e) => setFormValues({ ...formValues, pfRule: e.target?.value ?? e })}
          />
        </Grid>
        <Grid item xs={12} sm={4}>
          <TextField
            size="small"
            fullWidth
            disabled={!isEditable.value}
            label="EPF Number"
            name="epfNumber"
            placeholder="Enter EPF Number"
            value={values.epfNumber || ''}
            onChange={handleChange}
          />
        </Grid>
        <Grid item xs={12} sm={4}>
          <TextField
            size="small"
            fullWidth
            disabled={!isEditable.value}
            label="UAN Number"
            name="uanNumber"
            placeholder="Enter UAN Number"
            value={values.uanNumber || ''}
            onChange={handleChange}
          />
        </Grid>
        <Grid item xs={12} sm={4}>
          <TextField
            size="small"
            type="number"
            fullWidth
            disabled={!isEditable.value}
            label="Basic Salary"
            name="basicSalary"
            placeholder="Enter Basic Salary"
            value={values.basicSalary || ''}
            onChange={handleChange}
          />
        </Grid>
        <Grid item xs={12} sm={4}>
          <TextField
            size="small"
            fullWidth
            disabled={!isEditable.value}
            label="Punch Id"
            name="punchId"
            placeholder="Enter Punch Id"
            value={values.punchId || ''}
            onChange={handleChange}
          />
        </Grid>
        <Grid item xs={12} sm={4}>
          <TextField
            size="small"
            fullWidth
            disabled={!isEditable.value}
            label="TDS Percentage"
            name="tdsPercentage"
            placeholder="Enter TDS Percentage"
            value={values.tdsPercentage || ''}
            onChange={handleChange}
          />
        </Grid>
        <Grid item xs={12} sm={4}>
          <TextField
            size="small"
            fullWidth
            disabled={!isEditable.value}
            label="TDS Amount"
            name="tdsAmount"
            placeholder="Enter TDS Amount"
            value={values.tdsAmount || ''}
            onChange={handleChange}
          />
        </Grid>
      </Grid>
    </Box>
  );
};

export const PayrollFields: FieldsType[] = [
  {
    type: 'text',
    label: 'Bank Name',
    name: 'bankName',
    placeholder: 'Enter Bank Name',
    gridProps: { xs: 12, md: 12 },
    renderComp(props) {
      return <RenderPayrollFields {...props} />;
    },
  },
];
