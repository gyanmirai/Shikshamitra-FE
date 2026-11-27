import type { DateRange } from 'src/components/custom-date-range-picker';
import type {
  AssignmentHead,
  AssignmentPreview,
  OptionalServiceRestartResult,
  OptionalServiceRestartContext,
  OptionalServiceRestartRequest,
} from 'src/redux/finance/studentFeeAssignment';

import dayjs from 'dayjs';
import * as Yup from 'yup';
import { useFormik } from 'formik';
import { fDate } from 'src/utils/format-time';
import { GlobalIcons } from 'src/utils/icons';
import { Iconify } from 'src/components/iconify';
import { useRef, useState, useEffect } from 'react';
import { formatNumber } from 'src/utils/formate_number';
import CustomSelect from 'src/components/custom-select';
import { shikshaMitraToast } from 'src/components/toast';
import CustomTooltip from 'src/components/custom-tooltip';
import { ConfirmDialog } from 'src/components/confirm-dialog';
import ShakingTextField from 'src/components/shaking-text-field';
import CustomizableTable from 'src/components/customizabaleTable';
import { FormSectionCard } from 'src/components/form-section-card';
import NumericFormatCustom from 'src/components/custom-numeric-format';
import { DetailField } from 'src/screens/finance/components/detail-view';
import { FinanceListSkeleton } from 'src/screens/finance/components/FinanceContentSkeletons';
import { CustomDateRangePicker } from 'src/components/custom-date-range-picker';
import CustomDialog, { DialogScrollContent } from 'src/components/customDialog';
import {
  Box,
  Alert,
  Stack,
  Button,
  Typography,
  DialogActions,
} from '@mui/material';
import {
  assignmentError,
  assignmentErrorCode,
  useAssignmentOptionalServiceRestartMutation,
  useAssignmentOptionalServiceRestartContextQuery,
  useAssignmentOptionalServiceRestartPreviewMutation,
} from 'src/redux/finance/studentFeeAssignment';

import {
  prorationRuleLabel,
  formatInstallmentProration,
  formatSavedProrationExplanation,
} from './assignmentReviewPresentation';

type RestartProps = {
  assignment: AssignmentPreview;
  head: AssignmentHead;
  onSaved?: () => void;
  onBusyChange?: (busy: boolean) => void;
};

function restartError(error: unknown) {
  const code = assignmentErrorCode(error);
  if (code.endsWith('StalePreview')) {
    return 'The preview has expired or changed. Review the monthly breakdown again before confirming.';
  }
  if (code.endsWith('OptionalServiceRestartUnavailable')) {
    return 'This service is no longer eligible to restart. Reopen the assignment to check its current status.';
  }
  if (code.endsWith('OptionalServiceRestartDates')) {
    return 'Choose dates within the available range and payment term. Any existing installment must cover all selected days for that installment.';
  }
  return assignmentError(error);
}

export default function OptionalFeeServiceRestart({
  disabledReason,
  ...props
}: RestartProps & { disabledReason?: string }) {
  const [open, setOpen] = useState(false);
  const actionText = props.head.included ? 'Enable service' : 'Add service';
  const label = `${actionText} for ${props.head.feeHeadName}`;

  return (
    <>
      <CustomTooltip title={disabledReason || label} describeChild>
        {/* eslint-disable-next-line jsx-a11y/no-noninteractive-tabindex -- Keep a disabled action's explanation available by keyboard. */}
        <span tabIndex={disabledReason ? 0 : undefined} style={{ display: 'inline-flex' }}>
          <Button
            type="button"
            size="small"
            color="inherit"
            variant="outlined"
            aria-label={label}
            startIcon={<Iconify icon="mdi:play-circle-outline" />}
            disabled={Boolean(disabledReason)}
            onClick={() => setOpen(true)}
          >
            {actionText}
          </Button>
        </span>
      </CustomTooltip>
      {open && <RestartDialog {...props} onClose={() => setOpen(false)} />}
    </>
  );
}

function RestartDialog({
  assignment,
  head,
  onClose,
  ...props
}: RestartProps & { onClose: () => void }) {
  const { studentId, academicYearId } = assignment;
  const context = useAssignmentOptionalServiceRestartContextQuery(
    { studentId, academicYearId, feeHeadId: head.feeHeadId },
    { refetchOnMountOrArgChange: true }
  );
  const options = context.currentData ?? context.data;
  const title = `Enable ${head.feeHeadName} Service`;
  if (options) {
    return (
      <RestartForm
        {...props}
        assignment={assignment}
        head={head}
        title={title}
        options={options}
        onClose={onClose}
      />
    );
  }
  return (
    <CustomDialog open title={title} handleClose={onClose} maxWidth="xs" hasForm={false}>
      <DialogScrollContent>
        {context.isError ? (
          <Alert
            severity="error"
            action={
              <Button
                size="small"
                startIcon={<Iconify icon={GlobalIcons.refresh} />}
                onClick={() => context.refetch()}
              >
                Retry
              </Button>
            }
          >
            {restartError(context.error)}
          </Alert>
        ) : (
          <FinanceListSkeleton label="Loading optional service settings" columns={2} rows={2} />
        )}
      </DialogScrollContent>
      <DialogActions>
        <Button
          size="small"
          variant="outlined"
          color="inherit"
          onClick={onClose}
          startIcon={<Iconify icon={GlobalIcons.cancel} />}
        >
          Cancel
        </Button>
      </DialogActions>
    </CustomDialog>
  );
}

type RestartValues = {
  dates: DateRange;
  monthlyRate: string;
  prorationPolicyVersionId: string;
  paymentTermVersionId: string;
};

const maximumMonthlyRate = 9_999_999_999.99;

function RestartForm({
  assignment,
  head,
  title,
  options,
  onClose,
  onSaved,
  onBusyChange,
}: RestartProps & { title: string; options: OptionalServiceRestartContext; onClose: () => void }) {
  const [preview, previewState] = useAssignmentOptionalServiceRestartPreviewMutation();
  const [commit, commitState] = useAssignmentOptionalServiceRestartMutation();
  const [discardOpen, setDiscardOpen] = useState(false);
  const [dateInputError, setDateInputError] = useState<string | null>(null);
  const [error, setError] = useState('');
  const [review, setReview] = useState<{
    request: OptionalServiceRestartRequest;
    quote: OptionalServiceRestartResult;
  }>();
  const identity = useRef<{ input: string; id: string }>(undefined);
  const pending = useRef(false);
  const minDate = dayjs(options.earliestStartDate);
  const maxDate = dayjs(options.latestEndDate);
  const hasDates = minDate.isValid() && maxDate.isValid() && !minDate.isAfter(maxDate, 'day');
  const hasOptions = options.prorationPolicies.length > 0 && options.paymentTerms.length > 0;
  const formik = useFormik<RestartValues>({
    initialValues: {
      dates: hasDates ? [minDate, maxDate] : [null, null],
      monthlyRate: options.monthlyRate?.toString() ?? '',
      prorationPolicyVersionId: options.defaultProrationPolicyVersionId ?? '',
      paymentTermVersionId: options.defaultPaymentTermVersionId ?? '',
    },
    validationSchema: Yup.object({
      dates: Yup.mixed<DateRange>().test(
        'service-dates',
        'Choose service dates within the available period.',
        (dates) => {
          const [start, end] = dates ?? [];
          return Boolean(
            start?.isValid() &&
            end?.isValid() &&
            !start.isBefore(minDate, 'day') &&
            !end.isAfter(maxDate, 'day') &&
            !end.isBefore(start, 'day')
          );
        }
      ),
      monthlyRate: Yup.string()
        .required('Enter the monthly rate.')
        .test(
          'monthly-rate',
          'Enter a monthly rate greater than zero, with up to two decimal places.',
          (value) =>
            !value ||
            (/^\d+(\.\d{0,2})?$/.test(value) &&
              Number(value) > 0 &&
              Number(value) <= maximumMonthlyRate)
        ),
      prorationPolicyVersionId: Yup.string()
        .required('Select a proration policy.')
        .oneOf(
          options.prorationPolicies.map(({ versionId }) => versionId),
          'Select an available proration policy.'
        ),
      paymentTermVersionId: Yup.string()
        .required('Select a payment term.')
        .oneOf(
          options.paymentTerms.map(({ versionId }) => versionId),
          'Select an available payment term.'
        ),
    }),
    onSubmit: async (values) => {
      const [start, end] = values.dates;
      if (pending.current || dateInputError || !start || !end || !hasDates || !hasOptions) return;
      pending.current = true;
      setError('');
      const input = {
        studentId: assignment.studentId,
        academicYearId: assignment.academicYearId,
        feeHeadId: head.feeHeadId,
        startDate: start.format('YYYY-MM-DD'),
        endDate: end.format('YYYY-MM-DD'),
        monthlyRate: Number(values.monthlyRate),
        prorationPolicyVersionId: values.prorationPolicyVersionId,
        paymentTermVersionId: values.paymentTermVersionId,
      };
      const key = JSON.stringify(input);
      if (identity.current?.input !== key) {
        identity.current = { input: key, id: globalThis.crypto.randomUUID() };
      }
      const request = { ...input, requestId: identity.current.id };
      try {
        const quote = await preview(request).unwrap();
        if (quote.previewToken) setReview({ request, quote });
        else setError('The monthly breakdown could not be confirmed. Preview again.');
      } catch (issue) {
        setError(restartError(issue));
      } finally {
        pending.current = false;
      }
    },
  });
  const busy = previewState.isLoading || commitState.isLoading || formik.isSubmitting;
  useEffect(() => {
    onBusyChange?.(busy);
    return () => onBusyChange?.(false);
  }, [busy, onBusyChange]);

  const save = async () => {
    if (pending.current || !review?.quote.previewToken) return;
    pending.current = true;
    setError('');
    try {
      await commit({ ...review.request, previewToken: review.quote.previewToken }).unwrap();
      onClose();
      shikshaMitraToast.success({ message: 'Optional service enabled.' });
      onSaved?.();
    } catch (issue) {
      if (assignmentErrorCode(issue).endsWith('StalePreview')) setReview(undefined);
      setError(restartError(issue));
    } finally {
      pending.current = false;
    }
  };

  const fieldError = (field: keyof RestartValues) => {
    const message = formik.errors[field];
    return (formik.touched[field] || formik.submitCount > 0) && typeof message === 'string'
      ? message
      : undefined;
  };
  const datesError = dateInputError || fieldError('dates');
  const requestClose = () => {
    if (pending.current || busy) return;
    if (formik.dirty || dateInputError || review) setDiscardOpen(true);
    else onClose();
  };
  const policyFields = [
    {
      name: 'prorationPolicyVersionId',
      label: 'Proration policy',
      choices: options.prorationPolicies,
    },
    { name: 'paymentTermVersionId', label: 'Payment term', choices: options.paymentTerms },
  ] as const;

  return (
    <>
      <CustomDialog
        open
        title={title}
        titleInfo="Choose when service resumes and review existing installments and any new charges."
        maxWidth="sm"
        handleClose={requestClose}
        disableClose={busy}
        guardUnsavedChanges={false}
        formProps={{
          noValidate: true,
          onSubmit: (event) => {
            event.preventDefault();
            event.stopPropagation();
            if (!review && !busy) formik.handleSubmit();
          },
        }}
      >
        <DialogScrollContent>
          <Stack spacing={2} aria-busy={busy}>
            {error && <Alert severity="error">{error}</Alert>}
            {!hasDates || !hasOptions ? (
              <Alert severity="warning">
                {!hasDates
                  ? 'There are no available service dates in this academic year.'
                  : 'A published proration policy and payment term are required to enable this service.'}
              </Alert>
            ) : review ? (
              <RestartBreakdown
                quote={review.quote}
                currency={assignment.currency}
                tableId={`service-restart-${assignment.studentId}-${head.feeHeadId}`}
                policy={options.prorationPolicies.find(
                  (item) => item.versionId === review.request.prorationPolicyVersionId
                )}
                term={options.paymentTerms.find(
                  (item) => item.versionId === review.request.paymentTermVersionId
                )}
              />
            ) : (
              <FormSectionCard
                title="New Service Period"
                icon={GlobalIcons.calendar}
                descriptionTooltip="Choose when service resumes, the monthly charge, and how installments are calculated."
              >
                <Stack spacing={2}>
                  <ShakingTextField error={Boolean(datesError)}>
                    <CustomDateRangePicker
                      name="dates"
                      label="Service dates"
                      value={formik.values.dates}
                      onChange={(value) => formik.setFieldValue('dates', value)}
                      minDate={minDate}
                      maxDate={maxDate}
                      referenceDate={minDate}
                      disabled={busy}
                      singleInput
                      allowManualInput
                      onInputErrorChange={setDateInputError}
                      showShortcuts={false}
                      required
                      error={Boolean(datesError)}
                      helperText={
                        datesError || `Available from ${fDate(minDate)} to ${fDate(maxDate)}.`
                      }
                    />
                  </ShakingTextField>
                  <ShakingTextField error={Boolean(fieldError('monthlyRate'))}>
                    <NumericFormatCustom
                      name="monthlyRate"
                      label="Monthly rate"
                      size="small"
                      fullWidth
                      required
                      disabled={busy}
                      roundToWholeRupees={false}
                      decimalScale={2}
                      valueIsNumericString
                      isAllowed={({ floatValue }) =>
                        floatValue === undefined || floatValue <= maximumMonthlyRate
                      }
                      value={formik.values.monthlyRate}
                      onValueChange={({ value }, source) => {
                        if (source.source === 'event') formik.setFieldValue('monthlyRate', value);
                      }}
                      onBlur={formik.handleBlur}
                      error={Boolean(fieldError('monthlyRate'))}
                      helperText={fieldError('monthlyRate')}
                    />
                  </ShakingTextField>
                  {policyFields.map(({ name, label, choices }) => (
                    <ShakingTextField key={name} error={Boolean(fieldError(name))}>
                      <CustomSelect
                        name={name}
                        label={label}
                        fullWidth
                        size="small"
                        required
                        disabled={busy}
                        value={formik.values[name]}
                        options={choices.map((choice) => ({
                          value: choice.versionId,
                          label: choice.name,
                        }))}
                        onChange={(value) => formik.setFieldValue(name, value)}
                        onBlur={() => formik.setFieldTouched(name)}
                        error={Boolean(fieldError(name))}
                        helperText={fieldError(name)}
                      />
                    </ShakingTextField>
                  ))}
                </Stack>
              </FormSectionCard>
            )}
          </Stack>
        </DialogScrollContent>
        <DialogActions>
          <Button
            type="button"
            size="small"
            variant="outlined"
            color="inherit"
            disabled={busy}
            startIcon={<Iconify icon={review ? GlobalIcons.back : GlobalIcons.cancel} />}
            onClick={() => {
              if (review) {
                setReview(undefined);
                setError('');
              } else requestClose();
            }}
          >
            {review ? 'Back' : 'Cancel'}
          </Button>
          {review ? (
            <Button
              type="button"
              size="small"
              color="inherit"
              variant="contained"
              loading={busy}
              startIcon={<Iconify icon={GlobalIcons.submit} />}
              onClick={save}
            >
              {head.included ? 'Confirm service restart' : 'Confirm service activation'}
            </Button>
          ) : (
            <Button
              type="submit"
              size="small"
              color="inherit"
              variant="contained"
              loading={busy}
              startIcon={<Iconify icon={GlobalIcons.eye} />}
              disabled={!hasDates || !hasOptions || Boolean(dateInputError)}
            >
              Preview monthly breakdown
            </Button>
          )}
        </DialogActions>
      </CustomDialog>
      <ConfirmDialog
        open={discardOpen}
        title="Discard Unsaved Changes?"
        content="Discard the proposed service restart?"
        cancelText="Keep editing"
        disableBackdropClick
        onClose={() => setDiscardOpen(false)}
        action={
          <Button color="error" variant="contained" size="small" onClick={onClose}>
            Discard changes
          </Button>
        }
      />
    </>
  );
}

function RestartBreakdown({
  quote,
  currency,
  policy,
  term,
  tableId,
}: {
  quote: OptionalServiceRestartResult;
  currency: string;
  policy?: { name: string; version: number };
  term?: { name: string; version: number };
  tableId: string;
}) {
  const money = (value: number) => formatNumber(value, currency);
  return (
    <FormSectionCard
      title="Monthly Breakdown"
      icon={GlobalIcons.calendar}
      descriptionTooltip="Review proration for new charges and balances on any installments already billed."
    >
      <Stack spacing={2}>
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, minmax(0, 1fr))' },
            gap: 1.5,
          }}
        >
          <DetailField
            label="Service dates"
            value={`${fDate(quote.startDate)} to ${fDate(quote.endDate)}`}
          />
          <DetailField label="Monthly rate" value={money(quote.monthlyRate)} />
          {policy && <DetailField label="Proration policy" value={policy.name} />}
          {term && <DetailField label="Payment term" value={term.name} />}
          <DetailField label="New scheduled total" value={money(quote.scheduledTotal)} />
          <DetailField label="Proration reduction" value={money(quote.prorationReduction)} />
          <DetailField label="New assigned amount" value={money(quote.assignedTotal)} />
          <DetailField label="Prepaid service credit" value={money(quote.prepaidCredit)} />
        </Box>
        {!!quote.existingInstallments?.length && (
          <Stack spacing={1}>
            <Typography variant="subtitle2">Existing installments</Typography>
            <Typography variant="body2" color="text.secondary">
              These months keep their existing charges and balances.
            </Typography>
            {quote.existingInstallments.map((line) => (
              <Stack
                key={line.dueFeeId}
                direction={{ xs: 'column', sm: 'row' }}
                justifyContent="space-between"
                spacing={1}
              >
                <DetailField
                  label={line.installmentLabel}
                  value={`${fDate(line.coverageStartDate)} to ${fDate(line.coverageEndDate)}`}
                />
                <DetailField
                  label="Billed · Outstanding"
                  value={`${money(line.billedAmount)} · ${money(line.outstandingAmount)}`}
                />
              </Stack>
            ))}
          </Stack>
        )}
        {!!quote.lines.length && (
          <CustomizableTable
            tableId={tableId}
            tableTitle="Monthly breakdown"
            showToolbar={false}
            isPagination={false}
            isSearch={false}
            isFilter={false}
            isShowedDense={false}
            wrapperProps={{ sx: { flex: 'none', minWidth: 0 } }}
            tableContainerProps={{ sx: { height: 'auto', flex: 'none' } }}
            data={quote.lines.map((line) => ({ ...line, _id: String(line.sequence) }))}
            noDataText="No installments are due for this service period."
            columns={[
              {
                id: 'installmentLabel',
                label: 'Installment',
                minWidth: 145,
                render: (value, line) => (
                  <Stack spacing={0.5}>
                    <Typography variant="body2">{value}</Typography>
                    {line.coverageStartDate && line.coverageEndDate && (
                      <Typography variant="caption" color="text.secondary">
                        {fDate(line.coverageStartDate)} to {fDate(line.coverageEndDate)}
                      </Typography>
                    )}
                    {line.eligibleDays != null && (
                      <Typography variant="caption" color="text.secondary">
                        {line.eligibleDays} service {line.eligibleDays === 1 ? 'day' : 'days'}
                      </Typography>
                    )}
                  </Stack>
                ),
              },
              { id: 'dueDate', label: 'Due Date', minWidth: 105, render: (value) => fDate(value) },
              {
                id: 'scheduledAmount',
                label: 'Scheduled',
                align: 'right',
                render: (value) => money(value),
              },
              {
                id: 'reductionAmount',
                label: 'Reduction',
                align: 'right',
                render: (value) => money(value ?? 0),
              },
              {
                id: 'proratedAmount',
                label: 'Assigned',
                minWidth: 155,
                align: 'right',
                render: (value, line) => (
                  <Stack spacing={0.5}>
                    <Typography variant="subtitle2">{money(value)}</Typography>
                    {line.ruleType && (
                      <Typography variant="caption" color="text.secondary">
                        {prorationRuleLabel(line.ruleType)}
                      </Typography>
                    )}
                    {line.factor != null ? (
                      <Typography variant="caption" color="text.secondary">
                        {formatInstallmentProration(
                          {
                            scheduledAmount: line.scheduledAmount,
                            proratedAmount: value,
                            factor: line.factor,
                          },
                          currency
                        )}
                        {line.roundingMode === 'RoundUpRupee' && ' (rounded up to a whole rupee)'}
                      </Typography>
                    ) : line.explanation ? (
                      <Typography variant="caption" color="text.secondary">
                        {formatSavedProrationExplanation(line.explanation)}
                      </Typography>
                    ) : null}
                  </Stack>
                ),
              },
            ]}
          />
        )}
      </Stack>
    </FormSectionCard>
  );
}
