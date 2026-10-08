'use client';

import { useState, useEffect, useRef } from 'react';
import { DatePicker } from '@mui/x-date-pickers';
import AutoAwesome from '@mui/icons-material/AutoAwesome';
import { Box, Alert, Button, MenuItem, TextField, Typography, DialogActions } from '@mui/material';
import CustomDialog, { DialogScrollContent } from 'src/components/customDialog';
import CustomizableTable from 'src/components/customizabaleTable';
import { parseDateOnly, toDateOnly, formatDateOnly } from 'src/utils/date-only';
import { parseApiProblemDetail } from 'src/utils/api-problem-details';
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

export function InstallmentTemplateDialog({
  open,
  boardId,
  existingInstallmentCount,
  demandGenerationRule,
  demandOffsetDays,
  onClose,
  onApply,
}: Props) {
  const [templateKind, setTemplateKind] = useState<PaymentTermTemplateKind>('Quarterly');
  const [customCount, setCustomCount] = useState(3);
  const [dueDateRule, setDueDateRule] = useState<PaymentTermTemplateDueDateRule>('CoverageEnd');
  const [dueDays, setDueDays] = useState(10);
  const [invoiceRule, setInvoiceRule] = useState(demandGenerationRule);
  const [invoiceDays, setInvoiceDays] = useState<number | ''>(demandOffsetDays ?? '');
  const [geometry, setGeometry] = useState<PaymentTermTemplatePreviewResponse | null>(null);
  const [specificDates, setSpecificDates] = useState<string[]>([]);
  const [preview, setPreview] = useState<PaymentTermTemplatePreviewResponse | null>(null);
  const [error, setError] = useState('');
  const [loadingGeometry, setLoadingGeometry] = useState(false);
  const [geometryRetry, setGeometryRetry] = useState(0);
  const [previewTemplate, previewState] = usePreviewPaymentTermTemplateMutation();
  const revision = useRef(0);
  const customCountInvalid =
    templateKind === 'Custom' &&
    (!Number.isInteger(customCount) || customCount < 1 || customCount > 36);
  const dueDaysInvalid =
    dueDateRule === 'DaysAfterCoverageStart' &&
    (!Number.isInteger(dueDays) || dueDays < 0 || dueDays > 365);
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
      setInvoiceDays(demandOffsetDays ?? '');
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
      customInstallmentCount: templateKind === 'Custom' ? customCount : undefined,
      dueDateRule,
      dueDaysAfterCoverageStart: dueDateRule === 'DaysAfterCoverageStart' ? dueDays : undefined,
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
        : !Number.isInteger(invoiceDays) || Number(invoiceDays) < 1
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
        customInstallmentCount: templateKind === 'Custom' ? customCount : undefined,
        dueDateRule,
        dueDaysAfterCoverageStart: dueDateRule === 'DaysAfterCoverageStart' ? dueDays : undefined,
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
      handleClose={onClose}
      title="Generate installment schedule"
      maxWidth="md"
      disableClose={busy}
      guardUnsavedChanges={false}
      hasForm={false}
    >
      <DialogScrollContent>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          Configure payment due dates and invoice dates together, then review the complete schedule
          before applying it.
        </Typography>
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
              <Button size="small" onClick={() => setGeometryRetry((value) => value + 1)}>
                Retry loading schedule
              </Button>
            )}
          </Alert>
        )}
        <Box
          component="fieldset"
          disabled={busy}
          sx={{
            border: 0,
            p: 0,
            m: 0,
            minWidth: 0,
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)' },
            gap: 2,
          }}
        >
          <TextField
            select
            size="small"
            label="Schedule template"
            value={templateKind}
            disabled={busy}
            onChange={(event) => {
              setTemplateKind(event.target.value as PaymentTermTemplateKind);
              invalidate();
            }}
          >
            {TEMPLATE_OPTIONS.map((option) => (
              <MenuItem key={option.value} value={option.value}>
                {option.label}
              </MenuItem>
            ))}
          </TextField>
          {templateKind === 'Custom' && (
            <TextField
              size="small"
              type="number"
              label="Number of installments"
              value={customCount}
              inputProps={{ min: 1, max: 36, step: 1 }}
              error={customCountInvalid}
              helperText={customCountInvalid ? 'Enter a whole number from 1 to 36' : undefined}
              onChange={(event) => {
                setCustomCount(Number(event.target.value));
                invalidate();
              }}
            />
          )}
          <TextField
            select
            size="small"
            label="Payment due date"
            value={dueDateRule}
            disabled={busy}
            onChange={(event) => {
              setDueDateRule(event.target.value as PaymentTermTemplateDueDateRule);
              invalidate();
            }}
          >
            <MenuItem value="CoverageEnd">On the last day of each period</MenuItem>
            <MenuItem value="CoverageStart">On the first day of each period</MenuItem>
            <MenuItem value="DaysAfterCoverageStart">A number of days after period starts</MenuItem>
          </TextField>
          {dueDateRule === 'DaysAfterCoverageStart' && (
            <TextField
              size="small"
              type="number"
              label="Days after period starts"
              value={dueDays}
              inputProps={{ min: 0, max: 365, step: 1 }}
              error={dueDaysInvalid}
              helperText={dueDaysInvalid ? 'Enter a whole number from 0 to 365' : undefined}
              onChange={(event) => {
                setDueDays(Number(event.target.value));
                invalidate();
              }}
            />
          )}
          <TextField
            select
            size="small"
            label="Invoice Date Rule"
            value={invoiceRule}
            disabled={busy}
            onChange={(event) => {
              setInvoiceRule(event.target.value as DemandGenerationRule);
              invalidate();
            }}
          >
            {INVOICE_OPTIONS.map((option) => (
              <MenuItem key={option.value} value={option.value}>
                {option.label}
              </MenuItem>
            ))}
          </TextField>
          {invoiceRule === 'XDaysBeforeDue' && (
            <TextField
              size="small"
              type="number"
              label="Days Before Due"
              value={invoiceDays}
              inputProps={{ min: 1, max: maxDays ?? 365, step: 1 }}
              error={Boolean(offsetError)}
              helperText={
                offsetError ||
                (maxDays === null ? 'Loading maximum days…' : `Min 1 day; Max ${maxDays} days`)
              }
              onChange={(event) => {
                setInvoiceDays(event.target.value === '' ? '' : Number(event.target.value));
                invalidate();
              }}
            />
          )}
        </Box>
        {invoiceRule === 'SpecificDate' && geometry && (
          <Box
            sx={{
              mt: 2,
              display: 'grid',
              gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)' },
              gap: 2,
            }}
          >
            {geometry.installments.map((item, index) => (
              <DatePicker
                key={item.sequence}
                label={`Invoice date — ${item.name}`}
                format="DD/MM/YYYY"
                value={parseDateOnly(specificDates[index])}
                minDate={parseDateOnly(item.coverageStartDate)!}
                maxDate={parseDateOnly(item.dueDate)!}
                disabled={busy}
                onChange={(date) => {
                  setSpecificDates((dates) =>
                    dates.map((value, i) => (i === index ? (toDateOnly(date) ?? '') : value))
                  );
                  invalidate();
                }}
                slotProps={{
                  textField: {
                    size: 'small',
                    error: Boolean(specificErrors[index]),
                    helperText:
                      specificErrors[index] || 'Between installment start and payment due date',
                  },
                }}
              />
            ))}
          </Box>
        )}
        {preview && (
          <Box sx={{ mt: 3 }}>
            <Alert severity="success" sx={{ mb: 1.5 }}>
              {preview.installmentCount} installments generated with valid invoice dates and a total
              allocation of 100%.
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
          </Box>
        )}
      </DialogScrollContent>
      <DialogActions sx={{ p: 2 }}>
        <Button onClick={onClose} disabled={busy}>
          Cancel
        </Button>
        <Button
          variant={preview ? 'outlined' : 'contained'}
          startIcon={<AutoAwesome />}
          onClick={handlePreview}
          disabled={!canGenerate}
        >
          {busy ? 'Generating…' : preview ? 'Regenerate preview' : 'Generate preview'}
        </Button>
        {preview && (
          <Button variant="contained" onClick={handleApply} disabled={!canGenerate}>
            {existingInstallmentCount > 0 ? 'Replace installments' : 'Apply template'}
          </Button>
        )}
      </DialogActions>
    </CustomDialog>
  );
}
