'use client';

import dayjs from 'dayjs';
import { useState, useEffect } from 'react';
import AutoAwesome from '@mui/icons-material/AutoAwesome';
import { parseApiProblemDetail } from 'src/utils/api-problem-details';
import {
  type PaymentTermTemplateKind,
  type PaymentTermTemplateDueDateRule,
  usePreviewPaymentTermTemplateMutation,
  type PaymentTermTemplatePreviewResponse,
} from 'src/redux/finance/paymentTerm';
import {
  Box,
  Alert,
  Table,
  Button,
  Dialog,
  MenuItem,
  TableRow,
  TableBody,
  TableCell,
  TableHead,
  TextField,
  Typography,
  DialogTitle,
  DialogActions,
  DialogContent,
} from '@mui/material';

import type { IInstallment, DemandGenerationRule } from '../type';

const TEMPLATE_OPTIONS: Array<{ value: PaymentTermTemplateKind; label: string }> = [
  { value: 'Annual', label: 'Annual — 1 installment' },
  { value: 'HalfYearly', label: 'Half-yearly — 2 installments' },
  { value: 'Quarterly', label: 'Quarterly — 4 installments' },
  { value: 'Monthly', label: 'Monthly — one per calendar month' },
  { value: 'Custom', label: 'Custom installment count' },
];

const DUE_DATE_OPTIONS: Array<{
  value: PaymentTermTemplateDueDateRule;
  label: string;
}> = [
  { value: 'CoverageEnd', label: 'On the last day of each period' },
  { value: 'CoverageStart', label: 'On the first day of each period' },
  { value: 'DaysAfterCoverageStart', label: 'A number of days after period starts' },
];

interface InstallmentTemplateDialogProps {
  open: boolean;
  boardId: string;
  existingInstallmentCount: number;
  demandGenerationRule: DemandGenerationRule;
  demandOffsetDays: number | null;
  onClose: () => void;
  onApply: (installments: IInstallment[]) => void;
}

export function InstallmentTemplateDialog({
  open,
  boardId,
  existingInstallmentCount,
  demandGenerationRule,
  demandOffsetDays,
  onClose,
  onApply,
}: InstallmentTemplateDialogProps) {
  const [templateKind, setTemplateKind] = useState<PaymentTermTemplateKind>('Quarterly');
  const [customCount, setCustomCount] = useState(3);
  const [dueDateRule, setDueDateRule] = useState<PaymentTermTemplateDueDateRule>('CoverageEnd');
  const [dueDays, setDueDays] = useState(10);
  const [preview, setPreview] = useState<PaymentTermTemplatePreviewResponse | null>(null);
  const [error, setError] = useState('');
  const [previewTemplate, previewState] = usePreviewPaymentTermTemplateMutation();
  const customCountInvalid = templateKind === 'Custom' && (customCount < 1 || customCount > 36);
  const dueDaysInvalid = dueDateRule === 'DaysAfterCoverageStart' && (dueDays < 0 || dueDays > 365);

  useEffect(() => {
    if (open) {
      setPreview(null);
      setError('');
    }
  }, [boardId, demandGenerationRule, demandOffsetDays, open]);

  const clearPreview = () => {
    setPreview(null);
    setError('');
  };

  const handlePreview = async () => {
    setError('');
    try {
      const result = await previewTemplate({
        boardId,
        templateKind,
        customInstallmentCount: templateKind === 'Custom' ? customCount : undefined,
        dueDateRule,
        dueDaysAfterCoverageStart: dueDateRule === 'DaysAfterCoverageStart' ? dueDays : undefined,
        demandGenerationRule,
        demandOffsetDays,
      }).unwrap();
      setPreview(result);
    } catch (requestError) {
      setPreview(null);
      setError(parseApiProblemDetail(requestError).detail);
    }
  };

  const handleApply = () => {
    if (!preview) return;
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
      }))
    );
    onClose();
  };

  return (
    <Dialog
      open={open}
      onClose={previewState.isLoading ? undefined : onClose}
      fullWidth
      maxWidth="md"
    >
      <DialogTitle>Generate installment schedule</DialogTitle>
      <DialogContent dividers>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          The server generates a valid schedule inside the selected board period. You can edit every
          installment after applying it.
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
          </Alert>
        )}

        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', sm: 'repeat(3, 1fr)' },
            gap: 2,
          }}
        >
          <TextField
            select
            size="small"
            label="Schedule template"
            value={templateKind}
            onChange={(event) => {
              setTemplateKind(event.target.value as PaymentTermTemplateKind);
              clearPreview();
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
              inputProps={{ min: 1, max: 36 }}
              error={customCountInvalid}
              helperText={customCountInvalid ? 'Enter a value from 1 to 36' : undefined}
              onChange={(event) => {
                setCustomCount(Number(event.target.value));
                clearPreview();
              }}
            />
          )}

          <TextField
            select
            size="small"
            label="Payment due date"
            value={dueDateRule}
            onChange={(event) => {
              setDueDateRule(event.target.value as PaymentTermTemplateDueDateRule);
              clearPreview();
            }}
          >
            {DUE_DATE_OPTIONS.map((option) => (
              <MenuItem key={option.value} value={option.value}>
                {option.label}
              </MenuItem>
            ))}
          </TextField>

          {dueDateRule === 'DaysAfterCoverageStart' && (
            <TextField
              size="small"
              type="number"
              label="Days after period starts"
              value={dueDays}
              inputProps={{ min: 0, max: 365 }}
              error={dueDaysInvalid}
              helperText={dueDaysInvalid ? 'Enter a value from 0 to 365' : undefined}
              onChange={(event) => {
                setDueDays(Number(event.target.value));
                clearPreview();
              }}
            />
          )}
        </Box>

        {preview && (
          <Box sx={{ mt: 3 }}>
            <Alert severity="success" sx={{ mb: 1.5 }}>
              {preview.installmentCount} installments generated with a total allocation of 100%.
            </Alert>
            <Box sx={{ overflowX: 'auto', border: 1, borderColor: 'divider', borderRadius: 1 }}>
              <Table size="small" aria-label="Generated installment schedule preview">
                <TableHead>
                  <TableRow>
                    <TableCell>#</TableCell>
                    <TableCell>Installment</TableCell>
                    <TableCell>Installment start–end date</TableCell>
                    <TableCell>Invoice date</TableCell>
                    <TableCell>Due date</TableCell>
                    <TableCell align="right">Allocation</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {preview.installments.map((item) => (
                    <TableRow key={item.sequence}>
                      <TableCell>{item.sequence}</TableCell>
                      <TableCell>{item.name}</TableCell>
                      <TableCell>
                        {dayjs(item.coverageStartDate).format('DD/MM/YYYY')} –{' '}
                        {dayjs(item.coverageEndDate).format('DD/MM/YYYY')}
                      </TableCell>
                      <TableCell>
                        {item.demandDate ? dayjs(item.demandDate).format('DD/MM/YYYY') : '—'}
                      </TableCell>
                      <TableCell>{dayjs(item.dueDate).format('DD/MM/YYYY')}</TableCell>
                      <TableCell align="right">{item.allocationPercentage.toFixed(2)}%</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Box>
          </Box>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={previewState.isLoading}>
          Cancel
        </Button>
        <Button
          variant={preview ? 'outlined' : 'contained'}
          startIcon={<AutoAwesome />}
          onClick={handlePreview}
          disabled={!boardId || customCountInvalid || dueDaysInvalid || previewState.isLoading}
        >
          {previewState.isLoading
            ? 'Generating…'
            : preview
              ? 'Regenerate preview'
              : 'Generate preview'}
        </Button>
        {preview && (
          <Button variant="contained" onClick={handleApply}>
            {existingInstallmentCount > 0 ? 'Replace installments' : 'Apply template'}
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
}
