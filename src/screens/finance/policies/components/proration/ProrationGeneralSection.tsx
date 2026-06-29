'use client';

/**
 * ProrationGeneralSection — Card 1
 * Policy Name, Description, Status (Active / Inactive)
 */

import React from 'react';
import {
  Box,
  Grid,
  Select,
  MenuItem,
  TextField,
  InputLabel,
  Typography,
  FormControl,
} from '@mui/material';

import { ProrationSectionCard } from './ProrationCommon';

const STATUS_OPTIONS = [
  { value: 'Active', label: 'Active' },
  { value: 'Inactive', label: 'Inactive' },
];

interface ProrationGeneralSectionProps {
  formik: any;
  onNameChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export default function ProrationGeneralSection({
  formik,
  onNameChange,
}: ProrationGeneralSectionProps) {
  return (
    <ProrationSectionCard
      title="Policy Information"
      subtitle="Define policy identity and activation status."
      icon="solar:document-bold-duotone"
    >
      <Grid container spacing={3}>
        {/* Policy Name */}
        <Grid size={{ xs: 12, sm: 8 }}>
          <TextField
            fullWidth
            size="small"
            label="Policy Name *"
            name="policyName"
            value={formik.values.policyName}
            onChange={onNameChange || formik.handleChange}
            onBlur={formik.handleBlur}
            error={formik.touched.policyName && Boolean(formik.errors.policyName)}
            helperText={
              (formik.touched.policyName && (formik.errors.policyName as string)) ||
              `${(formik.values.policyName || '').length}/100 — Must be unique (3–100 characters)`
            }
            inputProps={{ maxLength: 100 }}
            placeholder="e.g. Standard Mid-Session Proration"
          />
        </Grid>

        {/* Status */}
        <Grid size={{ xs: 12, sm: 4 }}>
          <FormControl fullWidth size="small">
            <InputLabel>Status *</InputLabel>
            <Select
              label="Status *"
              name="status"
              value={formik.values.status}
              onChange={formik.handleChange}
            >
              {STATUS_OPTIONS.map((o) => (
                <MenuItem key={o.value} value={o.value}>
                  {o.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>

        {/* Description */}
        <Grid size={{ xs: 12 }}>
          <TextField
            fullWidth
            size="small"
            multiline
            rows={2}
            label="Description"
            name="description"
            value={formik.values.description}
            onChange={formik.handleChange}
            error={Boolean(formik.errors.description)}
            helperText={
              (formik.errors.description as string) ||
              `${(formik.values.description || '').length}/500`
            }
            inputProps={{ maxLength: 500 }}
            placeholder="Describe when and how this proration policy should be applied..."
          />
        </Grid>

        {/* Info callout */}
        <Grid size={{ xs: 12 }}>
          <Box
            sx={{
              p: 1.5,
              bgcolor: 'warning.lighter',
              borderRadius: 1,
              border: '1px solid',
              borderColor: 'warning.light',
            }}
          >
            <Typography variant="caption" color="warning.dark" lineHeight={1.6}>
              <strong>Reusable Policy:</strong> This policy can be assigned to multiple Fee
              Structures. Updating the policy will only affect future demand generation — existing
              demands, receipts, and adjustments will not change.
            </Typography>
          </Box>
        </Grid>
      </Grid>
    </ProrationSectionCard>
  );
}
