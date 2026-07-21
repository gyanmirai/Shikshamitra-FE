'use client';

import React from 'react';
import { Iconify } from 'src/components/iconify';
import { Scrollbar } from 'src/components/scrollbar';
import { Box, Card, Chip, Stack, Divider, Typography } from '@mui/material';

import { SummaryRow, ValidationCheck } from '../collection/CollectionCommon';

// ─── ProrationSectionCard ────────────────────────────────────────────────────

export function ProrationSectionCard({
  title,
  subtitle,
  icon,
  children,
}: {
  title: string;
  subtitle?: string;
  icon?: string;
  children: React.ReactNode;
}) {
  return (
    <Card
      variant="outlined"
      sx={{
        mb: 2.5,
        boxShadow: '0 1px 4px 0 rgba(0,0,0,0.06)',
        borderRadius: 2,
        overflow: 'visible',
      }}
    >
      <Box
        sx={{
          px: 2.5,
          py: 1.75,
          borderBottom: '1px solid',
          borderColor: 'divider',
          borderRadius: '8px 8px 0 0',
          display: 'flex',
          alignItems: 'center',
          gap: 1.25,
        }}
      >
        {icon && (
          <Box
            sx={{
              width: 32,
              height: 32,
              borderRadius: 1,
              bgcolor: 'primary.lighter',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            <Iconify icon={icon} width={18} sx={{ color: 'primary.main' }} />
          </Box>
        )}
        <Box>
          <Typography variant="h6" fontWeight={700} lineHeight={1.4}>
            {title}
          </Typography>
          {subtitle && (
            <Typography variant="caption" color="text.secondary" display="block">
              {subtitle}
            </Typography>
          )}
        </Box>
      </Box>
      <Box sx={{ p: 2.5 }}>{children}</Box>
    </Card>
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
  };
}

export function ProrationSummaryPanel({ formik, checks }: ProrationSummaryPanelProps) {
  const { values } = formik;

  const totalRules: number = values.feeHeadRules?.length ?? 0;
  const enabledRules: number =
    values.feeHeadRules?.filter((r: any) => r.prorationApplicable).length ?? 0;

  // Summarise distinct rule types in use
  const ruleTypeSummary: Record<string, number> = {};
  (values.feeHeadRules ?? []).forEach((r: any) => {
    if (r.prorationApplicable && r.ruleType) {
      ruleTypeSummary[r.ruleType] = (ruleTypeSummary[r.ruleType] ?? 0) + 1;
    }
  });

  const ruleTypeLabels: Record<string, string> = {
    NoProration: 'No Proration',
    DailyProration: 'Daily',
    MonthlyProration: 'Monthly',
    FullMonthCharge: 'Full Month',
  };

  return (
    <Box
      sx={{
        width: 300,
        flexShrink: 0,
        display: { xs: 'none', lg: 'flex' },
        flexDirection: 'column',
        borderLeft: '1px solid',
        borderColor: 'divider',
        overflow: 'hidden',
        bgcolor: (theme) => (theme.palette.mode === 'dark' ? 'background.neutral' : 'grey.50'),
      }}
    >
      <Scrollbar sx={{ flex: 1 }}>
        <Box sx={{ p: 2 }}>
          {/* Live Summary */}
          <Typography
            variant="overline"
            sx={{
              fontSize: '0.6rem',
              fontWeight: 800,
              letterSpacing: '0.1em',
              color: 'text.secondary',
            }}
          >
            Live Summary
          </Typography>
          <Stack spacing={0.75} mt={1} mb={2.5}>
            <SummaryRow
              label="Policy Name"
              value={
                <Typography
                  variant="caption"
                  fontWeight={600}
                  sx={{
                    maxWidth: 130,
                    textAlign: 'right',
                    wordBreak: 'break-word',
                    fontSize: '0.7rem',
                  }}
                >
                  {values.policyName || '—'}
                </Typography>
              }
            />
            <SummaryRow
              label="Status"
              value={
                <Chip
                  label={values.status}
                  size="small"
                  color={values.status === 'Active' ? 'success' : 'default'}
                  sx={{ height: 18, fontSize: '0.6rem', fontWeight: 700 }}
                />
              }
            />
            <SummaryRow
              label="Total Fee Heads"
              value={
                <Typography variant="caption" fontWeight={600} fontSize="0.7rem">
                  {totalRules}
                </Typography>
              }
            />
            <SummaryRow
              label="Proration Enabled"
              value={
                <Chip
                  label={`${enabledRules} / ${totalRules}`}
                  size="small"
                  color={enabledRules > 0 ? 'primary' : 'default'}
                  variant={enabledRules > 0 ? 'filled' : 'outlined'}
                  sx={{ height: 18, fontSize: '0.6rem' }}
                />
              }
            />
          </Stack>

          {/* Rule Types in use */}
          {Object.keys(ruleTypeSummary).length > 0 && (
            <>
              <Typography
                variant="overline"
                sx={{
                  fontSize: '0.6rem',
                  fontWeight: 800,
                  letterSpacing: '0.1em',
                  color: 'text.secondary',
                }}
              >
                Rule Types in Use
              </Typography>
              <Stack spacing={0.5} mt={1} mb={2.5}>
                {Object.entries(ruleTypeSummary).map(([ruleType, count]) => (
                  <SummaryRow
                    key={ruleType}
                    label={ruleTypeLabels[ruleType] ?? ruleType}
                    value={
                      <Typography variant="caption" fontWeight={600} fontSize="0.7rem">
                        {count} head{count > 1 ? 's' : ''}
                      </Typography>
                    }
                  />
                ))}
              </Stack>
            </>
          )}

          <Divider sx={{ my: 1.5 }} />

          {/* Validation */}
          <Typography
            variant="overline"
            sx={{
              fontSize: '0.6rem',
              fontWeight: 800,
              letterSpacing: '0.1em',
              color: 'text.secondary',
            }}
          >
            Validation
          </Typography>
          <Stack spacing={0.5} mt={1}>
            <ValidationCheck label="General Information Complete" valid={checks.generalValid} />
            <ValidationCheck
              label={`≥1 Recurring Head Enabled (${checks.recurringEnabledCount})`}
              valid={checks.feeHeadsValid}
            />
            <ValidationCheck
              label="All Enabled Heads Have a Rule"
              valid={
                checks.configuredCount === checks.recurringEnabledCount &&
                checks.recurringEnabledCount > 0
              }
            />
            {checks.isReadyToPublish ? (
              <Chip
                label="Ready to Save"
                size="small"
                color="success"
                sx={{ mt: 1, height: 20, fontSize: '10px' }}
              />
            ) : (
              <Chip
                label="Requires Fields Completion"
                size="small"
                color="warning"
                sx={{ mt: 1, height: 20, fontSize: '10px' }}
              />
            )}
          </Stack>

          <Divider sx={{ my: 1.5 }} />

          {/* Info box */}
          <Box
            sx={{
              p: 1.5,
              bgcolor: 'info.lighter',
              borderRadius: 1,
              border: '1px solid',
              borderColor: 'info.light',
            }}
          >
            <Stack direction="row" spacing={0.75} alignItems="flex-start">
              <Iconify
                icon="solar:info-circle-bold-duotone"
                width={14}
                sx={{ color: 'info.main', mt: 0.1, flexShrink: 0 }}
              />
              <Typography
                variant="caption"
                color="info.dark"
                lineHeight={1.5}
                sx={{ fontSize: '0.68rem' }}
              >
                Policy changes only affect future demand generation. Existing demands, receipts, and
                concessions remain unchanged.
              </Typography>
            </Stack>
          </Box>
        </Box>
      </Scrollbar>
    </Box>
  );
}
