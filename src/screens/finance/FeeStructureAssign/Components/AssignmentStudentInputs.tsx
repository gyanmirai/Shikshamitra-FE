import type {
  AssignmentRequest,
  AssignmentCandidate,
  AssignmentServicePeriod,
} from 'src/redux/finance/studentFeeAssignment';

import dayjs from 'dayjs';
import { useState } from 'react';
import { Label } from 'src/components/label';
import { fDate } from 'src/utils/format-time';
import { Iconify } from 'src/components/iconify';
import CustomSelect from 'src/components/custom-select';
import { formatNumber } from 'src/utils/formate_number';
import CustomTooltip from 'src/components/custom-tooltip';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { amountError } from 'src/screens/finance/settings/FeeStructure/feeStructureModel';
import { useAssignmentTransportSourcesQuery } from 'src/redux/finance/studentFeeAssignment';
import {
  Box,
  Stack,
  Alert,
  Button,
  Checkbox,
  Collapse,
  TextField,
  IconButton,
  Typography,
  FormControlLabel,
} from '@mui/material';

import AssignmentMoneyInput from './AssignmentMoneyInput';
import { servicePeriodErrors, serializeServiceDate } from './assignmentServiceDates';

import type { AssignmentYearBounds } from './assignmentServiceDates';

export default function AssignmentStudentInputs({
  candidate,
  request,
  onChange,
  canOverrideDates,
  disabled,
  yearBounds,
  showErrors = false,
  flat = false,
  allowTransportSource = true,
}: {
  candidate: AssignmentCandidate;
  request: AssignmentRequest;
  onChange: (value: AssignmentRequest) => void;
  canOverrideDates: boolean;
  disabled: boolean;
  yearBounds?: AssignmentYearBounds;
  showErrors?: boolean;
  flat?: boolean;
  // Verified transport records belong to one student and cannot be shared in bulk.
  allowTransportSource?: boolean;
}) {
  const [touchedAmounts, setTouchedAmounts] = useState<string[]>([]);
  const [expandedHeads, setExpandedHeads] = useState<string[]>(() =>
    request.servicePeriods
      .filter((period) => period.source !== 'AcademicYear')
      .map((period) => period.feeHeadId)
  );
  const [touchedDates, setTouchedDates] = useState<string[]>([]);
  const touchDate = (key: string) =>
    setTouchedDates((previous) => [...new Set([...previous, key])]);
  const usesTransport = request.servicePeriods.some((p) => p.source === 'TransportService');
  const transport = useAssignmentTransportSourcesQuery(
    { studentId: request.studentId, academicYearId: request.academicYearId },
    { skip: !usesTransport }
  );
  const updatePeriod = (period: AssignmentServicePeriod) =>
    onChange({
      ...request,
      servicePeriods: [
        ...request.servicePeriods.filter((p) => p.feeHeadId !== period.feeHeadId),
        period,
      ],
    });
  const selectedAmounts = candidate.heads
    .filter(
      (head) => !head.isOptional || request.selectedOptionalFeeHeadIds.includes(head.feeHeadId)
    )
    .map((head) =>
      head.isVariable
        ? request.variableFeeHeads?.find((input) => input.feeHeadId === head.feeHeadId)?.amount
        : head.configuredAmount
    );
  const selectedTotal = selectedAmounts.every((amount) => amount != null && !amountError(amount))
    ? selectedAmounts.reduce<number>((sum, amount) => sum + amount!, 0)
    : undefined;
  return (
    <Stack spacing={2}>
      <Stack divider={<Box sx={{ borderBottom: 1, borderColor: 'divider' }} />}>
        {candidate.heads.map((head) => {
          const included =
            !head.isOptional || request.selectedOptionalFeeHeadIds.includes(head.feeHeadId);
          const period = request.servicePeriods.find((p) => p.feeHeadId === head.feeHeadId) ?? {
            feeHeadId: head.feeHeadId,
            source: 'AcademicYear' as const,
          };
          const variable = request.variableFeeHeads?.find((h) => h.feeHeadId === head.feeHeadId);
          const dateErrors = servicePeriodErrors(period, yearBounds);
          const dateError = (key: 'start' | 'end' | 'reason') =>
            showErrors || touchedDates.includes(`${head.feeHeadId}-${key}`)
              ? dateErrors[key]
              : undefined;
          const expanded =
            flat ||
            expandedHeads.includes(head.feeHeadId) ||
            head.isVariable ||
            (showErrors && Boolean(dateErrors.start || dateErrors.end || dateErrors.reason));
          const manualDateFields = (
            <Box sx={{ gridColumn: '1 / -1', minWidth: 0 }}>
              {!yearBounds && (
                <Alert severity="error">Selected academic year dates are unavailable.</Alert>
              )}
              <Box
                sx={{
                  display: 'grid',
                  gridTemplateColumns: {
                    xs: 'minmax(0, 1fr)',
                    sm: 'minmax(0, 1fr) minmax(0, 1fr) minmax(0, 1.4fr)',
                  },
                  gap: 1,
                  alignItems: 'start',
                  '& > *': { minWidth: 0 },
                }}
              >
                <DatePicker
                  format="DD/MM/YYYY"
                  label="Start date"
                  value={period.startDate ? dayjs(period.startDate.slice(0, 10)) : null}
                  disabled={disabled || !yearBounds}
                  minDate={yearBounds?.start}
                  maxDate={yearBounds?.end}
                  slotProps={{
                    textField: {
                      fullWidth: true,
                      size: 'small',
                      required: true,
                      name: `${head.feeHeadId}-start`,
                      onBlur: () => touchDate(`${head.feeHeadId}-start`),
                      error: Boolean(dateError('start')),
                      helperText: dateError('start'),
                    },
                  }}
                  onChange={(date) => {
                    touchDate(`${head.feeHeadId}-start`);
                    updatePeriod({
                      ...period,
                      startDate: serializeServiceDate(date),
                    });
                  }}
                />
                <DatePicker
                  format="DD/MM/YYYY"
                  label="End date"
                  value={period.endDate ? dayjs(period.endDate.slice(0, 10)) : null}
                  disabled={disabled || !yearBounds}
                  minDate={
                    period.startDate &&
                    yearBounds &&
                    dayjs(period.startDate).isValid() &&
                    !dayjs(period.startDate).isBefore(yearBounds.start, 'day') &&
                    !dayjs(period.startDate).isAfter(yearBounds.end, 'day')
                      ? dayjs(period.startDate.slice(0, 10))
                      : yearBounds?.start
                  }
                  maxDate={yearBounds?.end}
                  slotProps={{
                    textField: {
                      fullWidth: true,
                      size: 'small',
                      required: true,
                      name: `${head.feeHeadId}-end`,
                      onBlur: () => touchDate(`${head.feeHeadId}-end`),
                      error: Boolean(dateError('end')),
                      helperText: dateError('end'),
                    },
                  }}
                  onChange={(date) => {
                    touchDate(`${head.feeHeadId}-end`);
                    updatePeriod({
                      ...period,
                      endDate: serializeServiceDate(date),
                    });
                  }}
                />
                <TextField
                  label="Reason for changing dates"
                  size="small"
                  fullWidth
                  required
                  value={period.reason ?? ''}
                  disabled={disabled}
                  inputProps={{ maxLength: 500 }}
                  onBlur={() => touchDate(`${head.feeHeadId}-reason`)}
                  error={Boolean(dateError('reason'))}
                  helperText={dateError('reason')}
                  onChange={(e) => updatePeriod({ ...period, reason: e.target.value })}
                />
              </Box>
            </Box>
          );
          return (
            <Box
              key={head.feeHeadId}
              component="section"
              aria-label={head.feeHeadName}
              sx={{
                py: flat ? 1.5 : 2,
                minWidth: 0,
                '&:first-of-type': { pt: flat ? 0 : 2 },
                ...(flat && {
                  display: 'grid',
                  gridTemplateColumns: {
                    xs: 'minmax(0, 1fr)',
                    sm: 'minmax(0, 1fr) minmax(0, 2fr)',
                  },
                  gap: 1.5,
                  alignItems: 'start',
                  '& > .MuiCollapse-root': { minWidth: 0 },
                }),
              }}
            >
              <Stack
                direction="row"
                spacing={2}
                justifyContent="space-between"
                alignItems="flex-start"
              >
                <Box sx={{ minWidth: 0, flex: 1 }}>
                  {head.isOptional ? (
                    <FormControlLabel
                      sx={{
                        m: 0,
                        ml: -1,
                        '& .MuiFormControlLabel-label': {
                          typography: 'subtitle2',
                          overflowWrap: 'anywhere',
                        },
                      }}
                      control={
                        <Checkbox
                          checked={included}
                          disabled={!head.isOptional || disabled}
                          onChange={(_, checked) =>
                            onChange({
                              ...request,
                              selectedOptionalFeeHeadIds: checked
                                ? [...request.selectedOptionalFeeHeadIds, head.feeHeadId]
                                : request.selectedOptionalFeeHeadIds.filter(
                                    (id) => id !== head.feeHeadId
                                  ),
                              servicePeriods: checked
                                ? request.servicePeriods
                                : request.servicePeriods.filter(
                                    (p) => p.feeHeadId !== head.feeHeadId
                                  ),
                              variableFeeHeads: checked
                                ? request.variableFeeHeads
                                : request.variableFeeHeads?.filter(
                                    (h) => h.feeHeadId !== head.feeHeadId
                                  ),
                              feeHeadDetails: checked
                                ? request.feeHeadDetails
                                : request.feeHeadDetails.filter(
                                    (h) => h.feeHeadId !== head.feeHeadId
                                  ),
                            })
                          }
                        />
                      }
                      label={`${head.feeHeadName} · ${head.isOptional ? 'Optional' : 'Mandatory'}`}
                    />
                  ) : (
                    <Stack
                      direction="row"
                      spacing={1}
                      alignItems="center"
                      useFlexGap
                      flexWrap="wrap"
                    >
                      <Typography
                        component="h3"
                        variant="subtitle2"
                        sx={{ overflowWrap: 'anywhere' }}
                      >
                        {head.feeHeadName}
                      </Typography>
                      <Label>Required</Label>
                    </Stack>
                  )}
                  {!flat && (
                    <Typography variant="body2" color="text.secondary">
                      {head.isVariable ? 'Student amount · ' : ''}
                      {period.source === 'ManualOverride'
                        ? 'Custom dates'
                        : period.source === 'TransportService'
                          ? 'Transport service'
                          : 'Academic year'}
                      {head.isOneTime ? ' · One-time' : ''}
                    </Typography>
                  )}
                </Box>
                {!head.isVariable && !flat && (
                  <Typography
                    variant="subtitle2"
                    sx={{
                      flexShrink: 0,
                      fontVariantNumeric: 'tabular-nums',
                      pt: head.isOptional ? 1 : 0,
                    }}
                  >
                    {head.configuredAmount == null
                      ? '—'
                      : formatNumber(head.configuredAmount, 'INR')}
                  </Typography>
                )}
                {included && !head.isVariable && !flat && (
                  <CustomTooltip title={`${expanded ? 'Collapse' : 'Expand'} ${head.feeHeadName}`}>
                    <IconButton
                      size="small"
                      sx={{ minWidth: 44, minHeight: 44 }}
                      disabled={disabled}
                      aria-label={`${expanded ? 'Collapse' : 'Expand'} ${head.feeHeadName}`}
                      aria-expanded={Boolean(expanded)}
                      aria-controls={`${request.studentId}-${head.feeHeadId}-fields`}
                      onClick={() =>
                        setExpandedHeads((previous) =>
                          previous.includes(head.feeHeadId)
                            ? previous.filter((id) => id !== head.feeHeadId)
                            : [...previous, head.feeHeadId]
                        )
                      }
                    >
                      <Iconify icon={expanded ? 'mdi:chevron-up' : 'mdi:chevron-down'} />
                    </IconButton>
                  </CustomTooltip>
                )}
              </Stack>
              {included && (
                <Collapse in={Boolean(expanded)}>
                  <Box
                    id={`${request.studentId}-${head.feeHeadId}-fields`}
                    sx={{
                      mt: flat ? 0 : 2,
                      display: 'grid',
                      gridTemplateColumns: {
                        xs: 'minmax(0, 1fr)',
                        sm:
                          flat || head.isVariable ? 'repeat(2, minmax(0, 1fr))' : 'minmax(0, 1fr)',
                      },
                      gap: 1,
                      alignItems: 'start',
                    }}
                  >
                    <Stack spacing={1}>
                      {canOverrideDates ||
                      (allowTransportSource && head.supportsTransportSource && !head.isVariable) ? (
                        <CustomSelect
                          optionDescriptionKey="description"
                          size="small"
                          name={`${head.feeHeadId}-source`}
                          label="Service period"
                          value={period.source}
                          disabled={disabled}
                          labelKey="label"
                          valueKey="value"

                          options={[
                            {
                              value: 'AcademicYear',
                              label: 'Academic year',
                              description: yearBounds
                                ? `${fDate(yearBounds.start)} – ${fDate(yearBounds.end)}`
                                : 'Academic year dates are unavailable.',
                            },
                            ...(allowTransportSource && head.supportsTransportSource && !head.isVariable
                              ? [
                                  {
                                    value: 'TransportService',
                                    label: 'Transport service',
                                    description:
                                      'Use the service dates from the selected verified transport record.',
                                  },
                                ]
                              : []),
                            ...(canOverrideDates
                              ? [
                                  {
                                    value: 'ManualOverride',
                                    label: 'Custom dates',
                                    description:
                                      'Set the charge coverage within the academic year. Start date, end date and a reason are required; preview shows any applicable service adjustment.',
                                  },
                                ]
                              : []),
                          ]}
                          onChange={(value) =>
                            updatePeriod({
                              feeHeadId: head.feeHeadId,
                              source: value as AssignmentServicePeriod['source'],
                            })
                          }
                        />
                      ) : flat ? (
                        <Box>
                          <Typography variant="caption" color="text.secondary">
                            Service period
                          </Typography>
                          <Typography variant="body2">
                            {period.source === 'ManualOverride'
                              ? 'Custom dates'
                              : period.source === 'TransportService'
                                ? 'Transport service'
                                : 'Academic year'}
                          </Typography>
                        </Box>
                      ) : null}
                      {period.source === 'TransportService' && (
                        <>
                          <CustomSelect
                            size="small"
                            name={`${head.feeHeadId}-transport`}
                            label="Transport record"
                            value={period.sourceReferenceId ?? ''}
                            isLoading={transport.isLoading}
                            disabled={disabled}
                            options={(transport.data ?? []).map((t) => ({
                              value: t.id,
                              label: t.label,
                            }))}
                            onChange={(value) =>
                              updatePeriod({
                                feeHeadId: head.feeHeadId,
                                source: 'TransportService',
                                sourceReferenceId: String(value),
                              })
                            }
                          />
                          {transport.isError && (
                            <Alert
                              severity="error"
                              action={
                                <Button
                                  size="small"
                                  startIcon={<Iconify icon="mdi:refresh" />}
                                  onClick={() => transport.refetch()}
                                >
                                  Retry
                                </Button>
                              }
                            >
                              Transport records could not be loaded.
                            </Alert>
                          )}
                        </>
                      )}
                      {!flat && period.source === 'ManualOverride' && manualDateFields}
                    </Stack>
                    {!head.isVariable && flat && (
                      <Box sx={{ textAlign: 'right' }}>
                        <Typography variant="caption" color="text.secondary">
                          Amount
                        </Typography>
                        <Typography variant="subtitle2" sx={{ fontVariantNumeric: 'tabular-nums' }}>
                          {head.configuredAmount == null
                            ? '—'
                            : formatNumber(head.configuredAmount, 'INR')}
                        </Typography>
                      </Box>
                    )}
                    {head.isVariable && (
                      <Stack spacing={1.5}>
                        <AssignmentMoneyInput
                          label={`${head.feeHeadName} student amount`}
                          name={`${request.studentId}-${head.feeHeadId}-amount`}
                          required
                          fullWidth
                          value={variable?.amount ?? null}
                          disabled={disabled}
                          error={
                            (showErrors || touchedAmounts.includes(head.feeHeadId)) &&
                            !!amountError(variable?.amount)
                          }
                          helperText={
                            ((showErrors || touchedAmounts.includes(head.feeHeadId)) &&
                            amountError(variable?.amount)
                              ? amountError(variable?.amount)
                              : undefined) || undefined
                          }
                          onBlur={() =>
                            setTouchedAmounts((previous) =>
                              previous.includes(head.feeHeadId)
                                ? previous
                                : [...previous, head.feeHeadId]
                            )
                          }
                          onAmountChange={(amount) =>
                            onChange({
                              ...request,
                              variableFeeHeads: [
                                ...(request.variableFeeHeads ?? []).filter(
                                  (h) => h.feeHeadId !== head.feeHeadId
                                ),
                                {
                                  feeHeadId: head.feeHeadId,
                                  amount,
                                  zeroAmountReason: variable?.zeroAmountReason,
                                },
                              ],
                            })
                          }
                        />
                        {variable?.amount === 0 && (
                          <TextField
                            label="Reason for zero amount"
                            fullWidth
                            size="small"
                            required
                            value={variable.zeroAmountReason ?? ''}
                            disabled={disabled}
                            inputProps={{ maxLength: 500 }}
                            onChange={(e) =>
                              onChange({
                                ...request,
                                variableFeeHeads: (request.variableFeeHeads ?? []).map((h) =>
                                  h.feeHeadId === head.feeHeadId
                                    ? { ...h, zeroAmountReason: e.target.value }
                                    : h
                                ),
                              })
                            }
                          />
                        )}
                      </Stack>
                    )}
                  </Box>
                </Collapse>
              )}
              {included && flat && period.source === 'ManualOverride' && manualDateFields}
            </Box>
          );
        })}
      </Stack>
      <Stack
        direction="row"
        justifyContent="space-between"
        alignItems="center"
        sx={{ px: 0, py: 1.5, borderTop: 1, borderColor: 'divider', '& > :last-child': { pr: 0 } }}
      >
        <Typography variant="subtitle2">Selected fees</Typography>
        <Typography variant="subtitle2" sx={{ fontVariantNumeric: 'tabular-nums' }}>
          {selectedTotal == null ? '—' : formatNumber(selectedTotal, 'INR')}
        </Typography>
      </Stack>
    </Stack>
  );
}
