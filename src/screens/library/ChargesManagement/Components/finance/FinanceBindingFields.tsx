import { Grid, TextField } from '@mui/material';
import ShakingTextField from 'src/components/shaking-text-field';
import { FinanceOperatorOptionKind } from 'src/redux/library/charges-management/finance-operator.types';

import { FinanceOperatorSelect } from './FinanceOperatorSelect';

import type { useFinanceBindingForm } from './useFinanceBindingForm';

type Props = { form: ReturnType<typeof useFinanceBindingForm> };

export function FinanceBindingFields({ form }: Props) {
  const { selectedSource, formik, locked, fieldError, choosePolicy, changeReason } = form;
  return (
    <Grid container spacing={2}>
      <Grid size={{ xs: 12, md: 6 }}>
        <FinanceOperatorSelect
          source={selectedSource}
          purpose="binding"
          optionKind={FinanceOperatorOptionKind.collectionPolicyVersion}
          label="Collection policy"
          name="collectionPolicyVersionId"
          required
          value={formik.values.collection}
          disabled={locked}
          error={Boolean(fieldError('collection'))}
          helperText={fieldError('collection')}
          onChange={(collection) => {
            choosePolicy('collection', collection);
          }}
          onBlur={() => {
            formik.setFieldTouched('collection', true);
          }}
        />
      </Grid>
      <Grid size={{ xs: 12, md: 6 }}>
        <FinanceOperatorSelect
          source={selectedSource}
          purpose="binding"
          optionKind={FinanceOperatorOptionKind.refundPolicyVersion}
          label="Refund policy"
          name="refundPolicyVersionId"
          value={formik.values.refund}
          disabled={locked}
          error={Boolean(fieldError('refund'))}
          helperText={fieldError('refund') || 'Optional'}
          onChange={(refund) => {
            choosePolicy('refund', refund);
          }}
          onBlur={() => {
            formik.setFieldTouched('refund', true);
          }}
        />
      </Grid>
      <Grid size={{ xs: 12 }}>
        <ShakingTextField error={Boolean(fieldError('reason'))}>
          <TextField
            fullWidth
            size="small"
            label="Policy reason"
            name="reason"
            required
            multiline
            minRows={2}
            disabled={locked}
            value={formik.values.reason}
            onChange={changeReason}
            onBlur={formik.handleBlur}
            error={Boolean(fieldError('reason'))}
            helperText={fieldError('reason')}
            slotProps={{ htmlInput: { maxLength: 1000 } }}
          />
        </ShakingTextField>
      </Grid>
    </Grid>
  );
}
