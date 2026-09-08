'use client';

/**
 * ConcessionGeneralSection — Card 1
 * Policy Name, Description, Status (Draft / Active), Active Impact Warning, Change Reason
 */

import React from 'react';
import { alpha } from '@mui/material/styles';
import { GlobalIcons } from 'src/utils/icons';
import { Iconify } from 'src/components/iconify';
import ShakingTextField from 'src/components/shaking-text-field';
import {
  Box,
  Grid,
  Chip,
  Alert,
  Stack,
  Select,
  Skeleton,
  MenuItem,
  TextField,
  InputLabel,
  Typography,
  FormControl,
  FormHelperText,
} from '@mui/material';

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
      title="General Information"
      subtitle="Define policy identity, publication status, and core scope."
      icon={GlobalIcons.notebook}
    >
      <Grid container spacing={2.5}>
        {/* Policy Name */}
        <Grid size={{ xs: 12, sm: 8 }}>
          <ShakingTextField error={!!(formik.touched.policyName && formik.errors.policyName)}>
            <TextField
              fullWidth
              size="small"
              label="Policy Name *"
              name="policyName"
              placeholder="e.g. Sibling Discount Policy, Merit Scholarship Concession"
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

        {/* Status */}
        <Grid size={{ xs: 12, sm: 4 }}>
          <ShakingTextField error={!!(formik.touched.status && formik.errors.status)}>
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
                  if (event.target.value !== 'Active') formik.setFieldValue('isDefault', false);
                }}
                onBlur={formik.handleBlur}
                renderValue={(val) => {
                  const opt = STATUS_OPTIONS.find((o) => o.value === val);
                  return (
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Chip
                        label={opt?.label || val}
                        size="small"
                        color={opt?.color || 'default'}
                        variant={val === 'Active' ? 'filled' : 'outlined'}
                        sx={{ height: 22, fontSize: '0.72rem', fontWeight: 700 }}
                      />
                    </Box>
                  );
                }}
              >
                {STATUS_OPTIONS.map((o) => (
                  <MenuItem key={o.value} value={o.value}>
                    <Stack direction="row" spacing={1} alignItems="center">
                      <Chip
                        label={o.label}
                        size="small"
                        color={o.color}
                        variant={o.value === 'Active' ? 'filled' : 'outlined'}
                        sx={{ height: 20, fontSize: '0.68rem', fontWeight: 600 }}
                      />
                      <Typography variant="body2">{o.label}</Typography>
                    </Stack>
                  </MenuItem>
                ))}
              </Select>
              {formik.touched.status && formik.errors.status && (
                <FormHelperText>{formik.errors.status as string}</FormHelperText>
              )}
            </FormControl>
          </ShakingTextField>
        </Grid>

        {/* Description */}
        <Grid size={{ xs: 12 }}>
          <ShakingTextField error={!!(formik.touched.description && formik.errors.description)}>
            <TextField
              fullWidth
              size="small"
              multiline
              rows={2.5}
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
              placeholder="Describe the operational purpose, criteria, and administrative scope of this concession policy..."
            />
          </ShakingTextField>
        </Grid>

        <Grid size={{ xs: 12 }}>
          <DefaultPolicyToggle
            policyLabel="Concession"
            status={formik.values.status}
            checked={Boolean(formik.values.isDefault)}
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
                Active Policy Revision Notice
              </Typography>
              <Typography variant="caption" color="text.secondary" display="block" sx={{ mt: 0.5 }}>
                Modifications to this active policy will generate a new revision version. Historical
                student snapshots remain immutable.
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
                    label={`${impact.attachedFeeStructureCount} Attached Fee Structures`}
                  />
                  <Chip
                    size="small"
                    variant="outlined"
                    label={`${impact.studentAssignmentCount} Active Assignments`}
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
                label="Change Reason *"
                name="changeReason"
                placeholder="Explain the governance reason or operational justification for modifying this active policy..."
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
