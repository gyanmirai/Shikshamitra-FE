import type { CompensationRevision, ProtectionMigrationPreview } from 'src/redux/hr/compensation-revision-api';

import { toast } from 'sonner';
import { useState } from 'react';
import { formatCurrency } from 'src/utils/cureencyFormater';
import { parseApiProblemDetail } from 'src/utils/api-problem-details';
import { Box, Alert, Button, Typography, DialogActions } from '@mui/material';
import CustomDialog, { DialogScrollContent } from 'src/components/customDialog';
import { useApplyProtectionMigrationMutation, usePreviewProtectionMigrationMutation } from 'src/redux/hr/compensation-revision-api';

export default function SalaryProtectionMigration({ employeeId, source, effectiveMonth, onApplied }: {
  employeeId: string; source: CompensationRevision; effectiveMonth: string; onApplied?: (revision: CompensationRevision) => void;
}) {
  const [preview, previewState] = usePreviewProtectionMigrationMutation();
  const [apply, applyState] = useApplyProtectionMigrationMutation();
  const [result, setResult] = useState<ProtectionMigrationPreview | null>(null);
  const [error, setError] = useState('');
  const [open, setOpen] = useState(false);
  const [reviewedMonth, setReviewedMonth] = useState('');
  const busy = previewState.isLoading || applyState.isLoading;
  const review = async () => {
    setError(''); setResult(null); setOpen(true);
    const month = `${effectiveMonth}-01T00:00:00.000Z`;
    setReviewedMonth(month);
    try { setResult(await preview({ employeeId, sourceRevisionId: source.id, effectiveMonth: month }).unwrap()); }
    catch (failure) { setError(parseApiProblemDetail(failure).detail || 'Unable to preview this migration.'); }
  };
  return (
    <>
      <Alert severity="info" action={<Button disabled={busy} onClick={review}>Review migration</Button>}>
        This salary uses an earlier protection calculation. Review the impact for the selected effective month before migrating.
      </Alert>
      <CustomDialog open={open} title="Review salary protection migration" disableClose={busy} handleClose={() => { if (!busy) setOpen(false); }}>
        <DialogScrollContent>
          <Box display="grid" gap={2}>
            {busy && <Typography role="status">Calculating salary protection...</Typography>}
            {error && <Alert severity="error">{error}</Alert>}
            {result && <>
              <Typography>
                Effective month: {reviewedMonth.slice(0, 7)}. {result.preview.calculation.protectionPolicy === 'PROTECT_TAKE_HOME' ? 'Protect employee take-home' : 'Protect school cost (CTC)'}.
              </Typography>
              {[
                ['Gross', result.previousGross, result.preview.calculation.grossSalary],
                ['Net salary', result.previousNet, result.preview.calculation.netSalary],
                ['Employer cost', result.previousEmployerCost, result.preview.calculation.employerCost],
              ].map(([label, before, after]) => <Typography key={String(label)}>
                {label}: {formatCurrency(Number(before))} to {formatCurrency(Number(after))}
              </Typography>)}
              <Typography>Protected monthly target: {formatCurrency(result.preview.calculation.protectedMonthlyAmount)}</Typography>
              <Typography variant="body2">Applying creates a new salary revision and resets unlocked payroll reviews. Locked and paid payroll retain their saved amounts.</Typography>
            </>}
          </Box>
        </DialogScrollContent>
        <DialogActions>
          <Button disabled={busy} onClick={() => setOpen(false)}>Cancel</Button>
          <Button variant="contained" disabled={busy || !result} onClick={async () => {
            if (!result) return;
            setError('');
            try {
              const revision = await apply({ employeeId, sourceRevisionId: source.id, effectiveMonth: reviewedMonth, previewToken: result.preview.previewToken }).unwrap();
              onApplied?.(revision);
              toast.success('Salary protection migrated. Review the refreshed payroll.'); setOpen(false);
            } catch (failure) { setError(parseApiProblemDetail(failure).detail || 'Migration failed. Review a fresh preview before trying again.'); }
          }}>Apply migration</Button>
        </DialogActions>
      </CustomDialog>
    </>
  );
}
