'use client';

/**
 * ProrationFeeHeadsSection — Card 2
 *
 * Renders a structured configuration table of all active fee heads.
 * Features:
 *   - Fee Head type badge (Recurring / OneTime)
 *   - Proration Rule selector with rich option descriptions
 *   - Inline status badge summarizing current parameters
 *   - Expandable nested configuration for Daily and Monthly rules
 *   - Quick-action presets (Apply Daily / Apply Monthly / Reset)
 */

import React, { useState } from 'react';
import { Label } from 'src/components/label';
import { Iconify } from 'src/components/iconify';
import CustomSelect from 'src/components/custom-select';
import CustomTooltip from 'src/components/custom-tooltip';
import ShakingTextField from 'src/components/shaking-text-field';
import {
  Box,
  Grid,
  Paper,
  Stack,
  Alert,
  Button,
  Collapse,
  TextField,
  Typography,
  IconButton,
} from '@mui/material';
import { alpha } from '@mui/material/styles';

import { SectionCard } from '../collection/CollectionCommon';

import type { ProrationRuleType, IProrationFeeHeadRule } from '../../types/finance-policy.types';

// ─── Constants ────────────────────────────────────────────────────────────────

const RULE_OPTIONS: {
  value: ProrationRuleType;
  label: string;
  icon: string;
  description: string;
}[] = [
  {
    value: 'NoProration',
    label: 'No Proration',
    icon: 'solar:forbidden-circle-bold',
    description: 'Always charge the full installment amount regardless of student join date.',
  },
  {
    value: 'DailyProration',
    label: 'Daily Proration',
    icon: 'solar:calendar-date-bold-duotone',
    description:
      'Charge proportional to the exact number of active calendar days in billing period.',
  },
  {
    value: 'MonthlyProration',
    label: 'Monthly Proration',
    icon: 'solar:calendar-minimalistic-bold-duotone',
    description:
      'Calculate charge based on calendar cut-off day (Full Month, Next Month, or Half Month).',
  },
  {
    value: 'FullMonthCharge',
    label: 'Full Month Charge',
    icon: 'solar:clock-circle-bold-duotone',
    description:
      'Always charge complete monthly installment when student is enrolled in any part of month.',
  },
];

const ROUND_OFF_OPTIONS = [
  { value: 'NoRoundOff', label: 'No Round Off (Exact Currency)' },
  { value: 'RoundUp', label: 'Round Up (Ceil to Integer)' },
  { value: 'RoundDown', label: 'Round Down (Floor to Integer)' },
];

const CALCULATION_BASIS_OPTIONS = [{ value: 'CalendarDays', label: 'Calendar Days (Standard)' }];

const RULE_GRID_COLUMNS = {
  xs: 'minmax(0, 1fr)',
  md: 'minmax(220px, 1.2fr) minmax(220px, 1fr) minmax(180px, 0.9fr) 40px',
} as const;

const MONTHLY_RULE_OPTIONS = [
  {
    value: 'ChargeNextMonth',
    label: 'Charge Next Month',
    description:
      'If admitted before cut-off → charge current month; if admitted after cut-off → waive current and charge from next month.',
  },
  {
    value: 'HalfMonthRule',
    label: 'Half Month Rule',
    description:
      'If admitted before cut-off → charge full month; if admitted after cut-off → charge half (50%) of monthly amount.',
  },
];

// ─── Helper: Daily Proration Inline Form ──────────────────────────────────────

interface RuleConfigProps {
  rule: IProrationFeeHeadRule;
  index: number;
  onChange: (index: number, field: string, value: any) => void;
  errors: any;
}

function DailyProrationConfig({ rule, index, onChange, errors }: RuleConfigProps) {
  const cfg = rule.configuration;
  const errCfg = errors?.feeHeadRules?.[index]?.configuration ?? {};

  return (
    <Grid container spacing={2} sx={{ mt: 0.25 }}>
      {/* Calculation Basis */}
      <Grid size={{ xs: 12, sm: 4 }}>
        <ShakingTextField error={Boolean(errCfg.calculationBasis)}>
          <CustomSelect
            label="Calculation Basis *"
            options={CALCULATION_BASIS_OPTIONS}
            labelKey="label"
            valueKey="value"
            value={cfg.calculationBasis ?? 'CalendarDays'}
            onChange={(value) => onChange(index, 'calculationBasis', value)}
            error={Boolean(errCfg.calculationBasis)}
            helperText={
              errCfg.calculationBasis || 'Calculates: Scheduled × (Active Days / Total Period Days)'
            }
          />
        </ShakingTextField>
      </Grid>

      {/* Round Off */}
      <Grid size={{ xs: 12, sm: 4 }}>
        <ShakingTextField error={Boolean(errCfg.roundOff)}>
          <CustomSelect
            label="Rounding Mode *"
            options={ROUND_OFF_OPTIONS}
            labelKey="label"
            valueKey="value"
            value={cfg.roundOff ?? 'NoRoundOff'}
            onChange={(value) => onChange(index, 'roundOff', value)}
            error={Boolean(errCfg.roundOff)}
            helperText={errCfg.roundOff || 'Applied to the calculated prorated amount'}
          />
        </ShakingTextField>
      </Grid>

      {/* Minimum Charge Days */}
      <Grid size={{ xs: 12, sm: 4 }}>
        <ShakingTextField error={Boolean(errCfg.minimumChargeDays)}>
          <TextField
            fullWidth
            size="small"
            type="number"
            label="Minimum Charge Days"
            value={cfg.minimumChargeDays ?? ''}
            onChange={(e) => {
              const val = e.target.value === '' ? null : parseInt(e.target.value, 10);
              onChange(index, 'minimumChargeDays', val);
            }}
            error={Boolean(errCfg.minimumChargeDays)}
            helperText={errCfg.minimumChargeDays || 'Optional — Minimum days to bill (0 to 366)'}
            inputProps={{ min: 0, max: 366, step: 1 }}
            placeholder="0"
          />
        </ShakingTextField>
      </Grid>
    </Grid>
  );
}

// ─── Helper: Monthly Proration Inline Form ────────────────────────────────────

function MonthlyProrationConfig({ rule, index, onChange, errors }: RuleConfigProps) {
  const cfg = rule.configuration;
  const errCfg = errors?.feeHeadRules?.[index]?.configuration ?? {};
  const monthlyRule = cfg.monthlyRule ?? 'ChargeNextMonth';
  const cutoff = cfg.cutOffDay ?? 15;

  return (
    <Grid container spacing={2} sx={{ mt: 0.25 }}>
      {/* Monthly Rule */}
      <Grid size={{ xs: 12, sm: 7 }}>
        <ShakingTextField error={Boolean(errCfg.monthlyRule)}>
          <CustomSelect
            label="Cut-off Behavior Strategy *"
            options={MONTHLY_RULE_OPTIONS}
            labelKey="label"
            valueKey="value"
            value={monthlyRule}
            onChange={(value) => onChange(index, 'monthlyRule', value)}
            error={Boolean(errCfg.monthlyRule)}
            helperText={
              errCfg.monthlyRule ||
              MONTHLY_RULE_OPTIONS.find((option) => option.value === monthlyRule)?.description
            }
          />
        </ShakingTextField>
      </Grid>

      {/* Cut-off Day */}
      <Grid size={{ xs: 12, sm: 5 }}>
        <ShakingTextField error={Boolean(errCfg.cutOffDay)}>
          <TextField
            fullWidth
            size="small"
            type="number"
            required
            label={
              monthlyRule === 'ChargeNextMonth' ? 'Monthly Cut-off Day' : 'Half Month Cut-off Day'
            }
            value={cfg.cutOffDay ?? ''}
            onChange={(e) => {
              const val = e.target.value === '' ? null : parseInt(e.target.value, 10);
              onChange(index, 'cutOffDay', val);
            }}
            error={Boolean(errCfg.cutOffDay)}
            helperText={errCfg.cutOffDay || 'Day of month (1 to 31)'}
            inputProps={{ min: 1, max: 31, step: 1 }}
            placeholder="15"
          />
        </ShakingTextField>
      </Grid>

      {/* Dynamic Visual Rule Explanation Pill */}
      <Grid size={{ xs: 12 }}>
        <Paper
          variant="outlined"
          sx={{
            p: 1.5,
            borderRadius: 1,
            bgcolor: (theme) => alpha(theme.palette.info.main, 0.04),
            borderColor: (theme) => alpha(theme.palette.info.main, 0.2),
          }}
        >
          <Stack direction="row" spacing={1} alignItems="center">
            <Iconify
              icon="solar:info-circle-bold"
              width={16}
              height={16}
              sx={{ color: 'info.main', flexShrink: 0 }}
            />
            <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.74rem' }}>
              {monthlyRule === 'ChargeNextMonth' ? (
                <>
                  Student admitted on or before day <strong>{cutoff}</strong> → Charged full current
                  month.&nbsp; Admitted after day <strong>{cutoff}</strong> → Current month waived,
                  charges start next month.
                </>
              ) : (
                <>
                  Student admitted on or before day <strong>{cutoff}</strong> → Charged 100% full
                  month.&nbsp; Admitted after day <strong>{cutoff}</strong> → Charged 50% half-month
                  rate.
                </>
              )}
            </Typography>
          </Stack>
        </Paper>
      </Grid>
    </Grid>
  );
}

// ─── Helper: Fee Head Row ─────────────────────────────────────────────────────

interface FeeHeadRowProps {
  rule: IProrationFeeHeadRule;
  index: number;
  expanded: boolean;
  onToggleExpand: () => void;
  onRuleChange: (ruleType: ProrationRuleType) => void;
  onConfigChange: (index: number, field: string, value: any) => void;
  errors: any;
  isFirst: boolean;
}

function FeeHeadRow({
  rule,
  index,
  expanded,
  onToggleExpand,
  onRuleChange,
  onConfigChange,
  errors,
  isFirst,
}: FeeHeadRowProps) {
  const isOneTime = rule.feeType === 'OneTime';
  const hasConfig = rule.ruleType === 'DailyProration' || rule.ruleType === 'MonthlyProration';
  const isEnabled = rule.ruleType !== 'NoProration';
  const ruleError = errors?.feeHeadRules?.[index]?.ruleType;

  // Build a concise preview badge for the active rule configuration
  const getConfigSummary = () => {
    if (rule.ruleType === 'DailyProration') {
      const parts = ['Calendar Days'];
      if (rule.configuration.roundOff && rule.configuration.roundOff !== 'NoRoundOff') {
        parts.push(rule.configuration.roundOff.replace(/([A-Z])/g, ' $1').trim());
      }
      if (rule.configuration.minimumChargeDays) {
        parts.push(`Min ${rule.configuration.minimumChargeDays}d`);
      }
      return parts.join(' · ');
    }
    if (rule.ruleType === 'MonthlyProration') {
      const isNext = rule.configuration.monthlyRule === 'ChargeNextMonth';
      const day = rule.configuration.cutOffDay ?? 15;
      return `${isNext ? 'Next Month' : 'Half Month'} · Cut-off ${day}th`;
    }
    if (rule.ruleType === 'FullMonthCharge') {
      return '100% Full Month';
    }
    return 'Full Amount';
  };

  return (
    <Box
      sx={{
        borderTop: isFirst ? 'none' : '1px solid',
        borderColor: 'divider',
        transition: 'all 0.15s ease-in-out',
        bgcolor: isEnabled ? (theme) => alpha(theme.palette.primary.main, 0.02) : 'transparent',
      }}
    >
      {/* Main row grid */}
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: RULE_GRID_COLUMNS,
          gap: 1.5,
          alignItems: 'center',
          px: 2,
          py: 1.25,
          '&:hover': {
            bgcolor: (theme) => alpha(theme.palette.action.hover, 0.6),
          },
        }}
      >
        {/* Fee Head Name & Category Tag */}
        <Box sx={{ minWidth: 0 }}>
          <Stack direction="row" spacing={1} alignItems="center">
            <Typography variant="subtitle2" fontWeight={600} fontSize="0.82rem" noWrap>
              {rule.feeHeadName || rule.feeHeadId}
            </Typography>
            <Label
              color={rule.feeType === 'Recurring' ? 'info' : 'default'}
              sx={{ height: 18, fontSize: '0.65rem', fontWeight: 600 }}
            >
              {rule.feeType}
            </Label>
          </Stack>
        </Box>

        {/* Rule Dropdown */}
        <ShakingTextField error={Boolean(ruleError)}>
          <CustomSelect
            label="Proration Model *"
            options={RULE_OPTIONS}
            labelKey="label"
            valueKey="value"
            value={rule.ruleType}
            onChange={(value) => onRuleChange(value as ProrationRuleType)}
            disabled={isOneTime}
            error={Boolean(ruleError)}
            helperText={
              ruleError ||
              (isOneTime
                ? 'One-time fee heads always use No Proration'
                : RULE_OPTIONS.find((option) => option.value === rule.ruleType)?.description)
            }
          />
        </ShakingTextField>

        {/* Config Summary Pill (Desktop) */}
        <Box sx={{ display: { xs: 'none', md: 'flex' }, alignItems: 'center' }}>
          <Label
            color={
              rule.ruleType === 'DailyProration'
                ? 'primary'
                : rule.ruleType === 'MonthlyProration'
                  ? 'info'
                  : rule.ruleType === 'FullMonthCharge'
                    ? 'warning'
                    : 'default'
            }
            sx={{ height: 22, fontSize: '0.68rem', fontWeight: 600 }}
          >
            {getConfigSummary()}
          </Label>
        </Box>

        {/* Expand / Collapse Action Button */}
        <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
          {hasConfig ? (
            <CustomTooltip
              title={expanded ? 'Collapse configuration' : 'Configure parameters'}
              arrow
            >
              <IconButton
                size="small"
                onClick={onToggleExpand}
                sx={{
                  width: 28,
                  height: 28,
                  bgcolor: expanded
                    ? (theme) => alpha(theme.palette.primary.main, 0.1)
                    : 'action.hover',
                  color: expanded ? 'primary.main' : 'text.secondary',
                  transition: 'all 0.2s',
                }}
              >
                <Iconify
                  icon={expanded ? 'solar:alt-arrow-up-bold' : 'solar:alt-arrow-down-bold'}
                  width={16}
                />
              </IconButton>
            </CustomTooltip>
          ) : (
            <Box sx={{ width: 28 }} />
          )}
        </Box>
      </Box>

      {/* Expandable Configuration Body */}
      <Collapse in={expanded && hasConfig} unmountOnExit>
        <Paper
          variant="outlined"
          sx={{
            m: 1.5,
            mt: 0.5,
            p: 2,
            borderRadius: 1.25,
            bgcolor: (theme) =>
              theme.palette.mode === 'dark'
                ? alpha(theme.palette.background.default, 0.6)
                : alpha(theme.palette.grey[50], 0.9),
            borderColor: (theme) => alpha(theme.palette.primary.main, 0.2),
          }}
        >
          <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1.5 }}>
            <Iconify
              icon="solar:tuning-square-2-bold-duotone"
              width={18}
              height={18}
              sx={{ color: 'primary.main' }}
            />
            <Typography variant="subtitle2" fontWeight={700} fontSize="0.8rem">
              {rule.ruleType === 'DailyProration'
                ? 'Daily Proration Parameters'
                : 'Monthly Cut-off Strategy'}
            </Typography>
          </Stack>

          {rule.ruleType === 'DailyProration' && (
            <DailyProrationConfig
              rule={rule}
              index={index}
              onChange={onConfigChange}
              errors={errors}
            />
          )}

          {rule.ruleType === 'MonthlyProration' && (
            <MonthlyProrationConfig
              rule={rule}
              index={index}
              onChange={onConfigChange}
              errors={errors}
            />
          )}
        </Paper>
      </Collapse>
    </Box>
  );
}

// ─── Main Section Component ───────────────────────────────────────────────────

interface ProrationFeeHeadsSectionProps {
  formik: any;
}

export default function ProrationFeeHeadsSection({ formik }: ProrationFeeHeadsSectionProps) {
  const rules: IProrationFeeHeadRule[] = formik.values.feeHeadRules ?? [];
  const [expandedRows, setExpandedRows] = useState<Set<number>>(new Set());

  const totalRules = rules.length;
  const enabledCount = rules.filter((r) => r.ruleType !== 'NoProration').length;
  const hasAtLeastOneRecurringEnabled = rules.some(
    (r) =>
      r.feeType === 'Recurring' &&
      (r.ruleType === 'DailyProration' || r.ruleType === 'MonthlyProration')
  );

  const toggleExpand = (index: number) => {
    setExpandedRows((prev) => {
      const next = new Set(prev);
      if (next.has(index)) next.delete(index);
      else next.add(index);
      return next;
    });
  };

  const handleRuleChange = (index: number, ruleType: ProrationRuleType) => {
    const updated = [...rules];
    updated[index] = {
      ...updated[index],
      ruleType,
      configuration:
        ruleType === 'DailyProration'
          ? { calculationBasis: 'CalendarDays', roundOff: 'NoRoundOff', minimumChargeDays: null }
          : ruleType === 'MonthlyProration'
            ? { monthlyRule: 'ChargeNextMonth', cutOffDay: 15 }
            : {},
    };
    formik.setFieldValue('feeHeadRules', updated);

    // Auto expand if configuration is needed
    if (ruleType === 'DailyProration' || ruleType === 'MonthlyProration') {
      setExpandedRows((prev) => new Set(prev).add(index));
    } else {
      setExpandedRows((prev) => {
        const next = new Set(prev);
        next.delete(index);
        return next;
      });
    }
  };

  const handleConfigChange = (index: number, field: string, value: any) => {
    const updated = [...rules];
    updated[index] = {
      ...updated[index],
      configuration: {
        ...updated[index].configuration,
        [field]: value,
      },
    };
    formik.setFieldValue('feeHeadRules', updated);
  };

  // Bulk Presets
  const applyBulkRule = (ruleType: ProrationRuleType) => {
    const updated = rules.map((r) => {
      if (r.feeType === 'OneTime') return r;
      return {
        ...r,
        ruleType,
        configuration:
          ruleType === 'DailyProration'
            ? {
                calculationBasis: 'CalendarDays' as const,
                roundOff: 'NoRoundOff' as const,
                minimumChargeDays: null,
              }
            : ruleType === 'MonthlyProration'
              ? { monthlyRule: 'ChargeNextMonth' as const, cutOffDay: 15 }
              : {},
      };
    });
    formik.setFieldValue('feeHeadRules', updated);
  };

  return (
    <SectionCard
      title="Fee Head Configuration"
      subtitle="Define calculation rules for active fee heads. One-time fee heads remain un-prorated."
      icon="solar:widget-bold-duotone"
      action={
        <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap" useFlexGap>
          <Label
            color={hasAtLeastOneRecurringEnabled ? 'primary' : 'warning'}
            sx={{ height: 20, fontSize: '0.68rem', fontWeight: 600 }}
          >
            {enabledCount} / {totalRules} Configured
          </Label>
          <Button
            size="small"
            variant="outlined"
            onClick={() => applyBulkRule('DailyProration')}
            startIcon={<Iconify icon="solar:calendar-date-bold" width={14} />}
            sx={{ fontSize: '0.72rem', height: 26, px: 1.25 }}
          >
            All Daily
          </Button>
          <Button
            size="small"
            variant="outlined"
            onClick={() => applyBulkRule('MonthlyProration')}
            startIcon={<Iconify icon="solar:calendar-minimalistic-bold" width={14} />}
            sx={{ fontSize: '0.72rem', height: 26, px: 1.25 }}
          >
            All Monthly
          </Button>
          <Button
            size="small"
            color="inherit"
            onClick={() => applyBulkRule('NoProration')}
            sx={{ fontSize: '0.72rem', height: 26, px: 1 }}
          >
            Reset
          </Button>
        </Stack>
      }
    >
      {/* Validation Banner if missing required proration rule */}
      {!hasAtLeastOneRecurringEnabled && (
        <Alert
          severity="warning"
          variant="outlined"
          sx={{
            mb: 2,
            fontSize: '0.78rem',
            borderRadius: 1.25,
            bgcolor: (theme) => alpha(theme.palette.warning.main, 0.04),
          }}
        >
          <strong>Validation Requirement:</strong> At least one <strong>Recurring</strong> fee head
          must have either a <strong>Daily</strong> or <strong>Monthly</strong> proration rule
          assigned before saving.
        </Alert>
      )}

      {rules.length === 0 ? (
        <Paper
          variant="outlined"
          sx={{
            p: 4,
            textAlign: 'center',
            borderRadius: 1.5,
            borderStyle: 'dashed',
          }}
        >
          <Iconify
            icon="solar:file-search-bold-duotone"
            width={40}
            height={40}
            sx={{ color: 'text.disabled', mb: 1 }}
          />
          <Typography variant="subtitle2" color="text.secondary" fontWeight={600}>
            No Active Fee Heads Found
          </Typography>
          <Typography variant="caption" color="text.disabled" display="block" sx={{ mt: 0.5 }}>
            Configure active fee heads in Finance → Settings → Fee Head before setting up proration.
          </Typography>
        </Paper>
      ) : (
        <Paper
          variant="outlined"
          sx={{
            borderRadius: 1.5,
            overflow: 'hidden',
            borderColor: 'divider',
          }}
        >
          {/* Table Header Bar */}
          <Box
            sx={{
              display: { xs: 'none', md: 'grid' },
              gridTemplateColumns: RULE_GRID_COLUMNS,
              gap: 1.5,
              px: 2,
              py: 1,
              bgcolor: (theme) =>
                theme.palette.mode === 'dark'
                  ? alpha(theme.palette.grey[800], 0.4)
                  : alpha(theme.palette.grey[500], 0.06),
              borderBottom: '1px solid',
              borderColor: 'divider',
            }}
          >
            <Typography variant="caption" fontWeight={700} color="text.secondary" fontSize="0.7rem">
              FEE HEAD & CATEGORY
            </Typography>
            <Typography variant="caption" fontWeight={700} color="text.secondary" fontSize="0.7rem">
              PRORATION MODEL
            </Typography>
            <Typography
              variant="caption"
              fontWeight={700}
              color="text.secondary"
              fontSize="0.7rem"
              sx={{ display: { xs: 'none', md: 'block' } }}
            >
              ACTIVE STRATEGY
            </Typography>
            <Box />
          </Box>

          {/* Fee Head Rows */}
          {rules.map((rule, index) => (
            <FeeHeadRow
              key={rule.feeHeadId}
              rule={rule}
              index={index}
              expanded={expandedRows.has(index)}
              onToggleExpand={() => toggleExpand(index)}
              onRuleChange={(ruleType) => handleRuleChange(index, ruleType)}
              onConfigChange={handleConfigChange}
              errors={formik.errors}
              isFirst={index === 0}
            />
          ))}
        </Paper>
      )}

      {/* Legend and Info Helper */}
      {rules.length > 0 && (
        <Stack direction="row" spacing={3} alignItems="center" sx={{ mt: 1.75 }} flexWrap="wrap">
          <Stack direction="row" spacing={0.75} alignItems="center">
            <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: 'primary.main' }} />
            <Typography variant="caption" color="text.secondary" fontSize="0.7rem">
              Proration rule actively applied
            </Typography>
          </Stack>
          <Stack direction="row" spacing={0.75} alignItems="center">
            <Iconify icon="solar:alt-arrow-down-bold" width={14} sx={{ color: 'text.secondary' }} />
            <Typography variant="caption" color="text.secondary" fontSize="0.7rem">
              Click arrow to adjust cut-off days or rounding
            </Typography>
          </Stack>
        </Stack>
      )}
    </SectionCard>
  );
}
