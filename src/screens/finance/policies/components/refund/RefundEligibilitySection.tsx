'use client';

import type { FormikProps } from 'formik';

import React from 'react';
import { alpha } from '@mui/material/styles';
import {
  Box,
  Grid,
  Chip,
  Paper,
  Switch,
  Select,
  MenuItem,
  TextField,
  InputLabel,
  Typography,
  FormControl,
  Autocomplete,
  FormHelperText,
  CircularProgress,
} from '@mui/material';

import { SectionCard } from './RefundCommon';

import type { IRefundPolicyFormValues } from '../../types/finance-policy.types';

interface FeeHeadOption {
  id: string;
  name: string;
  code?: string;
}

interface RefundEligibilitySectionProps {
  formik: FormikProps<IRefundPolicyFormValues>;
  feeHeads?: FeeHeadOption[];
  isFeeHeadsLoading?: boolean;
}

export default function RefundEligibilitySection({
  formik,
  feeHeads = [],
  isFeeHeadsLoading = false,
}: RefundEligibilitySectionProps) {
  const { values, errors, touched, setFieldValue, handleBlur } = formik;

  const isFieldInvalid = (name: keyof IRefundPolicyFormValues) =>
    Boolean(touched[name] && errors[name]);

  const getHelperText = (name: keyof IRefundPolicyFormValues) =>
    touched[name] ? (errors[name] as string) : undefined;

  return (
    <SectionCard
      title="What Can Be Refunded?"
      subtitle="Choose the payments and fee items that school staff may include in a refund."
      icon="solar:shield-check-bold-duotone"
    >
      <Grid container spacing={2}>
        {/* Fee Head Scope */}
        <Grid size={{ xs: 12 }}>
          <FormControl fullWidth size="small" error={isFieldInvalid('feeHeadScope')}>
            <InputLabel id="fee-head-scope-label">Refundable Fee Heads</InputLabel>
            <Select
              labelId="fee-head-scope-label"
              label="Refundable Fee Heads"
              name="feeHeadScope"
              value={values.feeHeadScope}
              onChange={(e) => {
                setFieldValue('feeHeadScope', e.target.value);
                if (e.target.value === 'AllFeeHeads') {
                  setFieldValue('applicableFeeHeadIds', []);
                }
              }}
              onBlur={handleBlur}
            >
              <MenuItem value="AllFeeHeads">All Fee Heads</MenuItem>
              <MenuItem value="SelectedFeeHeads">Only Selected Fee Heads</MenuItem>
            </Select>
            {getHelperText('feeHeadScope') && (
              <FormHelperText>{getHelperText('feeHeadScope')}</FormHelperText>
            )}
          </FormControl>
        </Grid>

        {/* Multi-Select Autocomplete when SelectedFeeHeads */}
        {values.feeHeadScope === 'SelectedFeeHeads' && (
          <Grid size={{ xs: 12 }}>
            <Autocomplete
              multiple
              size="small"
              loading={isFeeHeadsLoading}
              options={feeHeads}
              getOptionLabel={(option) => option.name}
              value={feeHeads.filter((head) => values.applicableFeeHeadIds.includes(head.id))}
              onChange={(_, selectedOptions) =>
                setFieldValue(
                  'applicableFeeHeadIds',
                  selectedOptions.map((head) => head.id)
                )
              }
              renderInput={(params) => (
                <TextField
                  {...params}
                  required
                  size="small"
                  label="Applicable Fee Heads"
                  placeholder="Search and select fee heads..."
                  error={isFieldInvalid('applicableFeeHeadIds')}
                  helperText={
                    getHelperText('applicableFeeHeadIds') ||
                    'Only paid amounts for these fee heads can be refunded.'
                  }
                  slotProps={{
                    input: {
                      ...params.InputProps,
                      endAdornment: (
                        <>
                          {isFeeHeadsLoading ? <CircularProgress color="inherit" size={18} /> : null}
                          {params.InputProps.endAdornment}
                        </>
                      ),
                    },
                  }}
                />
              )}
              renderTags={(tagValue, getTagProps) =>
                tagValue.map((option, index) => (
                  <Chip
                    {...getTagProps({ index })}
                    key={option.id}
                    label={option.name}
                    size="small"
                    color="primary"
                    variant="outlined"
                    sx={{ height: 24, fontSize: '0.75rem' }}
                  />
                ))
              }
            />
          </Grid>
        )}

        {/* Interactive Toggle Switch Cards */}
        <Grid size={{ xs: 12 }}>
          <Grid container spacing={2}>
            {/* Allow Partial Refund */}
            <Grid size={{ xs: 12, sm: 4 }}>
              <Paper
                variant="outlined"
                sx={{
                  p: 1.5,
                  borderRadius: 1.25,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  bgcolor: (theme) =>
                    values.allowPartialRefund
                      ? alpha(theme.palette.primary.main, 0.04)
                      : alpha(theme.palette.background.paper, 0.6),
                  borderColor: (theme) =>
                    values.allowPartialRefund ? alpha(theme.palette.primary.main, 0.3) : 'divider',
                  transition: 'all 0.2s ease',
                }}
              >
                <Box sx={{ pr: 1 }}>
                  <Typography variant="subtitle2" fontWeight={600} sx={{ fontSize: '0.8125rem' }}>
                    Allow Partial Refund
                  </Typography>
                  <Typography variant="caption" color="text.secondary" display="block">
                    Enable requesting less than full eligible balance
                  </Typography>
                </Box>
                <Switch
                  size="small"
                  checked={values.allowPartialRefund}
                  onChange={(_, checked) => {
                    setFieldValue('allowPartialRefund', checked);
                    if (!checked && values.amountMode === 'ManualUpToEligible') {
                      setFieldValue('amountMode', 'RemainingPaidAmount');
                    }
                  }}
                />
              </Paper>
            </Grid>

            {/* Include Paid Charges */}
            <Grid size={{ xs: 12, sm: 4 }}>
              <Paper
                variant="outlined"
                sx={{
                  p: 1.5,
                  borderRadius: 1.25,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  bgcolor: (theme) =>
                    values.includePaidCharges
                      ? alpha(theme.palette.info.main, 0.04)
                      : alpha(theme.palette.background.paper, 0.6),
                  borderColor: (theme) =>
                    values.includePaidCharges ? alpha(theme.palette.info.main, 0.3) : 'divider',
                  transition: 'all 0.2s ease',
                }}
              >
                <Box sx={{ pr: 1 }}>
                  <Typography variant="subtitle2" fontWeight={600} sx={{ fontSize: '0.8125rem' }}>
                    Include Paid Charges
                  </Typography>
                  <Typography variant="caption" color="text.secondary" display="block">
                    Allow refund on non-fee head collected charges
                  </Typography>
                </Box>
                <Switch
                  size="small"
                  checked={values.includePaidCharges}
                  onChange={(_, checked) => setFieldValue('includePaidCharges', checked)}
                />
              </Paper>
            </Grid>

            {/* Include Paid Late Fee */}
            <Grid size={{ xs: 12, sm: 4 }}>
              <Paper
                variant="outlined"
                sx={{
                  p: 1.5,
                  borderRadius: 1.25,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  bgcolor: (theme) =>
                    values.includePaidLateFee
                      ? alpha(theme.palette.warning.main, 0.04)
                      : alpha(theme.palette.background.paper, 0.6),
                  borderColor: (theme) =>
                    values.includePaidLateFee ? alpha(theme.palette.warning.main, 0.3) : 'divider',
                  transition: 'all 0.2s ease',
                }}
              >
                <Box sx={{ pr: 1 }}>
                  <Typography variant="subtitle2" fontWeight={600} sx={{ fontSize: '0.8125rem' }}>
                    Include Late Fees
                  </Typography>
                  <Typography variant="caption" color="text.secondary" display="block">
                    Allow refunding collected penalty charges
                  </Typography>
                </Box>
                <Switch
                  size="small"
                  checked={values.includePaidLateFee}
                  onChange={(_, checked) => setFieldValue('includePaidLateFee', checked)}
                />
              </Paper>
            </Grid>
          </Grid>
        </Grid>
      </Grid>
    </SectionCard>
  );
}
