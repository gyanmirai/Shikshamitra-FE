'use client';

import React from 'react';
import { Label } from 'src/components/label';
import { Iconify } from 'src/components/iconify';
import { Scrollbar } from 'src/components/scrollbar';
import { Box, Paper, Stack, Divider, Typography } from '@mui/material';
import { alpha } from '@mui/material/styles';

// ─── Summary Row ─────────────────────────────────────────────────────────────

export function SummaryRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        py: 0.5,
      }}
    >
      <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.72rem' }}>
        {label}
      </Typography>
      <Box>{value}</Box>
    </Box>
  );
}

// ─── Validation Check Item ───────────────────────────────────────────────────

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
    <Box
      sx={{
        display: 'flex',
        alignItems: 'flex-start',
        gap: 1,
        py: 0.6,
      }}
    >
      <Iconify
        icon={valid ? 'solar:check-circle-bold' : 'solar:danger-circle-bold'}
        width={16}
        height={16}
        sx={{
          color: valid ? 'success.main' : 'warning.main',
          mt: 0.2,
          flexShrink: 0,
        }}
      />
      <Box sx={{ minWidth: 0, flex: 1 }}>
        <Typography
          variant="caption"
          fontWeight={valid ? 600 : 500}
          color={valid ? 'text.primary' : 'text.secondary'}
          sx={{ fontSize: '0.72rem', lineHeight: 1.3 }}
        >
          {label}
        </Typography>
        {description && (
          <Typography
            variant="caption"
            color="text.disabled"
            sx={{ fontSize: '0.65rem', display: 'block', mt: 0.2 }}
          >
            {description}
          </Typography>
        )}
      </Box>
    </Box>
  );
}

// ─── ProrationSummaryPanel ────────────────────────────────────────────────────

interface ProrationSummaryPanelProps {
  formik: any;
  checks: {
    generalValid: boolean;
    feeHeadsValid: boolean;
    isReadyToPublish: boolean;
    configuredCount: number;
    recurringEnabledCount: number;
    allRuleSettingsValid: boolean;
    isDefaultConflict: boolean;
  };
}

export function ProrationSummaryPanel({ formik, checks }: ProrationSummaryPanelProps) {
  const { values } = formik;

  const totalRules: number = values.feeHeadRules?.length ?? 0;
  const enabledRules: number =
    values.feeHeadRules?.filter((r: any) => r.ruleType !== 'NoProration').length ?? 0;

  // Summarise distinct rule types in use
  const ruleTypeSummary: Record<string, number> = {};
  (values.feeHeadRules ?? []).forEach((r: any) => {
    if (r.ruleType !== 'NoProration') {
      ruleTypeSummary[r.ruleType] = (ruleTypeSummary[r.ruleType] ?? 0) + 1;
    }
  });

  const ruleTypeLabels: Record<
    string,
    { label: string; color: 'primary' | 'info' | 'warning' | 'default' }
  > = {
    DailyProration: { label: 'Daily Proration', color: 'primary' },
    MonthlyProration: { label: 'Monthly Proration', color: 'info' },
    FullMonthCharge: { label: 'Full Month Charge', color: 'warning' },
    NoProration: { label: 'No Proration', color: 'default' },
  };

  return (
    <Box
      sx={{
        width: 320,
        flexShrink: 0,
        display: { xs: 'none', lg: 'flex' },
        flexDirection: 'column',
        borderLeft: '1px solid',
        borderColor: 'divider',
        bgcolor: (theme) =>
          theme.palette.mode === 'dark'
            ? alpha(theme.palette.background.default, 0.6)
            : alpha(theme.palette.grey[50], 0.7),
        overflow: 'hidden',
      }}
    >
      <Scrollbar sx={{ flex: 1, minHeight: 0 }}>
        <Box sx={{ p: 2.25 }}>
          {/* Header */}
          <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 2 }}>
            <Box
              sx={{
                width: 26,
                height: 26,
                borderRadius: 0.75,
                bgcolor: (theme) => alpha(theme.palette.primary.main, 0.1),
                color: 'primary.main',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Iconify icon="solar:clipboard-check-bold-duotone" width={16} height={16} />
            </Box>
            <Typography
              variant="overline"
              sx={{
                fontSize: '0.68rem',
                fontWeight: 800,
                letterSpacing: '0.08em',
                color: 'text.secondary',
              }}
            >
              Policy Summary
            </Typography>
          </Stack>

          {/* Live Key Metrics */}
          <Stack spacing={0.75} sx={{ mb: 2.5 }}>
            <SummaryRow
              label="Policy Name"
              value={
                <Typography
                  variant="caption"
                  fontWeight={600}
                  sx={{
                    maxWidth: 140,
                    textAlign: 'right',
                    wordBreak: 'break-word',
                    fontSize: '0.72rem',
                  }}
                >
                  {values.policyName || '—'}
                </Typography>
              }
            />
            <SummaryRow
              label="Status"
              value={
                <Label
                  color={values.status === 'Active' ? 'success' : 'warning'}
                  sx={{ height: 20, fontSize: '0.68rem', fontWeight: 700 }}
                >
                  {values.status}
                </Label>
              }
            />
            <SummaryRow
              label="Default Policy"
              value={
                <Label
                  color={values.isDefault ? 'primary' : 'default'}
                  sx={{ height: 20, fontSize: '0.68rem' }}
                >
                  {values.isDefault ? 'Yes' : 'No'}
                </Label>
              }
            />
            <SummaryRow
              label="Active Fee Heads"
              value={
                <Typography variant="caption" fontWeight={600} fontSize="0.72rem">
                  {totalRules}
                </Typography>
              }
            />
            <SummaryRow
              label="Proration Active"
              value={
                <Label
                  color={enabledRules > 0 ? 'primary' : 'default'}
                  sx={{ height: 20, fontSize: '0.68rem', fontWeight: 600 }}
                >
                  {enabledRules} / {totalRules} head{totalRules !== 1 ? 's' : ''}
                </Label>
              }
            />
          </Stack>

          {/* Rule Breakdown in Use */}
          {Object.keys(ruleTypeSummary).length > 0 && (
            <>
              <Divider sx={{ my: 1.75 }} />
              <Typography
                variant="overline"
                sx={{
                  fontSize: '0.65rem',
                  fontWeight: 800,
                  letterSpacing: '0.08em',
                  color: 'text.secondary',
                  display: 'block',
                  mb: 1,
                }}
              >
                Rule Configuration Breakdown
              </Typography>
              <Stack spacing={0.75} sx={{ mb: 2 }}>
                {Object.entries(ruleTypeSummary).map(([ruleType, count]) => {
                  const meta = ruleTypeLabels[ruleType] ?? { label: ruleType, color: 'default' };
                  return (
                    <Box
                      key={ruleType}
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        py: 0.25,
                      }}
                    >
                      <Label color={meta.color} sx={{ height: 20, fontSize: '0.68rem' }}>
                        {meta.label}
                      </Label>
                      <Typography variant="caption" fontWeight={600} fontSize="0.72rem">
                        {count} head{count !== 1 ? 's' : ''}
                      </Typography>
                    </Box>
                  );
                })}
              </Stack>
            </>
          )}

          <Divider sx={{ my: 1.75 }} />

          {/* Validation Checklist */}
          <Typography
            variant="overline"
            sx={{
              fontSize: '0.65rem',
              fontWeight: 800,
              letterSpacing: '0.08em',
              color: 'text.secondary',
              display: 'block',
              mb: 1,
            }}
          >
            Validation Checklist
          </Typography>
          <Stack spacing={0.5} sx={{ mb: 2 }}>
            <ValidationCheckItem label="General Information Complete" valid={checks.generalValid} />
            <ValidationCheckItem
              label={`≥ 1 Recurring Rule Configured (${checks.recurringEnabledCount})`}
              valid={checks.feeHeadsValid}
              description="Daily or Monthly proration must be enabled on at least 1 fee head"
            />
            <ValidationCheckItem
              label="All Rule Settings Validated"
              valid={checks.allRuleSettingsValid}
            />
            {values.isDefault && (
              <ValidationCheckItem
                label="Default Policy Is Unique"
                valid={!checks.isDefaultConflict}
              />
            )}

            <Box sx={{ mt: 1.5 }}>
              {checks.isReadyToPublish ? (
                <Label
                  color="success"
                  sx={{
                    width: '100%',
                    py: 1.5,
                    height: 'auto',
                    fontSize: '0.72rem',
                    fontWeight: 700,
                    borderRadius: 1,
                  }}
                >
                  ✓ Ready to Save & Publish
                </Label>
              ) : (
                <Label
                  color="warning"
                  sx={{
                    width: '100%',
                    py: 1.5,
                    height: 'auto',
                    fontSize: '0.72rem',
                    fontWeight: 700,
                    borderRadius: 1,
                  }}
                >
                  ⚠ Requires Attention
                </Label>
              )}
            </Box>
          </Stack>

          <Divider sx={{ my: 1.75 }} />

          {/* Legal / Zero Refund Guardrail Callout */}
          <Paper
            variant="outlined"
            sx={{
              p: 1.5,
              borderRadius: 1.25,
              bgcolor: (theme) => alpha(theme.palette.info.main, 0.05),
              borderColor: (theme) => alpha(theme.palette.info.main, 0.2),
            }}
          >
            <Stack direction="row" spacing={1} alignItems="flex-start">
              <Iconify
                icon="solar:shield-check-bold"
                width={16}
                height={16}
                sx={{ color: 'info.main', mt: 0.2, flexShrink: 0 }}
              />
              <Box>
                <Typography
                  variant="caption"
                  fontWeight={700}
                  color="info.darker"
                  display="block"
                  sx={{ fontSize: '0.72rem', mb: 0.25 }}
                >
                  Demand-Only Proration
                </Typography>
                <Typography
                  variant="caption"
                  color="text.secondary"
                  sx={{ fontSize: '0.68rem', lineHeight: 1.4 }}
                >
                  Proration formulas adjust initial demand calculations for mid-term joiners.
                  Existing settled receipts and demands remain immutable.
                </Typography>
              </Box>
            </Stack>
          </Paper>
        </Box>
      </Scrollbar>
    </Box>
  );
}
