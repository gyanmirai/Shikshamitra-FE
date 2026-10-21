'use client';

import { useRef, useState, useEffect } from 'react';

import { DatePicker } from '@mui/x-date-pickers';
import { Box, Alert, Button, DialogActions } from '@mui/material';

import { GlobalIcons } from 'src/utils/icons';
import { parseApiProblemDetail } from 'src/utils/api-problem-details';
import { toDateOnly, parseDateOnly, formatDateOnly } from 'src/utils/date-only';

import { Iconify } from 'src/components/iconify';
import CustomSelect from 'src/components/custom-select';
import { ConfirmDialog } from 'src/components/confirm-dialog';
import { FormBusyRegion } from 'src/components/form-busy-region';
import { FormSectionCard } from 'src/components/form-section-card';
import ShakingTextField from 'src/components/shaking-text-field';
import CustomizableTable from 'src/components/customizabaleTable';
import NumericFormatCustom from 'src/components/custom-numeric-format';
import CustomDialog, { DialogScrollContent } from 'src/components/customDialog';

import {
  type PaymentTermTemplateKind,
  type PaymentTermTemplateDueDateRule,
  type PaymentTermTemplatePreviewResponse,
  usePreviewPaymentTermTemplateMutation,
} from 'src/redux/finance/paymentTerm';

import type { IInstallment, DemandGenerationRule } from '../type';

const TEMPLATE_OPTIONS = [
  { value: 'Annual', label: 'Annual — 1 installment' },
  { value: 'HalfYearly', label: 'Half-yearly — 2 installments' },
  { value: 'Quarterly', label: 'Quarterly — 4 installments' },
  { value: 'Monthly', label: 'Monthly — one per calendar month' },
  { value: 'Custom', label: 'Custom installment count' },
];
const INVOICE_OPTIONS = [
  { value: 'OnInstallmentStartDate', label: 'On installment start date' },
  { value: 'XDaysBeforeDue', label: 'X days before due date' },
  { value: 'OnDueDate', label: 'On due date' },
  { value: 'SpecificDate', label: 'On a specific date' },
];
interface Props {
  open: boolean;
  boardId: string;
  existingInstallmentCount: number;
  demandGenerationRule: DemandGenerationRule;
  demandOffsetDays: number | null;
  onClose: () => void;
  onApply: (
    installments: IInstallment[],
    rule: DemandGenerationRule,
    offset: number | null
  ) => void;
}

export function InstallmentTemplateDialog(props: Props) {
  return props.open ? <InstallmentTemplateDialogSession {...props} /> : null;
}

function InstallmentTemplateDialogSession({
  open,
  boardId,
  existingInstallmentCount,
  demandGenerationRule,
  demandOffsetDays,
  onClose,
  onApply,
}: Props) {
  const [templateKind, setTemplateKind] = useState<PaymentTermTemplateKind>('Quarterly');
  const [customCount, setCustomCount] = useState('3');
  const [dueDateRule, setDueDateRule] = useState<PaymentTermTemplateDueDateRule>('CoverageEnd');
  const [dueDays, setDueDays] = useState('10');
  const [invoiceRule, setInvoiceRule] = useState(demandGenerationRule);
  const [invoiceDays, setInvoiceDays] = useState(String(demandOffsetDays ?? ''));
  const [geometry, setGeometry] = useState<PaymentTermTemplatePreviewResponse | null>(null);
  const [specificDates, setSpecificDates] = useState<string[]>([]);
  const [preview, setPreview] = useState<PaymentTermTemplatePreviewResponse | null>(null);
  const [error, setError] = useState('');
  const [loadingGeometry, setLoadingGeometry] = useState(false);
  const [geometryRetry, setGeometryRetry] = useState(0);
  const [discardOpen, setDiscardOpen] = useState(false);
  const [previewTemplate, previewState] = usePreviewPaymentTermTemplateMutation();
  const revision = useRef(0);
  const customCountInvalid =
    templateKind === 'Custom' &&
    (!customCount ||
      !Number.isInteger(Number(customCount)) ||
      Number(customCount) < 1 ||
      Number(customCount) > 36);
  const dueDaysInvalid =
    dueDateRule === 'DaysAfterCoverageStart' &&
    (!dueDays ||
      !Number.isInteger(Number(dueDays)) ||
      Number(dueDays) < 0 ||
      Number(dueDays) > 365);
  const configuration = JSON.stringify({
    templateKind,
    customCount,
    dueDateRule,
    dueDays,
    invoiceRule,
    invoiceDays,
  });
  const initialConfiguration = useRef(configuration);
  const dirty =
    configuration !== initialConfiguration.current ||
    (invoiceRule === 'SpecificDate' &&
      Boolean(
        geometry?.installments.some(
          (item, index) => specificDates[index] !== toDateOnly(item.coverageStartDate)
        )
      ));
  const invalidate = () => {
    revision.current += 1;
    setPreview(null);
    setError('');
  };

  useEffect(() => {
    if (open) {
      revision.current += 1;
      setPreview(null);
      setInvoiceRule(demandGenerationRule);
      setInvoiceDays(String(demandOffsetDays ?? ''));
    }
  }, [open, demandGenerationRule, demandOffsetDays]);

  // Fetch period geometry from the authoritative generator before evaluating invoice rules.
  useEffect(() => {
    let active = true;
    revision.current += 1;
    setGeometry(null);
    setPreview(null);
    setError('');
    setLoadingGeometry(false);
    if (!open || !boardId || customCountInvalid || dueDaysInvalid) return undefined;
    setLoadingGeometry(true);
    previewTemplate({
      boardId,
      templateKind,
      customInstallmentCount: templateKind === 'Custom' ? Number(customCount) : undefined,
      dueDateRule,
      dueDaysAfterCoverageStart:
        dueDateRule === 'DaysAfterCoverageStart' ? Number(dueDays) : undefined,
      demandGenerationRule: 'OnInstallmentStartDate',
    })
      .unwrap()
      .then((result) => {
        if (!active) return;
        setGeometry(result);
        setSpecificDates(result.installments.map((item) => toDateOnly(item.coverageStartDate)!));
      })
      .catch((requestError) => {
        if (active) setError(parseApiProblemDetail(requestError).detail);
      })
      .finally(() => {
        if (active) setLoadingGeometry(false);
      });
    return () => {
      active = false;
      revision.current += 1;
    };
  }, [
    open,
    boardId,
    templateKind,
    customCount,
    dueDateRule,
    dueDays,
    customCountInvalid,
    dueDaysInvalid,
    previewTemplate,
    geometryRetry,
  ]);

  const maxDays = geometry
    ? Math.min(
        365,
        ...geometry.installments.map((item) =>
          parseDateOnly(item.dueDate)!.diff(parseDateOnly(item.coverageStartDate)!, 'day')
        )
      )
    : null;
  const offsetError =
    invoiceRule !== 'XDaysBeforeDue'
      ? ''
      : maxDays === 0
        ? 'No days before due are available. Choose On installment start date or On due date.'
        : !invoiceDays || !Number.isInteger(Number(invoiceDays)) || Number(invoiceDays) < 1
          ? 'Days Before Due must be a whole number of at least 1.'
          : maxDays !== null && Number(invoiceDays) > maxDays
            ? `Maximum ${maxDays} days; invoice dates cannot be before an installment starts.`
            : '';
  const specificErrors =
    geometry?.installments.map((item, index) => {
      const date = parseDateOnly(specificDates[index]);
      if (!date) return 'Invoice date is required';
      if (date.isBefore(parseDateOnly(item.coverageStartDate)!, 'day'))
        return 'Invoice date cannot be before installment start';
      if (date.isAfter(parseDateOnly(item.dueDate)!, 'day'))
        return 'Invoice date cannot be after payment due date';
      return '';
    }) ?? [];
  const invalidInvoice =
    Boolean(offsetError) || (invoiceRule === 'SpecificDate' && specificErrors.some(Boolean));
  const busy = loadingGeometry || previewState.isLoading;
  const requestClose = () => {
    if (busy || discardOpen) return;
    if (dirty) setDiscardOpen(true);
    else onClose();
  };

  useEffect(() => {
    if (!dirty) return undefined;
    const warn = (event: BeforeUnloadEvent) => event.preventDefault();
    window.addEventListener('beforeunload', warn);
    return () => window.removeEventListener('beforeunload', warn);
  }, [dirty]);
  const canGenerate = Boolean(
    boardId && geometry && !customCountInvalid && !dueDaysInvalid && !invalidInvoice && !busy
  );

  const handlePreview = async () => {
    if (!canGenerate) return;
    const requestRevision = revision.current;
    setError('');
    try {
      const result = await previewTemplate({
        boardId,
        templateKind,
        customInstallmentCount: templateKind === 'Custom' ? Number(customCount) : undefined,
        dueDateRule,
        dueDaysAfterCoverageStart:
          dueDateRule === 'DaysAfterCoverageStart' ? Number(dueDays) : undefined,
        demandGenerationRule: invoiceRule,
        demandOffsetDays: invoiceRule === 'XDaysBeforeDue' ? Number(invoiceDays) : null,
        specificDemandDates: invoiceRule === 'SpecificDate' ? specificDates : undefined,
      }).unwrap();
      if (revision.current === requestRevision) setPreview(result);
    } catch (requestError) {
      if (revision.current !== requestRevision) return;
      setPreview(null);
      setError(parseApiProblemDetail(requestError).detail);
    }
  };
  const handleApply = () => {
    if (!preview || !canGenerate) return;
    onApply(
      preview.installments.map((item) => ({
        installmentName: item.name,
        sequence: item.sequence,
        startDate: item.coverageStartDate,
        endDate: item.coverageEndDate,
        demandDate: item.demandDate ?? null,
        dueDate: item.dueDate,
        description: '',
        allocationPercentage: item.allocationPercentage,
        reminderDate: item.reminderDate ?? null,
        gracePeriod: item.gracePeriodDaysOverride ?? null,
        allowPartialOverride: item.allowPartialOverride ?? null,
        demandEnabled: item.demandEnabled,
        reminderEnabled: item.reminderEnabled,
      })),
      invoiceRule,
      invoiceRule === 'XDaysBeforeDue' ? Number(invoiceDays) : null
    );
    revision.current += 1;
    onClose();
  };

  return (
    <CustomDialog
      open={open}
      handleClose={requestClose}
      title="Generate Installment Schedule"
      titleInfo="Configure payment due dates and invoice dates, then preview the schedule before applying it."
      maxWidth="md"
      disableClose={busy}
      guardUnsavedChanges={false}
      hasForm={false}
    >
      <Box
        component="form"
        noValidate
        onSubmit={(event) => {
          event.preventDefault();
          void handlePreview();
        }}
      >
        <DialogScrollContent>
          {existingInstallmentCount > 0 && (
            <Alert severity="warning" sx={{ mb: 2 }}>
              Applying this template will replace the existing {existingInstallmentCount}{' '}
              installment(s).
            </Alert>
          )}
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
              {!geometry && !busy && (
                <Button
                  type="button"
                  size="small"
                  variant="outlined"
                  color="inherit"
                  startIcon={<Iconify icon={GlobalIcons.refresh} width={18} />}
                  onClick={() => setGeometryRetry((value) => value + 1)}
                >
                  Retry Loading Schedule
                </Button>
              )}
            </Alert>
          )}
          <FormBusyRegion
            busy={busy}
            label={loadingGeometry ? 'Loading schedule…' : 'Generating preview…'}
          >
            <FormSectionCard
              icon={GlobalIcons.calendar}
              title="Schedule Configuration"
              titleTypographyProps={{ variant: 'subtitle1', fontWeight: 600 }}
              descriptionTooltip="Choose the installment pattern and the payment and invoice date rules for the selected board period."
            >
              <Box
                sx={{
                  minWidth: 0,
                  display: 'grid',
                  gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)' },
                  gap: 2,
                }}
              >
                <ShakingTextField>
                  <CustomSelect
                    name="templateKind"
                    required
                    fullWidth
                    size="small"
                    label="Schedule template"
                    value={templateKind}
                    disabled={busy}
                    options={TEMPLATE_OPTIONS}
                    onChange={(value) => {
                      setTemplateKind(value as PaymentTermTemplateKind);
                      invalidate();
                    }}
                  />
                </ShakingTextField>
                {templateKind === 'Custom' && (
                  <ShakingTextField error={customCountInvalid}>
                    <NumericFormatCustom
                      name="customCount"
                      required
                      fullWidth
                      size="small"
                      prefix=""
                      decimalScale={0}
                      roundToWholeRupees={false}
                      valueIsNumericString
                      thousandSeparator={false}
                      label="Number of installments"
                      value={customCount}
                      error={customCountInvalid}
                      helperText={
                        customCountInvalid ? 'Enter a whole number from 1 to 36' : undefined
                      }
                      onValueChange={({ value }, source) => {
                        if (source.source !== 'event') return;
                        setCustomCount(value);
                        invalidate();
                      }}
                    />
                  </ShakingTextField>
                )}
                <ShakingTextField>
                  <CustomSelect
                    name="dueDateRule"
                    required
                    fullWidth
                    size="small"
                    label="Payment due date"
                    value={dueDateRule}
                    disabled={busy}
                    options={[
                      { value: 'CoverageEnd', label: 'On the last day of each period' },
                      { value: 'CoverageStart', label: 'On the first day of each period' },
                      {
                        value: 'DaysAfterCoverageStart',
                        label: 'A number of days after period starts',
                      },
                    ]}
                    onChange={(value) => {
                      setDueDateRule(value as PaymentTermTemplateDueDateRule);
                      invalidate();
                    }}
                  />
                </ShakingTextField>
                {dueDateRule === 'DaysAfterCoverageStart' && (
                  <ShakingTextField error={dueDaysInvalid}>
                    <NumericFormatCustom
                      name="dueDays"
                      required
                      fullWidth
                      size="small"
                      prefix=""
                      decimalScale={0}
                      roundToWholeRupees={false}
                      valueIsNumericString
                      thousandSeparator={false}
                      label="Days after period starts"
                      value={dueDays}
                      error={dueDaysInvalid}
                      helperText={dueDaysInvalid ? 'Enter a whole number from 0 to 365' : undefined}
                      onValueChange={({ value }, source) => {
                        if (source.source !== 'event') return;
                        setDueDays(value);
                        invalidate();
                      }}
                    />
                  </ShakingTextField>
                )}
                <ShakingTextField>
                  <CustomSelect
                    name="invoiceRule"
                    required
                    fullWidth
                    size="small"
                    label="Invoice date rule"
                    value={invoiceRule}
                    disabled={busy}
                    options={INVOICE_OPTIONS}
                    onChange={(value) => {
                      setInvoiceRule(value as DemandGenerationRule);
                      invalidate();
                    }}
                  />
                </ShakingTextField>
                {invoiceRule === 'XDaysBeforeDue' && (
                  <ShakingTextField error={Boolean(offsetError)}>
                    <NumericFormatCustom
                      name="invoiceDays"
                      required
                      fullWidth
                      size="small"
                      prefix=""
                      decimalScale={0}
                      roundToWholeRupees={false}
                      valueIsNumericString
                      thousandSeparator={false}
                      label="Days before due"
                      value={invoiceDays}
                      error={Boolean(offsetError)}
                      helperText={
                        offsetError ||
                        (maxDays === null
                          ? 'Loading maximum days…'
                          : `Min 1 day; Max ${maxDays} days`)
                      }
                      onValueChange={({ value }, source) => {
                        if (source.source !== 'event') return;
                        setInvoiceDays(value);
                        invalidate();
                      }}
                    />
                  </ShakingTextField>
                )}
              </Box>
              {invoiceRule === 'SpecificDate' && geometry && (
                <Box
                  sx={{
                    display: 'grid',
                    gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)' },
                    gap: 2,
                  }}
                >
                  {geometry.installments.map((item, index) => (
                    <ShakingTextField key={item.sequence} error={Boolean(specificErrors[index])}>
                      <DatePicker
                        label={`Invoice date — ${item.name}`}
                        format="DD/MM/YYYY"
                        value={parseDateOnly(specificDates[index])}
                        minDate={parseDateOnly(item.coverageStartDate)!}
                        maxDate={parseDateOnly(item.dueDate)!}
                        disabled={busy}
                        onChange={(date) => {
                          setSpecificDates((dates) =>
                            dates.map((value, i) =>
                              i === index ? (toDateOnly(date) ?? '') : value
                            )
                          );
                          invalidate();
                        }}
                        slotProps={{
                          textField: {
                            size: 'small',
                            fullWidth: true,
                            required: true,
                            name: `specificDates[${index}]`,
                            error: Boolean(specificErrors[index]),
                            helperText:
                              specificErrors[index] ||
                              'Between installment start and payment due date',
                          },
                        }}
                      />
                    </ShakingTextField>
                  ))}
                </Box>
              )}
            </FormSectionCard>
            {preview && (
              <FormSectionCard
                sx={{ mt: 2 }}
                icon={GlobalIcons.eye}
                title="Schedule Preview"
                titleTypographyProps={{ variant: 'subtitle1', fontWeight: 600 }}
                descriptionTooltip="Review each installment's dates and allocation before applying the schedule."
              >
                <Alert severity="success">
                  {preview.installmentCount} installments generated with valid invoice dates and a
                  total allocation of 100%.
                </Alert>
                <CustomizableTable
                  tableId="payment-term-template-preview"
                  isPagination={false}
                  isFilter={false}
                  isSearch={false}
                  data={preview.installments}
                  columns={[
                    { id: 'sequence', label: '#', isSort: false, isFilter: false },
                    { id: 'name', label: 'Installment', isSort: false, isFilter: false },
                    {
                      id: 'coverageStartDate',
                      label: 'Start date',
                      isSort: false,
                      isFilter: false,
                      render: (value) => formatDateOnly(value),
                    },
                    {
                      id: 'coverageEndDate',
                      label: 'End date',
                      isSort: false,
                      isFilter: false,
                      render: (value) => formatDateOnly(value),
                    },
                    {
                      id: 'dueDate',
                      label: 'Due date',
                      isSort: false,
                      isFilter: false,
                      render: (value) => formatDateOnly(value),
                    },
                    {
                      id: 'demandDate',
                      label: 'Invoice date',
                      isSort: false,
                      isFilter: false,
                      render: (value) => formatDateOnly(value),
                    },
                    {
                      id: 'allocationPercentage',
                      label: 'Allocation %',
                      isSort: false,
                      isFilter: false,
                      align: 'right',
                      render: (value) => Number(value).toFixed(2) + '%',
                    },
                  ]}
                />
              </FormSectionCard>
            )}
          </FormBusyRegion>
        </DialogScrollContent>
        <DialogActions sx={{ p: 2, flexWrap: 'wrap', rowGap: 1 }}>
          <Button
            type="button"
            size="small"
            variant="outlined"
            color="inherit"
            startIcon={<Iconify icon={GlobalIcons.cancel} width={18} />}
            onClick={requestClose}
            disabled={busy}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            size="small"
            color="inherit"
            variant={preview ? 'outlined' : 'contained'}
            startIcon={
              <Iconify icon={preview ? GlobalIcons.refresh : GlobalIcons.calendar} width={18} />
            }
            loading={previewState.isLoading}
            disabled={!canGenerate}
          >
            {preview ? 'Regenerate Preview' : 'Generate Preview'}
          </Button>
          {preview && (
            <Button
              type="button"
              size="small"
              color="inherit"
              startIcon={
                <Iconify
                  icon={existingInstallmentCount > 0 ? GlobalIcons.transfer : GlobalIcons.submit}
                  width={18}
                />
              }
              variant="contained"
              onClick={handleApply}
              disabled={!canGenerate}
            >
              {existingInstallmentCount > 0 ? 'Replace Installments' : 'Apply Template'}
            </Button>
          )}
        </DialogActions>
      </Box>
      <ConfirmDialog
        open={discardOpen}
        title="Discard Unsaved Changes?"
        icon={<Iconify icon={GlobalIcons.alertIcon} width={24} />}
        content="Your changes to this schedule will be lost if you discard them."
        onClose={() => setDiscardOpen(false)}
        cancelText="Keep Editing"
        disableBackdropClick
        action={
          <Button
            type="button"
            size="small"
            variant="contained"
            color="error"
            startIcon={<Iconify icon={GlobalIcons.delete} width={18} />}
            onClick={onClose}
          >
            Discard Changes
          </Button>
        }
      />
    </CustomDialog>
  );
}
