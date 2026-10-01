'use client';

import React from 'react';
import { Label } from 'src/components/label';
import { GlobalIcons } from 'src/utils/icons';
import ShakingTextField from 'src/components/shaking-text-field';
import {
  Box,
  Grid,
  Stack,
  Select,
  MenuItem,
  TextField,
  InputLabel,
  Typography,
  FormControl,
  FormHelperText,
} from '@mui/material';

import DefaultPolicyToggle from '../DefaultPolicyToggle';
import { SectionCard } from '../collection/CollectionCommon';

interface ProrationGeneralSectionProps {
  formik: any;
  activeEdit?: boolean;
  canActivate?: boolean;
  otherDefaultPolicyName?: string;
}

export default function ProrationGeneralSection({
  formik,
  activeEdit = false,
  canActivate = false,
  otherDefaultPolicyName,
}: ProrationGeneralSectionProps) {
  return (
    <SectionCard
      title="General Information"
      subtitle="Configure policy identity, status, description, and academic year defaults."
      icon={GlobalIcons.notebook}
    >
      <Grid container spacing={2.5}>
        <Grid size={{ xs: 12, sm: 8 }}>
          <ShakingTextField error={formik.touched.policyName && Boolean(formik.errors.policyName)}>
            <TextField
              fullWidth
              required
              size="small"
              label="Proration Policy Name"
              placeholder="e.g. Standard Mid-Session Proration Policy"
              name="policyName"
              value={formik.values.policyName}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              error={formik.touched.policyName && Boolean(formik.errors.policyName)}
              helperText={formik.touched.policyName && (formik.errors.policyName as string)}
              inputProps={{ maxLength: 128 }}
            />
          </ShakingTextField>
        </Grid>

        <Grid size={{ xs: 12, sm: 4 }}>
          <ShakingTextField error={formik.touched.status && Boolean(formik.errors.status)}>
            <FormControl
              fullWidth
              required
              size="small"
              error={formik.touched.status && Boolean(formik.errors.status)}
            >
              <InputLabel>Status</InputLabel>
              <Select
                label="Status"
                name="status"
                value={formik.values.status}
                onChange={(event) => {
                  formik.handleChange(event);
                  if (event.target.value === 'Draft') formik.setFieldValue('isDefault', false);
                }}
                onBlur={formik.handleBlur}
                renderValue={(value) => (
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <Label color={value === 'Active' ? 'success' : 'warning'} sx={{ height: 20 }}>
                      {value}
                    </Label>
                  </Box>
                )}
              >
                <MenuItem value="Draft" disabled={Boolean(formik.initialValues.isDefault)}>
                  <Stack direction="row" spacing={1} alignItems="center">
                    <Label color="warning" sx={{ height: 20 }}>
                      Draft
                    </Label>
                    <Typography variant="caption" color="text.secondary">
                      (Work in progress, not assignable)
                    </Typography>
                  </Stack>
                </MenuItem>
                <MenuItem
                  value="Active"
                  disabled={!canActivate && formik.values.status !== 'Active'}
                >
                  <Stack direction="row" spacing={1} alignItems="center">
                    <Label color="success" sx={{ height: 20 }}>
                      Active
                    </Label>
                    <Typography variant="caption" color="text.secondary">
                      (Ready for fee structures)
                    </Typography>
                  </Stack>
                </MenuItem>
              </Select>
              {formik.touched.status && formik.errors.status && (
                <FormHelperText>{formik.errors.status as string}</FormHelperText>
              )}
            </FormControl>
          </ShakingTextField>
        </Grid>

        <Grid size={{ xs: 12, sm: 4 }}>
          <ShakingTextField error={formik.touched.policyCode && Boolean(formik.errors.policyCode)}>
            <TextField
              fullWidth
              size="small"
              label="Policy Code"
              name="policyCode"
              placeholder="e.g. PRORATE-STD-2026"
              value={formik.values.policyCode}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              error={formik.touched.policyCode && Boolean(formik.errors.policyCode)}
              helperText={
                (formik.touched.policyCode && (formik.errors.policyCode as string)) ||
                'Optional; generated automatically when blank'
              }
              inputProps={{ maxLength: 32 }}
            />
          </ShakingTextField>
        </Grid>

        <Grid size={{ xs: 12, sm: 8 }}>
          <ShakingTextField
            error={formik.touched.description && Boolean(formik.errors.description)}
          >
            <TextField
              fullWidth
              size="small"
              multiline
              rows={2}
              label="Policy Description"
              name="description"
              placeholder="Describe when and where this proration policy should be used..."
              value={formik.values.description}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              error={formik.touched.description && Boolean(formik.errors.description)}
              helperText={
                (formik.touched.description && (formik.errors.description as string)) ||
                `${(formik.values.description || '').length}/500 characters`
              }
              inputProps={{ maxLength: 500 }}
            />
          </ShakingTextField>
        </Grid>

        {activeEdit && (
          <Grid size={{ xs: 12 }}>
            <ShakingTextField
              error={formik.touched.changeReason && Boolean(formik.errors.changeReason)}
            >
              <TextField
                fullWidth
                required
                size="small"
                multiline
                rows={2}
                label="Change Reason"
                name="changeReason"
                placeholder="Explain why this active proration policy is being changed..."
                value={formik.values.changeReason || ''}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={formik.touched.changeReason && Boolean(formik.errors.changeReason)}
                helperText={
                  (formik.touched.changeReason && (formik.errors.changeReason as string)) ||
                  `${(formik.values.changeReason || '').length}/500 — recorded in version history and audit trail`
                }
                inputProps={{ maxLength: 500 }}
              />
            </ShakingTextField>
          </Grid>
        )}

        <Grid size={{ xs: 12 }}>
          <DefaultPolicyToggle
            policyLabel="Proration"
            status={formik.values.status}
            checked={Boolean(formik.values.isDefault)}
            currentDefault={Boolean(formik.initialValues.isDefault)}
            onChange={(checked) => formik.setFieldValue('isDefault', checked)}
            otherDefaultPolicyName={otherDefaultPolicyName}
          />
        </Grid>
      </Grid>
    </SectionCard>
  );
}
