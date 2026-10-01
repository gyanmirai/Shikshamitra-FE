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

import { SectionCard } from './CollectionCommon';
import DefaultPolicyToggle from '../DefaultPolicyToggle';

interface CollectionGeneralSectionProps {
  formik: any;
  otherDefaultPolicyName?: string;
  activeEdit?: boolean;
}

export default function CollectionGeneralSection({
  formik,
  otherDefaultPolicyName,
  activeEdit = false,
}: CollectionGeneralSectionProps) {
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
              size="small"
              label="Collection Policy Name *"
              placeholder="e.g. Standard Term Collection Policy"
              name="policyName"
              value={formik.values.policyName}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              error={formik.touched.policyName && Boolean(formik.errors.policyName)}
              helperText={formik.touched.policyName && (formik.errors.policyName as string)}
            />
          </ShakingTextField>
        </Grid>

        <Grid size={{ xs: 12, sm: 4 }}>
          <ShakingTextField error={formik.touched.status && Boolean(formik.errors.status)}>
            <FormControl
              fullWidth
              size="small"
              error={formik.touched.status && Boolean(formik.errors.status)}
            >
              <InputLabel>Status *</InputLabel>
              <Select
                label="Status *"
                name="status"
                value={formik.values.status}
                onChange={(event) => {
                  formik.handleChange(event);
                  if (event.target.value === 'Draft') {
                    formik.setFieldValue('isDefault', false);
                  }
                }}
                onBlur={formik.handleBlur}
                renderValue={(val) => (
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <Label color={val === 'Active' ? 'success' : 'warning'} sx={{ height: 20 }}>
                      {val}
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
                <MenuItem value="Active">
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

        <Grid size={{ xs: 12 }}>
          <ShakingTextField
            error={formik.touched.description && Boolean(formik.errors.description)}
          >
            <TextField
              fullWidth
              size="small"
              multiline
              rows={2.5}
              label="Policy Description"
              placeholder="Describe the rules, purpose, or intended classes/structures for this policy..."
              name="description"
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
                size="small"
                label="Change Reason (Optional)"
                name="changeReason"
                placeholder="Explain why this active collection policy is being changed..."
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
            policyLabel="Collection"
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
