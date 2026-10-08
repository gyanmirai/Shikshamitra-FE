'use client';

import React from 'react';
import { Grid, TextField, InputAdornment } from '@mui/material';
import CustomSelect from 'src/components/custom-select';
import NumericFormatCustom from 'src/components/custom-numeric-format';
import ShakingTextField from 'src/components/shaking-text-field';

import { ConcessionSectionCard } from './ConcessionCommon';
import { CONCESSION_METHODS, CONCESSION_VALUE_SOURCES } from './concessionPresentation';

export default function ConcessionCalculationSection({ formik }: { formik: any }) {
  const method = formik.values.calculationMethod;
  const isRequestEntered = formik.values.valueSource === 'RequestEnteredWithinLimits';
  const isPercentage = method === 'Percentage';
  const isFullWaiver = method === 'FullWaiver';
  const valueField = isPercentage
    ? isRequestEntered
      ? 'maximumPercentage'
      : 'percentageValue'
    : isRequestEntered
      ? 'maximumFixedAmount'
      : 'fixedAmount';
  const error = (field: string) => Boolean(formik.touched[field] && formik.errors[field]);
  const helper = (field: string, text: string) =>
    (formik.touched[field] && formik.errors[field]) || text;

  return (
    <ConcessionSectionCard
      title="Calculation Rules"
      subtitle={
        isFullWaiver
          ? 'Full waiver covers 100% of the eligible balance. No value is required.'
          : 'Choose how the value is entered and set the concession or maximum limit.'
      }
      icon="solar:calculator-linear"
    >
      <Grid container spacing={2}>
        <Grid size={{ xs: 12, sm: 6 }}>
          <ShakingTextField error={error('valueSource')}>
            <CustomSelect
              fullWidth
              size="small"
              label="Value source *"
              name="valueSource"
              options={CONCESSION_VALUE_SOURCES}
              optionDescriptionKey="caption"
              value={formik.values.valueSource}
              onChange={(value) => {
                formik.setFieldValue('valueSource', value);
                if (value === 'RequestEnteredWithinLimits' && isFullWaiver) {
                  formik.setFieldValue('calculationMethod', 'Percentage');
                }
              }}
              onBlur={() => formik.setFieldTouched('valueSource', true)}
              error={error('valueSource')}
              helperText={helper('valueSource', '')}
            />
          </ShakingTextField>
        </Grid>
        <Grid size={{ xs: 12, sm: 6 }}>
          <ShakingTextField error={error('calculationMethod')}>
            <CustomSelect
              fullWidth
              size="small"
              label="Calculation method *"
              name="calculationMethod"
              options={CONCESSION_METHODS}
              optionDescriptionKey="caption"
              value={method}
              onChange={(value) => formik.setFieldValue('calculationMethod', value)}
              onBlur={() => formik.setFieldTouched('calculationMethod', true)}
              disabledValues={isRequestEntered ? ['FullWaiver'] : []}
              disabledLabel="Requires a fixed policy value"
              error={error('calculationMethod')}
              helperText={helper('calculationMethod', '')}
            />
          </ShakingTextField>
        </Grid>
        {!isFullWaiver && (
          <Grid size={{ xs: 12, sm: 6 }}>
            <ShakingTextField error={error(valueField)}>
              {isPercentage ? (
                <TextField
                  fullWidth
                  size="small"
                  type="number"
                  label={isRequestEntered ? 'Maximum percentage *' : 'Concession percentage *'}
                  name={valueField}
                  value={formik.values[valueField] ?? ''}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  error={error(valueField)}
                  helperText={helper(valueField, 'Enter a value from 0.01% to 100%.')}
                  slotProps={{
                    input: { endAdornment: <InputAdornment position="end">%</InputAdornment> },
                    htmlInput: { min: 0.01, max: 100, step: 0.01 },
                  }}
                />
              ) : (
                <NumericFormatCustom
                  fullWidth
                  size="small"
                  label={isRequestEntered ? 'Maximum amount *' : 'Concession amount *'}
                  name={valueField}
                  value={formik.values[valueField] ?? ''}
                  onValueChange={({ floatValue }) =>
                    formik.setFieldValue(valueField, floatValue ?? null)
                  }
                  onBlur={formik.handleBlur}
                  error={error(valueField)}
                  helperText={helper(
                    valueField,
                    isRequestEntered
                      ? 'Maximum rupee amount allowed for each request.'
                      : 'Fixed rupee amount for each eligible request.'
                  )}
                  decimalScale={0}
                />
              )}
            </ShakingTextField>
          </Grid>
        )}
      </Grid>
    </ConcessionSectionCard>
  );
}
