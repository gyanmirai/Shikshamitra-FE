'use client';

/**
 * ConcessionGeneralSection — Card 1
 * Policy Name, Description, Status (Draft / Active), Active Impact Warning, Change Reason
 */

import React from 'react';
import { alpha } from '@mui/material/styles';
import { GlobalIcons } from 'src/utils/icons';
import { Iconify } from 'src/components/iconify';
import { Label } from 'src/components/label';
import CustomSelect from 'src/components/custom-select';
import ShakingTextField from 'src/components/shaking-text-field';
import { Box, Grid, Chip, Alert, Stack, Skeleton, TextField, Typography } from '@mui/material';

import DefaultPolicyToggle from '../DefaultPolicyToggle';
import { ConcessionSectionCard } from './ConcessionCommon';

const STATUS_OPTIONS = [
  { value: 'Draft', label: 'Draft', color: 'warning' as const },
  { value: 'Active', label: 'Active', color: 'success' as const },
];

interface ConcessionGeneralSectionProps {
  formik: any;
  onNameChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  activeEdit?: boolean;
  impact?: {
    currentVersion: number;
    attachedFeeStructureCount: number;
    studentAssignmentCount: number;
    concessionRequestCount: number;
  };
  isImpactLoading?: boolean;
}

export default function ConcessionGeneralSection({
  formik,
  onNameChange,
  activeEdit = false,
  impact,
  isImpactLoading = false,
}: ConcessionGeneralSectionProps) {
  return (
    <ConcessionSectionCard
      title="General information"
      subtitle="Name the policy and choose when it is available."
      icon={GlobalIcons.notebook}
    >
      <Grid container spacing={1}>
        {/* Policy Name */}
        <Grid size={{ xs: 12, sm: 7 }}>
          <ShakingTextField error={!!(formik.touched.policyName && formik.errors.policyName)}>
            <TextField
              fullWidth
              size="small"
              label="Policy name *"
              name="policyName"
              placeholder="e.g. Sibling tuition assistance"
              value={formik.values.policyName}
              onChange={onNameChange || formik.handleChange}
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
          <ShakingTextField error={Boolean(formik.touched.status && formik.errors.status)}>
            <CustomSelect
              fullWidth
              size="small"
              label="Status *"
              name="status"
              options={STATUS_OPTIONS}
              value={formik.values.status}
              onChange={(value) => {
                formik.setFieldValue('status', value);
                if (value !== 'Active') formik.setFieldValue('isDefault', false);
              }}
              onBlur={() => formik.setFieldTouched('status', true)}
              disabledValues={formik.initialValues.isDefault ? ['Draft'] : []}
              disabledLabel="Choose another default policy first"
              renderValue={(value) => (
                <Label color={value === 'Active' ? 'success' : 'warning'}>{String(value)}</Label>
              )}
              error={Boolean(formik.touched.status && formik.errors.status)}
              helperText={
                (formik.touched.status && formik.errors.status) ||
                (formik.values.status === 'Active'
                  ? 'Available for concession requests.'
                  : 'Save for review before making it active.')
              }
            />
          </ShakingTextField>
        </Grid>

        {/* Description */}
        <Grid size={{ xs: 12, sm: 7 }}>
          <ShakingTextField error={!!(formik.touched.description && formik.errors.description)}>
            <TextField
              fullWidth
              size="small"
              multiline
              rows={3}
              label="Description"
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
              placeholder="Describe who this policy supports and when to use it."
            />
          </ShakingTextField>
        </Grid>

        <Grid size={{ xs: 12, sm: 5 }}>
          <DefaultPolicyToggle
            policyLabel="Concession"
            status={formik.values.status}
            checked={Boolean(formik.values.isDefault)}
            currentDefault={Boolean(formik.initialValues.isDefault)}
            onChange={(checked) => formik.setFieldValue('isDefault', checked)}
          />
        </Grid>

        {/* Active Policy Edit Impact Preview Banner */}
        {activeEdit && (
          <Grid size={{ xs: 12 }}>
            <Alert
              severity="warning"
              variant="outlined"
              icon={<Iconify icon={GlobalIcons.alertIcon} width={22} height={22} />}
              sx={{
                borderRadius: 1.5,
                bgcolor: (theme) => alpha(theme.palette.warning.main, 0.04),
                borderColor: (theme) => alpha(theme.palette.warning.main, 0.3),
              }}
            >
              <Typography variant="subtitle2" fontWeight={700} color="warning.dark">
                Updating an active policy
              </Typography>
              <Typography variant="caption" color="text.secondary" display="block" sx={{ mt: 0.5 }}>
                Modifications to this active policy will generate a new revision version. Historical
                request snapshots remain immutable.
              </Typography>

              {isImpactLoading || !impact ? (
                <Stack direction="row" spacing={1} sx={{ mt: 1.5 }}>
                  <Skeleton variant="rounded" width={80} height={26} />
                  <Skeleton variant="rounded" width={120} height={26} />
                  <Skeleton variant="rounded" width={110} height={26} />
                  <Skeleton variant="rounded" width={90} height={26} />
                </Stack>
              ) : (
                <Stack direction="row" spacing={1} useFlexGap flexWrap="wrap" sx={{ mt: 1.5 }}>
                  <Chip
                    size="small"
                    color="primary"
                    variant="soft"
                    icon={<Iconify icon={GlobalIcons.newversion} width={14} height={14} />}
                    label={`Current: Version ${impact.currentVersion}`}
                    sx={{ fontWeight: 600 }}
                  />
                  <Chip
                    size="small"
                    variant="outlined"
                    label={`${impact.concessionRequestCount} Concession Requests`}
                  />
                </Stack>
              )}
            </Alert>
          </Grid>
        )}

        {/* Change Reason Input (Mandatory when editing Active policy) */}
        {activeEdit && (
          <Grid size={{ xs: 12 }}>
            <ShakingTextField error={!!(formik.touched.changeReason && formik.errors.changeReason)}>
              <TextField
                fullWidth
                size="small"
                label="Change reason *"
                name="changeReason"
                placeholder="Explain why the policy is changing."
                value={formik.values.changeReason || ''}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={formik.touched.changeReason && Boolean(formik.errors.changeReason)}
                helperText={
                  (formik.touched.changeReason && (formik.errors.changeReason as string)) ||
                  `${(formik.values.changeReason || '').length}/500 — Audit trail compliance requirement`
                }
                inputProps={{ maxLength: 500 }}
              />
            </ShakingTextField>
          </Grid>
        )}
      </Grid>
    </ConcessionSectionCard>
  );
}
