'use client';

import { sanitizeFinanceName } from 'src/utils/finance-name';
/**
 * ConcessionGeneralSection — Card 1
 * Policy Name, Description, Status (Draft / Active), Active Impact Warning, Change Reason
 */

import React from 'react';

import { GlobalIcons } from 'src/utils/icons';

import { Label } from 'src/components/label';
import CustomSelect from 'src/components/custom-select';
import ShakingTextField from 'src/components/shaking-text-field';
import { Grid, TextField } from '@mui/material';

import DefaultPolicyToggle from '../DefaultPolicyToggle';
import { ConcessionSectionCard } from './ConcessionCommon';

const STATUS_OPTIONS = [
  {
    value: 'Draft',
    label: 'Draft',
    color: 'warning' as const,
    caption: 'Save for review before making it active.',
  },
  {
    value: 'Active',
    label: 'Active',
    color: 'success' as const,
    caption: 'Available for concession requests.',
  },
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
}: ConcessionGeneralSectionProps) {
  return (
    <ConcessionSectionCard
      subtitle="Name the policy and choose when it is available."
      title="General Information"

      icon={GlobalIcons.notebook}
    >
      <Grid container spacing={2}>
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
              onChange={
                onNameChange ||
                ((event) =>
                  formik.setFieldValue('policyName', sanitizeFinanceName(event.target.value)))
              }
              onBlur={formik.handleBlur}
              error={formik.touched.policyName && Boolean(formik.errors.policyName)}
              helperText={
                (formik.touched.policyName && (formik.errors.policyName as string)) || undefined
              }
              inputProps={{ maxLength: 128 }}
            />
          </ShakingTextField>
        </Grid>

        <Grid size={{ xs: 12, sm: 5 }}>
          <ShakingTextField error={Boolean(formik.touched.status && formik.errors.status)}>
            <CustomSelect
              optionDescriptionKey="caption"
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
              helperText={(formik.touched.status && formik.errors.status) || undefined}
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
              rows={2}
              label="Description"
              name="description"
              value={formik.values.description}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              error={formik.touched.description && Boolean(formik.errors.description)}
              helperText={
                (formik.touched.description && (formik.errors.description as string)) || undefined
              }
              inputProps={{ maxLength: 500 }}
              placeholder="Describe who this policy supports and when to use it."
            />
          </ShakingTextField>
        </Grid>

        <Grid size={{ xs: 12, sm: 5 }}>
          <DefaultPolicyToggle
            compact
            descriptionDisplay="tooltip"
            policyLabel="Concession"
            status={formik.values.status}
            checked={Boolean(formik.values.isDefault)}
            currentDefault={Boolean(formik.initialValues.isDefault)}
            onChange={(checked) => formik.setFieldValue('isDefault', checked)}
          />
        </Grid>

        {/* Active Policy Edit Impact Preview Banner */}

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
                  undefined
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
