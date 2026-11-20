'use client';

import type { DateRange } from 'src/components/custom-date-range-picker';
import type {
  FinanceReportFilter, FinanceReportFormat, FinanceReportOption, FinanceReportOptions,
} from 'src/redux/finance/reports/financeReportsApi';

import dayjs from 'dayjs';
import { mixed, object } from 'yup';
import { useState } from 'react';
import { useFormik } from 'formik';
import { LoadingButton } from '@mui/lab';
import { Box, Alert, Stack, Paper, MenuItem, TextField, Typography, TablePagination } from '@mui/material';
import {
  usePreviewFinanceReportMutation, useCreateFinanceReportExportMutation,
} from 'src/redux/finance/reports/financeReportsApi';
import { formatNumber } from 'src/utils/formate_number';
import { toDateOnly } from 'src/utils/date-only';
import { Iconify } from 'src/components/iconify';
import ShakingTextField from 'src/components/shaking-text-field';
import { CustomDateRangePicker } from 'src/components/custom-date-range-picker';
import { parseApiProblemDetail } from 'src/utils/api-problem-details';
import { CurriculumReportPreviewTable } from 'src/screens/academic/curriculum-management/reports/CurriculumReportPreviewTable';

import {
  reportFields, phaseOneReports, reportAgeingOptions, reportStatusOptions,
} from '../finance-report-catalog';

type Props = {
  report: FinanceReportOption;
  options: FinanceReportOptions;
  defaultYear?: string;
  onQueued: () => void;
};

const PAGE_SIZE = 25;
const MIN_REPORT_DATE = dayjs('1900-01-01');
const MAX_REPORT_DATE = dayjs('2200-12-31');
const unique = (values: FinanceReportOption[]) =>
  [...new Map(values.map((value) => [value.id, value])).values()];
const namedOptions = (values: string[]) => values.map((value) => ({ id: value, label: value }));

export function FinanceReportBuilder({ report, options, defaultYear, onQueued }: Props) {
  const [format, setFormat] = useState<FinanceReportFormat>('excel');
  const [error, setError] = useState<string>();
  const [preview, previewState] = usePreviewFinanceReportMutation();
  const [queue, queueState] = useCreateFinanceReportExportMutation();
  const [confirmedPage, setConfirmedPage] = useState<number>();
  const [requestVersion, setRequestVersion] = useState(0);
  const [previewVersion, setPreviewVersion] = useState<number>();
  const [dateInputError, setDateInputError] = useState<string | null>(null);
  const years = options.academicYears.filter((year) => !report.yearWideOnly || year.yearWideOnly);
  const initialYear = years.find((year) => year.id === defaultYear)?.id ?? years[0]?.id;
  const reportType = report.id;
  const hasDateLimits = phaseOneReports.some((type) => type === reportType);
  const minDate = hasDateLimits ? MIN_REPORT_DATE : undefined;
  const maxDate = hasDateLimits ? MAX_REPORT_DATE : undefined;
  const form = useFormik<{ filters: FinanceReportFilter; dateRange: DateRange }>({
    initialValues: { filters: { academicYearIds: initialYear ? [initialYear] : undefined }, dateRange: [null, null] },
    validationSchema: object({
      dateRange: mixed<DateRange>().defined().test('report-date-range', ([start, end], context) => {
        if (!start && !end) return true;
        if (!start?.isValid() || !end?.isValid()) {
          return context.createError({ message: 'Enter both dates to filter the report by date.' });
        }
        if (end.isBefore(start, 'day')) {
          return context.createError({ message: 'End date must be on or after start date.' });
        }
        if (minDate && maxDate && (start.isBefore(minDate, 'day') || end.isAfter(maxDate, 'day'))) {
          return context.createError({ message: 'Enter dates between 01/01/1900 and 31/12/2200.' });
        }
        return true;
      }),
    }),
    onSubmit: async (values) => {
      await runPreview(values, 0);
    },
  });
  const { filters } = form.values;
  const fields = reportFields(reportType);
  const year = filters.academicYearIds?.[0];
  const hierarchy = options.scope.filter((row) =>
    row.academicYearId === year &&
    (!filters.boardId || row.board.id === filters.boardId) &&
    (!filters.mediumId || row.medium.id === filters.mediumId) &&
    (!filters.organizationIds?.length || filters.organizationIds.includes(row.stage.id)) &&
    (!filters.classIds?.length || filters.classIds.includes(row.class.id)));
  const previewData = previewVersion === requestVersion && confirmedPage != null ? previewState.data : undefined;
  const dateRangeError = dateInputError || form.errors.dateRange;
  const statementWithoutPayer = reportType === phaseOneReports[2] && !filters.payerSearch?.trim();
  const canPreview = !!year && !dateRangeError && !statementWithoutPayer;
  const busy = previewState.isLoading || queueState.isLoading;

  async function runPreview(values: typeof form.values, page: number) {
    if (!canPreview) return;
    const [start, end] = values.dateRange;
    const requestFilters = start && end
      ? { ...values.filters, fromDate: toDateOnly(start), toDate: toDateOnly(end) }
      : values.filters;
    setError(undefined);
    try {
      await preview({ reportType, filters: requestFilters, format, page: page + 1, pageSize: PAGE_SIZE }).unwrap();
      setConfirmedPage(page);
      setPreviewVersion(requestVersion);
    } catch (exception) {
      setPreviewVersion(undefined);
      setError(parseApiProblemDetail(exception).detail || 'Could not load the report preview.');
    }
  }

  async function generate() {
    if (!previewData || busy) return;
    setError(undefined);
    try {
      await queue({ reportType, filters: previewData.normalizedFilters, format }).unwrap();
      onQueued();
    } catch (exception) {
      setError(parseApiProblemDetail(exception).detail || 'Could not generate the report.');
    }
  }

  const invalidatePreview = () => {
    setRequestVersion(requestVersion + 1);
    setConfirmedPage(undefined);
    setError(undefined);
  };

  const update = (patch: Partial<FinanceReportFilter>) => {
    invalidatePreview();
    form.setFieldValue('filters', { ...filters, ...patch });
  };

  function optionField(label: string, value: string | undefined, choices: FinanceReportOption[],
    onChange: (value: string) => void, allLabel = 'All', disabled = false) {
    return (
      <TextField select size="small" label={label} value={value ?? ''} onChange={(event) => onChange(event.target.value)}
        disabled={busy || disabled} fullWidth
        slotProps={{ select: { displayEmpty: Boolean(allLabel) }, inputLabel: { shrink: allLabel ? true : undefined } }}>
        {allLabel && <MenuItem value="">{allLabel}</MenuItem>}
        {choices.map((choice) => <MenuItem key={choice.id} value={choice.id}>{choice.label}</MenuItem>)}
      </TextField>
    );
  }

  const textField = (key: 'payerSearch' | 'installment' | 'collector' | 'bank' | 'receiptNumber', label: string) =>
    <TextField size="small" label={label} value={filters[key] ?? ''} disabled={busy} fullWidth
      onChange={(event) => update({ [key]: event.target.value || undefined })}
      slotProps={{ htmlInput: { maxLength: 120 } }} />;

  const rows = (previewData?.rows ?? []).map((row) => Object.fromEntries(
    (previewData?.columns ?? []).map((column) => {
      const value = row[column.id];
      const amount = Number(value);
      return [column.id, value != null && column.kind === 'money'
        ? formatNumber(amount, 'INR', { fractionDigits: Number.isInteger(amount) ? 0 : 2 })
        : value ?? '—'];
    })
  ));

  return (
    <Stack spacing={2} sx={{ p: { xs: 1.5, lg: 2 }, minWidth: 0 }}>
      <Paper
        component="form"
        aria-label={report.label}
        onSubmit={(event) => {
          event.preventDefault();
          if (canPreview && !busy) form.handleSubmit(event);
        }}
        variant="outlined"
        sx={{ p: 2 }}
      >
        <Stack spacing={2}>
          <Box sx={{ display: 'grid', gap: 2, gridTemplateColumns: { xs: 'minmax(0, 1fr)', sm: 'repeat(2, minmax(0, 1fr))' } }}>
            {optionField('Academic year', year, years,
              (id) => {
                if (id === year) return;
                invalidatePreview();
                setDateInputError(null);
                form.setValues({ filters: { academicYearIds: [id] }, dateRange: [null, null] });
              }, '')}
            {optionField('Format', format, [{ id: 'excel', label: 'Excel' }, { id: 'pdf', label: 'PDF' }],
              (id) => setFormat(id as FinanceReportFormat), '')}
          </Box>
          {fields.length > 0 && (
            <Box sx={{ display: 'grid', gap: 2, gridTemplateColumns: { xs: 'minmax(0, 1fr)', sm: 'repeat(2, minmax(0, 1fr))' } }}>
              {fields.includes('boardId') && optionField('Board', filters.boardId,
                unique(options.scope.filter((row) => row.academicYearId === year).map((row) => row.board)),
                (id) => update({ boardId: id || undefined, mediumId: undefined, organizationIds: undefined, classIds: undefined, divisionIds: undefined }))}
              {fields.includes('mediumId') && optionField('Medium', filters.mediumId,
                unique(options.scope.filter((row) => row.academicYearId === year && (!filters.boardId || row.board.id === filters.boardId)).map((row) => row.medium)),
                (id) => update({ mediumId: id || undefined, organizationIds: undefined, classIds: undefined, divisionIds: undefined }),
                'All', !filters.boardId)}
              {fields.includes('organizationIds') && optionField('Stage', filters.organizationIds?.[0],
                unique(options.scope.filter((row) => row.academicYearId === year && (!filters.boardId || row.board.id === filters.boardId) &&
                  (!filters.mediumId || row.medium.id === filters.mediumId)).map((row) => row.stage)),
                (id) => update({ organizationIds: id ? [id] : undefined, classIds: undefined, divisionIds: undefined }))}
              {fields.includes('classIds') && optionField('Class', filters.classIds?.[0],
                unique(options.scope.filter((row) => row.academicYearId === year && (!filters.boardId || row.board.id === filters.boardId) &&
                  (!filters.mediumId || row.medium.id === filters.mediumId) &&
                  (!filters.organizationIds?.length || filters.organizationIds.includes(row.stage.id))).map((row) => row.class)),
                (id) => update({ classIds: id ? [id] : undefined, divisionIds: undefined }))}
              {fields.includes('divisionIds') && optionField('Division', filters.divisionIds?.[0],
                unique(hierarchy.flatMap((row) => row.divisions)), (id) => update({ divisionIds: id ? [id] : undefined }),
                'All', !filters.classIds?.[0])}
              {fields.includes('feeHeadIds') && optionField('Fee head', filters.feeHeadIds?.[0],
                options.feeHeads.filter((option) => option.academicYearId === year), (id) => update({ feeHeadIds: id ? [id] : undefined }))}
              {fields.includes('receiptBookIds') && optionField('Receipt book', filters.receiptBookIds?.[0],
                options.receiptBooks.filter((option) => option.academicYearId === year), (id) => update({ receiptBookIds: id ? [id] : undefined }))}
              {fields.includes('groupBy') && optionField('Group by', filters.groupBy ?? 'classDivision',
                [{ id: 'classDivision', label: 'Class and division' }, { id: 'feeHead', label: 'Fee head' }], (id) => update({ groupBy: id }), '')}
              {fields.includes('payerSearch') && textField('payerSearch', reportType === phaseOneReports[2] ? 'Payer name, admission no. or ID' : 'Payer name')}
              {fields.includes('installment') && textField('installment', 'Installment')}
              {fields.includes('collector') && textField('collector', 'Collector')}
              {fields.includes('bank') && textField('bank', 'Bank')}
              {fields.includes('receiptNumber') && textField('receiptNumber', 'Receipt number')}
              {fields.includes('paymentMethod') && optionField('Payment method', filters.paymentMethod,
                options.paymentMethods.filter((method) => reportType !== phaseOneReports[5] || method.id !== 'Cash'),
                (id) => update({ paymentMethod: id || undefined }))}
              {fields.includes('receiptKind') && optionField('Document kind', filters.receiptKind,
                namedOptions(['Official', 'Provisional']), (id) => update({ receiptKind: id || undefined }))}
              {fields.includes('status') && optionField('Status', filters.status,
                namedOptions(reportStatusOptions[reportType] ?? []), (id) => update({ status: id || undefined }))}
              {fields.includes('ageingBucket') && optionField('Ageing bucket', filters.ageingBucket,
                namedOptions(reportAgeingOptions(reportType)), (id) => update({ ageingBucket: id || undefined }))}
              {fields.includes('dateBasis') && optionField('Date basis', filters.dateBasis ?? 'payment',
                [{ id: 'payment', label: 'Payment date' }, { id: 'decision', label: 'Verification date' }],
                (id) => update({ dateBasis: id }), '')}
              {fields.includes('months') && optionField('Month', filters.months?.[0]?.toString(),
                Array.from({ length: 12 }, (_, index) => ({
                  id: String(index + 1), label: new Intl.DateTimeFormat('en-IN', { month: 'long' }).format(new Date(2026, index, 1)),
                })), (id) => update({ months: id ? [Number(id)] : undefined }))}
              {fields.includes('dateRange') && (
                <ShakingTextField error={Boolean(dateRangeError)} sx={{ gridColumn: '1 / -1' }}>
                  <CustomDateRangePicker
                    key={year}
                    label="Date range"
                    dateFormat="DD/MM/YYYY"
                    allowManualInput
                    value={form.values.dateRange}
                    minDate={minDate}
                    maxDate={maxDate}
                    disabled={busy}
                    error={Boolean(dateRangeError)}
                    helperText={dateRangeError}
                    onInputErrorChange={setDateInputError}
                    onAccept={() => setDateInputError(null)}
                    onChange={(range) => {
                      invalidatePreview();
                      form.setFieldValue('dateRange', range);
                    }}
                  />
                </ShakingTextField>
              )}
            </Box>
          )}
          {error && <Alert severity="error">{error}</Alert>}
          <Stack direction="row" spacing={1} flexWrap="wrap" justifyContent="flex-end">
            <LoadingButton type="submit" size="small" variant="outlined" startIcon={<Iconify icon="mdi:eye-outline" />}
              loading={previewState.isLoading} disabled={!canPreview || busy}>
              Preview
            </LoadingButton>
            <LoadingButton size="small" variant="contained" startIcon={<Iconify icon="mdi:tray-arrow-down" />}
              loading={queueState.isLoading} disabled={!previewData || busy} onClick={() => { generate(); }}>
              Queue export
            </LoadingButton>
          </Stack>
        </Stack>
      </Paper>
      {(previewData || previewState.isLoading) && (
        <Paper variant="outlined" sx={{ display: 'flex', flexDirection: 'column', flex: 1, minHeight: 180, overflow: 'hidden' }}>
          <Typography variant="subtitle2" sx={{ p: 1.5 }}>Report preview</Typography>
          <CurriculumReportPreviewTable
            columns={(previewData?.columns ?? []).map((column) => ({
              ...column, align: column.kind === 'money' || column.kind === 'number' ||
                /^(Amount|Total)$|^(FH|STD|M|Cash|Gateway|Total)_/.test(column.id) ? 'right' : 'left',
            }))}
            rows={rows} rowsPerPage={5} isLoading={previewState.isLoading}
          />
          {previewData && <TablePagination component="div" count={previewData.totalCount} page={confirmedPage ?? 0}
            rowsPerPage={PAGE_SIZE} rowsPerPageOptions={[PAGE_SIZE]}
            onPageChange={(_, page) => { if (!busy) runPreview(form.values, page); }} />}
        </Paper>
      )}
    </Stack>
  );
}
