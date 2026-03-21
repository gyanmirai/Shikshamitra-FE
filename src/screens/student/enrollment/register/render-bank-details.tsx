import { Grid, TextField } from '@mui/material';
import { useBoolean } from 'src/hooks/useBoolean';
import {
  SectionCard,
  CardActions,
} from 'src/screens/hr/employee/employee-form-fields/InformationFields';

import type { FieldsType } from './type';

export const bankDetailsFields: FieldsType[] = [
  {
    name: 'bankName',
    label: 'Bank Name',
    gridProps: { size: { xs: 12, sm: 12, md: 12 } },
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

  const IFSC_REGEX = /^[A-Z]{4}0[A-Z0-9]{6}$/; // e.g., HDFC0ABCD12
  const ACCOUNT_REGEX = /^\d{6,18}$/; // common range; stored as string

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
        {
          label: 'Bank Name',
          name: 'bankName',
          sanitize: (v: string) => v.replace(/[^A-Za-z\s]/g, ''),
        },
        {
          label: 'Account No.',
          name: 'accountNo',
          sanitize: (v: string) => v.replace(/[^0-9]/g, ''),
        },
        {
          label: 'IFSC Code',
          name: 'ifscCode',
          sanitize: (v: string) => v.replace(/[^a-zA-Z0-9]/g, '').toUpperCase(),
        },
        { label: 'Branch Name', name: 'branchName', sanitize: (v: string) => v },
        {
          label: 'Account Holder Name',
          name: 'accountHolderName',
          sanitize: (v: string) => v.replace(/[^A-Za-z\s]/g, ''),
        },
      ].map((field) => {
        const value = String(formik.values[field.name] ?? '');
        const nextValue = value;
        const isIfsc = field.name === 'ifscCode';
        const isAccount = field.name === 'accountNo';
        const ifscInvalid = isIfsc && nextValue !== '' && !IFSC_REGEX.test(nextValue.toUpperCase());
        const accountInvalid = isAccount && nextValue !== '' && !ACCOUNT_REGEX.test(nextValue);

        return (
          <Grid key={field.name} size={{ xs: 12, sm: 6, md: 4 }}>
            <TextField
              label={field.label}
              name={field.name}
              value={nextValue}
              onChange={(e) => {
                const cleaned = field.sanitize?.(e.target.value ?? '') ?? e.target.value;
                formik.setFieldValue(field.name, cleaned);
              }}
              onBlur={(e) => {
                const cleaned = field.sanitize?.(e.target.value ?? '') ?? e.target.value;
                formik.setFieldValue(field.name, cleaned);
              }}
              disabled={!isEditable.value}
              size="small"
              fullWidth
              type="text"
              inputMode={isAccount ? 'numeric' : 'text'}
              inputProps={{
                maxLength: field.name === 'ifscCode' ? 11 : undefined,
                style: field.name === 'ifscCode' ? { textTransform: 'uppercase' } : undefined,
                pattern: isAccount ? '[0-9]*' : undefined,
              }}
              error={Boolean(ifscInvalid || accountInvalid)}
              helperText={
                ifscInvalid
                  ? 'Invalid IFSC format (e.g., HDFC0ABCD12)'
                  : accountInvalid
                    ? 'Account number must be 6–18 digits'
                    : undefined
              }
            />
          </Grid>
        );
      })}
    </SectionCard>
  );
};
