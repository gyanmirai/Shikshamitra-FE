import type { IColumn } from 'src/components/customizabaleTable/types';
import type {
  StructureLine,
  StructureSettings,
  StructureInstallment,
} from 'src/redux/finance/feeStructureWorkspace';

import dayjs from 'dayjs';
import { useState } from 'react';
import { GlobalIcons } from 'src/utils/icons';
import { Iconify } from 'src/components/iconify';
import CustomTooltip from 'src/components/custom-tooltip';
import { formatNumber } from 'src/utils/formate_number';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { ConfirmDialog } from 'src/components/confirm-dialog';
import ShakingTextField from 'src/components/shaking-text-field';
import CustomizableTable from 'src/components/customizabaleTable';
import { FormSectionCard } from 'src/components/form-section-card';
import NumericFormatCustom from 'src/components/custom-numeric-format';
import CustomDialog, { DialogScrollContent } from 'src/components/customDialog';
import { DetailGrid, DetailField } from 'src/components/detail-view';
import { Box, Alert, Stack, Button, IconButton, Typography, DialogActions } from '@mui/material';

import { structureScheduleAmounts } from './structureScheduleAmounts';

type Term = StructureSettings['terms'][number];
interface Props {
  line: StructureLine;
  term: Term;
  readOnly: boolean;
  onClose: () => void;
  onSave: (rows: StructureInstallment[], customized: boolean) => void;
  onEdit?: () => void;
}

export default function StructureScheduleDialog({
  line,
  term,
  readOnly,
  onClose,
  onSave,
  onEdit,
}: Props) {
  const [initialRows] = useState(() =>
    [...term.installments]
      .sort((a, b) => a.sequence - b.sequence)
      .map((master) => {
        const override = line.installmentOverrides.find(
          (x) => x.sourcePaymentTermInstallmentId === master.sourcePaymentTermInstallmentId
        );
        return Object.fromEntries(
          Object.entries(master).map(([key, value]) => [
            key,
            override?.[key as keyof StructureInstallment] ?? value,
          ])
        ) as unknown as StructureInstallment;
      })
  );
  const [rows, setRows] = useState(initialRows);
  const [confirmClose, setConfirmClose] = useState(false);
  const [error, setError] = useState('');
  const requestClose = () => {
    if (!readOnly && JSON.stringify(rows) !== JSON.stringify(initialRows)) setConfirmClose(true);
    else onClose();
  };
  const amounts = structureScheduleAmounts(line.isVariable ? null : line.amount, rows);
  const totalAmount = amounts.every((amount) => amount !== null)
    ? amounts.reduce<number>((sum, amount) => sum + (amount ?? 0), 0)
    : null;
  const derivedDate = (row: StructureInstallment) => {
    if (term.demandGenerationRule === 'SpecificDate') return row.demandDate;
    if (term.demandGenerationRule === 'OnInstallmentStartDate') return row.coverageStartDate;
    if (!row.dueDate) return null;
    return dayjs(row.dueDate)
      .subtract(
        term.demandGenerationRule === 'XDaysBeforeDue' ? (term.demandOffsetDays ?? 0) : 0,
        'day'
      )
      .format('YYYY-MM-DD');
  };
  const change = (id: string, field: keyof StructureInstallment, value: string | number | null) => {
    setError('');
    setRows((current) =>
      current.map((row) =>
        row.sourcePaymentTermInstallmentId === id ? { ...row, [field]: value } : row
      )
    );
  };
  const save = () => {
    if (
      rows.some(
        (x) =>
          !x.coverageStartDate ||
          !x.coverageEndDate ||
          !x.dueDate ||
          !dayjs(x.dueDate).isValid() ||
          !dayjs(x.coverageStartDate).isValid() ||
          !dayjs(x.coverageEndDate).isValid() ||
          !x.allocationPercentage ||
          x.allocationPercentage <= 0 ||
          x.allocationPercentage > 100 ||
          dayjs(x.coverageStartDate).isAfter(x.coverageEndDate, 'day') ||
          (term.demandGenerationRule === 'SpecificDate' &&
            (!x.demandDate || dayjs(x.demandDate).isAfter(x.dueDate, 'day')))
      )
    ) {
      setError(
        'Complete the dates and positive allocations. Coverage start and demand date cannot follow their respective end/due dates.'
      );
      return;
    }
    if (
      Math.abs(rows.reduce((sum, x) => sum + (x.allocationPercentage ?? 0), 0) - 100) > 0.000001
    ) {
      setError('Installment allocations must total exactly 100%.');
      return;
    }
    for (let i = 1; i < rows.length; i += 1) {
      if (
        !dayjs(rows[i].coverageStartDate).isAfter(rows[i - 1].coverageEndDate, 'day') ||
        !dayjs(rows[i].dueDate).isAfter(rows[i - 1].dueDate, 'day')
      ) {
        setError(
          'Coverage periods cannot overlap and due dates must increase in installment order.'
        );
        return;
      }
    }
    onSave(rows, true);
  };
  const dateColumn = (
    id: keyof StructureInstallment,
    label: string,
    disabled = false
  ): IColumn => ({
    id,
    label,
    width: 174,
    minWidth: 174,
    isFilter: false,
    isSort: false,
    render: (_value, row) => {
      const rawDate = id === 'demandDate' ? derivedDate(row as StructureInstallment) : row[id];
      const selectedDate =
        typeof rawDate === 'string' && dayjs(rawDate).isValid() ? dayjs(rawDate) : null;
      if (readOnly) return selectedDate ? selectedDate.format('DD MMM YYYY') : '—';
      const showError = Boolean(error && !disabled && !selectedDate);
      return (
        <ShakingTextField error={showError}>
          <DatePicker
            label={label}
            format="DD/MM/YYYY"
            sx={{ width: 1, minWidth: 0 }}
            value={selectedDate}
            disabled={readOnly || disabled}
            onChange={(date) =>
              change(
                row.sourcePaymentTermInstallmentId,
                id,
                date?.isValid() ? date.format('YYYY-MM-DD') : null
              )
            }
            slotProps={{
              textField: {
                size: 'small',
                fullWidth: true,
                name: `${id}-${row.sourcePaymentTermInstallmentId}`,
                required: !disabled,
                error: showError,
                helperText: showError ? `${label} is required` : undefined,
                InputProps: { 'aria-label': `${row.name} ${label}` },
                inputProps: { 'aria-label': `${row.name} ${label}` },
              },
              openPickerButton: { 'aria-label': `${row.name} ${label} calendar` },
            }}
          />
        </ShakingTextField>
      );
    },
  });
  return (
    <>
      <CustomDialog
        titleInfo="Review installment dates, allocations, and calculated amounts for the selected fee head."
        guardUnsavedChanges={false}
        open
        handleClose={requestClose}
        title={readOnly ? 'View Installment Schedule' : 'Edit Installment Schedule'}

        maxWidth="lg"
        hasForm={!readOnly}
        onSubmit={(event) => {
          event.preventDefault();
          event.stopPropagation();
          if (!readOnly) save();
        }}
      >
        <DialogScrollContent>
          <Stack spacing={2}>
            <FormSectionCard
              descriptionTooltip="Annual amount and charge options configured for this fee head. Variable amounts are determined during student assignment."
              icon={GlobalIcons.receiptIcon}
              title="Fee Head Details"
              titleTypographyProps={{ variant: 'subtitle1', fontWeight: 600 }}
              sx={{ minWidth: 0, containerType: 'inline-size' }}
            >
              <DetailGrid desktopColumns={line.categoryName ? 5 : 4}>
                <DetailField label="Fee head name" value={line.feeHeadName || 'Fee head'} />
                {line.categoryName && <DetailField label="Category" value={line.categoryName} />}
                <DetailField
                  label="Annual amount"
                  value={
                    line.isVariable
                      ? 'Set during assignment'
                      : line.amount == null
                        ? 'Not set'
                        : formatNumber(line.amount, 'INR')
                  }
                />
                <DetailField
                  label="Payment frequency"
                  value={`${term.name} · v${term.versionNumber}`}
                />
                <DetailField
                  label="Charge option"
                  value={line.isOptional ? 'Optional' : 'Required'}
                />
              </DetailGrid>
            </FormSectionCard>
            <FormSectionCard
              descriptionTooltip="Each installment shows its coverage, demand date, due date, percentage allocation, and calculated amount. Remainders follow the existing payment-term allocation rules."
              icon={GlobalIcons.calendar}
              title="Installment Breakdown"
              titleTypographyProps={{ variant: 'subtitle1', fontWeight: 600 }}

              contentSx={{ minWidth: 0 }}
            >
              {error && <Alert severity="error">{error}</Alert>}
              <CustomizableTable
                tableId="fee-structure-schedule-editor"
                variant="embedded"
                tableTitle="Payment term installments"
                data={rows.map((x, index) => ({
                  ...x,
                  _id: x.sourcePaymentTermInstallmentId,
                  amount: amounts[index],
                }))}
                showToolbar={false}
                page={0}
                rowsPerPage={Math.max(rows.length, 1)}
                sorts={[]}
                filters={[]}
                searchTerm=""
                isPagination={false}
                isSearch={false}
                isFilter={false}
                isShowedDense={false}
                tableContainerProps={{
                  sx: {
                    '& .MuiTable-root': { tableLayout: 'fixed', minWidth: 1088 },
                    '& .MuiTableCell-root': { px: 1.5, py: 1.5 },
                    '& .MuiTableCell-head': { whiteSpace: 'nowrap' },
                  },
                }}
                columns={[
                  {
                    id: 'name',
                    label: 'Installment',
                    sticky: true,
                    stickyPosition: 'left',
                    width: 150,
                    minWidth: 150,
                    isSort: false,
                    isFilter: false,
                    cellSx: { overflowWrap: 'anywhere' },
                  },
                  dateColumn('coverageStartDate', 'Coverage start'),
                  dateColumn('coverageEndDate', 'Coverage end'),
                  dateColumn(
                    'demandDate',
                    'Demand date',
                    term.demandGenerationRule !== 'SpecificDate'
                  ),
                  dateColumn('dueDate', 'Due date'),
                  {
                    cellSx: { textAlign: 'right' as const },
                    id: 'allocationPercentage',
                    label: 'Allocation %',
                    width: 112,
                    minWidth: 112,
                    align: 'left',
                    isSort: false,
                    isFilter: false,
                    render: (_v, row) =>
                      readOnly ? (
                        row.allocationPercentage == null ? (
                          '—'
                        ) : (
                          `${row.allocationPercentage}%`
                        )
                      ) : (
                        <ShakingTextField
                          error={Boolean(
                            error &&
                            (!row.allocationPercentage ||
                              row.allocationPercentage > 100 ||
                              row.allocationPercentage < 0)
                          )}
                        >
                          <NumericFormatCustom
                            size="small"
                            fullWidth
                            sx={{
                              '& input': { textAlign: 'right', fontVariantNumeric: 'tabular-nums' },
                            }}
                            label="Allocation"
                            required
                            error={Boolean(
                              error &&
                              (!row.allocationPercentage ||
                                row.allocationPercentage > 100 ||
                                row.allocationPercentage < 0)
                            )}
                            helperText={
                              (error &&
                              (!row.allocationPercentage ||
                                row.allocationPercentage > 100 ||
                                row.allocationPercentage < 0)
                                ? 'Enter a percentage greater than 0 and up to 100'
                                : undefined) || undefined
                            }
                            name={`allocation-${row.sourcePaymentTermInstallmentId}`}
                            prefix=""
                            suffix="%"
                            roundToWholeRupees={false}
                            decimalScale={2}
                            isAllowed={({ floatValue }) =>
                              floatValue === undefined || floatValue <= 100
                            }
                            disabled={readOnly}
                            value={row.allocationPercentage ?? ''}
                            inputProps={{
                              min: 0.01,
                              max: 100,
                              step: 0.01,
                              'aria-label': `${row.name} allocation percentage`,
                            }}
                            onValueChange={({ floatValue }, source) => {
                              if (source.source === 'event')
                                change(
                                  row.sourcePaymentTermInstallmentId,
                                  'allocationPercentage',
                                  floatValue ?? null
                                );
                            }}
                          />
                        </ShakingTextField>
                      ),
                  },
                  {
                    id: 'amount',
                    label: 'Amount',
                    width: 130,
                    minWidth: 130,
                    align: 'left',
                    isSort: false,
                    isFilter: false,
                    cellSx: { fontVariantNumeric: 'tabular-nums' },
                    render: (_value, row) =>
                      line.isVariable ? (
                        <Typography variant="caption" color="text.secondary">
                          Calculated during assignment
                        </Typography>
                      ) : row.amount === null ? (
                        '—'
                      ) : (
                        formatNumber(row.amount, 'INR')
                      ),
                  },
                ]}
              />
            </FormSectionCard>
          </Stack>
        </DialogScrollContent>
        <DialogActions sx={{ p: 2, flexShrink: 0, flexWrap: 'wrap', rowGap: 1 }}>
          <Typography
            variant="subtitle2"
            sx={{ fontVariantNumeric: 'tabular-nums', minWidth: 0, mr: 1 }}
          >
            Total amount:{' '}
            {line.isVariable
              ? 'Calculated during assignment'
              : totalAmount === null
                ? '—'
                : formatNumber(totalAmount, 'INR')}
          </Typography>
          {!readOnly && (
            <Button
              size="small"
              type="button"
              variant="outlined"
              startIcon={<Iconify icon={GlobalIcons.refresh} width={18} />}
              onClick={() => onSave([], false)}
            >
              Restore Inherited Schedule
            </Button>
          )}
          <Box sx={{ flex: 1 }} />
          {readOnly && onEdit && (
            <CustomTooltip title="Edit installments" placement="right">
              <IconButton
                size="small"
                type="button"
                aria-label="Edit installments"
                onClick={onEdit}
                sx={{ border: 1, borderColor: 'divider', borderRadius: 1 }}
              >
                <Iconify icon={GlobalIcons.edit} width={18} />
              </IconButton>
            </CustomTooltip>
          )}
          <Button
            size="small"
            variant="outlined"
            type="button"
            startIcon={<Iconify icon={GlobalIcons.cancel} width={18} />}
            onClick={requestClose}
          >
            {readOnly ? 'Close' : 'Cancel'}
          </Button>
          {!readOnly && (
            <Button
              size="small"
              variant="contained"
              type="submit"
              startIcon={<Iconify icon={GlobalIcons.submit} width={18} />}
            >
              Submit
            </Button>
          )}
        </DialogActions>
      </CustomDialog>
      <ConfirmDialog
        open={confirmClose}
        onClose={() => setConfirmClose(false)}
        title="Discard Changes?"
        content="Your changes to this installment schedule will be lost if you discard them."
        cancelText="Keep Editing"
        action={
          <Button
            size="small"
            type="button"
            variant="contained"
            color="error"
            startIcon={<Iconify icon={GlobalIcons.delete} width={18} />}
            onClick={onClose}
          >
            Discard Changes
          </Button>
        }
      />
    </>
  );
}
