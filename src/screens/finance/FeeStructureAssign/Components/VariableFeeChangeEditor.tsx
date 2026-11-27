import type { DateRange } from 'src/components/custom-date-range-picker';
import type {
  AssignmentDetails,
  VariableFeeChangeInput,
  VariableFeeChangeResult,
} from 'src/redux/finance/studentFeeAssignment';

import dayjs from 'dayjs';
import { fDate } from 'src/utils/format-time';
import { Iconify } from 'src/components/iconify';
import { useRef, useState, useEffect } from 'react';
import CustomSelect from 'src/components/custom-select';
import { formatNumber } from 'src/utils/formate_number';
import { shikshaMitraToast } from 'src/components/toast';
import { ConfirmDialog } from 'src/components/confirm-dialog';
import { FormBusyRegion } from 'src/components/form-busy-region';
import { parseApiProblemDetail } from 'src/utils/api-problem-details';
import { CustomDateRangePicker } from 'src/components/custom-date-range-picker';
import { DetailField, DetailSection } from 'src/screens/finance/components/detail-view';
import {
  Box,
  Stack,
  Alert,
  Table,
  Button,
  TableRow,
  TableBody,
  TableCell,
  TableHead,
  TextField,
  TableContainer,
} from '@mui/material';
import {
  assignmentError,
  assignmentErrorCode,
  useCommitVariableFeeChangeMutation,
  usePreviewVariableFeeChangeMutation,
} from 'src/redux/finance/studentFeeAssignment';

import AssignmentMoneyInput from './AssignmentMoneyInput';

export default function VariableFeeChangeEditor({
  data,
  onClose,
  onSaved,
  onBusyChange,
  onDirtyChange,
}: {
  data: AssignmentDetails;
  onClose: () => void;
  onSaved: () => void;
  onBusyChange: (busy: boolean) => void;
  onDirtyChange: (dirty: boolean) => void;
}) {
  const heads = data.assignment.heads.filter((head) => head.canChangeVariableFee);
  const [headId, setHeadId] = useState(heads[0]?.feeHeadId ?? '');
  const head = heads.find((item) => item.feeHeadId === headId);
  const [dates, setDates] = useState<DateRange>([null, null]);
  const [rate, setRate] = useState<number | null>(null);
  const [reason, setReason] = useState('');
  const [error, setError] = useState('');
  const [discardOpen, setDiscardOpen] = useState(false);
  const [review, setReview] = useState<{
    input: VariableFeeChangeInput;
    result: VariableFeeChangeResult;
  }>();
  const pending = useRef(false);
  const editor = useRef<HTMLElement>(null);
  const stamp = useRef(data.concurrencyStamp);
  const [preview, previewState] = usePreviewVariableFeeChangeMutation();
  const [commit, commitState] = useCommitVariableFeeChangeMutation();
  const busy = previewState.isLoading || commitState.isLoading;
  const [start, end] = dates;
  const validRange =
    start?.isValid() && end?.isValid() && start.date() === 1 && !end.isBefore(start, 'day');
  const money = (value: number) => formatNumber(value, data.assignment.currency);
  const dirty = Boolean(review || rate != null || start || end || reason.trim());

  useEffect(() => {
    editor.current?.focus();
  }, []);
  useEffect(() => {
    onBusyChange(busy);
    return () => onBusyChange(false);
  }, [busy, onBusyChange]);
  useEffect(() => {
    onDirtyChange(dirty);
    return () => onDirtyChange(false);
  }, [dirty, onDirtyChange]);

  const submit = async () => {
    if (pending.current || !head || !start || !end || !validRange || rate == null || !reason.trim())
      return;
    pending.current = true;
    setError('');
    try {
      if (review) {
        await commit({ ...review.input, previewToken: review.result.previewToken }).unwrap();
        shikshaMitraToast.success({ message: 'Variable fee change saved.' });
        onSaved();
        return;
      }
      const input = {
        studentId: data.assignment.studentId,
        academicYearId: data.assignment.academicYearId,
        feeHeadId: head.feeHeadId,
        requestId: crypto.randomUUID(),
        concurrencyStamp: stamp.current,
        effectiveDate: start.format('YYYY-MM-DD'),
        serviceEndDate: end.format('YYYY-MM-DD'),
        monthlyRate: rate,
        reason: reason.trim(),
      };
      const result = await preview(input).unwrap();
      setReview({ input, result });
    } catch (issue) {
      const code = assignmentErrorCode(issue);
      const { detail } = parseApiProblemDetail(issue);
      setError(
        code.endsWith('StructureEditBlocked') && detail !== 'Something went wrong'
          ? detail
          : assignmentError(issue)
      );
    } finally {
      pending.current = false;
    }
  };

  const requestClose = () => {
    if (busy || pending.current) return;
    if (dirty) setDiscardOpen(true);
    else onClose();
  };
  const oldBySequence = new Map(
    review?.result.previousInstallments.map((row) => [row.sequence, row])
  );
  const newBySequence = new Map(review?.result.newInstallments.map((row) => [row.sequence, row]));
  const sequences = [...new Set([...oldBySequence.keys(), ...newBySequence.keys()])].sort(
    (a, b) => a - b
  );

  return (
    <Box ref={editor} component="section" aria-label="Edit variable fee" tabIndex={-1}>
      <DetailSection
        title={review ? 'Review fee change' : 'Edit variable fee'}
        icon="mdi:pencil-outline"
      >
        <FormBusyRegion busy={busy} label={review ? 'Saving…' : 'Previewing…'}>
          <Stack spacing={2}>
            {error && <Alert severity="error">{error}</Alert>}
            {review ? (
              <>
                <DetailField
                  label={head?.feeHeadName ?? 'Variable fee'}
                  value={`${fDate(review.input.effectiveDate)} – ${fDate(review.input.serviceEndDate)}`}
                />
                <Box
                  sx={{ display: 'grid', gap: 2, gridTemplateColumns: 'repeat(2, minmax(0, 1fr))' }}
                >
                  <DetailField
                    label="Previous amount"
                    value={money(review.result.previousAmount)}
                  />
                  <DetailField label="New amount" value={money(review.result.newAmount)} />
                </Box>
                <TableContainer>
                  <Table size="small" aria-label="Installments affected by the fee change">
                    <TableHead>
                      <TableRow>
                        <TableCell>Installment</TableCell>
                        <TableCell align="right">Previous</TableCell>
                        <TableCell align="right">New</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {sequences.map((sequence) => {
                        const before = oldBySequence.get(sequence);
                        const after = newBySequence.get(sequence);
                        return (
                          <TableRow key={sequence}>
                            <TableCell>
                              {after?.installmentLabel ?? before?.installmentLabel}
                            </TableCell>
                            <TableCell align="right">
                              {before ? money(before.proratedAmount) : '—'}
                            </TableCell>
                            <TableCell align="right">
                              {after ? money(after.proratedAmount) : '—'}
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </TableContainer>
              </>
            ) : (
              <>
                <CustomSelect
                  label="Variable fee"
                  name="variable-fee"
                  size="small"
                  required
                  value={headId}
                  options={heads.map(({ feeHeadId, feeHeadName }) => ({
                    value: feeHeadId,
                    label: feeHeadName,
                  }))}
                  onChange={(value) => {
                    setHeadId(String(value));
                    setDates([null, null]);
                    setRate(null);
                    setError('');
                  }}
                />
                {head?.effectiveAmount != null && head.amountBasis === 'MonthlyRate' && (
                  <DetailField label="Current monthly amount" value={money(head.effectiveAmount)} />
                )}
                <CustomDateRangePicker
                  label="Effective start – end date"
                  name="variable-fee-dates"
                  dateFormat="DD/MM/YYYY"
                  singleInput
                  calendars={2}
                  showShortcuts={false}
                  allowManualInput
                  minDate={dayjs().startOf('day')}
                  value={dates}
                  onChange={setDates}
                  error={Boolean(start && end && !validRange)}
                  helperText="Start on the first day of a month. Earlier installments keep their amounts."
                />
                <AssignmentMoneyInput
                  label="New monthly amount"
                  name="new-monthly-amount"
                  required
                  fullWidth
                  value={rate}
                  onAmountChange={setRate}
                />
                <TextField
                  label="Reason for change"
                  required
                  size="small"
                  multiline
                  minRows={2}
                  value={reason}
                  onChange={(event) => setReason(event.target.value)}
                  slotProps={{ htmlInput: { maxLength: 500 } }}
                />
              </>
            )}
          </Stack>
        </FormBusyRegion>
        <Stack direction="row" spacing={1} justifyContent="flex-end" flexWrap="wrap" useFlexGap>
          <Button
            type="button"
            size="small"
            variant="outlined"
            color="inherit"
            disabled={busy}
            startIcon={<Iconify icon={review ? 'mdi:arrow-left' : 'mdi:close'} />}
            onClick={
              review
                ? () => {
                    setReview(undefined);
                    setError('');
                  }
                : requestClose
            }
          >
            {review ? 'Back to fee fields' : 'Cancel fee edit'}
          </Button>
          <Button
            type="button"
            size="small"
            variant="contained"
            disabled={
              busy ||
              !validRange ||
              !head ||
              rate == null ||
              !reason.trim() ||
              Boolean(review && !review.result.previewToken)
            }
            startIcon={<Iconify icon={review ? 'mdi:check' : 'mdi:eye-outline'} />}
            onClick={submit}
          >
            {review ? 'Save fee change' : 'Preview fee change'}
          </Button>
        </Stack>
      </DetailSection>
      <ConfirmDialog
        open={discardOpen}
        onClose={() => setDiscardOpen(false)}
        title="Discard fee changes?"
        content="Your unsaved fee changes will be lost."
        action={
          <Button color="error" variant="contained" onClick={onClose}>
            Discard changes
          </Button>
        }
      />
    </Box>
  );
}
