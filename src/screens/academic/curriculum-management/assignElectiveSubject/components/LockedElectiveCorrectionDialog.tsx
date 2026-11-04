import { useState } from 'react';
import { GlobalIcons } from 'src/utils/icons';
import { Iconify } from 'src/components/iconify';
import { ConfirmDialog } from 'src/components/confirm-dialog';
import { FormSectionCard } from 'src/components/form-section-card';
import CustomDialog, { DialogScrollContent } from 'src/components/customDialog';
import { Alert, Stack, Button, MenuItem, TextField, Typography, DialogActions } from '@mui/material';

import LockedElectiveImpactReview from './LockedElectiveImpactReview';
import useLockedElectiveCorrection from '../hooks/useLockedElectiveCorrection';

import type { StudentElectiveRow } from '../types';
import type { CorrectionContext } from '../hooks/useLockedElectiveCorrection';

export default function LockedElectiveCorrectionDialog({ student, context, onClose, onSaved }: {
  student: StudentElectiveRow; context: CorrectionContext; onClose: () => void; onSaved: () => void;
}) {
  const state = useLockedElectiveCorrection(context, student.studentId, student.selectedSubjectId ?? '', onSaved);
  const { form, review, isBusy } = state;
  const [discardOpen, setDiscardOpen] = useState(false);
  const requestClose = () => {
    if (isBusy) return;
    if (form.dirty) setDiscardOpen(true);
    else onClose();
  };
  return (
    <>
    <CustomDialog open={!discardOpen} handleClose={requestClose} title={review ? 'Review Locked Elective Change' : 'Change Locked Elective'}
      titleInfo="Administrators can correct a locked subject or preference after reviewing the effects. The assignment remains locked."
      maxWidth="sm" hasForm={!review} formProps={{ onSubmit: (event) => { event.preventDefault(); form.submitForm(); } }} disableClose={isBusy}
      guardUnsavedChanges={false}>
      <DialogScrollContent sx={{ p: { xs: 2, sm: 2.5 } }}>
        <Stack spacing={2}>
          <Typography variant="subtitle1">{student.studentName} · Roll No. {student.rollNo}</Typography>
          {state.error && <Alert severity="error" role="alert">{state.error}</Alert>}
          {review ? <LockedElectiveImpactReview review={review} /> : (
            <FormSectionCard title="Elective Details" descriptionTooltip="Choose a subject, a preference correction, or both. Original student submissions are retained.">
              <TextField select fullWidth required size="small" label="Assigned subject" name="selectedSubjectId"
                value={form.values.selectedSubjectId} onChange={form.handleChange} onBlur={form.handleBlur} disabled={isBusy}
                error={!!form.touched.selectedSubjectId && !!form.errors.selectedSubjectId} helperText={form.touched.selectedSubjectId && form.errors.selectedSubjectId}>
                {student.selectableSubjects.map((option) => <MenuItem key={option.subjectId} value={option.subjectId}>{option.subjectName}</MenuItem>)}
              </TextField>
              <TextField select fullWidth size="small" label="Preference correction" name="preferredSubjectId"
                value={form.values.preferredSubjectId} onChange={form.handleChange} disabled={isBusy}
                helperText={`Current preference: ${student.studentPreference || 'No preference'}`}>
                <MenuItem value="">Keep current preference</MenuItem>
                {student.selectableSubjects.map((option) => <MenuItem key={option.subjectId} value={option.subjectId}>{option.subjectName}</MenuItem>)}
              </TextField>
              <TextField fullWidth multiline minRows={2} size="small" label="Reason (optional)" name="reason"
                value={form.values.reason} onChange={form.handleChange} onBlur={form.handleBlur} disabled={isBusy}
                error={!!form.touched.reason && !!form.errors.reason} helperText={form.touched.reason && form.errors.reason}
                inputProps={{ maxLength: 1000 }} />
            </FormSectionCard>
          )}
        </Stack>
      </DialogScrollContent>
      <DialogActions>
        <Button type="button" variant="outlined" color="inherit" size="small" disabled={isBusy}
          startIcon={<Iconify icon={GlobalIcons.cancel} />} onClick={review ? state.backToEdit : requestClose}>
          {review ? 'Keep editing' : 'Cancel'}
        </Button>
        <Button type={review ? 'button' : 'submit'} variant="contained" size="small" loading={isBusy}
          disabled={!state.hasChanges} onClick={review ? state.confirmChanges : undefined}
          startIcon={<Iconify icon={GlobalIcons.submit} />}>
          {review ? 'Confirm changes' : 'Review changes'}
        </Button>
      </DialogActions>
    </CustomDialog>
    <ConfirmDialog open={discardOpen} onClose={() => setDiscardOpen(false)} title="Discard Unsaved Changes?"
      content="Your elective correction has not been saved. Discard it or keep editing."
      cancelText="Keep editing" disableBackdropClick
      action={<Button variant="contained" color="error" onClick={onClose}>Discard changes</Button>} />
    </>
  );
}
