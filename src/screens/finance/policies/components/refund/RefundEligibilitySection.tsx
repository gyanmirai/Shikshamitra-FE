'use client';

import type { FormikProps } from 'formik';

import CustomSelect from 'src/components/custom-select';

import {
  Grid,
  Chip,
  Paper,
  Stack,
  Switch,
  Checkbox,
  Skeleton,
  TextField,
  Typography,
  Autocomplete,
  FormControlLabel,
  IconButton,
} from '@mui/material';

import { SectionCard } from './RefundCommon';

import type { IRefundPolicyFormValues } from '../../types/finance-policy.types';
import { Iconify } from 'src/components/iconify';
import CustomTooltip from 'src/components/custom-tooltip';

interface FeeHeadOption {
  id: string;
  name: string;
  code?: string;
  status?: 'Active' | 'Inactive' | 'Deleted';
}

export default function RefundEligibilitySection({
  formik,
  feeHeads = [],
  selectedFeeHeadNames,
  selectedFeeHeadStatuses,
  isFeeHeadsLoading = false,
}: {
  formik: FormikProps<IRefundPolicyFormValues>;
  feeHeads?: FeeHeadOption[];
  selectedFeeHeadNames?: Record<string, string>;
  selectedFeeHeadStatuses?: Record<string, 'Active' | 'Inactive' | 'Deleted'>;
  isFeeHeadsLoading?: boolean;
}) {
  const { values, errors, touched, setFieldValue } = formik;
  const selectedOptions = values.applicableFeeHeadIds.map(
    (id) =>
      feeHeads.find((head) => head.id === id) || {
        id,
        name: selectedFeeHeadNames?.[id] || 'Fee head name unavailable',
        status: selectedFeeHeadStatuses?.[id],
      }
  );
  const options = [
    ...feeHeads,
    ...selectedOptions.filter((selected) => !feeHeads.some((head) => head.id === selected.id)),
  ];
  return (
    <SectionCard
      subtitle="Choose the paid fees and charges that staff may include in a refund."
      title="Refund Eligibility"

      icon="solar:shield-check-linear"
    >
      <Stack spacing={2}>
        <CustomSelect
          fullWidth
          size="small"
          name="feeHeadScope"
          label="Refundable fee heads"
          options={[
            { value: 'AllFeeHeads', label: 'All fee heads' },
            { value: 'SelectedFeeHeads', label: 'Selected fee heads' },
          ]}
          valueKey="value"
          labelKey="label"
          value={values.feeHeadScope}
          onChange={(value) => {
            setFieldValue('feeHeadScope', value);
            if (value === 'AllFeeHeads') setFieldValue('applicableFeeHeadIds', []);
          }}
          onBlur={() => formik.setFieldTouched('feeHeadScope', true)}
          error={Boolean(touched.feeHeadScope && errors.feeHeadScope)}
          helperText={touched.feeHeadScope ? errors.feeHeadScope : undefined}
        />
        {values.feeHeadScope === 'SelectedFeeHeads' &&
          (isFeeHeadsLoading ? (
            <Skeleton variant="rounded" height={40} aria-label="Loading fee heads" />
          ) : (
            <Autocomplete
              multiple
              disableCloseOnSelect
              fullWidth
              size="small"
              options={options}
              getOptionKey={(option) => option.id}
              getOptionLabel={(option) =>
                `${option.name}${option.status && option.status !== 'Active' ? ` (${option.status})` : ''}`
              }
              getOptionDisabled={(option) =>
                option.status === 'Deleted' || option.status === 'Inactive'
              }
              renderOption={({ key, ...optionProps }, option, { selected }) => (
                <li key={key} {...optionProps}>
                  <Checkbox
                    size="small"
                    checked={selected}
                    disabled={option.status === 'Deleted' || option.status === 'Inactive'}
                    tabIndex={-1}
                    disableRipple
                    sx={{ mr: 1 }}
                    slotProps={{ input: { 'aria-hidden': true } }}
                  />
                  {option.name}
                  {option.status && option.status !== 'Active' ? ` (${option.status})` : ''}
                </li>
              )}
              isOptionEqualToValue={(option, value) => option.id === value.id}
              value={selectedOptions}
              onChange={(_, selected) =>
                setFieldValue(
                  'applicableFeeHeadIds',
                  selected.map((head) => head.id)
                )
              }
              onBlur={() => formik.setFieldTouched('applicableFeeHeadIds', true)}
              renderInput={(params) => (
                <TextField
                  {...params}
                  required
                  label="Applicable fee heads"
                  placeholder="Search fee heads…"
                  error={Boolean(touched.applicableFeeHeadIds && errors.applicableFeeHeadIds)}
                  helperText={
                    (touched.applicableFeeHeadIds && errors.applicableFeeHeadIds
                      ? String(errors.applicableFeeHeadIds)
                      : undefined) || undefined
                  }
                />
              )}
              renderTags={(selected, getTagProps) =>
                selected.map((option, index) => (
                  <Chip
                    {...getTagProps({ index })}
                    key={option.id}
                    label={`${option.name}${option.status && option.status !== 'Active' ? ` (${option.status})` : ''}`}
                    size="small"
                    variant="outlined"
                  />
                ))
              }
            />
          ))}
        <Grid container spacing={2}>
          {[
            {
              name: 'allowPartialRefund',
              label: 'Allow partial refunds',
              help: 'Staff may request less than the full eligible paid balance.',
            },
            {
              name: 'includePaidCharges',
              label: 'Include paid charges',
              help: 'Allow refunds of collected charges in addition to fee heads.',
            },
            {
              name: 'includePaidLateFee',
              label: 'Include paid late fees',
              help: 'Allow refunds of collected late fees.',
            },
          ].map(({ name, label, help }) => (
            <Grid key={name} size={{ xs: 12, sm: 4 }}>
              <Paper variant="outlined" sx={{ p: 1.5, borderRadius: 1.5, height: 1 }}>
                <Stack direction="row" spacing={0.5} alignItems="center">
                  <FormControlLabel
                    sx={{ m: 0, flex: 1, minWidth: 0 }}
                    label={
                      <Typography variant="body2" fontWeight={500}>
                        {label}
                      </Typography>
                    }
                    control={
                      <Switch
                        size="small"
                        name={name}
                        checked={Boolean(values[name as keyof IRefundPolicyFormValues])}
                        onChange={(_, checked) => {
                          setFieldValue(name, checked);
                          if (
                            name === 'allowPartialRefund' &&
                            !checked &&
                            values.amountMode === 'ManualUpToEligible'
                          ) {
                            setFieldValue('amountMode', 'RemainingPaidAmount');
                          }
                        }}
                      />
                    }
                  />
                  <CustomTooltip title={help} arrow placement="top">
                    <IconButton size="small" aria-label={`${label} information`}>
                      <Iconify
                        icon="lucide:info"
                        width={16}
                        sx={{ color: 'info.main' }}
                        aria-hidden
                      />
                    </IconButton>
                  </CustomTooltip>
                </Stack>
              </Paper>
            </Grid>
          ))}
        </Grid>
      </Stack>
    </SectionCard>
  );
}
