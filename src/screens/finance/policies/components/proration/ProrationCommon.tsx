'use client';

import type { FormikProps } from 'formik';

import React from 'react';
import { Label } from 'src/components/label';
import { Iconify } from 'src/components/iconify';
import { Scrollbar } from 'src/components/scrollbar';
import { Box, Stack, Divider, Typography } from '@mui/material';

import { enabledModels, isProratedRule } from './prorationRuleHelpers';

import type { getProrationFormChecks } from '../../hooks/useProrationPolicyForm';
import type { IProrationPolicyFormValues } from '../../types/finance-policy.types';

export function SummaryRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <Stack direction="row" justifyContent="space-between" alignItems="center" gap={1}>
      <Typography variant="caption" color="text.secondary">
        {label}
      </Typography>
      <Box sx={{ textAlign: 'right', minWidth: 0, overflowWrap: 'anywhere' }}>{value}</Box>
    </Stack>
  );
}

export function ValidationCheckItem({
  label,
  valid,
  description,
}: {
  label: string;
  valid: boolean;
  description?: string;
}) {
  return (
    <Stack direction="row" alignItems="flex-start" gap={1}>
      <Iconify
        icon={valid ? 'solar:check-circle-bold' : 'solar:clock-circle-bold'}
        width={16}
        sx={{ color: valid ? 'success.main' : 'text.secondary', mt: 0.25, flexShrink: 0 }}
      />
      <Box>
        <Typography variant="caption" display="block">
          {valid ? 'Complete: ' : 'Pending: '}
          {label}
        </Typography>
        {description && (
          <Typography variant="caption" color="text.secondary" display="block">
            {description}
          </Typography>
        )}
      </Box>
    </Stack>
  );
}

export function ProrationSummaryPanel({
  formik,
  checks,
  inline = false,
}: {
  formik: FormikProps<IProrationPolicyFormValues>;
  checks: ReturnType<typeof getProrationFormChecks>;
  inline?: boolean;
}) {
  const { values } = formik;
  const recurringRules = values.feeHeadRules.filter((rule) => rule.feeType !== 'OneTime');
  const proratedCount = recurringRules.filter(isProratedRule).length;
  const modelCounts: Record<string, number> = {};
  recurringRules.forEach((rule) => {
    new Set(enabledModels(rule).filter((model) => model !== 'NoProration')).forEach((model) => {
      modelCounts[model] = (modelCounts[model] ?? 0) + 1;
    });
  });
  const labels: Record<string, string> = {
    DailyProration: 'Daily proration',
    MonthlyProration: 'Monthly proration',
    FullMonthCharge: 'Full month charge',
  };
  const content = (
    <Stack spacing={2} sx={{ p: 2 }}>
      <Typography variant="subtitle2">Policy Summary</Typography>
      <Stack spacing={1}>
        <SummaryRow
          label="Policy name"
          value={
            <Typography variant="caption" fontWeight={600}>
              {values.policyName.trim() || '—'}
            </Typography>
          }
        />
        <SummaryRow
          label="Status"
          value={
            <Label color={values.status === 'Active' ? 'success' : 'warning'}>
              {values.status}
            </Label>
          }
        />
        <SummaryRow
          label="Default policy"
          value={
            <Typography variant="caption">
              {values.isDefault && values.status === 'Active' ? 'Yes' : 'No'}
            </Typography>
          }
        />
        <SummaryRow
          label="Prorated recurring fees"
          value={
            <Typography variant="caption" fontWeight={600}>
              {proratedCount} / {recurringRules.length}
            </Typography>
          }
        />
      </Stack>
      {Object.keys(modelCounts).length > 0 && (
        <>
          <Divider />
          <Stack spacing={0.75}>
            <Typography variant="caption" color="text.secondary">
              Models in use · fee heads
            </Typography>
            {Object.entries(modelCounts).map(([model, count]) => (
              <SummaryRow
                key={model}
                label={labels[model] || model}
                value={<Typography variant="caption">{count}</Typography>}
              />
            ))}
          </Stack>
        </>
      )}
      <Divider />
      <Stack spacing={1.25}>
        <Typography variant="subtitle2">Validation Checklist</Typography>
        <ValidationCheckItem label="General information" valid={checks.generalValid} />
        <ValidationCheckItem
          label={`Daily or Monthly proration (${checks.recurringEnabledCount})`}
          valid={checks.feeHeadsValid}
          description={
            !checks.feeHeadsValid
              ? 'Enable at least one recurring fee for admission or early withdrawal.'
              : undefined
          }
        />
        <ValidationCheckItem label="Enabled event settings" valid={checks.allRuleSettingsValid} />
        <Label
          color={checks.isReadyToPublish ? 'success' : 'default'}
          sx={{ alignSelf: 'flex-start' }}
        >
          {checks.isReadyToPublish
            ? values.status === 'Active'
              ? 'Ready to save as active'
              : 'Ready to save draft'
            : 'Complete required settings'}
        </Label>
      </Stack>
      <Divider />
      <Typography variant="caption" color="text.secondary">
        Attach this policy to a fee structure. Admission and last chargeable dates determine
        proration. Existing recorded dues and receipts keep their amounts.
      </Typography>
    </Stack>
  );
  return (
    <Box
      component="aside"
      aria-label="Policy Summary"
      sx={{
        width: inline ? '100%' : 280,
        minWidth: 0,
        flexShrink: 0,
        display: inline ? { xs: 'block', lg: 'none' } : { xs: 'none', lg: 'flex' },
        flexDirection: 'column',
        bgcolor: 'background.neutral',
        overflow: 'hidden',
        borderLeft: inline ? 0 : 1,
        border: inline ? 1 : undefined,
        borderColor: 'divider',
        borderRadius: inline ? 1.5 : 0,
      }}
    >
      {inline ? content : <Scrollbar sx={{ flex: 1, minHeight: 0 }}>{content}</Scrollbar>}
    </Box>
  );
}
