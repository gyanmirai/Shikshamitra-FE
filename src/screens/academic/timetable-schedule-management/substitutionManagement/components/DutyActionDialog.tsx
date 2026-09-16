import { LoadingButton } from '@mui/lab';
import { GlobalIcons } from 'src/utils/icons';
import { Iconify } from 'src/components/iconify';
import CustomTooltip from 'src/components/custom-tooltip';
import { Box, Button, TextField, DialogActions } from '@mui/material';
import CustomDialog, { DialogScrollContent } from 'src/components/customDialog';

import { DUTY_ACTION_REASON_MIN_LENGTH } from '../services/duty-actions';

import type { useTeacherDutyActions } from '../hooks/use-teacher-duty-actions';

export function DutyActionDialog({
  controller,
}: {
  controller: ReturnType<typeof useTeacherDutyActions>;
}) {
  const { payload, note, setNote, isSubmitting, close, submit } = controller;
  const action = payload?.action;
  const isAccept = action === 'accept';
  const isReject = action === 'reject';
  const title = isAccept ? 'Accept Duty' : isReject ? 'Reject Duty' : 'Request Change / Transfer';

  return (
    <CustomDialog
      open={!!payload}
      handleClose={close}
      disableClose={isSubmitting}
      maxWidth="xs"
      title={
        <Box component="span" display="flex" alignItems="center" gap={1}>
          <Box component="span">{title}</Box>
          <CustomTooltip
            arrow
            placement="right"
            title={
              isAccept
                ? 'Accept this substitution duty and optionally add a note.'
                : isReject
                  ? 'Reject this substitution duty by providing a reason.'
                  : 'Request a change or transfer by providing a reason.'
            }
          >
            <Iconify
              icon={GlobalIcons.info}
              color="info.main"
              width={16}
              height={16}
              sx={{ cursor: 'pointer' }}
            />
          </CustomTooltip>
        </Box>
      }
    >
      <DialogScrollContent onSubmit={submit}>
        <TextField
          autoFocus
          fullWidth
          multiline
          size="small"
          minRows={3}
          maxRows={5}
          disabled={isSubmitting}
          placeholder={isAccept ? 'Add a note (optional)…' : 'Enter your reason…'}
          value={note}
          onChange={(event) => setNote(event.target.value)}
          helperText={
            isAccept ? 'Optional' : `Minimum ${DUTY_ACTION_REASON_MIN_LENGTH} characters required`
          }
        />
      </DialogScrollContent>
      <DialogActions sx={{ p: 2, boxShadow: 'var(--shadows-10)' }}>
        <Button
          size="small"
          variant="outlined"
          disabled={isSubmitting}
          startIcon={<Iconify icon={GlobalIcons.cancel} width={16} />}
          onClick={close}
        >
          Cancel
        </Button>
        <LoadingButton
          size="small"
          variant="contained"
          color={isAccept ? 'success' : isReject ? 'error' : 'warning'}
          disabled={!payload || (!isAccept && note.trim().length < DUTY_ACTION_REASON_MIN_LENGTH)}
          loading={isSubmitting}
          onClick={submit}
          startIcon={
            <Iconify
              icon={isAccept ? 'mdi:check' : isReject ? 'mdi:close' : 'mdi:swap-horizontal'}
              width={16}
            />
          }
        >
          {isAccept ? 'Accept Duty' : isReject ? 'Reject Duty' : 'Request Change'}
        </LoadingButton>
      </DialogActions>
    </CustomDialog>
  );
}
