import type {
  HouseStudent,
  HouseLeaderCommand,
} from 'src/redux/student/house-management/house-management-types';

import { useRef, useState } from 'react';
import { GlobalIcons } from 'src/utils/icons';
import { Iconify } from 'src/components/iconify';
import { shikshaMitraToast } from 'src/components/toast';
import { ConfirmDialog } from 'src/components/confirm-dialog';
import { LoadingButton } from 'src/components/loading-button';
import { StudentFeedback } from 'src/components/student-feedback';
import { Stack, Button, Skeleton, Typography } from '@mui/material';
import { parseApiProblemDetail } from 'src/utils/api-problem-details';
import { useGetManagedHousesQuery } from 'src/redux/student/house-management/house-management-api';

type Props = {
  academicMediumId: string;
  student: HouseStudent & { houseId: string };
  onClose: () => void;
  onSave: (command: HouseLeaderCommand) => Promise<void>;
};

export default function HouseRowLeaderDialog({
  academicMediumId,
  student,
  onClose,
  onSave,
}: Props) {
  const { houseId } = student;
  const houseQuery = useGetManagedHousesQuery(
    { academicMediumId, houseId, maxResultCount: 1 },
    { refetchOnMountOrArgChange: true }
  );
  const saving = useRef(false);
  const [busy, setBusy] = useState(false);
  const [refreshRequired, setRefreshRequired] = useState(false);
  const loading = houseQuery.isLoading || houseQuery.isFetching;
  const reviewed = houseQuery.currentData?.items.find((house) => house.id === houseId);
  const current = reviewed?.leader;
  const removing = student.isHouseLeader;
  const matchesCurrent = current?.enrollmentId === student.enrollmentId;
  const changed = refreshRequired || removing !== matchesCurrent;
  const allowed = Boolean(reviewed?.canManage && !changed && !loading && !houseQuery.isError);
  const title = removing
    ? 'Remove House Leader?'
    : current
      ? 'Replace House Leader?'
      : 'Assign House Leader?';

  const submit = async () => {
    if (!reviewed || !allowed || saving.current) return;
    saving.current = true;
    setBusy(true);
    try {
      await onSave({
        id: reviewed.id,
        academicMediumId,
        enrollmentId: removing ? null : student.enrollmentId,
        concurrencyStamp: reviewed.concurrencyStamp,
      });
      onClose();
    } catch (failure) {
      const problem = parseApiProblemDetail(failure);
      const stale =
        problem.errorCode === 'Students:HouseManagement:StalePreview' ||
        problem.errorCode === 'Students:HouseManagement:IneligibleLeader';
      setRefreshRequired(stale);
      shikshaMitraToast.error({
        message: stale
          ? 'The house appointment or membership changed. Refresh the student list and try again.'
          : problem.detail,
      });
    } finally {
      saving.current = false;
      setBusy(false);
    }
  };

  return (
    <ConfirmDialog
      open
      title={title}
      icon={removing || current ? 'warning' : 'info'}
      onClose={onClose}
      disableCancel={busy}
      bodyBusy={busy}
      busyLabel="Saving house leader…"
      content={
        <Stack spacing={1} sx={{ overflowWrap: 'anywhere' }}>
          {loading && (
            <Stack role="status" aria-label="Loading house leader" spacing={0.5}>
              <Skeleton width="55%" />
              <Skeleton width="85%" />
              <Skeleton width="75%" />
            </Stack>
          )}
          {houseQuery.isError && !loading && (
            <>
              <StudentFeedback
                notificationKey="house-leader-review-failed"
                scopeKey={houseId}
                severity="error"
                toastAction={
                  <Button size="small" color="inherit" onClick={() => houseQuery.refetch()}>
                    Retry
                  </Button>
                }
              >
                {parseApiProblemDetail(houseQuery.error).detail}
              </StudentFeedback>
              <Typography variant="body2" color="text.secondary">
                Review the current house leader before making a change.
              </Typography>
            </>
          )}
          {!loading && !houseQuery.isError && (
            <>
              <Typography variant="subtitle2">{reviewed?.name || student.houseName}</Typography>
              {!reviewed && (
                <Typography variant="body2" color="text.secondary">
                  This house is unavailable. Refresh the student list for the latest membership.
                </Typography>
              )}
              {reviewed && !reviewed.canManage && (
                <Typography variant="body2" color="text.secondary">
                  Full medium scope is required to change the house leader.
                </Typography>
              )}
              {reviewed?.canManage && (
                <>
                  <Typography variant="body2">
                    Current leader: {current?.studentName || 'Vacant'}
                  </Typography>
                  <Typography variant="body2" color={changed ? 'text.secondary' : 'text.primary'}>
                    {changed
                      ? 'The appointment has changed. Close this dialog and refresh the student list.'
                      : removing
                        ? 'The position will become vacant.'
                        : `New leader: ${student.studentName}`}
                  </Typography>
                </>
              )}
            </>
          )}
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
          onClick={submit}
        >
          {removing ? 'Remove leader' : current ? 'Replace leader' : 'Assign leader'}
        </LoadingButton>
      }
    />
  );
}
