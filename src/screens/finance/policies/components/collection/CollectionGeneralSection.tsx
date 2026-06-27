'use client';

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
} from '@mui/material'; // Wait, let's just type formik as any if needed, or import formik type.
import { SectionCard } from './CollectionCommon';

interface CollectionGeneralSectionProps {
  formik: any;
}

export default function CollectionGeneralSection({ formik }: CollectionGeneralSectionProps) {
  return (
    <SectionCard
      title="General Information"
      subtitle="Configure base policy options, name, status, and default rules."
    >
      <Grid container spacing={2.5}>
        <Grid size={{ xs: 12, sm: 8 }}>
          <TextField
            fullWidth
            size="small"
            label="Collection Policy Name *"
            name="policyName"
            value={formik.values.policyName}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            error={formik.touched.policyName && Boolean(formik.errors.policyName)}
            helperText={formik.touched.policyName && (formik.errors.policyName as string)}
          />
        </Grid>

        <Grid size={{ xs: 12, sm: 4 }}>
          <FormControl fullWidth size="small">
            <InputLabel>Status *</InputLabel>
            <Select
              label="Status *"
              name="status"
              value={formik.values.status}
              onChange={formik.handleChange}
            >
              <MenuItem value="Active">Active</MenuItem>
              <MenuItem value="Archived">Archived</MenuItem>
            </Select>
          </FormControl>
        </Grid>

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
          />
        </Grid>

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
                    Default Collection Policy
                  </Typography>
                  <Typography variant="caption" color="text.secondary" display="block">
                    Use this policy automatically when no collection policy is selected in the Fee
                    Structure.
                  </Typography>
                </Box>
              }
            />
          </Card>
        </Grid>
      </Grid>
    </SectionCard>
  );
}
