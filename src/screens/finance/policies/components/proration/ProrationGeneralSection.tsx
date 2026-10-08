'use client';

import React from 'react';
import { Label } from 'src/components/label';
import { GlobalIcons } from 'src/utils/icons';
import { capitalizeWords } from 'src/utils/input-format';
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
import { ConcessionSectionCard as SectionCard } from '../concession/ConcessionCommon';

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
      subtitle="Name the policy and choose when it is available."
      icon={GlobalIcons.notebook}
    >
      <Grid container spacing={2}>
        <Grid size={{ xs: 12, sm: 7 }}>
          <ShakingTextField error={formik.touched.policyName && Boolean(formik.errors.policyName)}>
            <TextField
              fullWidth
              required
              size="small"
              label="Policy name"
              placeholder="e.g. Standard Mid-Session Proration Policy"
              name="policyName"
              value={formik.values.policyName}
              onChange={(event) => {
                formik.setFieldValue('policyName', capitalizeWords(event.target.value));
              }}
              onBlur={formik.handleBlur}
              error={formik.touched.policyName && Boolean(formik.errors.policyName)}
              helperText={
                (formik.touched.policyName && (formik.errors.policyName as string)) ||
                `${(formik.values.policyName || '').length}/128 characters`
              }
              inputProps={{ maxLength: 128 }}
            />
          </ShakingTextField>
        </Grid>

        <Grid size={{ xs: 12, sm: 5 }}>
          <ShakingTextField error={formik.touched.status && Boolean(formik.errors.status)}>
            <FormControl
              fullWidth
              required
              size="small"
              error={formik.touched.status && Boolean(formik.errors.status)}
            >
              <InputLabel id="proration-status-label">Status</InputLabel>
              <Select
                labelId="proration-status-label"
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

        <Grid size={{ xs: 12, sm: 7 }}>
          <ShakingTextField
            error={formik.touched.description && Boolean(formik.errors.description)}
          >
            <TextField
              fullWidth
              size="small"
              multiline
              rows={2}
              label="Description"
              name="description"
              placeholder="Describe when and where this proration policy should be used..."
              value={formik.values.description}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              error={formik.touched.description && Boolean(formik.errors.description)}
              helperText={formik.touched.description && (formik.errors.description as string)}
              inputProps={{ maxLength: 500 }}
            />
          </ShakingTextField>
        </Grid>

        <Grid size={{ xs: 12, sm: 5 }}>
          <DefaultPolicyToggle
            compact
            descriptionDisplay="tooltip"
            policyLabel="Proration"
            status={formik.values.status}
            checked={Boolean(formik.values.isDefault)}
            currentDefault={Boolean(formik.initialValues.isDefault)}
            onChange={(checked) => formik.setFieldValue('isDefault', checked)}
            otherDefaultPolicyName={otherDefaultPolicyName}
          />
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
                label="Change reason"
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
      </Grid>
    </SectionCard>
  );
}
