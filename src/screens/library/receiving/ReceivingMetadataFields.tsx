import type { ReceivingOptions, LibraryStockSource } from 'src/redux/library/receiving-types';

import { GlobalIcons } from 'src/utils/icons';
import { Grid, TextField } from '@mui/material';
import CustomSelect from 'src/components/custom-select';
import ShakingTextField from 'src/components/shaking-text-field';
import { FormSectionCard } from 'src/components/form-section-card';

import { SchoolDateContext } from '../circulation/SchoolDateContext';
import { CirculationDateField } from '../circulation/CirculationDateField';
import { receivingSources, receivingFieldError } from './receiving-field-state';

import type { ReceivingForm } from './receiving-field-state';

export function ReceivingMetadataFields({
  formik,
  options,
  disabled,
}: {
  formik: ReceivingForm;
  options?: ReceivingOptions;
  disabled: boolean;
}) {
  return (
    <FormSectionCard
      title="Receipt Details"
      icon={GlobalIcons.calendar}
      descriptionTooltip="Record the actual school receipt date and stock source. Opening stock records this entry, without claiming an old book's original acquisition date."
    >
      <SchoolDateContext
        context={options?.schoolContext}
        disabled={disabled}
        onUse={(date) => formik.setFieldValue('receivedOn', date)}
      />
      <Grid container spacing={2}>
        <Grid size={{ xs: 12, sm: 6 }}>
          <CirculationDateField
            label="Received on"
            name="receivedOn"
            value={formik.values.receivedOn}
            disabled={disabled}
            error={receivingFieldError(formik, 'receivedOn')}
            onChange={(date) => formik.setFieldValue('receivedOn', date)}
            onBlur={() => formik.setFieldTouched('receivedOn', true)}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6 }}>
          <ShakingTextField error={Boolean(receivingFieldError(formik, 'source'))}>
            <CustomSelect
              label="Source"
              name="source"
              required
              fullWidth
              size="small"
              value={formik.values.source ?? ''}
              options={receivingSources}
              labelKey="name"
              valueKey="id"
              disabled={disabled}
              onChange={(value) =>
                formik.setFieldValue(
                  'source',
                  value === '' ? null : (Number(value) as LibraryStockSource)
                )
              }
              onBlur={() => formik.setFieldTouched('source', true)}
              error={Boolean(receivingFieldError(formik, 'source'))}
              helperText={receivingFieldError(formik, 'source')}
            />
          </ShakingTextField>
        </Grid>
        <Grid size={{ xs: 12, sm: 6 }}>
          <TextField
            {...formik.getFieldProps('sourceName')}
            label="Supplier or donor"
            fullWidth
            size="small"
            disabled={disabled}
            error={Boolean(receivingFieldError(formik, 'sourceName'))}
            helperText={receivingFieldError(formik, 'sourceName')}
            slotProps={{ htmlInput: { maxLength: 256 } }}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6 }}>
          <TextField
            {...formik.getFieldProps('reference')}
            label="External reference"
            fullWidth
            size="small"
            disabled={disabled}
            error={Boolean(receivingFieldError(formik, 'reference'))}
            helperText={receivingFieldError(formik, 'reference')}
            slotProps={{ htmlInput: { maxLength: 256 } }}
          />
        </Grid>
      </Grid>
    </FormSectionCard>
  );
}
