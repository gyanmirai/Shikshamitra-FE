import type { TableExportFormat } from 'src/components/customizabaleTable/types';

import { useState } from 'react';
import { Alert, Stack, Button } from '@mui/material';
import { normalizeHrFailure } from 'src/screens/hr/recovery/hr-failure';
import { useHrTableExport } from 'src/screens/hr/hooks/use-hr-table-export';

const columns = [
  { id: 'employeeName', label: 'Staff name' },
  { id: 'employeeIdentifier', label: 'Staff code' },
  { id: 'payableDays', label: 'Payable days' },
  { id: 'totalEarnings', label: 'Total earnings (INR)' },
  { id: 'totalDeduction', label: 'Total deductions (INR)' },
  { id: 'netSalary', label: 'Net pay (INR)' },
  { id: 'earningBreakdown', label: 'Earnings breakdown (INR)' },
  { id: 'deductionBreakdown', label: 'Deduction breakdown (INR)' },
];

export function PayrollReviewSheetButtons({
  selection,
  disabled = false,
}: {
  selection: Record<string, unknown>;
  disabled?: boolean;
}) {
  const exportSheet = useHrTableExport('payroll-review-sheet', selection);
  const [format, setFormat] = useState<TableExportFormat | null>(null);
  const [error, setError] = useState('');
  const download = async (requestedFormat: TableExportFormat) => {
    setError('');
    setFormat(requestedFormat);
    try {
      await exportSheet({ format: requestedFormat, columns, searchTerm: '', filters: [], sorts: [] });
    } catch (caught) {
      setError(normalizeHrFailure(caught).message);
    } finally {
      setFormat(null);
    }
  };
  return (
    <Stack spacing={1}>
      <Stack direction="row" spacing={1}>
        <Button size="small" variant="outlined" loading={format === 'excel'} disabled={disabled || Boolean(format)} onClick={() => download('excel')}>
          Review sheet Excel
        </Button>
        <Button size="small" variant="outlined" loading={format === 'pdf'} disabled={disabled || Boolean(format)} onClick={() => download('pdf')}>
          Review sheet PDF
        </Button>
      </Stack>
      {error && <Alert severity="error">{error}</Alert>}
    </Stack>
  );
}
