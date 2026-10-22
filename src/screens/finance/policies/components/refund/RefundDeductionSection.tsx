'use client';

import type { FormikProps } from 'formik';

import { Iconify } from 'src/components/iconify';

import {
  Box,
  Grid,
  Chip,
  Stack,
  Select,
  MenuItem,
  TextField,
  InputLabel,
  FormControl,
  Typography,
  FormHelperText,
  InputAdornment,
} from '@mui/material';

import { SectionCard } from './RefundCommon';
import { PAYOUT_METHODS } from '../../hooks/useRefundPolicyForm';

import type { IRefundPolicyFormValues, RefundPayoutMethod } from '../../types/finance-policy.types';

interface RefundDeductionSectionProps {
  formik: FormikProps<IRefundPolicyFormValues>;
}

export default function RefundDeductionSection({ formik }: RefundDeductionSectionProps) {
  const { values, errors, touched, setFieldValue, handleChange, handleBlur } = formik;

  const isFieldInvalid = (name: keyof IRefundPolicyFormValues) =>
    Boolean(touched[name] && errors[name]);

  const getHelperText = (name: keyof IRefundPolicyFormValues) =>
    touched[name] ? (errors[name] as string) : undefined;

  const togglePayoutMethod = (method: RefundPayoutMethod) => {
    const current = values.allowedPayoutMethods || [];
    if (current.includes(method)) {
      if (current.length > 1) {
        setFieldValue(
          'allowedPayoutMethods',
          current.filter((m) => m !== method)
        );
      }
    } else {
      setFieldValue('allowedPayoutMethods', [...current, method]);
    }
  };

  return (
    <SectionCard
      subtitle="Configure administrative processing deductions, mandatory audit justification, allowed disbursement channels, and operational SLA."
      title="Deductions & Allowed Payouts"

      icon="solar:tag-price-bold-duotone"
    >
      <Grid container spacing={2}>
        {/* Deduction Type */}
        <Grid size={{ xs: 12, md: 4 }}>
          <FormControl fullWidth size="small" error={isFieldInvalid('deductionType')}>
            <InputLabel id="deduction-type-label">Deduction Rule</InputLabel>
            <Select
              labelId="deduction-type-label"
              label="Deduction Rule"
              name="deductionType"
              value={values.deductionType}
              onChange={(e) => {
                setFieldValue('deductionType', e.target.value);
                if (e.target.value === 'None') {
                  setFieldValue('deductionValue', null);
                  setFieldValue('maximumDeduction', null);
                  setFieldValue('deductionExplanation', '');
                }
              }}
              onBlur={handleBlur}
            >
              <MenuItem value="None">No Deduction (0%)</MenuItem>
              <MenuItem value="Percentage">Percentage of Calculated Refund (%)</MenuItem>
              <MenuItem value="FixedAmount">Fixed Deduction Fee (₹)</MenuItem>
            </Select>
            {getHelperText('deductionType') && (
              <FormHelperText>{getHelperText('deductionType')}</FormHelperText>
            )}
          </FormControl>
        </Grid>

        {/* Deduction Fields when Active */}
        {values.deductionType !== 'None' && (
          <>
            {/* Deduction Value */}
            <Grid size={{ xs: 12, sm: 6, md: 4 }}>
              <TextField
                fullWidth
                required
                size="small"
                type="number"
                name="deductionValue"
                label={
                  values.deductionType === 'Percentage'
                    ? 'Deduction Percentage'
                    : 'Deduction Amount'
                }
                placeholder={values.deductionType === 'Percentage' ? 'e.g. 10' : 'e.g. 500'}
                value={values.deductionValue ?? ''}
                onChange={(e) =>
                  setFieldValue(
                    'deductionValue',
                    e.target.value === '' ? null : Number(e.target.value)
                  )
                }
                onBlur={handleBlur}
                error={isFieldInvalid('deductionValue')}
                helperText={getHelperText('deductionValue')}
                slotProps={{
                  input: {
                    startAdornment:
                      values.deductionType === 'FixedAmount' ? (
                        <InputAdornment position="start">₹</InputAdornment>
                      ) : undefined,
                    endAdornment:
                      values.deductionType === 'Percentage' ? (
                        <InputAdornment position="end">%</InputAdornment>
                      ) : undefined,
                    inputProps: { min: 0.01, step: 0.01 },
                  },
                }}
              />
            </Grid>

            {/* Maximum Deduction Ceiling */}
            <Grid size={{ xs: 12, sm: 6, md: 4 }}>
              <TextField
                fullWidth
                size="small"
                type="number"
                name="maximumDeduction"
                label="Maximum Deduction Ceiling"
                placeholder="e.g. 2000"
                value={values.maximumDeduction ?? ''}
                onChange={(e) =>
                  setFieldValue(
                    'maximumDeduction',
                    e.target.value === '' ? null : Number(e.target.value)
                  )
                }
                onBlur={handleBlur}
                error={isFieldInvalid('maximumDeduction')}
                helperText={getHelperText('maximumDeduction')}
                slotProps={{
                  input: {
                    startAdornment: <InputAdornment position="start">₹</InputAdornment>,
                    inputProps: { min: 0.01 },
                  },
                }}
              />
            </Grid>

            {/* Deduction Explanation */}
            <Grid size={{ xs: 12 }}>
              <TextField
                fullWidth
                required
                multiline
                minRows={2}
                size="small"
                name="deductionExplanation"
                label="Deduction Justification / Purpose"
                placeholder="e.g. Standard non-refundable administrative processing and document verification charge"
                value={values.deductionExplanation || ''}
                onChange={handleChange}
                onBlur={handleBlur}
                error={isFieldInvalid('deductionExplanation')}
                helperText={getHelperText('deductionExplanation')}
              />
            </Grid>
          </>
        )}

        {/* Allowed Payout Methods */}
        <Grid size={{ xs: 12, md: 8 }}>
          <Box sx={{ mb: 0.5 }}>
            <Typography
              variant="caption"
              color="text.secondary"
              fontWeight={600}
              display="block"
              sx={{ mb: 1 }}
            >
              ALLOWED DISBURSEMENT METHODS *
            </Typography>
            <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
              {PAYOUT_METHODS.map((method) => {
                const isSelected = (values.allowedPayoutMethods || []).includes(method.value);
                return (
                  <Chip
                    key={method.value}
                    label={method.label}
                    icon={<Iconify icon={method.icon} width={18} height={18} />}
                    onClick={() => togglePayoutMethod(method.value)}
                    color={isSelected ? 'primary' : 'default'}
                    variant={isSelected ? 'filled' : 'outlined'}
                    sx={{
                      cursor: 'pointer',
                      height: 32,
                      px: 0.5,
                      fontWeight: isSelected ? 600 : 500,
                      fontSize: '0.8125rem',
                      transition: 'all 0.15s ease',
                      '&:hover': {
                        bgcolor: isSelected ? 'primary.dark' : 'action.hover',
                      },
                    }}
                  />
                );
              })}
            </Stack>
            {isFieldInvalid('allowedPayoutMethods') && (
              <FormHelperText error sx={{ mt: 0.75 }}>
                {getHelperText('allowedPayoutMethods') || 'Select at least one payout method'}
              </FormHelperText>
            )}
          </Box>
        </Grid>

        {/* Processing Target SLA */}
        <Grid size={{ xs: 12, md: 4 }}>
          <TextField
            fullWidth
            size="small"
            type="number"
            name="processingTargetDays"
            label="Processing Target SLA (Days)"
            placeholder="e.g. 7"
            value={values.processingTargetDays ?? ''}
            onChange={(e) =>
              setFieldValue(
                'processingTargetDays',
                e.target.value === '' ? null : Number(e.target.value)
              )
            }
            onBlur={handleBlur}
            error={isFieldInvalid('processingTargetDays')}
            helperText={getHelperText('processingTargetDays')}
            slotProps={{
              input: {
                endAdornment: <InputAdornment position="end">days</InputAdornment>,
                inputProps: { min: 0 },
              },
            }}
          />
        </Grid>
      </Grid>
    </SectionCard>
  );
}
