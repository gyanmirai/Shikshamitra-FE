import type {
  House,
  HouseStudent,
  HouseDivision,
  HouseLeaderCommand,
} from 'src/redux/student/house-management/house-management-types';

import { useState } from 'react';
import { useFormik } from 'formik';
import { GlobalIcons } from 'src/utils/icons';
import { Iconify } from 'src/components/iconify';
import { ConfirmDialog } from 'src/components/confirm-dialog';
import { FormBusyRegion } from 'src/components/form-busy-region';
import { FormSectionCard } from 'src/components/form-section-card';
import { parseApiProblemDetail } from 'src/utils/api-problem-details';
import { Alert, Stack, Button, Typography, DialogActions } from '@mui/material';
import CustomDialog, { DialogScrollContent } from 'src/components/customDialog';

import { LeaderStudentPicker } from './house-pickers';
import { useHouseCloseGuard } from './use-house-close-guard';

type Props = {
  kind: 'house' | 'division';
  academicMediumId: string;
  record: House | HouseDivision;
  onSave: (command: HouseLeaderCommand) => Promise<void>;
  onClose: () => void;
};
export default function HouseLeaderDialog({
  kind,
  academicMediumId,
  record,
  onSave,
  onClose,
}: Props) {
  const [error, setError] = useState('');
  const [confirming, setConfirming] = useState(false);
  const [busy, setBusy] = useState(false);
  const title = kind === 'house' ? 'House Leader' : 'Division Leader';
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
    initialValues: { leader: record.leader },
    onSubmit: async (values) => {
      if (!form.dirty || busy) return;
      if (record.leader) setConfirming(true);
      else await save(values.leader);
    },
  });
  const { close, confirmation } = useHouseCloseGuard(form.dirty, busy, onClose);
  return (
    <>
      <CustomDialog
        open
        title={title}
        titleInfo={
          kind === 'house'
            ? 'Choose one leader from the current house members, or leave the position vacant.'
            : 'Choose one student enrolled in this division. House membership is not required.'
        }
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
                descriptionTooltip={
                  kind === 'house'
                    ? 'Moving or removing the house leader from this house clears their house leadership.'
                    : 'Division leadership is independent of house membership and house leadership.'
                }
              >
                <Typography variant="body2">
                  {kind === 'division' && 'standardName' in record
                    ? `${record.standardName} / `
                    : ''}
                  {record.name}
                </Typography>
                <LeaderStudentPicker
                  input={{
                    academicMediumId,
                    ...(kind === 'house' ? { houseId: record.id } : { divisionId: record.id }),
                  }}
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
          <Button
            size="small"
            type="submit"
            variant="contained"
            color="inherit"
            disabled={busy || !form.dirty}
            startIcon={<Iconify icon={GlobalIcons.submit} />}
          >
            Submit
          </Button>
        </DialogActions>
      </CustomDialog>
      <ConfirmDialog
        open={confirming}
        onClose={() => setConfirming(false)}
        title={`${form.values.leader ? 'Replace' : 'Remove'} ${title}?`}
        icon="warning"
        disableCancel={busy}
        bodyBusy={busy}
        content={`${record.leader?.studentName ?? ''} will no longer be the ${kind} leader. ${form.values.leader ? `${form.values.leader.studentName} will take this position.` : 'The position will be vacant.'}`}
        action={
          <Button
            size="small"
            variant="contained"
            color="inherit"
            disabled={busy}
            onClick={() => save(form.values.leader)}
            startIcon={<Iconify icon={GlobalIcons.submit} />}
          >
            Confirm change
          </Button>
        }
      />
      {confirmation}
    </>
  );
}
