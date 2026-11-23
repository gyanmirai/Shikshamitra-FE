import type { ReactNode } from 'react';
import type { DateRange } from 'src/components/custom-date-range-picker';
import type {
  AssignmentRequest,
  AssignmentPreview,
  AssignmentCandidate,
  AssignmentServicePeriod,
} from 'src/redux/finance/studentFeeAssignment';

import dayjs from 'dayjs';
import { useId, useState } from 'react';
import { Label } from 'src/components/label';
import { fDate } from 'src/utils/format-time';
import { Iconify } from 'src/components/iconify';
import CustomSelect from 'src/components/custom-select';
import { formatNumber } from 'src/utils/formate_number';
import CustomTooltip from 'src/components/custom-tooltip';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { DetailField } from 'src/screens/finance/components/detail-view';
import { CustomDateRangePicker } from 'src/components/custom-date-range-picker';
import { FormSectionCard, FormSectionHeader } from 'src/components/form-section-card';
import { getPayableMonthCount } from 'src/utils/fee-structure-assignment-calculations';
import { amountError } from 'src/screens/finance/settings/FeeStructure/feeStructureModel';
import { useAssignmentTransportSourcesQuery } from 'src/redux/finance/studentFeeAssignment';
import {
  Box,
  Stack,
  Alert,
  Button,
  Divider,
  Checkbox,
  TextField,
  IconButton,
  Typography,
} from '@mui/material';

import AssignmentMoneyInput from './AssignmentMoneyInput';
import AssignmentFeeHeadSummary from './AssignmentFeeHeadSummary';
import { groupFeeHeadProration } from './assignmentReviewPresentation';
import {
  endOfServiceMonth,
  servicePeriodErrors,
  serializeServiceDate,
} from './assignmentServiceDates';

import type { AssignmentYearBounds } from './assignmentServiceDates';

const parseDate = (date?: string) => (date ? dayjs(date.slice(0, 10)) : null);

export default function AssignmentStudentInputs({
  candidate,
  request,
  savedAssignment,
  onChange,
  canOverrideDates,
  disabled,
  yearBounds,
  validationBounds = yearBounds,
  showErrors = false,
  flat = false,
  optionalServiceAction,
  allowTransportSource = true,
  lockOptionalSelection = false,
}: {
  candidate: AssignmentCandidate;
  request: AssignmentRequest;
  savedAssignment?: AssignmentPreview | null;
  onChange: (value: AssignmentRequest) => void;
  canOverrideDates: boolean;
  disabled: boolean;
  yearBounds?: AssignmentYearBounds;
  validationBounds?: AssignmentYearBounds;
  showErrors?: boolean;
  flat?: boolean;
  optionalServiceAction?: (feeHeadId: string) => ReactNode;
  // Verified transport records belong to one student and cannot be shared in bulk.
  allowTransportSource?: boolean;
  lockOptionalSelection?: boolean;
}) {
  const selectionId = useId();
  const editing = Boolean(request.editAssignmentId);
  const saved =
    editing && savedAssignment?.structureId === candidate.id ? savedAssignment : undefined;
  const savedProration =
    saved?.calculationVersion !== 'LegacyUnknown' && saved?.lines
      ? groupFeeHeadProration(saved.lines)
      : undefined;
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
  const variableFor = (feeHeadId: string) =>
    request.variableFeeHeads?.find((input) => input.feeHeadId === feeHeadId);
  const isMonthlyRate = (head: AssignmentCandidate['heads'][number]) => {
    if (!head.isVariable) return head.amountBasis === 'MonthlyRate';
    return head.supportsMonthlyRate === true || variableFor(head.feeHeadId)?.isMonthlyRate === true;
  };
  const updateVariable = (entry: NonNullable<AssignmentRequest['variableFeeHeads']>[number]) =>
    onChange({
      ...request,
      variableFeeHeads: [
        ...(request.variableFeeHeads ?? []).filter((item) => item.feeHeadId !== entry.feeHeadId),
        entry,
      ],
    });
  const amountFor = (head: AssignmentCandidate['heads'][number]) => {
    if (head.isVariable) return variableFor(head.feeHeadId)?.amount;
    const override = request.feeHeadDetails.find((input) => input.feeHeadId === head.feeHeadId);
    return override ? override.amount : head.configuredAmount;
  };
  const amounts = candidate.heads.filter(isIncluded).map(amountFor);
  const hasMonthlyRates = candidate.heads.some((head) => isIncluded(head) && isMonthlyRate(head));
  const total = amounts.every((amount) => amount != null && !amountError(amount))
    ? amounts.reduce<number>((sum, amount) => sum + amount!, 0)
    : undefined;

  return (
    <Stack spacing={editing ? 2 : 1.5}>
      {[
        {
          optional: false,
          title: 'Required Fee Heads',
          help: 'These fees are required by the selected structure and remain included.',
        },
        {
          optional: true,
          title: 'Optional Fee Heads',
          help: 'Select the optional fees to include. Clear a checkbox to remove that fee before saving.',
        },
      ].map(({ optional, title, help }) => {
        const heads = candidate.heads.filter((head) => head.isOptional === optional);
        if (!heads.length) return null;
        const rows = (
          <Stack spacing={editing ? 1.5 : undefined} divider={<Divider flexItem />}>
            {heads.map((head) => {
              const { feeHeadId, feeHeadName } = head;
              const checkboxId = `${selectionId}-${feeHeadId}`;
              const included = isIncluded(head);
              const canEditAmount = head.isVariable;
              const fixedServiceDates = editing && !head.isOptional;
              const savedHead = fixedServiceDates
                ? saved?.heads.find((item) => item.feeHeadId === feeHeadId)
                : undefined;
              const canEditDates = canOverrideDates && !fixedServiceDates;
              const amount = amountFor(head);
              const singleServiceMonth = head.isOneTime || head.usesSingleServiceMonth;
              const amountIssue =
                showErrors || touched.includes(feeHeadId) ? amountError(amount) : undefined;
              const variable = variableFor(feeHeadId);
              const monthly = isMonthlyRate(head);
              const savedTermAmount =
                request.editAssignmentId &&
                head.isVariable &&
                monthly &&
                variable?.amount != null &&
                !variable.isMonthlyRate
                  ? variable.amount
                  : null;
              const amountLabel = monthly
                ? 'Monthly amount'
                : head.isVariable && !singleServiceMonth
                  ? 'Amount for the term'
                  : `${feeHeadName} amount`;
              const savedPeriod = request.servicePeriods.find(
                (item) => item.feeHeadId === feeHeadId
              );
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
              const sourceEnd = parseDate(defaultPeriod.endDate) ?? yearBounds?.end;
              const defaultEnd =
                singleServiceMonth && defaultStart && sourceEnd
                  ? endOfServiceMonth(defaultStart, sourceEnd)
                  : sourceEnd;
              const savedRange =
                period.source !== 'AcademicYear' && period.source !== 'BoardAcademicYear';
              const start =
                parseDate(period.startDate ?? transportRecord?.startDate) ??
                (savedRange ? null : (defaultStart ?? null));
              const end =
                savedPeriod || transportPeriod
                  ? (parseDate(period.endDate ?? transportRecord?.endDate) ??
                    (savedRange ? null : (defaultEnd ?? null)))
                  : (defaultEnd ?? null);
              const dateErrors = servicePeriodErrors(period, validationBounds);
              const rangeError =
                dateErrors.start ||
                dateErrors.end ||
                (!yearBounds ? 'Selected academic year dates are unavailable.' : undefined);
              const monthCount =
                start?.isValid() && end?.isValid() && !end.isBefore(start, 'day')
                  ? getPayableMonthCount(
                      start.month() + 1,
                      end.month() + 1,
                      start.year(),
                      end.year()
                    )
                  : null;
              const monthHelper =
                monthCount === null
                  ? undefined
                  : `${monthCount} ${monthCount === 1 ? 'month' : 'months'} covered`;
              const canUseTransport =
                !fixedServiceDates &&
                allowTransportSource &&
                head.supportsTransportSource &&
                !head.isVariable &&
                !singleServiceMonth;
              const expanded =
                flat || canEditAmount || Boolean(savedPeriod) || expandedHeads.includes(feeHeadId);

              const changeDates = ([nextStart, nextEnd]: DateRange) => {
                if (!canEditDates || disabled) return;
                if (!nextStart || !nextEnd) {
                  updatePeriod({ feeHeadId, source: 'ManualOverride' });
                  return;
                }
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
                      }
                );
              };

              const chooseServiceMonth = (month: ReturnType<typeof dayjs> | null) => {
                if (!month?.isValid() || !yearBounds || !canEditDates || disabled) return;
                if (month.isSame(start, 'month')) return;
                const monthStart = month.startOf('month');
                const first = monthStart.isBefore(yearBounds.start, 'day')
                  ? yearBounds.start
                  : monthStart;
                const last = endOfServiceMonth(first, yearBounds.end);
                if (!last.isBefore(first, 'day')) changeDates([first, last]);
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

              const currency = saved?.currency ?? 'INR';
              const serviceFields = expanded || fixedServiceDates ? (
                <Stack spacing={1}>
                  {fixedServiceDates ? (
                    <DetailField
                      label="Service dates"
                      value={
                        start && end
                          ? `${fDate(start.toDate())} – ${fDate(end.toDate())}`
                          : '—'
                      }
                    />
                  ) : singleServiceMonth ? (
                    <DatePicker
                      label="Service month"
                      name={`${request.studentId}-${feeHeadId}-service-month`}
                      value={start}
                      minDate={yearBounds?.start}
                      maxDate={yearBounds?.end}
                      disabled={disabled}
                      readOnly={!canEditDates || !yearBounds}
                      views={['year', 'month']}
                      openTo="month"
                      format="MMM YYYY"
                      onAccept={chooseServiceMonth}
                      slotProps={{
                        textField: {
                          fullWidth: true,
                          size: 'small',
                          error: Boolean(rangeError),
                          helperText: rangeError ?? 'Charged once.',
                        },
                      }}
                    />
                  ) : (
                    <CustomDateRangePicker
                      label="Effective start – end date"
                      name={`${request.studentId}-${feeHeadId}-service-dates`}
                      dateFormat="DD/MM/YYYY"
                      singleInput
                      calendars={2}
                      showShortcuts={false}
                      allowManualInput
                      value={[start, end]}
                      minDate={yearBounds?.start}
                      maxDate={yearBounds?.end}
                      disabled={disabled || (!yearBounds && !start && !end)}
                      readOnly={!canEditDates || !yearBounds}
                      error={Boolean(rangeError)}
                      helperText={rangeError ?? monthHelper}
                      onChange={changeDates}
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
              ) : null;
              const moneyFields = canEditAmount ? (
                <Stack spacing={1}>
                  <AssignmentMoneyInput
                    label={amountLabel}
                    name={`${request.studentId}-${feeHeadId}-amount`}
                    required={savedTermAmount == null}
                    fullWidth
                    value={savedTermAmount == null ? (amount ?? null) : null}
                    disabled={disabled}
                    error={Boolean(amountIssue)}
                    helperText={
                      amountIssue ||
                      (savedTermAmount != null
                        ? `Saved term amount ${formatNumber(savedTermAmount, 'INR')}. Enter a monthly amount to replace it.`
                        : monthly
                          ? 'Charged for each covered month.'
                          : undefined)
                    }
                    onBlur={() => touch(feeHeadId)}
                    onAmountChange={(value) =>
                      updateVariable({
                        feeHeadId,
                        amount: value,
                        isMonthlyRate: monthly,
                        zeroAmountReason: variable?.zeroAmountReason,
                      })
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
              ) : null;

              if (editing) {
                const showSavedAmount = savedHead && !canEditAmount;
                return (
                  <AssignmentFeeHeadSummary
                    key={feeHeadId}
                    head={{ ...(savedHead ?? head), included }}
                    currency={currency}
                    selection={
                      head.isOptional
                        ? {
                            id: checkboxId,
                            disabled: disabled || lockOptionalSelection,
                            onChange: selectOptional,
                          }
                        : undefined
                    }
                    serviceDetails={included ? serviceFields : null}
                    calculation={showSavedAmount ? savedProration?.get(feeHeadId) : undefined}
                    amountInput={included ? moneyFields : null}
                    amountDetails={
                      !included || showSavedAmount || canEditAmount ? undefined : (
                        <DetailField
                          label={monthly ? 'Monthly amount' : 'Configured amount'}
                          value={amount == null ? '—' : formatNumber(amount, currency)}
                        />
                      )
                    }
                    actions={head.isOptional ? optionalServiceAction?.(feeHeadId) : undefined}
                  />
                );
              }

              return (
                <Box
                  key={feeHeadId}
                  component="section"
                  aria-label={feeHeadName}
                  sx={{
                    py: 1.5,
                    display: 'grid',
                    gridTemplateColumns: {
                      xs: 'minmax(0, 1fr)',
                      sm: 'minmax(0, 1fr) minmax(0, 2fr)',
                    },
                    gap: 1.5,
                    alignItems: 'start',
                  }}
                >
                  <Box
                    sx={{
                      display: 'grid',
                      gridTemplateColumns: head.isOptional
                        ? '36px minmax(0, 1fr)'
                        : 'minmax(0, 1fr)',
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
                      sx={{ gridColumn: head.isOptional ? 2 : 1, gridRow: 1, minWidth: 0 }}
                    >
                      <Typography
                        component="h3"
                        variant="subtitle2"
                        sx={{ overflowWrap: 'anywhere' }}
                      >
                        {head.isOptional ? (
                          <label htmlFor={checkboxId}>{feeHeadName}</label>
                        ) : (
                          feeHeadName
                        )}
                      </Typography>
                      <Label color={head.isOptional ? 'info' : 'default'}>
                        {head.isOptional ? 'Optional' : 'Required'}
                      </Label>
                      {head.isOptional && optionalServiceAction?.(feeHeadId)}
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
                        gridTemplateColumns: {
                          xs: 'minmax(0, 1fr)',
                          sm: 'repeat(2, minmax(0, 1fr))',
                        },
                        gap: 1.5,
                        alignItems: 'start',
                      }}
                    >
                      {serviceFields ?? <Box />}
                      {moneyFields ?? (
                        <Typography
                          variant="subtitle2"
                          sx={{ textAlign: { sm: 'right' }, fontVariantNumeric: 'tabular-nums' }}
                        >
                          {amount == null
                            ? '—'
                            : `${formatNumber(amount, 'INR')}${monthly ? ' / month' : ''}`}
                        </Typography>
                      )}
                    </Box>
                  )}
                </Box>
              );
            })}
          </Stack>
        );
        return (
          <Stack key={title} role="group" aria-label={title} spacing={1}>
            {editing ? (
              <FormSectionCard
                title={title}
                icon="mdi:format-list-checks"
                descriptionTooltip={help}
              >
                {rows}
              </FormSectionCard>
            ) : (
              <>
                {optional && candidate.heads.some((head) => !head.isOptional) && <Divider />}
                <FormSectionHeader title={title} descriptionTooltip={help} />
                {rows}
              </>
            )}
          </Stack>
        );
      })}
      {!editing && (
        <Stack
          direction="row"
          justifyContent="space-between"
          sx={{ py: 1.5, borderTop: 1, borderColor: 'divider' }}
        >
          <Typography variant="subtitle2">Selected fees</Typography>
          <Typography variant="subtitle2" sx={{ fontVariantNumeric: 'tabular-nums' }}>
            {hasMonthlyRates
              ? 'Calculated in review'
              : total == null
                ? '—'
                : formatNumber(total, 'INR')}
          </Typography>
        </Stack>
      )}
    </Stack>
  );
}
