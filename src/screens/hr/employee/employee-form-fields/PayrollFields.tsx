import { useBoolean } from 'src/hooks/use-boolean';
import { Box, Grid, MenuItem, TextField } from '@mui/material';

import { RenderPfRules } from './RenderPfRules';
import { CardActions } from './InformationFields';

import type { FieldsType } from './types';

const RenderPayrollFields = (props: any) => {
  const { formik, isMainForm } = props;
  const { values, handleChange } = formik;
  const isEditable = useBoolean(isMainForm);
  const handleSave = async (): Promise<void | false | undefined> => {
    const validation = await formik.validateForm();
    await formik?.submitForm?.();
    if (Object.keys(validation).length > 0) return false;

    formik.resetForm({ values: formik.values });
    return undefined;
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
        <Grid size={{ xs: 12, sm: 4 }}>
          <TextField
            size="small"
            fullWidth
            disabled={!isEditable.value}
            label="Bank Name"
            name="bankName"
            value={values.bankName || ''}
            onChange={handleChange}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 4 }}>
          <TextField
            size="small"
            fullWidth
            disabled={!isEditable.value}
            label="Branch Name"
            name="branchName"
            value={values.branchName || ''}
            onChange={handleChange}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 4 }}>
          <TextField
            size="small"
            fullWidth
            disabled={!isEditable.value}
            label="Account Holder Name"
            name="accountHolderName"
            value={values.accountHolderName || ''}
            onChange={handleChange}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 4 }}>
          <TextField
            size="small"
            fullWidth
            disabled={!isEditable.value}
            label="Account Number"
            name="accountNumber"
            value={values.accountNumber || ''}
            onChange={handleChange}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 4 }}>
          <TextField
            size="small"
            fullWidth
            disabled={!isEditable.value}
            label="IFSC Code"
            name="ifscCode"
            value={values.ifscCode || ''}
            onChange={handleChange}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 4 }}>
          <TextField
            size="small"
            select
            fullWidth
            disabled={!isEditable.value}
            label="PF Type"
            name="pfType"
            value={values.pfType || ''}
            onChange={handleChange}
          >
            <MenuItem value="Type A">Type A</MenuItem>
            <MenuItem value="Type B">Type B</MenuItem>
          </TextField>
        </Grid>
        <Grid size={{ xs: 12, sm: 4 }}>
          <RenderPfRules
          // value={values.pfRule || ''}
          // onChange={(e) => setFormValues({ ...formValues, pfRule: e.target?.value ?? e })}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 4 }}>
          <TextField
            size="small"
            fullWidth
            disabled={!isEditable.value}
            label="EPF Number"
            name="epfNumber"
            value={values.epfNumber || ''}
            onChange={handleChange}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 4 }}>
          <TextField
            size="small"
            fullWidth
            disabled={!isEditable.value}
            label="UAN Number"
            name="uanNumber"
            value={values.uanNumber || ''}
            onChange={handleChange}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 4 }}>
          <TextField
            size="small"
            type="number"
            fullWidth
            disabled={!isEditable.value}
            label="Basic Salary"
            name="basicSalary"
            value={values.basicSalary || ''}
            onChange={handleChange}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 4 }}>
          <TextField
            size="small"
            fullWidth
            disabled={!isEditable.value}
            label="Punch Id"
            name="punchId"
            value={values.punchId || ''}
            onChange={handleChange}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 4 }}>
          <TextField
            size="small"
            fullWidth
            disabled={!isEditable.value}
            label="TDS Percentage"
            name="tdsPercentage"
            value={values.tdsPercentage || ''}
            onChange={handleChange}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 4 }}>
          <TextField
            size="small"
            fullWidth
            disabled={!isEditable.value}
            label="TDS Amount"
            name="tdsAmount"
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
    gridProps: { size: { xs: 12, md: 12 } },
    renderComp(props) {
      return <RenderPayrollFields {...props} />;
    },
  },
];
