import type {
  HouseStudent,
  HouseDivision,
  HouseLeaderCommand,
} from 'src/redux/student/house-management/house-management-types';

import { useState } from 'react';
import { useFormik } from 'formik';
import { GlobalIcons } from 'src/utils/icons';
import { Iconify } from 'src/components/iconify';
import CustomSelect from 'src/components/custom-select';
import { ConfirmDialog } from 'src/components/confirm-dialog';
import { LoadingButton } from 'src/components/loading-button';
import { FormBusyRegion } from 'src/components/form-busy-region';
import { FormSectionCard } from 'src/components/form-section-card';
import { parseApiProblemDetail } from 'src/utils/api-problem-details';
import { Alert, Stack, Button, Typography, DialogActions } from '@mui/material';
import CustomDialog, { DialogScrollContent } from 'src/components/customDialog';

import { LeaderStudentPicker } from './house-pickers';
import { useHouseCloseGuard } from './use-house-close-guard';

type LeaderRole = 'house' | 'division';
const roles = [
  { value: 'house', label: 'House leader' },
  { value: 'division', label: 'Division leader' },
];

type Props = {
  academicMediumId: string;
  houseId?: string;
  record: HouseDivision;
  onSave: (role: LeaderRole, command: HouseLeaderCommand) => Promise<void>;
  onClose: () => void;
};
export default function HouseLeaderDialog({
  academicMediumId,
  houseId,
  record,
  onSave,
  onClose,
}: Props) {
  const [error, setError] = useState('');
  const [confirming, setConfirming] = useState(false);
  const [busy, setBusy] = useState(false);
  const [role, setRole] = useState<LeaderRole>('house');
  const isHouse = role === 'house';
  const title = isHouse ? 'House Leader' : 'Division Leader';
  const currentLeader = (isHouse ? record.houseLeader : record.leader) ?? null;
  const save = async (leader: HouseStudent | null) => {
    if (busy) return;
    setBusy(true);
    setError('');
    try {
      await onSave(role, {
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
  const { close, confirmation, requestNavigation } = useHouseCloseGuard(form.dirty, busy, onClose);
  return (
    <>
      <CustomDialog
        open
        title="Manage Leaders"
        titleInfo="Each division can have one house leader and one division leader. A student can hold both roles."
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
                  isHouse
                    ? 'Choose an active student in this division with a house. Moving them to another house clears their house leadership.'
                    : 'Choose an active student in this division. House membership is optional.'
                }
              >
                <Typography variant="body2">
                  {record.standardName} / {record.name}
                </Typography>
                <CustomSelect
                  label="Role"
                  options={roles}
                  value={role}
                  disabled={busy}
                  onChange={(nextRole) => {
                    if (nextRole === role || (nextRole !== 'house' && nextRole !== 'division')) return;
                    requestNavigation(() => {
                      setRole(nextRole);
                      form.resetForm({
                        values: {
                          leader: (nextRole === 'house' ? record.houseLeader : record.leader) ?? null,
                        },
                      });
                      setError('');
                    });
                  }}
                />
                {currentLeader && (
                  <Typography variant="body2" color="text.secondary">
                    Current leader: {currentLeader.studentName}
                    {isHouse && currentLeader.houseName ? ` · ${currentLeader.houseName}` : ''}
                  </Typography>
                )}
                <LeaderStudentPicker
                  input={{
                    academicMediumId,
                    divisionId: record.id,
                    ...(isHouse ? { assignedOnly: true, houseId } : {}),
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
        title={`${form.values.leader ? 'Replace' : 'Remove'} ${title}?`}
        icon="warning"
        disableCancel={busy}
        bodyBusy={busy}
        content={`${currentLeader?.studentName ?? ''} will no longer be the ${role} leader. ${form.values.leader ? `${form.values.leader.studentName} will take this position.` : 'The position will be vacant.'}`}
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
