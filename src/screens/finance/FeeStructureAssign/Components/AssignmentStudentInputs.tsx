import type {
  AssignmentRequest,
  AssignmentCandidate,
  AssignmentServicePeriod,
} from 'src/redux/finance/studentFeeAssignment';
import type { DateRange } from 'src/components/custom-date-range-picker';

import dayjs from 'dayjs';
import { useId, useState } from 'react';
import { Label } from 'src/components/label';
import { Iconify } from 'src/components/iconify';
import CustomSelect from 'src/components/custom-select';
import { formatNumber } from 'src/utils/formate_number';
import CustomTooltip from 'src/components/custom-tooltip';
import { CustomDateRangePicker } from 'src/components/custom-date-range-picker';
import { amountError } from 'src/screens/finance/settings/FeeStructure/feeStructureModel';
import { useAssignmentTransportSourcesQuery } from 'src/redux/finance/studentFeeAssignment';
import {
  Box,
  Stack,
  Alert,
  Button,
  Checkbox,
  TextField,
  IconButton,
  Typography,
} from '@mui/material';

import AssignmentMoneyInput from './AssignmentMoneyInput';
import { servicePeriodErrors, serializeServiceDate } from './assignmentServiceDates';

import type { AssignmentYearBounds } from './assignmentServiceDates';

const parseDate = (date?: string) => (date ? dayjs(date.slice(0, 10)) : null);

export default function AssignmentStudentInputs({
  candidate,
  request,
  onChange,
  canOverrideDates,
  canOverrideAmount = false,
  disabled,
  yearBounds,
  validationBounds = yearBounds,
  showErrors = false,
  flat = false,
  allowTransportSource = true,
  lockOptionalSelection = false,
}: {
  candidate: AssignmentCandidate;
  request: AssignmentRequest;
  onChange: (value: AssignmentRequest) => void;
  canOverrideDates: boolean;
  canOverrideAmount?: boolean;
  disabled: boolean;
  yearBounds?: AssignmentYearBounds;
  validationBounds?: AssignmentYearBounds;
  showErrors?: boolean;
  flat?: boolean;
  // Verified transport records belong to one student and cannot be shared in bulk.
  allowTransportSource?: boolean;
  lockOptionalSelection?: boolean;
}) {
  const selectionId = useId();
  const [touched, setTouched] = useState<string[]>([]);
  const [expandedHeads, setExpandedHeads] = useState<string[]>([]);
  const touch = (key: string) =>
    setTouched((previous) => (previous.includes(key) ? previous : [...previous, key]));
  const transport = useAssignmentTransportSourcesQuery(
    { studentId: request.studentId, academicYearId: request.academicYearId },
    {
      skip:
        !allowTransportSource ||
        !request.servicePeriods.some((p) => p.source === 'TransportService'),
    }
  );
  const updatePeriod = (period: AssignmentServicePeriod) =>
    onChange({
      ...request,
      servicePeriods: [
        ...request.servicePeriods.filter((p) => p.feeHeadId !== period.feeHeadId),
        period,
      ],
    });
  const isIncluded = (head: AssignmentCandidate['heads'][number]) =>
    !head.isOptional || request.selectedOptionalFeeHeadIds.includes(head.feeHeadId);
  const amountFor = (head: AssignmentCandidate['heads'][number]) => {
    if (head.isVariable)
      return request.variableFeeHeads?.find((input) => input.feeHeadId === head.feeHeadId)?.amount;
    const override = request.feeHeadDetails.find((input) => input.feeHeadId === head.feeHeadId);
    return override ? override.amount : head.configuredAmount;
  };
  const amounts = candidate.heads.filter(isIncluded).map(amountFor);
  const total = amounts.every((amount) => amount != null && !amountError(amount))
    ? amounts.reduce<number>((sum, amount) => sum + amount!, 0)
    : undefined;

  return (
    <Stack spacing={1.5}>
      <Stack divider={<Box sx={{ borderBottom: 1, borderColor: 'divider' }} />}>
        {candidate.heads.map((head) => {
          const { feeHeadId, feeHeadName } = head;
          const checkboxId = `${selectionId}-${feeHeadId}`;
          const included = isIncluded(head);
          const canEditAmount =
            head.isVariable ||
            (head.isOptional && canOverrideAmount && Boolean(request.editAssignmentId));
          const amount = amountFor(head);
          const amountIssue =
            showErrors || touched.includes(feeHeadId) ? amountError(amount) : undefined;
          const variable = request.variableFeeHeads?.find((input) => input.feeHeadId === feeHeadId);
          const savedPeriod = request.servicePeriods.find((item) => item.feeHeadId === feeHeadId);
          const admissionPeriod =
            head.servicePeriod?.source === 'Registration'
              ? head.servicePeriod
              : savedPeriod?.source === 'Registration'
                ? savedPeriod
                : undefined;
          const defaultPeriod: AssignmentServicePeriod = admissionPeriod ?? {
            feeHeadId,
            source: request.chargePeriodSource ?? 'AcademicYear',
            ...(request.chargePeriodSource && {
              startDate: request.chargeStartDate,
              endDate: request.chargeEndDate,
            }),
          };
          const period = savedPeriod ?? defaultPeriod;
          const transportPeriod = period.source === 'TransportService';
          const transportRecord = transportPeriod
            ? transport.data?.find((record) => record.id === period.sourceReferenceId)
            : undefined;
          const defaultStart = parseDate(defaultPeriod.startDate) ?? yearBounds?.start;
          const defaultEnd = parseDate(defaultPeriod.endDate) ?? yearBounds?.end;
          const savedRange =
            period.source !== 'AcademicYear' && period.source !== 'BoardAcademicYear';
          const start =
            parseDate(period.startDate ?? transportRecord?.startDate) ??
            (savedRange ? null : (defaultStart ?? null));
          const end =
            parseDate(period.endDate ?? transportRecord?.endDate) ??
            (savedRange ? null : (defaultEnd ?? null));
          const dateErrors = servicePeriodErrors(period, validationBounds);
          const rangeError =
            dateErrors.start ||
            dateErrors.end ||
            (!yearBounds ? 'Selected academic year dates are unavailable.' : undefined);
          const reasonError =
            showErrors || touched.includes(`${feeHeadId}-reason`) ? dateErrors.reason : undefined;
          const canUseTransport =
            allowTransportSource && head.supportsTransportSource && !head.isVariable;
          const expanded =
            flat || canEditAmount || Boolean(savedPeriod) || expandedHeads.includes(feeHeadId);

          const changeDates = ([nextStart, nextEnd]: DateRange) => {
            if (!canOverrideDates || disabled || !nextStart || !nextEnd) return;
            if (nextStart.isSame(start, 'day') && nextEnd.isSame(end, 'day')) return;
            const isDefault =
              defaultStart &&
              defaultEnd &&
              nextStart.isSame(defaultStart, 'day') &&
              nextEnd.isSame(defaultEnd, 'day');
            updatePeriod(
              isDefault
                ? defaultPeriod
                : {
                    feeHeadId,
                    source: 'ManualOverride',
                    startDate: serializeServiceDate(nextStart),
                    endDate: serializeServiceDate(nextEnd),
                    ...(period.source === 'ManualOverride' && { reason: period.reason }),
                  }
            );
          };

          const selectOptional = (checked: boolean) => {
            onChange({
              ...request,
              selectedOptionalFeeHeadIds: checked
                ? [...request.selectedOptionalFeeHeadIds, feeHeadId]
                : request.selectedOptionalFeeHeadIds.filter((id) => id !== feeHeadId),
              servicePeriods: checked
                ? [...request.servicePeriods, ...(admissionPeriod ? [admissionPeriod] : [])]
                : request.servicePeriods.filter((item) => item.feeHeadId !== feeHeadId),
              feeHeadDetails: checked
                ? request.feeHeadDetails
                : request.feeHeadDetails.filter((item) => item.feeHeadId !== feeHeadId),
              variableFeeHeads: checked
                ? request.variableFeeHeads
                : request.variableFeeHeads?.filter((item) => item.feeHeadId !== feeHeadId),
            });
          };

          return (
            <Box
              key={feeHeadId}
              component="section"
              aria-label={feeHeadName}
              sx={{
                py: 1.5,
                display: 'grid',
                gridTemplateColumns: { xs: 'minmax(0, 1fr)', sm: 'minmax(0, 1fr) minmax(0, 2fr)' },
                gap: 1.5,
                alignItems: 'start',
              }}
            >
              <Box
                sx={{
                  display: 'grid',
                  gridTemplateColumns: '36px minmax(0, 1fr)',
                  columnGap: 0.5,
                  minHeight: 36,
                  alignItems: 'center',
                }}
              >
                {head.isOptional && (
                  <Checkbox
                    checked={included}
                    disabled={disabled || lockOptionalSelection}
                    onChange={(_, checked) => selectOptional(checked)}
                    slotProps={{ input: { id: checkboxId } }}
                    sx={{ gridColumn: 1, gridRow: 1, justifySelf: 'center' }}
                  />
                )}
                <Stack
                  direction="row"
                  spacing={1}
                  alignItems="center"
                  flexWrap="wrap"
                  useFlexGap
                  sx={{ gridColumn: 2, gridRow: 1, minWidth: 0 }}
                >
                  <Typography component="h3" variant="subtitle2" sx={{ overflowWrap: 'anywhere' }}>
                    {head.isOptional ? <label htmlFor={checkboxId}>{feeHeadName}</label> : feeHeadName}
                  </Typography>
                  <Label color={head.isOptional ? 'info' : 'default'}>
                    {head.isOptional ? 'Optional' : 'Required'}
                  </Label>
                  {!flat && included && !expanded && (
                    <CustomTooltip title={`Expand ${feeHeadName}`}>
                      <IconButton
                        size="small"
                        disabled={disabled}
                        aria-label={`Expand ${feeHeadName}`}
                        onClick={() => setExpandedHeads((previous) => [...previous, feeHeadId])}
                      >
                        <Iconify icon="mdi:chevron-down" />
                      </IconButton>
                    </CustomTooltip>
                  )}
                </Stack>
              </Box>
              {included && (
                <Box
                  sx={{
                    display: 'grid',
                    gridTemplateColumns: { xs: 'minmax(0, 1fr)', sm: 'repeat(2, minmax(0, 1fr))' },
                    gap: 1.5,
                    alignItems: 'start',
                  }}
                >
                  {expanded ? (
                    <Stack spacing={1}>
                      <CustomDateRangePicker
                        label="Start – end date"
                        name={`${request.studentId}-${feeHeadId}-service-dates`}
                        dateFormat="DD/MM/YYYY"
                        singleInput
                        calendars={1}
                        value={[start, end]}
                        minDate={yearBounds?.start}
                        maxDate={yearBounds?.end}
                        disabled={disabled || (!yearBounds && !start && !end)}
                        readOnly={!canOverrideDates || !yearBounds}
                        error={Boolean(rangeError)}
                        helperText={rangeError}
                        onChange={changeDates}
                      />
                      {period.source === 'ManualOverride' && (
                        <TextField
                          label="Reason for changing dates"
                          size="small"
                          fullWidth
                          required
                          value={period.reason ?? ''}
                          disabled={disabled}
                          inputProps={{ maxLength: 500 }}
                          onBlur={() => touch(`${feeHeadId}-reason`)}
                          error={Boolean(reasonError)}
                          helperText={reasonError}
                          onChange={(event) =>
                            updatePeriod({ ...period, reason: event.target.value })
                          }
                        />
                      )}
                      {canUseTransport && (
                        <Button
                          size="small"
                          sx={{ alignSelf: 'flex-start' }}
                          disabled={disabled}
                          onClick={() =>
                            updatePeriod(
                              transportPeriod
                                ? defaultPeriod
                                : { feeHeadId, source: 'TransportService' }
                            )
                          }
                        >
                          {transportPeriod ? 'Use default dates' : 'Use transport dates'}
                        </Button>
                      )}
                      {transportPeriod && canUseTransport && (
                        <>
                          <CustomSelect
                            size="small"
                            name={`${feeHeadId}-transport`}
                            label="Transport record"
                            value={period.sourceReferenceId ?? ''}
                            isLoading={transport.isLoading}
                            disabled={disabled}
                            options={(transport.data ?? []).map((record) => ({
                              value: record.id,
                              label: record.label,
                            }))}
                            onChange={(value) =>
                              updatePeriod({
                                feeHeadId,
                                source: 'TransportService',
                                sourceReferenceId: String(value),
                              })
                            }
                          />
                          {transport.isError && (
                            <Alert
                              severity="error"
                              action={
                                <Button size="small" onClick={() => transport.refetch()}>
                                  Retry
                                </Button>
                              }
                            >
                              Transport records could not be loaded.
                            </Alert>
                          )}
                        </>
                      )}
                    </Stack>
                  ) : (
                    <Box />
                  )}
                  {canEditAmount ? (
                    <Stack spacing={1}>
                      <AssignmentMoneyInput
                        label={head.isVariable ? 'Monthly amount' : `${feeHeadName} amount`}
                        name={`${request.studentId}-${feeHeadId}-amount`}
                        required
                        fullWidth
                        value={amount ?? null}
                        disabled={disabled}
                        error={Boolean(amountIssue)}
                        helperText={
                          amountIssue || (head.isVariable ? 'Total for the selected dates' : undefined)
                        }
                        onBlur={() => touch(feeHeadId)}
                        onAmountChange={(value) =>
                          onChange(
                            head.isVariable
                              ? {
                                  ...request,
                                  variableFeeHeads: [
                                    ...(request.variableFeeHeads ?? []).filter(
                                      (item) => item.feeHeadId !== feeHeadId
                                    ),
                                    {
                                      feeHeadId,
                                      amount: value,
                                      zeroAmountReason: variable?.zeroAmountReason,
                                    },
                                  ],
                                }
                              : {
                                  ...request,
                                  feeHeadDetails: [
                                    ...request.feeHeadDetails.filter(
                                      (item) => item.feeHeadId !== feeHeadId
                                    ),
                                    ...(value === head.configuredAmount
                                      ? []
                                      : [{ feeHeadId, amount: value }]),
                                  ],
                                }
                          )
                        }
                      />
                      {head.isVariable && variable?.amount === 0 && (
                        <TextField
                          label="Reason for zero amount"
                          fullWidth
                          size="small"
                          required
                          value={variable.zeroAmountReason ?? ''}
                          disabled={disabled}
                          inputProps={{ maxLength: 500 }}
                          onChange={(event) =>
                            onChange({
                              ...request,
                              variableFeeHeads: (request.variableFeeHeads ?? []).map((item) =>
                                item.feeHeadId === feeHeadId
                                  ? { ...item, zeroAmountReason: event.target.value }
                                  : item
                              ),
                            })
                          }
                        />
                      )}
                    </Stack>
                  ) : (
                    <Typography
                      variant="subtitle2"
                      sx={{ textAlign: { sm: 'right' }, fontVariantNumeric: 'tabular-nums' }}
                    >
                      {amount == null ? '—' : formatNumber(amount, 'INR')}
                    </Typography>
                  )}
                </Box>
              )}
            </Box>
          );
        })}
      </Stack>
      <Stack
        direction="row"
        justifyContent="space-between"
        sx={{ py: 1.5, borderTop: 1, borderColor: 'divider' }}
      >
        <Typography variant="subtitle2">Selected fees</Typography>
        <Typography variant="subtitle2" sx={{ fontVariantNumeric: 'tabular-nums' }}>
          {total == null ? '—' : formatNumber(total, 'INR')}
        </Typography>
      </Stack>
    </Stack>
  );
}
