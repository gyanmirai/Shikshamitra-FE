import ShakingTextField from 'src/components/shaking-text-field';
import NumericFormatCustom from 'src/components/custom-numeric-format';
import { Grid, Checkbox, TextField, Typography, FormControlLabel } from '@mui/material';

import { receivingFieldError } from './receiving-field-state';

import type { ReceivingForm } from './receiving-field-state';

export function ReceivingCostFields({
  formik,
  index,
  disabled,
}: {
  formik: ReceivingForm;
  index: number;
  disabled: boolean;
}) {
  const line = formik.values.lines[index];
  const prefix = `lines[${index}]`;
  const error = (name: string) => receivingFieldError(formik, `${prefix}.${name}`);
  return (
    <>
      <FormControlLabel
        label="Cost is known"
        control={
          <Checkbox
            checked={line.costKnown}
            disabled={disabled}
            onChange={(_, checked) => formik.setFieldValue(`${prefix}.costKnown`, checked)}
          />
        }
      />
      {!line.costKnown ? (
        <Typography variant="body2" color="text.secondary">
          Acquisition cost: Unknown
        </Typography>
      ) : (
        <Grid container spacing={2}>
          <Grid size={{ xs: 12, sm: 6 }}>
            <ShakingTextField error={Boolean(error('unitCost'))}>
              <NumericFormatCustom
                label="Unit cost"
                name={`${prefix}.unitCost`}
                required
                size="small"
                fullWidth
                value={line.unitCost}
                prefix=""
                decimalScale={2}
                valueIsNumericString
                roundToWholeRupees={false}
                disabled={disabled}
                isAllowed={({ value }) => value.split('.')[0].replace(/^0+/, '').length <= 16}
                onValueChange={({ value }, source) => {
                  if (source.source === 'event') formik.setFieldValue(`${prefix}.unitCost`, value);
                }}
                onBlur={() => formik.setFieldTouched(`${prefix}.unitCost`, true)}
                error={Boolean(error('unitCost'))}
                helperText={
                  error('unitCost') || 'Record zero only when the cost is evidenced as zero.'
                }
              />
            </ShakingTextField>
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <ShakingTextField error={Boolean(error('currency'))}>
              <TextField
                {...formik.getFieldProps(`${prefix}.currency`)}
                label="Currency"
                required
                fullWidth
                size="small"
                disabled={disabled}
                error={Boolean(error('currency'))}
                helperText={error('currency') || 'Three uppercase letters, such as INR.'}
                slotProps={{ htmlInput: { maxLength: 3 } }}
              />
            </ShakingTextField>
          </Grid>
        </Grid>
      )}
    </>
  );
}
