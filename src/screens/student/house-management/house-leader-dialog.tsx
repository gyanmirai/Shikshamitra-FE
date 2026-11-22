import type {
  House,
  HouseStudent,
  HouseLeaderCommand,
} from 'src/redux/student/house-management/house-management-types';

import { useState } from 'react';
import { useFormik } from 'formik';
import { GlobalIcons } from 'src/utils/icons';
import { Iconify } from 'src/components/iconify';
import { ConfirmDialog } from 'src/components/confirm-dialog';
import { LoadingButton } from 'src/components/loading-button';
import { FormBusyRegion } from 'src/components/form-busy-region';
import { FormSectionCard } from 'src/components/form-section-card';
import { parseApiProblemDetail } from 'src/utils/api-problem-details';
import { Alert, Stack, Button, Typography, DialogActions } from '@mui/material';
import CustomDialog, { DialogScrollContent } from 'src/components/customDialog';

import { LeaderStudentPicker } from './house-pickers';
import { useHouseCloseGuard } from './use-house-close-guard';

type Props = {
  academicMediumId: string;
  record: House;
  onSave: (command: HouseLeaderCommand) => Promise<void>;
  onClose: () => void;
};
export default function HouseLeaderDialog({ academicMediumId, record, onSave, onClose }: Props) {
  const [error, setError] = useState('');
  const [confirming, setConfirming] = useState(false);
  const [busy, setBusy] = useState(false);
  const currentLeader = record.leader ?? null;
  const save = async (leader: HouseStudent | null) => {
    if (busy) return;
    setBusy(true);
    setError('');
    try {
      await onSave({
        id: record.id,
        academicMediumId,
        enrollmentId: leader?.enrollmentId ?? null,
        concurrencyStamp: record.concurrencyStamp,
      });
      onClose();
    } catch (failure) {
      setConfirming(false);
      setError(parseApiProblemDetail(failure).detail);
    } finally {
      setBusy(false);
    }
  };
  const form = useFormik<{ leader: HouseStudent | null }>({
    initialValues: { leader: currentLeader },
    onSubmit: async (values) => {
      if (!form.dirty || busy) return;
      if (currentLeader) setConfirming(true);
      else await save(values.leader);
    },
  });
  const { close, confirmation } = useHouseCloseGuard(form.dirty, busy, onClose);
  return (
    <>
      <CustomDialog
        open
        title="Manage House Leader"
        titleInfo="Each house has one leader. Choose a current house member or leave the role vacant."
        handleClose={close}
        guardUnsavedChanges={false}
        disableClose={busy}
        formProps={{
          onSubmit: (event) => {
            event.preventDefault();
            event.stopPropagation();
            form.handleSubmit();
          },
          noValidate: true,
        }}
      >
        <DialogScrollContent>
          <FormBusyRegion busy={busy}>
            <Stack spacing={2}>
              {error && <Alert severity="error">{error}</Alert>}
              <FormSectionCard
                title="Leader Appointment"
                icon={GlobalIcons.admissionStudent}
                descriptionTooltip="Choose an active member of this house. Leaving the house clears this appointment."
              >
                <Typography variant="body2">{record.name}</Typography>
                {currentLeader && (
                  <Typography variant="body2" color="text.secondary">
                    Current leader: {currentLeader.studentName}
                  </Typography>
                )}
                <LeaderStudentPicker
                  input={{ academicMediumId, houseId: record.id }}
                  value={form.values.leader}
                  onChange={(student) => form.setFieldValue('leader', student)}
                  disabled={busy}
                />
              </FormSectionCard>
            </Stack>
          </FormBusyRegion>
        </DialogScrollContent>
        <DialogActions>
          <Button
            size="small"
            variant="outlined"
            color="inherit"
            disabled={busy}
            onClick={close}
            startIcon={<Iconify icon={GlobalIcons.cancel} />}
          >
            Cancel
          </Button>
          <LoadingButton
            size="small"
            type="submit"
            variant="contained"
            color="inherit"
            loading={busy}
            disabled={!form.dirty}
            startIcon={<Iconify icon={GlobalIcons.submit} />}
          >
            Submit
          </LoadingButton>
        </DialogActions>
      </CustomDialog>
      <ConfirmDialog
        open={confirming}
        onClose={() => setConfirming(false)}
        title={form.values.leader ? 'Replace House Leader?' : 'Remove House Leader?'}
        icon="warning"
        disableCancel={busy}
        bodyBusy={busy}
        content={`${currentLeader?.studentName ?? ''} will no longer be the house leader. ${form.values.leader ? `${form.values.leader.studentName} will take this position.` : 'The position will be vacant.'}`}
        action={
          <LoadingButton
            size="small"
            variant="contained"
            color="inherit"
            loading={busy}
            onClick={() => save(form.values.leader)}
            startIcon={<Iconify icon={GlobalIcons.submit} />}
          >
            Confirm change
          </LoadingButton>
        }
      />
      {confirmation}
    </>
  );
}
