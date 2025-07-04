import { Grid, TextField } from '@mui/material';

import { useBoolean } from 'src/hooks/use-boolean';

import {
  SectionCard,
  CardActions,
} from 'src/screens/hr/employee/employee-form-fields/InformationFields';

import type { FieldsType } from './type';

export const bankDetailsFields: FieldsType[] = [
  {
    name: 'bankName',
    label: 'Bank Name',
    gridProps: { xs: 12, sm: 12, md: 12 },
    type: 'text',
    otherProps: { autoFocus: true },
    renderComp(props) {
      return <RenderBankDetails {...props} />;
    },
  },
];

const RenderBankDetails = (props: any) => {
  const { formik, isMainForm = false } = props;
  const isEditable = useBoolean(isMainForm);
  const handleSave = async () => {
    await formik?.submitForm?.();
    formik.resetForm({ values: formik.values });
  };
  const handleCancel = () => {
    formik.resetForm();
  };
  return (
    <SectionCard
      title=""
      headerContent={
        !isMainForm && (
          <CardActions
            isLoading={formik.isSubmitting}
            {...{ isEdit: isEditable, onSave: handleSave, onCancel: handleCancel }}
          />
        )
      }
    >
      {[
        { label: 'Bank Name', name: 'bankName' },
        { label: 'Account No.', name: 'accountNo' },
        { label: 'IFSC Code', name: 'ifscCode' },
        { label: 'Branch Name', name: 'branchName' },
        { label: 'Account Holder Name', name: 'accountHolderName' },
      ].map((field) => (
        <Grid key={field.name} item xs={12} sm={6} md={4}>
          <TextField
            {...field}
            value={formik.values[field.name]}
            onChange={formik.handleChange}
            disabled={!isEditable.value}
            size="small"
            fullWidth
          />
        </Grid>
      ))}
    </SectionCard>
  );
};
