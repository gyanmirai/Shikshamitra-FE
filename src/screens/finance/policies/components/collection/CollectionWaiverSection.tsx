'use client';

import React from 'react';
import dayjs from 'dayjs';
import { DatePicker } from '@mui/x-date-pickers';
import { Grid, Switch, Checkbox, TextField, Autocomplete, FormControlLabel } from '@mui/material';

import { SectionCard } from './CollectionCommon';

interface CollectionWaiverSectionProps {
  formik: any;
  feeHeads: any[];
}

export default function CollectionWaiverSection({
  formik,
  feeHeads,
}: CollectionWaiverSectionProps) {
  return (
    <SectionCard
      title="Waiver Rules"
      subtitle="Define waivers, applicable fee heads, and maximum percentage or amount values."
    >
      <Grid container spacing={2.5}>
        <Grid size={{ xs: 12 }}>
          <FormControlLabel
            control={
              <Switch
                checked={formik.values.enableWaiver}
                onChange={(e) => formik.setFieldValue('enableWaiver', e.target.checked)}
              />
            }
            label="Enable Waiver"
          />
        </Grid>

        {formik.values.enableWaiver && (
          <>
            {/* Apply On Fee Heads */}
            <Grid size={{ xs: 12 }}>
              <Autocomplete
                multiple
                size="small"
                options={feeHeads}
                getOptionLabel={(option) => option.name || ''}
                value={feeHeads.filter((h) => formik.values.waiverApplyOnFeeHeads?.includes(h.id))}
                onChange={(_, newValue) => {
                  formik.setFieldValue(
                    'waiverApplyOnFeeHeads',
                    newValue.map((v) => v.id)
                  );
                }}
                disableCloseOnSelect
                renderOption={(props, option, { selected }) => {
                  const { key, ...optionProps } = props as any;
                  return (
                    <li key={key || option.id} {...optionProps}>
                      <Checkbox size="small" style={{ marginRight: 8 }} checked={selected} />
                      {option.name}
                    </li>
                  );
                }}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Apply On Fee Heads *"
                    error={
                      formik.touched.waiverApplyOnFeeHeads &&
                      Boolean(formik.errors.waiverApplyOnFeeHeads)
                    }
                    helperText={
                      formik.touched.waiverApplyOnFeeHeads &&
                      (formik.errors.waiverApplyOnFeeHeads as any)
                    }
                  />
                )}
              />
            </Grid>

            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                fullWidth
                size="small"
                type="number"
                label="Maximum Waiver Amount (₹)"
                name="maximumWaiverAmount"
                value={formik.values.maximumWaiverAmount ?? ''}
                onChange={formik.handleChange}
              />
            </Grid>

            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                fullWidth
                size="small"
                type="number"
                label="Maximum Waiver Percentage (%)"
                name="maximumWaiverPercentage"
                value={formik.values.maximumWaiverPercentage ?? ''}
                onChange={formik.handleChange}
              />
            </Grid>

            <Grid size={{ xs: 12 }}>
              <DatePicker
                label="Waiver Expiry Date"
                value={formik.values.waiverExpiry ? dayjs(formik.values.waiverExpiry) : null}
                onChange={(date) =>
                  formik.setFieldValue('waiverExpiry', date ? date.toISOString() : null)
                }
                slotProps={{
                  textField: {
                    fullWidth: true,
                    size: 'small',
                  },
                }}
              />
            </Grid>
          </>
        )}
      </Grid>
    </SectionCard>
  );
}
