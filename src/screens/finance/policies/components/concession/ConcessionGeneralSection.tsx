'use client';

/**
 * ConcessionGeneralSection — Card 1
 * Policy Name, Description, Status (Active / Archived), Default Policy toggle
 */

import React from 'react';
import {
  Box,
  Grid,
  Card,
  Select,
  Switch,
  MenuItem,
  TextField,
  InputLabel,
  Typography,
  FormControl,
  FormControlLabel,
} from '@mui/material';

import { ConcessionSectionCard } from './ConcessionCommon';

const STATUS_OPTIONS = [
  { value: 'Active', label: 'Active' },
  { value: 'Archived', label: 'Archived' },
];

interface ConcessionGeneralSectionProps {
  formik: any;
  onNameChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export default function ConcessionGeneralSection({
  formik,
  onNameChange,
}: ConcessionGeneralSectionProps) {
  return (
    <ConcessionSectionCard
      title="General Information"
      subtitle="Define policy identity and base configuration."
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
          />
        </Grid>

        {/* Status */}
        <Grid size={{ xs: 12, sm: 4 }}>
          <FormControl fullWidth size="small">
            <InputLabel>Status</InputLabel>
            <Select
              label="Status"
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
            placeholder="Describe the purpose and scope of this concession policy..."
          />
        </Grid>

        {/* Default Policy Toggle */}
        <Grid size={{ xs: 12 }}>
          <Card
            variant="outlined"
            sx={{
              px: 2,
              py: 1.25,
              display: 'flex',
              alignItems: 'center',
              bgcolor: formik.values.isDefault ? 'primary.lighter' : 'transparent',
              borderColor: formik.values.isDefault ? 'primary.main' : 'divider',
              transition: 'all 0.2s ease',
              cursor: 'pointer',
            }}
            onClick={() => formik.setFieldValue('isDefault', !formik.values.isDefault)}
          >
            <FormControlLabel
              sx={{ m: 0, pointerEvents: 'none' }}
              control={<Switch size="small" checked={formik.values.isDefault} />}
              label={
                <Box ml={0.5}>
                  <Typography variant="body2" fontWeight={600}>
                    Default Concession Policy
                  </Typography>
                  <Typography variant="caption" color="text.secondary" display="block">
                    This policy will be pre-selected when a finance admin creates a new concession
                    request.
                  </Typography>
                </Box>
              }
            />
          </Card>
        </Grid>
      </Grid>
    </ConcessionSectionCard>
  );
}
