'use client';

/**
 * ConcessionFeeHeadsSection — Card 3
 * Apply On: Entire Fee Structure | Selected Fee Heads (Autocomplete multi-select)
 */

import React from 'react';
import {
  Box,
  Grid,
  Chip,
  Select,
  MenuItem,
  TextField,
  InputLabel,
  Typography,
  FormControl,
  Autocomplete,
} from '@mui/material';

import { ConcessionSectionCard } from './ConcessionCommon';

const FEE_SCOPE_OPTIONS = [
  { value: 'EntireFeeStructure', label: 'Entire Fee Structure' },
  { value: 'SelectedFeeHeads', label: 'Selected Fee Heads Only' },
];

// Default fee heads if none fetched from API
const DEFAULT_FEE_HEADS = [
  { id: 'tuition', name: 'Tuition Fee' },
  { id: 'hostel', name: 'Hostel Fee' },
  { id: 'transport', name: 'Transport Fee' },
  { id: 'library', name: 'Library Fee' },
  { id: 'examination', name: 'Examination Fee' },
  { id: 'sports', name: 'Sports Fee' },
  { id: 'lab', name: 'Lab Fee' },
  { id: 'development', name: 'Development Fee' },
];

interface ConcessionFeeHeadsSectionProps {
  formik: any;
  feeHeads?: { id: string; name: string }[];
}

export default function ConcessionFeeHeadsSection({
  formik,
  feeHeads = [],
}: ConcessionFeeHeadsSectionProps) {
  const heads = feeHeads.length > 0 ? feeHeads : DEFAULT_FEE_HEADS;
  const isSelected = formik.values.feeHeadScope === 'SelectedFeeHeads';

  // Resolve selected fee head objects from stored IDs
  const selectedHeads = heads.filter((h) => formik.values.applicableFeeHeads.includes(h.id));

  return (
    <ConcessionSectionCard
      title="Applicable Fee Heads"
      subtitle="Define which fee heads this concession applies to."
    >
      <Grid container spacing={3}>
        {/* Scope */}
        <Grid size={{ xs: 12, sm: 6 }}>
          <FormControl fullWidth size="small">
            <InputLabel>Apply On</InputLabel>
            <Select
              label="Apply On"
              name="feeHeadScope"
              value={formik.values.feeHeadScope}
              onChange={(e) => {
                formik.handleChange(e);
                if (e.target.value === 'EntireFeeStructure') {
                  formik.setFieldValue('applicableFeeHeads', []);
                }
              }}
            >
              {FEE_SCOPE_OPTIONS.map((o) => (
                <MenuItem key={o.value} value={o.value}>
                  {o.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>

        {/* Autocomplete Fee Heads */}
        {isSelected && (
          <Grid size={{ xs: 12 }}>
            <Autocomplete
              multiple
              size="small"
              options={heads}
              getOptionLabel={(option) => option.name}
              isOptionEqualToValue={(option, value) => option.id === value.id}
              value={selectedHeads}
              onChange={(_e, newValue) => {
                formik.setFieldValue(
                  'applicableFeeHeads',
                  newValue.map((h) => h.id)
                );
              }}
              onBlur={() => formik.setFieldTouched('applicableFeeHeads', true)}
              renderTags={(value, getTagProps) =>
                value.map((option, index) => (
                  <Chip
                    label={option.name}
                    size="small"
                    {...getTagProps({ index })}
                    sx={{ height: 22, fontSize: '0.72rem' }}
                  />
                ))
              }
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Fee Heads *"
                  placeholder={selectedHeads.length === 0 ? 'Search and select fee heads…' : ''}
                  error={
                    formik.touched.applicableFeeHeads && Boolean(formik.errors.applicableFeeHeads)
                  }
                  helperText={
                    formik.touched.applicableFeeHeads && formik.errors.applicableFeeHeads
                      ? (formik.errors.applicableFeeHeads as string)
                      : 'Select one or more fee heads this concession will be applied to'
                  }
                />
              )}
            />
          </Grid>
        )}

        {/* Info when entire structure */}
        {!isSelected && (
          <Grid size={{ xs: 12 }}>
            <Box
              sx={{
                p: 1.5,
                bgcolor: 'action.hover',
                borderRadius: 1,
                border: '1px solid',
                borderColor: 'divider',
              }}
            >
              <Typography variant="caption" color="text.secondary">
                The concession will be applied across all fee heads in the student&apos;s fee
                structure when the policy is selected in a concession request.
              </Typography>
            </Box>
          </Grid>
        )}
      </Grid>
    </ConcessionSectionCard>
  );
}
