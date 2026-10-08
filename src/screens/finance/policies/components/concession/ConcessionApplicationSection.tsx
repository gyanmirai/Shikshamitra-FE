'use client';

import CustomSelect from 'src/components/custom-select';
import { Stack, Switch, Typography, FormControlLabel } from '@mui/material';
import ShakingTextField from 'src/components/shaking-text-field';

import { ConcessionSectionCard } from './ConcessionCommon';
import { CONCESSION_SCOPES } from './concessionPresentation';

export default function ConcessionApplicationSection({ formik }: { formik: any }) {
  const error = Boolean(formik.touched.applyOn && formik.errors.applyOn);
  const includesPaid = formik.values.applyOn === 'AllFees';
  return (
    <ConcessionSectionCard
      title="Application Scope"
      subtitle={
        formik.values.applyOn === 'AllFees'
          ? 'Paid collections remain in history. The paid concession is refundable through an automatically or manually created refund request.'
          : 'Choose eligible installments. Only unpaid balances are recalculated; paid collections remain in history.'
      }
      icon="solar:layers-linear"
    >
      <ShakingTextField error={error}>
        <CustomSelect
          fullWidth
          size="small"
          label="Apply concession on *"
          name="applyOn"
          options={CONCESSION_SCOPES}
          optionDescriptionKey="caption"
          value={formik.values.applyOn}
          onChange={(value) => {
            formik.setFieldValue('applyOn', value);
            formik.setFieldValue('autoCreateRefund', value === 'AllFees');
          }}
          onBlur={() => formik.setFieldTouched('applyOn', true)}
          error={error}
          helperText={(formik.touched.applyOn && formik.errors.applyOn) || ''}
        />
      </ShakingTextField>
      <Stack spacing={0.5} sx={{ mt: 2 }}>
        <FormControlLabel
          control={
            <Switch
              name="autoCreateRefund"
              checked={includesPaid && Boolean(formik.values.autoCreateRefund)}
              disabled={!includesPaid}
              onChange={(_, checked) => formik.setFieldValue('autoCreateRefund', checked)}
            />
          }
          label="Automatically create refund requests on concession approval"
        />
        <Typography variant="caption" color="text.secondary">
          {!includesPaid
            ? 'Available when the application scope includes paid installments.'
            : formik.values.autoCreateRefund
              ? 'The paid concession creates linked refund requests for separate review and payout.'
              : 'The paid concession remains refundable. Create the linked refund requests manually after approval.'}
        </Typography>
      </Stack>
    </ConcessionSectionCard>
  );
}
