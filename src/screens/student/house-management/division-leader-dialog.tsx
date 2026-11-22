import type {
  HouseStudent,
  HouseDivision,
  HouseLeaderCommand,
} from 'src/redux/student/house-management/house-management-types';

import { useState, useEffect } from 'react';
import { GlobalIcons } from 'src/utils/icons';
import { Iconify } from 'src/components/iconify';
import { ConfirmDialog } from 'src/components/confirm-dialog';
import { LoadingButton } from 'src/components/loading-button';
import { parseApiProblemDetail } from 'src/utils/api-problem-details';
import { Alert, Stack, Button, Typography, LinearProgress } from '@mui/material';
import { useLazyGetHouseDivisionsQuery } from 'src/redux/student/house-management/house-management-api';

type Props = {
  academicMediumId: string;
  student: HouseStudent & { divisionId: string };
  onClose: () => void;
  onSave: (command: HouseLeaderCommand) => Promise<void>;
};

export default function DivisionLeaderDialog({
  academicMediumId,
  student,
  onClose,
  onSave,
}: Props) {
  const { divisionId } = student;
  const [loadDivision] = useLazyGetHouseDivisionsQuery();
  const [reviewed, setReviewed] = useState<HouseDivision | null>();
  const [lookupError, setLookupError] = useState('');
  const [attempt, setAttempt] = useState(0);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  useEffect(() => {
    let active = true;
    const load = async () => {
      try {
        // Review the server response for this opening, even if the prior lookup is cached.
        const result = await loadDivision({ academicMediumId, divisionId, maxResultCount: 1 }, false).unwrap();
        if (active) setReviewed(result.items.find((item) => item.id === divisionId) ?? null);
      } catch (failure) {
        if (active) setLookupError(parseApiProblemDetail(failure).detail);
      }
    };
    load();
    return () => {
      active = false;
    };
  }, [academicMediumId, divisionId, attempt, loadDivision]);

  const removing = student.isDivisionLeader;
  const current = reviewed?.leader;
  const matchesCurrent = current?.enrollmentId === student.enrollmentId;
  const allowed = Boolean(reviewed?.canManage && removing === matchesCurrent);
  const title = removing
    ? 'Remove Division Leader?'
    : current
      ? 'Replace Division Leader?'
      : 'Assign Division Leader?';

  return (
    <ConfirmDialog
      open
      title={title}
      icon={removing || current ? 'warning' : 'info'}
      onClose={onClose}
      disableCancel={busy}
      bodyBusy={busy}
      content={
        <Stack spacing={1}>
          {reviewed === undefined &&
            (lookupError ? (
              <Alert
                severity="error"
                action={
                  <Button
                    size="small"
                    color="inherit"
                    onClick={() => {
                      setLookupError('');
                      setAttempt((previous) => previous + 1);
                    }}
                  >
                    Retry
                  </Button>
                }
              >
                {lookupError}
              </Alert>
            ) : (
              <LinearProgress aria-label="Loading division leader" />
            ))}
          {reviewed !== undefined && !reviewed?.canManage && (
            <Alert severity="warning">Full division scope is required to change the leader.</Alert>
          )}
          {reviewed?.canManage && (
            <>
              <Typography variant="subtitle2">
                {reviewed.standardName} / {reviewed.name}
              </Typography>
              <Typography variant="body2">
                Current leader: {current?.studentName ?? 'Vacant'}
              </Typography>
              {allowed ? (
                <Typography variant="body2">
                  {removing
                    ? 'The position will become vacant.'
                    : `New leader: ${student.studentName}`}
                </Typography>
              ) : (
                <Alert severity="info">
                  The appointment has changed. Close this dialog and refresh the student list.
                </Alert>
              )}
            </>
          )}
          {error && <Alert severity="error">{error}</Alert>}
        </Stack>
      }
      action={
        <LoadingButton
          size="small"
          variant="contained"
          color="inherit"
          loading={busy}
          disabled={!allowed}
          startIcon={<Iconify icon={removing ? GlobalIcons.delete : GlobalIcons.submit} />}
          onClick={async () => {
            if (!reviewed || !allowed || busy) return;
            setBusy(true);
            setError('');
            try {
              await onSave({
                id: divisionId,
                academicMediumId,
                enrollmentId: removing ? null : student.enrollmentId,
                concurrencyStamp: reviewed.concurrencyStamp,
              });
              onClose();
            } catch (failure) {
              setError(parseApiProblemDetail(failure).detail);
            } finally {
              setBusy(false);
            }
          }}
        >
          {removing ? 'Remove leader' : 'Confirm assignment'}
        </LoadingButton>
      }
    />
  );
}
