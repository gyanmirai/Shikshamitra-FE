'use client';

/**
 * ProrationFeeHeadsSection — Card 2
 *
 * Renders a table of all active fee heads.
 * Each row has:
 *   - Fee Head name (read-only)
 *   - Fee Type (Recurring / OneTime) — read-only
 *   - Proration Applicable — Switch (disabled for OneTime)
 *   - Rule — dropdown (enabled only when Proration Applicable = ON)
 *   - Expandable inline config (appears below the row when rule != NoProration / FullMonthCharge)
 *
 * Validation (shown as alert banner):
 *   - At least one Recurring fee head must have Proration Applicable = ON
 *   - When Proration Applicable = ON, Rule is mandatory
 */

import React, { useState } from 'react';
import { Iconify } from 'src/components/iconify';
import {
  Box,
  Chip,
  Grid,
  Alert,
  Select,
  Switch,
  Tooltip,
  MenuItem,
  Collapse,
  TextField,
  InputLabel,
  Typography,
  IconButton,
  FormControl,
  FormHelperText,
} from '@mui/material';

import { ProrationSectionCard } from './ProrationCommon';

import type { ProrationRuleType, IProrationFeeHeadRule } from '../../types/finance-policy.types';

// ─── Constants ────────────────────────────────────────────────────────────────

const RULE_OPTIONS: { value: ProrationRuleType; label: string; description: string }[] = [
  {
    value: 'NoProration',
    label: 'No Proration',
    description: 'Always charge the full configured amount, regardless of start date.',
  },
  {
    value: 'DailyProration',
    label: 'Daily Proration',
    description: 'Charge proportional to the number of days in the billing period.',
  },
  {
    value: 'MonthlyProration',
    label: 'Monthly Proration',
    description: 'Charge based on calendar month rules (current, next, or half-month).',
  },
  {
    value: 'FullMonthCharge',
    label: 'Full Month Charge',
    description: 'Always charge the complete monthly amount.',
  },
];

const ROUND_OFF_OPTIONS = [
  { value: 'NoRoundOff', label: 'No Round Off' },
  { value: 'NearestRupee', label: 'Nearest Rupee' },
  { value: 'RoundUp', label: 'Round Up' },
  { value: 'RoundDown', label: 'Round Down' },
];

const MONTHLY_RULE_OPTIONS = [
  {
    value: 'ChargeCurrentMonth',
    label: 'Charge Current Month',
    description: 'Always charge the current month.',
  },
  {
    value: 'ChargeNextMonth',
    label: 'Charge Next Month',
    description:
      'If admitted before cut-off → charge current month; after cut-off → charge next month.',
  },
  {
    value: 'HalfMonthRule',
    label: 'Half Month Rule',
    description:
      'If admitted before cut-off → charge full month; after cut-off → charge half month.',
  },
];

// ─── Helper: Rule Config Inline Form ─────────────────────────────────────────

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
    <Grid container spacing={2} sx={{ mt: 0.5 }}>
      {/* Calculation Basis */}
      <Grid size={{ xs: 12, sm: 4 }}>
        <FormControl fullWidth size="small">
          <InputLabel>Calculation Basis *</InputLabel>
          <Select
            label="Calculation Basis *"
            value={cfg.calculationBasis ?? 'CalendarDays'}
            onChange={(e) => onChange(index, 'calculationBasis', e.target.value)}
          >
            <MenuItem value="CalendarDays">Calendar Days</MenuItem>
          </Select>
          <FormHelperText>Only Calendar Days supported currently</FormHelperText>
        </FormControl>
      </Grid>

      {/* Round Off */}
      <Grid size={{ xs: 12, sm: 4 }}>
        <FormControl fullWidth size="small">
          <InputLabel>Round Off</InputLabel>
          <Select
            label="Round Off"
            value={cfg.roundOff ?? 'NoRoundOff'}
            onChange={(e) => onChange(index, 'roundOff', e.target.value)}
          >
            {ROUND_OFF_OPTIONS.map((o) => (
              <MenuItem key={o.value} value={o.value}>
                {o.label}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Grid>

      {/* Minimum Charge Days */}
      <Grid size={{ xs: 12, sm: 4 }}>
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
          helperText={errCfg.minimumChargeDays || 'Optional — positive integer'}
          inputProps={{ min: 1, step: 1 }}
        />
      </Grid>
    </Grid>
  );
}

function MonthlyProrationConfig({ rule, index, onChange, errors }: RuleConfigProps) {
  const cfg = rule.configuration;
  const errCfg = errors?.feeHeadRules?.[index]?.configuration ?? {};
  const monthlyRule = cfg.monthlyRule ?? 'ChargeCurrentMonth';
  const showCutOff = monthlyRule === 'ChargeNextMonth' || monthlyRule === 'HalfMonthRule';

  return (
    <Grid container spacing={2} sx={{ mt: 0.5 }}>
      {/* Monthly Rule */}
      <Grid size={{ xs: 12, sm: showCutOff ? 6 : 8 }}>
        <FormControl fullWidth size="small" error={Boolean(errCfg.monthlyRule)}>
          <InputLabel>Monthly Rule *</InputLabel>
          <Select
            label="Monthly Rule *"
            value={monthlyRule}
            renderValue={(val) => {
              const selectedOpt = MONTHLY_RULE_OPTIONS.find((o) => o.value === val);
              return selectedOpt ? selectedOpt.label : val;
            }}
            onChange={(e) => {
              onChange(index, 'monthlyRule', e.target.value);
              // Reset cut-off day when switching to ChargeCurrentMonth
              if (e.target.value === 'ChargeCurrentMonth') {
                onChange(index, 'cutOffDay', null);
              }
            }}
          >
            {MONTHLY_RULE_OPTIONS.map((o) => (
              <MenuItem
                key={o.value}
                value={o.value}
                sx={{ flexDirection: 'column', alignItems: 'flex-start' }}
              >
                <Typography variant="caption" fontWeight={600}>
                  {o.label}
                </Typography>
                <Typography
                  variant="caption"
                  color="text.secondary"
                  fontSize="0.68rem"
                  sx={{ whiteSpace: 'normal' }}
                >
                  {o.description}
                </Typography>
              </MenuItem>
            ))}
          </Select>
          {errCfg.monthlyRule && <FormHelperText>{errCfg.monthlyRule}</FormHelperText>}
        </FormControl>
      </Grid>

      {/* Cut-off Day */}
      {showCutOff && (
        <Grid size={{ xs: 12, sm: 6 }}>
          <TextField
            fullWidth
            size="small"
            type="number"
            label={monthlyRule === 'ChargeNextMonth' ? 'Cut-off Day *' : 'Half Month Cut-off Day *'}
            value={cfg.cutOffDay ?? ''}
            onChange={(e) => {
              const val = e.target.value === '' ? null : parseInt(e.target.value, 10);
              onChange(index, 'cutOffDay', val);
            }}
            error={Boolean(errCfg.cutOffDay)}
            helperText={
              errCfg.cutOffDay ||
              (monthlyRule === 'ChargeNextMonth'
                ? 'Before cut-off → current month; after → next month'
                : 'Before cut-off → full month; after → half month')
            }
            inputProps={{ min: 1, max: 31, step: 1 }}
          />
        </Grid>
      )}

      {/* Business logic info */}
      {monthlyRule !== 'ChargeCurrentMonth' && (
        <Grid size={{ xs: 12 }}>
          <Alert severity="info" variant="outlined" sx={{ fontSize: '0.78rem', py: 0.5 }}>
            {monthlyRule === 'ChargeNextMonth' ? (
              <>
                <strong>Admission before day {cfg.cutOffDay ?? '?'}:</strong> Charge current month
                &nbsp;|&nbsp;
                <strong>Admission after day {cfg.cutOffDay ?? '?'}:</strong> Charge next month
              </>
            ) : (
              <>
                <strong>Admission before day {cfg.cutOffDay ?? '?'}:</strong> Charge full month
                &nbsp;|&nbsp;
                <strong>Admission after day {cfg.cutOffDay ?? '?'}:</strong> Charge half month
              </>
            )}
          </Alert>
        </Grid>
      )}
    </Grid>
  );
}

// ─── Fee Head Row ─────────────────────────────────────────────────────────────

interface FeeHeadRowProps {
  rule: IProrationFeeHeadRule;
  index: number;
  expanded: boolean;
  onToggleExpand: () => void;
  onApplicableChange: (checked: boolean) => void;
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
  onApplicableChange,
  onRuleChange,
  onConfigChange,
  errors,
  isFirst,
}: FeeHeadRowProps) {
  const isOneTime = rule.feeType === 'OneTime';
  const hasConfig = rule.ruleType === 'DailyProration' || rule.ruleType === 'MonthlyProration';
  const ruleError = errors?.feeHeadRules?.[index]?.ruleType;

  return (
    <Box
      sx={{
        borderTop: isFirst ? 'none' : '1px solid',
        borderColor: 'divider',
      }}
    >
      {/* Main row */}
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: '1fr 100px 100px 1fr 40px',
          gap: 1.5,
          alignItems: 'center',
          px: 1.5,
          py: 1,
          bgcolor: rule.prorationApplicable ? 'action.selected' : 'transparent',
          transition: 'background-color 0.2s',
          '&:hover': { bgcolor: rule.prorationApplicable ? 'action.selected' : 'action.hover' },
        }}
      >
        {/* Fee Head Name */}
        <Typography variant="caption" fontWeight={600} fontSize="13px" noWrap>
          {rule.feeHeadName || rule.feeHeadId}
        </Typography>

        {/* Fee Type */}
        <Chip
          label={rule.feeType}
          size="small"
          color={rule.feeType === 'Recurring' ? 'primary' : 'default'}
          variant="outlined"
          sx={{ height: 20, fontSize: '0.65rem', maxWidth: '100%' }}
        />

        {/* Proration Applicable Switch */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
          {isOneTime ? (
            <Tooltip title="One-time fees cannot be prorated" placement="top">
              <Box>
                <Typography variant="caption" color="text.disabled" fontSize="0.68rem">
                  N/A
                </Typography>
              </Box>
            </Tooltip>
          ) : (
            <Switch
              size="small"
              checked={rule.prorationApplicable}
              onChange={(e) => onApplicableChange(e.target.checked)}
            />
          )}
        </Box>

        {/* Rule Dropdown */}
        <FormControl
          fullWidth
          size="small"
          disabled={isOneTime || !rule.prorationApplicable}
          error={Boolean(ruleError)}
        >
          <Select
            displayEmpty
            value={rule.ruleType ?? ''}
            onChange={(e) => onRuleChange(e.target.value as ProrationRuleType)}
            renderValue={(val) => {
              if (!val)
                return (
                  <Typography variant="caption" color="text.disabled">
                    Select rule…
                  </Typography>
                );
              return RULE_OPTIONS.find((r) => r.value === val)?.label ?? val;
            }}
            sx={{ fontSize: '0.8rem' }}
          >
            {RULE_OPTIONS.map((o) => (
              <MenuItem
                key={o.value}
                value={o.value}
                sx={{ flexDirection: 'column', alignItems: 'flex-start' }}
              >
                <Typography variant="caption" fontWeight={600}>
                  {o.label}
                </Typography>
                <Typography variant="caption" color="text.secondary" fontSize="0.68rem">
                  {o.description}
                </Typography>
              </MenuItem>
            ))}
          </Select>
          {ruleError && <FormHelperText sx={{ fontSize: '0.68rem' }}>{ruleError}</FormHelperText>}
        </FormControl>

        {/* Expand toggle */}
        <IconButton
          size="small"
          onClick={onToggleExpand}
          disabled={!hasConfig}
          sx={{ opacity: hasConfig ? 1 : 0.2 }}
        >
          <Iconify icon={expanded ? 'mdi:chevron-up' : 'mdi:chevron-down'} width={18} />
        </IconButton>
      </Box>

      {/* Expandable config */}
      <Collapse in={expanded && hasConfig} unmountOnExit>
        <Box
          sx={{
            px: 2.5,
            py: 1.5,
            bgcolor: 'background.neutral',
            borderTop: '1px dashed',
            borderColor: 'divider',
          }}
        >
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
        </Box>
      </Collapse>
    </Box>
  );
}

// ─── Main Section ─────────────────────────────────────────────────────────────

interface ProrationFeeHeadsSectionProps {
  formik: any;
}

export default function ProrationFeeHeadsSection({ formik }: ProrationFeeHeadsSectionProps) {
  const rules: IProrationFeeHeadRule[] = formik.values.feeHeadRules ?? [];
  const [expandedRows, setExpandedRows] = useState<Set<number>>(new Set());

  const hasAtLeastOneRecurringEnabled = rules.some(
    (r) => r.feeType === 'Recurring' && r.prorationApplicable
  );

  const toggleExpand = (index: number) => {
    setExpandedRows((prev) => {
      const next = new Set(prev);
      if (next.has(index)) next.delete(index);
      else next.add(index);
      return next;
    });
  };

  const handleApplicableChange = (index: number, checked: boolean) => {
    const updated = [...rules];
    updated[index] = {
      ...updated[index],
      prorationApplicable: checked,
      // Reset rule when turning off
      ruleType: checked ? updated[index].ruleType : null,
      configuration: checked ? updated[index].configuration : {},
    };
    formik.setFieldValue('feeHeadRules', updated);
    // Collapse row when turning off
    if (!checked) {
      setExpandedRows((prev) => {
        const next = new Set(prev);
        next.delete(index);
        return next;
      });
    }
  };

  const handleRuleChange = (index: number, ruleType: ProrationRuleType) => {
    const updated = [...rules];
    // Reset config when rule changes
    updated[index] = {
      ...updated[index],
      ruleType,
      configuration:
        ruleType === 'DailyProration'
          ? { calculationBasis: 'CalendarDays', roundOff: 'NoRoundOff', minimumChargeDays: null }
          : ruleType === 'MonthlyProration'
            ? { monthlyRule: 'ChargeCurrentMonth', cutOffDay: null }
            : {},
    };
    formik.setFieldValue('feeHeadRules', updated);
    // Auto-expand if config needed
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

  return (
    <ProrationSectionCard
      title="Fee Head Configuration"
      subtitle="Configure proration rules per active fee head. Recurring fee heads can have proration enabled; One-time fee heads cannot."
      icon="solar:widget-bold-duotone"
    >
      {/* Validation banner */}
      {!hasAtLeastOneRecurringEnabled && (
        <Alert severity="warning" variant="outlined" sx={{ mb: 2, fontSize: '0.82rem' }}>
          At least one <strong>Recurring</strong> fee head must have{' '}
          <strong>Proration Applicable</strong> turned on before you can save this policy.
        </Alert>
      )}

      {rules.length === 0 && (
        <Box
          sx={{
            p: 3,
            textAlign: 'center',
            bgcolor: 'action.hover',
            borderRadius: 1,
            border: '1px dashed',
            borderColor: 'divider',
          }}
        >
          <Iconify
            icon="solar:file-search-bold-duotone"
            width={32}
            sx={{ color: 'text.disabled', mb: 1 }}
          />
          <Typography variant="body2" color="text.secondary">
            No active fee heads found. Please create fee heads in Finance → Settings → Fee Head
            first.
          </Typography>
        </Box>
      )}

      {rules.length > 0 && (
        <Box
          sx={{
            border: '1px solid',
            borderColor: 'divider',
            borderRadius: 1.5,
            overflow: 'hidden',
          }}
        >
          {/* Table header */}
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: '1fr 100px 100px 1fr 40px',
              gap: 1.5,
              px: 1.5,
              py: 1,
              bgcolor: 'background.neutral',
              borderBottom: '1px solid',
              borderColor: 'divider',
            }}
          >
            <Typography
              variant="caption"
              fontWeight={700}
              color="text.secondary"
              fontSize="0.72rem"
            >
              FEE HEAD
            </Typography>
            <Typography
              variant="caption"
              fontWeight={700}
              color="text.secondary"
              fontSize="0.72rem"
            >
              FEE TYPE
            </Typography>
            <Typography
              variant="caption"
              fontWeight={700}
              color="text.secondary"
              fontSize="0.72rem"
            >
              PRORATION
            </Typography>
            <Typography
              variant="caption"
              fontWeight={700}
              color="text.secondary"
              fontSize="0.72rem"
            >
              RULE
            </Typography>
            <Box />
          </Box>

          {/* Rows */}
          {rules.map((rule, index) => (
            <FeeHeadRow
              key={rule.feeHeadId}
              rule={rule}
              index={index}
              expanded={expandedRows.has(index)}
              onToggleExpand={() => toggleExpand(index)}
              onApplicableChange={(checked) => handleApplicableChange(index, checked)}
              onRuleChange={(ruleType) => handleRuleChange(index, ruleType)}
              onConfigChange={handleConfigChange}
              errors={formik.errors}
              isFirst={index === 0}
            />
          ))}
        </Box>
      )}

      {/* Legend */}
      {rules.length > 0 && (
        <Box sx={{ mt: 1.5, display: 'flex', gap: 2, flexWrap: 'wrap' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <Iconify icon="mdi:chevron-down" width={14} sx={{ color: 'text.secondary' }} />
            <Typography variant="caption" color="text.secondary" fontSize="0.7rem">
              Expand row to configure rule options
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: 'primary.main' }} />
            <Typography variant="caption" color="text.secondary" fontSize="0.7rem">
              Highlighted rows have proration enabled
            </Typography>
          </Box>
        </Box>
      )}
    </ProrationSectionCard>
  );
}
