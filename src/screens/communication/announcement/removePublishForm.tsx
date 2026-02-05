import React, { memo } from 'react';
import { GlobalIcons } from 'src/utils/icons';
import { Iconify } from 'src/components/iconify';
import ShakingTextField from 'src/components/shaking-text-field';
import { DialogScrollContent } from 'src/components/customDialog';
import { Grid, Button, TextField, DialogActions } from '@mui/material';
import { BackPopUpChecked } from 'src/components/back-popup-check/BackPopUpCheck';

import { useRemoveReasonForm } from './hooks/useRemoveReasonForm';

interface IAnnouncementRemoveReasonFormProps {
  onClose: (e: any, isSubmit: boolean) => void;
}

/**
 * AnnouncementRemoveReasonForm Component
 * Renders a form to capture the reason for removing an announcement.
 *
 * Memoization Justification:
 * Component is pure and mostly static UI. Renders are controlled via useRemoveReasonForm hook.
 * Re-renders are only necessary when error states change.
 */
const AnnouncementRemoveReasonForm = memo(({ onClose }: IAnnouncementRemoveReasonFormProps) => {
  const { formik, handleCancel, handleReasonChange, handleSubmit } = useRemoveReasonForm({
    onClose,
  });

  return (
    <BackPopUpChecked initialValues={formik.initialValues} currentValues={formik.values}>
      <DialogScrollContent>
        <Grid container spacing={2} sx={{ mb: 2 }}>
          <Grid size={12}>
            <ShakingTextField error={!!(formik.touched.reason && formik.errors.reason)}>
              <TextField
                fullWidth
                label="Reason *"
                name="reason"
                size="small"
                multiline
                rows={3}
                value={formik.values.reason}
                onChange={handleReasonChange}
                error={formik.touched.reason && Boolean(formik.errors.reason)}
                helperText={formik.touched.reason && formik.errors.reason}
              />
            </ShakingTextField>
          </Grid>
        </Grid>
      </DialogScrollContent>

      <DialogActions sx={{ p: 2, boxShadow: 'var(--shadows-10)' }}>
        <Button
          onClick={handleCancel}
          variant="outlined"
          size="small"
          startIcon={<Iconify icon={GlobalIcons.cancel} />}
        >
          Cancel
        </Button>

        <Button
          variant="contained"
          color="error"
          size="small"
          startIcon={<Iconify icon={GlobalIcons.delete} />}
          onClick={handleSubmit}
        >
          Remove
        </Button>
      </DialogActions>
    </BackPopUpChecked>
  );
});

AnnouncementRemoveReasonForm.displayName = 'AnnouncementRemoveReasonForm';

export default AnnouncementRemoveReasonForm;
