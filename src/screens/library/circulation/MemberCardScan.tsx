import type { FormikProps } from 'formik';

import { Stack, Button, TextField } from '@mui/material';
import ShakingTextField from 'src/components/shaking-text-field';

import type { IssueValues } from './useIssueDraft';

export function MemberCardScan({
  formik,
  disabled,
}: {
  formik: FormikProps<IssueValues>;
  disabled: boolean;
}) {
  const scan = formik.values.memberScan || '';
  const resolve = () => {
    if (!disabled && scan.trim()) formik.setFieldValue('memberId', scan.trim());
  };
  return (
    <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1} alignItems="flex-start">
      <ShakingTextField
        error={Boolean(formik.touched.memberId && formik.errors.memberId)}
        sx={{ flex: 1, width: '100%' }}
      >
        <TextField
          label="Printed member ID"
          name="memberScan"
          size="small"
          fullWidth
          required
          value={scan}
          disabled={disabled}
          inputProps={{ maxLength: 100 }}
          onChange={(event) => {
            formik.setFieldValue('memberScan', event.target.value);
            formik.setFieldValue('memberId', '');
          }}
          onKeyDown={(event) => {
            if (event.key === 'Enter') {
              event.preventDefault();
              resolve();
            }
          }}
          onBlur={() => formik.setFieldTouched('memberId', true)}
          error={Boolean(formik.touched.memberId && formik.errors.memberId)}
          helperText={
            (formik.touched.memberId && formik.errors.memberId) ||
            'Scan a member card or enter its exact printed ID, then press Enter.'
          }
        />
      </ShakingTextField>
      <Button variant="outlined" onClick={resolve} disabled={disabled || !scan.trim()}>
        Look up member
      </Button>
    </Stack>
  );
}
