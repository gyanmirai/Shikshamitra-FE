import type { FormikProps } from 'formik';

import { GlobalIcons } from 'src/utils/icons';
import { Grid, Alert, TextField } from '@mui/material';
import CustomSelect from 'src/components/custom-select';
import ShakingTextField from 'src/components/shaking-text-field';
import { FormSectionCard } from 'src/components/form-section-card';

import { CirculationDateField } from './CirculationDateField';

import type { ReturnValues } from './return-form';

export function ReturnConditionFields({
  formik,
  disabled,
}: {
  formik: FormikProps<ReturnValues>;
  disabled: boolean;
}) {
  return (
    <FormSectionCard
      title="Return Details"
      icon={GlobalIcons.retrunIcon}
      descriptionTooltip="The server validates the exact saved loan and copy. An explicit reason retains uncertainty about original dates. Copy condition does not mark an assessment paid."
    >
      <Alert severity="info">
        Record a return when the physical copy is recovered. Use Inventory actions to report a loss
        or write off an eligible copy. Charges remain separate.
      </Alert>
      <Grid container spacing={2}>
        <Grid size={{ xs: 12, sm: 6 }}>
          <CirculationDateField
            label="Return date"
            name="returnDate"
            value={formik.values.returnDate}
            disabled={disabled}
            error={formik.touched.returnDate && formik.errors.returnDate}
            onChange={(value) => formik.setFieldValue('returnDate', value)}
            onBlur={() => formik.setFieldTouched('returnDate', true)}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6 }}>
          <ShakingTextField error={Boolean(formik.touched.copyStatus && formik.errors.copyStatus)}>
            <CustomSelect
              label="Copy status after return"
              name="copyStatus"
              required
              fullWidth
              size="small"
              disabled={disabled}
              value={formik.values.copyStatus}
              options={[
                { id: 0, name: 'Available' },
                { id: 4, name: 'Damaged' },
                { id: 5, name: 'Under repair' },
              ]}
              labelKey="name"
              valueKey="id"
              onChange={(value) => formik.setFieldValue('copyStatus', Number(value))}
              onBlur={() => formik.setFieldTouched('copyStatus', true)}
              error={Boolean(formik.touched.copyStatus && formik.errors.copyStatus)}
              helperText={formik.touched.copyStatus ? formik.errors.copyStatus : undefined}
            />
          </ShakingTextField>
        </Grid>
        <Grid size={12}>
          <ShakingTextField error={Boolean(formik.touched.remarks && formik.errors.remarks)}>
            <TextField
              label="Remarks"
              name="remarks"
              fullWidth
              size="small"
              multiline
              minRows={2}
              inputProps={{ maxLength: 500 }}
              disabled={disabled}
              value={formik.values.remarks}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              error={Boolean(formik.touched.remarks && formik.errors.remarks)}
              helperText={formik.touched.remarks && formik.errors.remarks}
            />
          </ShakingTextField>
        </Grid>
      </Grid>
    </FormSectionCard>
  );
}
