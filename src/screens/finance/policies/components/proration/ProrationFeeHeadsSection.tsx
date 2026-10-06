'use client';

import type { FormikProps } from 'formik';

import { getIn } from 'formik';
import { Label } from 'src/components/label';
import { Iconify } from 'src/components/iconify';
import CustomSelect from 'src/components/custom-select';
import CustomTooltip from 'src/components/custom-tooltip';
import ShakingTextField from 'src/components/shaking-text-field';
import React, { useId, useRef, useState, useLayoutEffect } from 'react';
import {
  Box,
  Stack,
  Alert,
  Button,
  Switch,
  Collapse,
  TextField,
  Typography,
  IconButton,
  FormControlLabel,
} from '@mui/material';

import { SectionCard } from '../collection/CollectionCommon';
import { isProratedRule, defaultConfiguration, applyAdmissionPreset } from './prorationRuleHelpers';

import type {
  ProrationRuleType,
  IProrationFeeHeadRule,
  IProrationPolicyFormValues,
} from '../../types/finance-policy.types';

const RULE_OPTIONS: { value: ProrationRuleType; label: string }[] = [
  { value: 'NoProration', label: 'No proration' },
  { value: 'DailyProration', label: 'Daily proration' },
  { value: 'MonthlyProration', label: 'Monthly proration' },
];
type PolicyFormik = FormikProps<IProrationPolicyFormValues>;

function fieldError(formik: PolicyFormik, path: string): string | undefined {
  const error = getIn(formik.errors, path);
  return (formik.submitCount > 0 || getIn(formik.touched, path)) && typeof error === 'string'
    ? error
    : undefined;
}
function eventSummary(rule: IProrationFeeHeadRule, withdrawal = false) {
  const enabled = withdrawal ? rule.applyOnEarlyWithdrawal : rule.applyOnAdmission !== false;
  const model = withdrawal ? (rule.earlyWithdrawalRuleType ?? 'NoProration') : rule.ruleType;
  return enabled
    ? model === 'FullMonthCharge'
      ? 'Monthly proration · Full month charge'
      : RULE_OPTIONS.find((option) => option.value === model)?.label
    : 'Off';
}

function EventSettings({
  formik,
  index,
  withdrawal = false,
  update,
}: {
  formik: PolicyFormik;
  index: number;
  withdrawal?: boolean;
  update: (index: number, changes: Partial<IProrationFeeHeadRule>) => void;
}) {
  const rule = formik.values.feeHeadRules[index];
  const eventId = useId();
  const eventName = withdrawal ? 'Early withdrawal' : 'Admission';
  const enabledKey = withdrawal ? 'applyOnEarlyWithdrawal' : 'applyOnAdmission';
  const modelKey = withdrawal ? 'earlyWithdrawalRuleType' : 'ruleType';
  const configKey = withdrawal ? 'earlyWithdrawalConfiguration' : 'configuration';
  const enabled = withdrawal
    ? Boolean(rule.applyOnEarlyWithdrawal)
    : rule.applyOnAdmission !== false;
  const model = withdrawal ? (rule.earlyWithdrawalRuleType ?? 'NoProration') : rule.ruleType;
  const config = (withdrawal ? rule.earlyWithdrawalConfiguration : rule.configuration) ?? {};
  const prefix = `feeHeadRules[${index}]`;
  const configPath = `${prefix}.${configKey}`;
  const modelPath = `${prefix}.${modelKey}`;
  const modelError = fieldError(formik, modelPath);
  const cutoffError = fieldError(formik, `${configPath}.cutOffDay`);
  const strategyError = fieldError(formik, `${configPath}.monthlyRule`);
  const minimumError = fieldError(formik, `${configPath}.minimumChargeDays`);
  const basisError = fieldError(formik, `${configPath}.calculationBasis`);
  const setConfig = (field: string, value: string | number | null) =>
    update(index, { [configKey]: { ...config, [field]: value } });
  const monthlyOptions = [
    { value: 'ChargeNextMonth', label: withdrawal ? 'Waive exit month' : 'Charge from next month' },
    { value: 'HalfMonthRule', label: 'Half month charge' },
    { value: 'FullMonthCharge', label: 'Full month charge' },
  ];
  const description = !enabled
    ? `${eventName} does not reduce the scheduled coverage amount.`
    : model === 'DailyProration'
      ? 'Charge proportionally to active calendar days in the billing period.'
      : model === 'MonthlyProration'
        ? withdrawal
          ? 'Use the last chargeable date to determine the exit-month charge.'
          : 'Use the admission date to determine the first-month charge.'
        : model === 'FullMonthCharge'
          ? withdrawal
            ? 'Charge the exit month in full; exclude later months.'
            : 'Charge each touched calendar month in full.'
          : 'Keep the full scheduled coverage amount for this event.';

  return (
    <Stack
      component="section"
      aria-label={`${eventName} settings for ${rule.feeHeadName || rule.feeHeadId}`}
      spacing={1.5}
      sx={{ minWidth: 0 }}
    >
      <Box>
        <FormControlLabel
          sx={{ m: 0, gap: 1, alignItems: 'center' }}
          label={<Typography variant="subtitle2">Apply on {eventName.toLowerCase()}</Typography>}
          control={
            <Switch
              size="small"
              name={`${prefix}.${enabledKey}`}
              checked={enabled}
              onChange={(_, checked) => update(index, { [enabledKey]: checked })}
            />
          }
        />
        {!enabled && (
          <Typography variant="caption" color="text.secondary" display="block" sx={{ mt: 0.75 }}>
            {description}
          </Typography>
        )}
      </Box>
      {enabled && (
        <>
          <ShakingTextField error={Boolean(modelError)}>
            <CustomSelect
              label="Proration model"
              labelId={`${eventId}-model-label`}
              SelectDisplayProps={{
                'aria-labelledby': `${eventId}-model-label`,
                'aria-describedby': `${eventId}-model-helper`,
              }}
              helperTextProps={{ id: `${eventId}-model-helper` }}
              name={modelPath}
              options={RULE_OPTIONS}
              labelKey="label"
              valueKey="value"
              value={model === 'FullMonthCharge' ? 'MonthlyProration' : model}
              onBlur={() => formik.setFieldTouched(modelPath, true)}
              onChange={(value) =>
                update(index, {
                  [modelKey]: value as ProrationRuleType,
                  [configKey]: {
                    ...defaultConfiguration(value as ProrationRuleType),
                    ...(!withdrawal && { roundOff: rule.configuration.roundOff ?? 'NoRoundOff' }),
                  },
                })
              }
              error={Boolean(modelError)}
              helperText={modelError || description}
            />
          </ShakingTextField>
          {model === 'DailyProration' && (
            <>
              <ShakingTextField error={Boolean(basisError)}>
                <CustomSelect
                  label="Calculation basis"
                  labelId={`${eventId}-basis-label`}
                  SelectDisplayProps={{
                    'aria-labelledby': `${eventId}-basis-label`,
                    'aria-describedby': basisError ? `${eventId}-basis-helper` : undefined,
                  }}
                  helperTextProps={{ id: `${eventId}-basis-helper` }}
                  required
                  name={`${configPath}.calculationBasis`}
                  options={[{ value: 'CalendarDays', label: 'Calendar days' }]}
                  labelKey="label"
                  valueKey="value"
                  value={config.calculationBasis ?? ''}
                  onChange={(value) => setConfig('calculationBasis', String(value))}
                  onBlur={() => formik.setFieldTouched(`${configPath}.calculationBasis`, true)}
                  error={Boolean(basisError)}
                  helperText={basisError}
                />
              </ShakingTextField>
              <ShakingTextField error={Boolean(minimumError)}>
                <TextField
                  fullWidth
                  size="small"
                  type="number"
                  label="Minimum charge days"
                  name={`${configPath}.minimumChargeDays`}
                  value={config.minimumChargeDays ?? ''}
                  onChange={(event) =>
                    setConfig(
                      'minimumChargeDays',
                      event.target.value === '' ? null : Number(event.target.value)
                    )
                  }
                  onBlur={formik.handleBlur}
                  error={Boolean(minimumError)}
                  helperText={minimumError || 'Optional · Whole number from 0 to 366'}
                  inputProps={{ min: 0, max: 366, step: 1 }}
                />
              </ShakingTextField>
            </>
          )}
          {(model === 'MonthlyProration' || model === 'FullMonthCharge') && (
            <>
              <ShakingTextField error={Boolean(strategyError)}>
                <CustomSelect
                  label="Cut-off behavior"
                  labelId={`${eventId}-strategy-label`}
                  SelectDisplayProps={{
                    'aria-labelledby': `${eventId}-strategy-label`,
                    'aria-describedby': strategyError ? `${eventId}-strategy-helper` : undefined,
                  }}
                  helperTextProps={{ id: `${eventId}-strategy-helper` }}
                  required
                  name={`${configPath}.monthlyRule`}
                  options={monthlyOptions}
                  labelKey="label"
                  valueKey="value"
                  value={
                    model === 'FullMonthCharge' ? 'FullMonthCharge' : (config.monthlyRule ?? '')
                  }
                  onChange={(value) => {
                    if (value === 'FullMonthCharge') {
                      update(index, {
                        [modelKey]: 'FullMonthCharge',
                        [configKey]: {
                          ...(!withdrawal && {
                            roundOff: rule.configuration.roundOff ?? 'NoRoundOff',
                          }),
                        },
                      });
                    } else if (model === 'FullMonthCharge') {
                      update(index, {
                        [modelKey]: 'MonthlyProration',
                        [configKey]: {
                          ...defaultConfiguration('MonthlyProration'),
                          ...config,
                          monthlyRule: value,
                        },
                      });
                    } else {
                      setConfig('monthlyRule', String(value));
                    }
                  }}
                  onBlur={() => formik.setFieldTouched(`${configPath}.monthlyRule`, true)}
                  error={Boolean(strategyError)}
                  helperText={strategyError}
                />
              </ShakingTextField>
              {model !== 'FullMonthCharge' && (
                <ShakingTextField error={Boolean(cutoffError)}>
                  <TextField
                    fullWidth
                    required
                    size="small"
                    type="number"
                    label="Monthly cut-off day"
                    name={`${configPath}.cutOffDay`}
                    value={config.cutOffDay ?? ''}
                    onChange={(event) =>
                      setConfig(
                        'cutOffDay',
                        event.target.value === '' ? null : Number(event.target.value)
                      )
                    }
                    onBlur={formik.handleBlur}
                    error={Boolean(cutoffError)}
                    helperText={cutoffError || 'Whole number from 1 to 31'}
                    inputProps={{ min: 1, max: 31, step: 1 }}
                  />
                </ShakingTextField>
              )}
              {model !== 'FullMonthCharge' &&
                Number.isInteger(config.cutOffDay) &&
                config.cutOffDay! >= 1 &&
                config.cutOffDay! <= 31 && (
                  <Typography variant="caption" color="text.secondary">
                    {withdrawal
                      ? `Exit on/before day ${config.cutOffDay}: ${config.monthlyRule === 'HalfMonthRule' ? '50%' : '0%'} of exit month. After: full exit month. Later months excluded.`
                      : `Admission on/before day ${config.cutOffDay}: full current month. After: ${config.monthlyRule === 'HalfMonthRule' ? '50% of current month' : 'charge from next month'}.`}
                  </Typography>
                )}
            </>
          )}
        </>
      )}
    </Stack>
  );
}

export default function ProrationFeeHeadsSection({ formik }: { formik: PolicyFormik }) {
  const rules = formik.values.feeHeadRules;
  const id = useId();
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());
  const lastSubmit = useRef(0);
  const proratedCount = rules.filter(isProratedRule).length;
  const showSectionError = formik.submitCount > 0 && !proratedCount;

  useLayoutEffect(() => {
    if (!formik.submitCount) {
      lastSubmit.current = 0;
      return;
    }
    if (
      !formik.submitCount ||
      formik.isValidating ||
      formik.isSubmitting ||
      lastSubmit.current === formik.submitCount
    )
      return;
    lastSubmit.current = formik.submitCount;
    const invalidRows =
      typeof formik.errors.feeHeadRules === 'string'
        ? []
        : rules.filter((rule, index) => getIn(formik.errors, `feeHeadRules[${index}]`));
    if (invalidRows.length)
      setExpandedRows(
        (previous) => new Set([...previous, ...invalidRows.map((rule) => rule.feeHeadId)])
      );
  }, [formik.submitCount, formik.isValidating, formik.isSubmitting, formik.errors, rules]);

  const update = (index: number, changes: Partial<IProrationFeeHeadRule>) => {
    formik.setValues((values) => ({
      ...values,
      feeHeadRules: values.feeHeadRules.map((rule, i) =>
        i === index ? { ...rule, ...changes } : rule
      ),
    }));
  };
  const applyBulkRule = (model: ProrationRuleType) => {
    formik.setValues((values) => ({
      ...values,
      feeHeadRules: applyAdmissionPreset(values.feeHeadRules, model),
    }));
    if (model !== 'NoProration')
      setExpandedRows(
        new Set(rules.filter((rule) => rule.feeType !== 'OneTime').map((rule) => rule.feeHeadId))
      );
  };

  return (
    <SectionCard
      title="Fee head configuration"
      subtitle="Choose when each recurring fee should be prorated."
      icon="solar:widget-bold-duotone"
      sx={{
        '& > .MuiBox-root:first-of-type': { flexWrap: 'wrap', '& > .MuiBox-root': { minWidth: 0 } },
      }}
      action={
        <Label color={proratedCount ? 'primary' : 'default'}>
          {proratedCount} / {rules.filter((rule) => rule.feeType !== 'OneTime').length} prorated
        </Label>
      }
    >
      <Stack direction="row" gap={1} alignItems="center" flexWrap="wrap" sx={{ mb: 2 }}>
        <Typography variant="caption" color="text.secondary">
          Admission presets:
        </Typography>
        <Button
          type="button"
          size="small"
          variant="outlined"
          onClick={() => applyBulkRule('DailyProration')}
        >
          All daily
        </Button>
        <Button
          type="button"
          size="small"
          variant="outlined"
          onClick={() => applyBulkRule('MonthlyProration')}
        >
          All monthly
        </Button>
        <Button
          type="button"
          size="small"
          color="inherit"
          onClick={() => applyBulkRule('NoProration')}
        >
          Reset admission
        </Button>
      </Stack>
      {showSectionError && (
        <Alert severity="error" tabIndex={-1} data-validation-error sx={{ mb: 2 }}>
          Enable Daily or Monthly proration for admission or early withdrawal on at least one
          recurring fee head.
        </Alert>
      )}
      {!rules.length ? (
        <Typography color="text.secondary">
          No active fee heads found. Configure fee heads first.
        </Typography>
      ) : (
        <Stack sx={{ border: 1, borderColor: 'divider', borderRadius: 1.5, overflow: 'hidden' }}>
          {rules.map((rule, index) => {
            const oneTime = rule.feeType === 'OneTime';
            const expanded = expandedRows.has(rule.feeHeadId);
            const rowError =
              typeof formik.errors.feeHeadRules === 'string'
                ? undefined
                : getIn(formik.errors, `feeHeadRules[${index}]`);
            const showRowError = formik.submitCount > 0 && Boolean(rowError);
            const toggleId = `${id}-${rule.feeHeadId}`;
            const toggleLabel = `${expanded ? 'Collapse' : 'Configure'} ${rule.feeHeadName || rule.feeHeadId}`;
            return (
              <Box key={rule.feeHeadId} sx={{ '& + &': { borderTop: 1, borderColor: 'divider' } }}>
                <Stack direction="row" alignItems="center" gap={1} sx={{ p: 1.5 }}>
                  <Stack spacing={0.75} sx={{ flex: 1, minWidth: 0 }}>
                    <Stack direction="row" gap={1} alignItems="center" flexWrap="wrap">
                      <Typography variant="subtitle2" sx={{ overflowWrap: 'anywhere' }}>
                        {rule.feeHeadName || rule.feeHeadId}
                      </Typography>
                      <Label color={oneTime ? 'default' : 'info'}>
                        {oneTime ? 'One-time' : 'Recurring'}
                      </Label>
                      {showRowError && <Label color="error">Check settings</Label>}
                    </Stack>
                    {oneTime ? (
                      <Typography variant="caption" color="text.secondary">
                        One-time fees cannot be prorated.
                      </Typography>
                    ) : (
                      <Stack direction="row" gap={1.5} flexWrap="wrap">
                        <Typography variant="caption" color="text.secondary">
                          Admission: {eventSummary(rule)}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          Early withdrawal: {eventSummary(rule, true)}
                        </Typography>
                      </Stack>
                    )}
                  </Stack>
                  {!oneTime && (
                    <CustomTooltip title={toggleLabel}>
                      <IconButton
                        type="button"
                        size="small"
                        aria-label={toggleLabel}
                        aria-expanded={expanded}
                        aria-controls={expanded ? toggleId : undefined}
                        onClick={() =>
                          setExpandedRows((previous) => {
                            const next = new Set(previous);
                            if (next.has(rule.feeHeadId)) next.delete(rule.feeHeadId);
                            else next.add(rule.feeHeadId);
                            return next;
                          })
                        }
                      >
                        <Iconify
                          icon={expanded ? 'solar:alt-arrow-up-bold' : 'solar:alt-arrow-down-bold'}
                        />
                      </IconButton>
                    </CustomTooltip>
                  )}
                </Stack>
                {oneTime && showRowError && typeof rowError === 'string' && (
                  <Alert
                    severity="error"
                    tabIndex={-1}
                    data-validation-error
                    sx={{ m: 1.5, mt: 0 }}
                  >
                    {rowError}
                  </Alert>
                )}
                <Collapse in={expanded && !oneTime} unmountOnExit>
                  <Stack id={toggleId} spacing={2} sx={{ px: 1.5, pb: 2 }}>
                    {showRowError && typeof rowError === 'string' && (
                      <Alert severity="error" tabIndex={-1} data-validation-error>
                        {rowError}
                      </Alert>
                    )}
                    <Box
                      sx={{
                        display: 'grid',
                        gridTemplateColumns: {
                          xs: 'minmax(0, 1fr)',
                          md: 'repeat(2, minmax(0, 1fr))',
                        },
                        gap: 2,
                        p: 1.5,
                        borderRadius: 1,
                        bgcolor: 'background.neutral',
                      }}
                    >
                      <EventSettings formik={formik} index={index} update={update} />
                      <EventSettings formik={formik} index={index} update={update} withdrawal />
                    </Box>
                  </Stack>
                </Collapse>
              </Box>
            );
          })}
        </Stack>
      )}
    </SectionCard>
  );
}
