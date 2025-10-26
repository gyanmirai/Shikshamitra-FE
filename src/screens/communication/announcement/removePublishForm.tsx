import React from 'react';
import * as Yup from 'yup';
import { useFormik } from 'formik';
import { GlobalIcons } from 'src/utils/icons';
import { Iconify } from 'src/components/iconify';
import ShakingTextField from 'src/components/shaking-text-field';
import { DialogScrollContent } from 'src/components/customDialog';
import { Grid, Button, TextField, DialogActions } from '@mui/material';
import { BackPopUpChecked } from 'src/components/back-popup-check/BackPopUpCheck';

interface IAnnouncementRemoveReasonFormProps {
  onClose: (e: any, isSubmit: boolean) => void;
}

const AnnouncementRemoveReasonForm = ({ onClose }: IAnnouncementRemoveReasonFormProps) => {
  const formik = useFormik({
    initialValues: {
      reason: '',
    },
    validationSchema: Yup.object().shape({
      reason: Yup.string().required('Reason is required'),
    }),
    onSubmit: (values) => {
      onClose(null, true);
    },
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
                onChange={(e) => {
                  formik.setFieldValue('reason', e.target.value);
                  formik.setFieldTouched('reason', true);
                }}
                error={formik.touched.reason && Boolean(formik.errors.reason)}
                helperText={formik.touched.reason && formik.errors.reason}
              />
            </ShakingTextField>
          </Grid>
        </Grid>
      </DialogScrollContent>

      <DialogActions sx={{ p: 2, boxShadow: 'var(--shadows-10)' }}>
        <Button
          onClick={() => onClose(null, false)}
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
          onClick={(e: any) => {
            e.preventDefault();
            formik.handleSubmit(e);
          }}
        >
          Remove
        </Button>
      </DialogActions>
    </BackPopUpChecked>
  );
};

export default AnnouncementRemoveReasonForm;
