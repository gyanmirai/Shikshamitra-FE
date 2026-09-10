import type { IColumn } from 'src/components/customizabaleTable/types';
import type {
  StructureLine,
  StructureSettings,
  StructureInstallment,
} from 'src/redux/finance/feeStructureWorkspace';

import dayjs from 'dayjs';
import { useState } from 'react';
import CustomizableTable from 'src/components/customizabaleTable';
import CustomDialog, { DialogScrollContent } from 'src/components/customDialog';
import { Box, Alert, Stack, Button, TextField, Typography, DialogActions } from '@mui/material';

type Term = StructureSettings['terms'][number];
interface Props {
  line: StructureLine;
  term: Term;
  readOnly: boolean;
  onClose: () => void;
  onSave: (rows: StructureInstallment[], customized: boolean) => void;
}

export default function StructureScheduleDialog({ line, term, readOnly, onClose, onSave }: Props) {
  const [rows, setRows] = useState(() =>
    term.installments.map((master) => {
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
  const [error, setError] = useState('');
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
    minWidth: 175,
    isFilter: false,
    isSort: false,
    render: (_value, row) => (
      <TextField
        size="small"
        type="date"
        fullWidth
        inputProps={{ 'aria-label': `${row.name} ${label}` }}
        value={
          id === 'demandDate'
            ? (derivedDate(row as StructureInstallment)?.slice(0, 10) ?? '')
            : row[id]
              ? String(row[id]).slice(0, 10)
              : ''
        }
        disabled={readOnly || disabled}
        onChange={(e) => change(row.sourcePaymentTermInstallmentId, id, e.target.value || null)}
      />
    ),
  });
  return (
    <CustomDialog
      guardUnsavedChanges={false}
      open
      handleClose={onClose}
      title={`${line.feeHeadName || 'Fee Head'} · ${term.name} v${term.versionNumber}`}
      maxWidth="lg"
      hasForm={false}
    >
      <DialogScrollContent>
        <Stack spacing={2} sx={{ p: 2 }}>
          <Alert severity="info">
            Changes apply only to this Fee Structure. The published Payment Term remains unchanged.
            Demand dates follow the term rule unless it uses a specific date.
          </Alert>
          {error && <Alert severity="error">{error}</Alert>}
          <CustomizableTable
            tableId="fee-structure-schedule-editor"
            data={rows.map((x) => ({ ...x, _id: x.sourcePaymentTermInstallmentId }))}
            isPagination={false}
            isSearch={false}
            isFilter={false}
            isShowedDense={false}
            columns={[
              { id: 'name', label: 'Installment', sticky: true, minWidth: 160, isSort: false },
              dateColumn('coverageStartDate', 'Coverage start'),
              dateColumn('coverageEndDate', 'Coverage end'),
              dateColumn('demandDate', 'Demand date', term.demandGenerationRule !== 'SpecificDate'),
              dateColumn('dueDate', 'Due date'),
              {
                id: 'allocationPercentage',
                label: 'Allocation %',
                minWidth: 130,
                isSort: false,
                render: (_v, row) => (
                  <TextField
                    size="small"
                    type="number"
                    disabled={readOnly}
                    value={row.allocationPercentage ?? ''}
                    inputProps={{
                      min: 0.01,
                      max: 100,
                      step: 0.01,
                      'aria-label': `${row.name} allocation percentage`,
                    }}
                    onChange={(e) =>
                      change(
                        row.sourcePaymentTermInstallmentId,
                        'allocationPercentage',
                        e.target.value === '' ? null : Number(e.target.value)
                      )
                    }
                  />
                ),
              },
            ]}
          />
          <Typography variant="subtitle2" textAlign="right">
            Total allocation:{' '}
            {rows.reduce((sum, x) => sum + (x.allocationPercentage ?? 0), 0).toFixed(2)}%
          </Typography>
        </Stack>
        <DialogActions sx={{ p: 2 }}>
          {!readOnly && (
            <Button size="small" onClick={() => onSave([], false)}>
              Restore inherited schedule
            </Button>
          )}
          <Box sx={{ flex: 1 }} />
          <Button size="small" variant="outlined" onClick={onClose}>
            {readOnly ? 'Close' : 'Cancel'}
          </Button>
          {!readOnly && (
            <Button size="small" variant="contained" onClick={save}>
              Use this schedule
            </Button>
          )}
        </DialogActions>
      </DialogScrollContent>
    </CustomDialog>
  );
}
