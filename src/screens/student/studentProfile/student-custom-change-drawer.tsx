import type { StudentRecordDetails } from 'src/redux/student/records/student-record-details-api';

import { useId, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Iconify } from 'src/components/iconify';
import { Scrollbar } from 'src/components/scrollbar';
import { studentPaths } from 'src/constants/student-menu';
import { StudentFeedback } from 'src/components/student-feedback';
import { useUnsavedNavigation } from 'src/hooks/use-unsaved-navigation';
import { useGetStudentRecordSnapshotQuery } from 'src/redux/student/records/student-record-changes-api';
import {
  Box,
  Stack,
  Drawer,
  Button,
  Divider,
  Skeleton,
  Typography,
  IconButton,
} from '@mui/material';

import { CustomRecordChangeForm } from './custom-record-change-form';

export function StudentCustomChangeDrawer({
  studentId,
  details,
  onClose,
}: {
  studentId: string;
  details: StudentRecordDetails;
  onClose: () => void;
}) {
  const titleId = useId();
  const formId = useId();
  const router = useRouter();
  const [dirty, setDirty] = useState(false);
  const [busy, setBusy] = useState(false);
  const [formReady, setFormReady] = useState(false);
  const [canSubmit, setCanSubmit] = useState(false);
  const guard = useUnsavedNavigation(dirty, {
    push: router.push,
    blockNavigation: busy,
    title: 'Discard unsaved changes?',
    description: 'Your unsaved school details will be discarded.',
  });
  const snapshot = useGetStudentRecordSnapshotQuery(
    { studentId, section: 'custom-details' },
    { refetchOnMountOrArgChange: true }
  );
  const close = () => guard.requestNavigation(onClose);
  const errorStatus =
    snapshot.error && typeof snapshot.error === 'object' && 'status' in snapshot.error
      ? snapshot.error.status
      : undefined;
  const accessDenied = errorStatus === 401 || errorStatus === 403 || details.customDetailsMasked;
  return (
    <>
      <Drawer
        anchor="right"
        open
        onClose={close}
        slotProps={{
          paper: {
            role: 'dialog',
            'aria-modal': true,
            'aria-labelledby': titleId,
            sx: {
              width: { xs: 1, sm: 720 },
              maxWidth: 1,
              display: 'flex',
              flexDirection: 'column',
              overflow: 'hidden',
            },
          },
        }}
      >
        <Stack direction="row" alignItems="center" sx={{ p: 2 }}>
          <Typography id={titleId} variant="h6" sx={{ flex: 1 }}>
            Request school details change
          </Typography>
          <IconButton disabled={busy} aria-label="Close school details change" onClick={close}>
            <Iconify icon="mdi:close" />
          </IconButton>
        </Stack>
        <Divider />
        <Scrollbar sx={{ flex: 1, minHeight: 0 }}>
          <Box sx={{ p: 2 }}>
            {accessDenied ? (
              <StudentFeedback notificationKey="STU-0753" presentation="inline" severity="info">
                School details are no longer available with your current access.
              </StudentFeedback>
            ) : snapshot.isLoading || (snapshot.isFetching && !formReady) ? (
              <Stack spacing={2} aria-label="Loading current school details">
                <Skeleton height={60} />
                <Skeleton height={160} />
                <Skeleton height={100} />
              </Stack>
            ) : snapshot.isError && !formReady ? (
              <StudentFeedback
                notificationKey="STU-0754"
                presentation="toast"
                severity="error"
                action={<Button onClick={() => snapshot.refetch()}>Retry</Button>}
              >
                Current school details could not be loaded. Retry before making a change.
              </StudentFeedback>
            ) : (
              snapshot.currentData && (
                <CustomRecordChangeForm
                  studentId={studentId}
                  snapshot={snapshot.currentData}
                  details={details}
                  formId={formId}
                  hideSubmit
                  onCanSubmitChange={setCanSubmit}
                  onDirtyChange={setDirty}
                  onReady={() => setFormReady(true)}
                  onBusyChange={setBusy}
                  onSubmitted={(id) => {
                    setDirty(false);
                    onClose();
                    router.push(
                      `${studentPaths.records.changes}?student=${encodeURIComponent(
                        studentId
                      )}&request=${encodeURIComponent(id)}`
                    );
                  }}
                />
              )
            )}
          </Box>
        </Scrollbar>
        <Divider />
        <Stack direction="row" justifyContent="flex-end" spacing={1} sx={{ p: 2 }}>
          <Button disabled={busy} variant="outlined" onClick={close}>
            Cancel
          </Button>
          <Button
            type="submit"
            form={formId}
            variant="contained"
            loading={busy}
            disabled={!canSubmit || accessDenied}
          >
            Submit
          </Button>
        </Stack>
      </Drawer>
      {guard.confirmation}
    </>
  );
}
