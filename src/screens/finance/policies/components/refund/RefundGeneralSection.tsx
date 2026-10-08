'use client';

import type { FormikProps } from 'formik';
import type { RefundPolicyImpactResponse } from 'src/redux/finance/refundPolicy';

import React from 'react';
import { Label } from 'src/components/label';
import { GlobalIcons } from 'src/utils/icons';
import { capitalizeWords } from 'src/utils/input-format';
import { Iconify } from 'src/components/iconify';
import CustomTooltip from 'src/components/custom-tooltip';
import ShakingTextField from 'src/components/shaking-text-field';
import {
  Box,
  Grid,
  Alert,
  Stack,
  Select,
  MenuItem,
  Skeleton,
  TextField,
  InputLabel,
  Typography,
  FormControl,
  FormHelperText,
} from '@mui/material';

import { SectionCard } from './RefundCommon';
import DefaultPolicyToggle from '../DefaultPolicyToggle';

import type { IRefundPolicyFormValues } from '../../types/finance-policy.types';

interface RefundGeneralSectionProps {
  formik: FormikProps<IRefundPolicyFormValues>;
  activeEdit?: boolean;
  impact?: RefundPolicyImpactResponse | null;
  isImpactLoading?: boolean;
}

export default function RefundGeneralSection({
  formik,
  activeEdit,
  impact,
  isImpactLoading,
}: RefundGeneralSectionProps) {
  const { values, errors, touched, handleChange, handleBlur } = formik;

  const isFieldInvalid = (name: keyof IRefundPolicyFormValues) =>
    Boolean(touched[name] && errors[name]);

  const getHelperText = (name: keyof IRefundPolicyFormValues) =>
    touched[name] ? (errors[name] as string) : undefined;

  return (
    <SectionCard
      title="General Information"
      subtitle="Give the policy a clear name and choose whether it is ready to use."
      icon={GlobalIcons.notebook}
    >
      {activeEdit && (
        <Alert
          severity="info"
          icon={<Iconify icon="solar:info-circle-bold" />}
          sx={{ mb: 2.5, borderRadius: 1.25 }}
        >
          {isImpactLoading ? (
            <Skeleton width="100%" height={24} aria-label="Loading policy impact" />
          ) : (
            `This Active policy is currently attached to ${impact?.attachedFeeStructureCount ?? 0} fee structure(s) and referenced by ${impact?.studentAssignmentCount ?? 0} student assignment(s). Modifying this policy will create a new version snapshot.`
          )}
        </Alert>
      )}

      <Grid container spacing={2}>
        {/* Policy Name */}
        <Grid size={{ xs: 12, sm: 6 }}>
          <ShakingTextField error={isFieldInvalid('policyName')}>
            <TextField
              fullWidth
              size="small"
              required
              name="policyName"
              label="Policy name"
              placeholder="e.g. Standard Admission Refund Policy"
              value={values.policyName}
              onChange={(event) => {
                formik.setFieldValue('policyName', capitalizeWords(event.target.value));
              }}
              onBlur={handleBlur}
              error={isFieldInvalid('policyName')}
              helperText={getHelperText('policyName')}
            />
          </ShakingTextField>
        </Grid>

        {/* Status */}
        <Grid size={{ xs: 12, sm: 6 }}>
          <ShakingTextField error={isFieldInvalid('status')}>
            <FormControl fullWidth size="small" error={isFieldInvalid('status')}>
              <InputLabel>Status *</InputLabel>
              <Select
                label="Status *"
                name="status"
                value={values.status}
                onChange={(event) => {
                  handleChange(event);
                  if (event.target.value !== 'Active') formik.setFieldValue('isDefault', false);
                }}
                onBlur={handleBlur}
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
              {getHelperText('status') && (
                <FormHelperText>{getHelperText('status')}</FormHelperText>
              )}
            </FormControl>
          </ShakingTextField>
        </Grid>

        {/* Description */}
        <Grid size={{ xs: 12, sm: 7 }}>
          <TextField
            fullWidth
            multiline
            rows={2}
            size="small"
            name="description"
            label="Description"
            placeholder="Document refund conditions, administrative notes, or exceptions..."
            value={values.description || ''}
            onChange={handleChange}
            onBlur={handleBlur}
            error={isFieldInvalid('description')}
            helperText={getHelperText('description')}
            inputProps={{ maxLength: 500 }}
          />
        </Grid>

        <Grid size={{ xs: 12, sm: 5 }}>
          <DefaultPolicyToggle
            compact
            descriptionDisplay="tooltip"
            policyLabel="Refund"
            status={values.status}
            checked={Boolean(values.isDefault)}
            currentDefault={Boolean(formik.initialValues.isDefault)}
            onChange={(checked) => formik.setFieldValue('isDefault', checked)}
          />
        </Grid>

        {/* Change Reason (Mandatory when editing Active policy) */}
        {activeEdit && (
          <Grid size={{ xs: 12 }}>
            <TextField
              fullWidth
              required
              size="small"
              name="changeReason"
              label="Reason for Modification"
              placeholder="e.g. Updated refundable fee heads after the finance committee review"
              value={values.changeReason || ''}
              onChange={handleChange}
              onBlur={handleBlur}
              error={isFieldInvalid('changeReason')}
              helperText={
                getHelperText('changeReason') ||
                'Mandatory audit log record explaining this revision in version history.'
              }
              slotProps={{
                input: {
                  endAdornment: (
                    <CustomTooltip
                      title="This explanation is permanently logged in the policy version audit trail for regulatory compliance."
                      arrow
                    >
                      <Box
                        component="span"
                        sx={{ cursor: 'pointer', display: 'flex', color: 'info.main' }}
                      >
                        <Iconify icon={GlobalIcons.info} width={18} height={18} />
                      </Box>
                    </CustomTooltip>
                  ),
                },
              }}
            />
          </Grid>
        )}
      </Grid>
    </SectionCard>
  );
}
