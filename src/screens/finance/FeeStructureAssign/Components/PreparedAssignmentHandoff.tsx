import type { AssignmentContext, AssignmentRequest } from 'src/redux/finance/studentFeeAssignment';

import { useState, useEffect } from 'react';
import { Stack, Alert, Button } from '@mui/material';
import {
  assignmentError,
  useAssignmentCommitMutation,
  useAssignmentPreviewMutation,
} from 'src/redux/finance/studentFeeAssignment';

import AssignmentReview from './AssignmentReview';

export default function PreparedAssignmentHandoff({
  context,
  canAssign,
  onSaved,
  onBusyChange,
}: {
  context: AssignmentContext;
  canAssign: boolean;
  onSaved: () => void;
  onBusyChange?: (busy: boolean) => void;
}) {
  const [preview, previewState] = useAssignmentPreviewMutation();
  const [commit, commitState] = useAssignmentCommitMutation();
  const [error, setError] = useState('');
  const [running, setRunning] = useState(false);
  const busy = running || previewState.isLoading || commitState.isLoading;
  useEffect(() => {
    onBusyChange?.(Boolean(busy));
    return () => onBusyChange?.(false);
  }, [busy, onBusyChange]);
  if (!context.preparedAssignment || !context.structureId)
    return (
      <Alert severity="error">
        Prepared fee details are unavailable. Refresh to review the handoff.
      </Alert>
    );
  const complete = async () => {
    if (busy) return;
    setRunning(true);
    setError('');
    const input: AssignmentRequest = {
      studentId: context.studentId,
      academicYearId: context.academicYearId,
      standardFeeStructureId: context.structureId!,
      selectedOptionalFeeHeadIds: context.selectedOptionalFeeHeadIds,
      variableFeeHeads: context.variableFeeHeads,
      servicePeriods: [],
      feeHeadDetails: [],
    };
    try {
      const checked = await preview(input).unwrap();
      await commit({ ...input, previewToken: checked.previewToken }).unwrap();
      onSaved();
    } catch (failure) {
      setError(assignmentError(failure));
      onSaved(); // Refresh after an interrupted response or a concurrent completed handoff.
    } finally {
      setRunning(false);
    }
  };
  return (
    <Stack spacing={2} sx={{ p: 2, flex: 1, minHeight: 0, overflowY: 'auto' }}>
      <Alert severity="info">
        Fees were prepared in Admission. Complete the handoff to reuse these dues and payments.
      </Alert>
      {error && <Alert severity="error">{error}</Alert>}
      <AssignmentReview data={context.preparedAssignment} committed />
      {canAssign && (
        <Button variant="contained" disabled={busy} onClick={complete}>
          {busy ? 'Completing handoff…' : 'Complete handoff'}
        </Button>
      )}
    </Stack>
  );
}
