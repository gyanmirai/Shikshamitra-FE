'use client';

import React from 'react';
import { useFormik } from 'formik';
import { GlobalIcons } from 'src/utils/icons';
import { Iconify } from 'src/components/iconify';
import { Scrollbar } from 'src/components/scrollbar';
import ShakingTextField from 'src/components/shaking-text-field';
import { Grid, Button, TextField, DialogActions } from '@mui/material';

import { checkInValidationSchema, checkOutValidationSchema } from '../validationSchema';

import type { ICheckInCheckOutDialogProps } from '../my-duties-interface';

const CheckInCheckOutDialog: React.FC<ICheckInCheckOutDialogProps> = ({
  isCheckIn,
  onClose,
  data,
}) => {
  const formik = useFormik({
    initialValues: {
      checkInNotes: data?.checkInNotes ?? '',
      checkOutNotes: data?.checkOutNotes ?? '',
    },
    validationSchema: !isCheckIn ? checkOutValidationSchema : checkInValidationSchema,
    onSubmit: (values) => {},
  });

  return (
    <form onSubmit={formik.handleSubmit}>
      <Scrollbar sx={{ p: 2, bgcolor: 'background.neutral', height: '100%' }}>
        <Grid container spacing={3}>
          {isCheckIn == null && (
            <Grid size={12} pb="10px">
              <ShakingTextField
                error={formik.touched.checkInNotes && Boolean(formik.errors.checkInNotes)}
              >
                <TextField
                  multiline
                  rows={4}
                  disabled
                  name="checkInNotes"
                  label="Check In Notes *"
                  value={formik.values.checkInNotes}
                  onChange={formik.handleChange}
                  size="small"
                  fullWidth
                  error={formik.touched.checkInNotes && Boolean(formik.errors.checkInNotes)}
                  helperText={formik.touched.checkInNotes && formik.errors.checkInNotes}
                />
              </ShakingTextField>
            </Grid>
          )}

          {isCheckIn == null && (
            <Grid size={12} pb="10px">
              <ShakingTextField
                error={formik.touched.checkOutNotes && Boolean(formik.errors.checkOutNotes)}
              >
                <TextField
                  multiline
                  rows={4}
                  disabled
                  name="checkOutNotes"
                  label="Check Out Notes *"
                  value={formik.values.checkOutNotes}
                  onChange={formik.handleChange}
                  size="small"
                  fullWidth
                  error={formik.touched.checkOutNotes && Boolean(formik.errors.checkOutNotes)}
                  helperText={formik.touched.checkOutNotes && formik.errors.checkOutNotes}
                />
              </ShakingTextField>
            </Grid>
          )}

          {isCheckIn && (
            <Grid size={12} pb="10px">
              <ShakingTextField
                error={formik.touched.checkInNotes && Boolean(formik.errors.checkInNotes)}
              >
                <TextField
                  multiline
                  rows={4}
                  name="checkInNotes"
                  label="Check In Notes *"
                  value={formik.values.checkInNotes}
                  onChange={formik.handleChange}
                  size="small"
                  fullWidth
                  error={formik.touched.checkInNotes && Boolean(formik.errors.checkInNotes)}
                  helperText={formik.touched.checkInNotes && formik.errors.checkInNotes}
                />
              </ShakingTextField>
            </Grid>
          )}

          {!isCheckIn && data === null && (
            <Grid size={12} pb="10px">
              <ShakingTextField
                error={formik.touched.checkOutNotes && Boolean(formik.errors.checkOutNotes)}
              >
                <TextField
                  multiline
                  rows={4}
                  name="checkOutNotes"
                  label="Check Out Notes *"
                  value={formik.values.checkOutNotes}
                  onChange={formik.handleChange}
                  size="small"
                  fullWidth
                  error={formik.touched.checkOutNotes && Boolean(formik.errors.checkOutNotes)}
                  helperText={formik.touched.checkOutNotes && formik.errors.checkOutNotes}
                />
              </ShakingTextField>
            </Grid>
          )}
        </Grid>
      </Scrollbar>

      <DialogActions>
        <Button
          startIcon={<Iconify icon={GlobalIcons.cancel} />}
          onClick={() => {
            onClose();
          }}
          variant="outlined"
        >
          Cancel
        </Button>
        {data == null && (
          <Button
            startIcon={<Iconify icon={GlobalIcons.submit} />}
            type="submit"
            variant="contained"
          >
            {isCheckIn ? 'Check In' : 'Check Out'}
          </Button>
        )}
      </DialogActions>
    </form>
  );
};

export default CheckInCheckOutDialog;
