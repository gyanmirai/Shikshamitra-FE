'use client';

import type { UseBooleanReturn } from 'src/hooks/use-boolean';

import React from 'react';
import * as Yup from 'yup';
import { useFormik } from 'formik';

import { Grid, Button, TextField, DialogActions } from '@mui/material';

import { GlobalIcons } from 'src/utils/icons';

import { Iconify } from 'src/components/iconify';
import { shikshaMitraToast } from 'src/components/toast';
import ShakingTextField from 'src/components/shaking-text-field';
import { DialogScrollContent } from 'src/components/customDialog';
import { BackPopUpChecked } from 'src/components/back-popup-check/BackPopUpCheck';

import type { IRoomType } from '../types';

interface IRoomTypeFormProps {
  open: UseBooleanReturn;
  onClose: (_e: any, isSubmit?: boolean) => void;
  editData: IRoomType | null;
}

const RoomTypeForm: React.FC<IRoomTypeFormProps> = ({ open, onClose, editData }) => {
  const formik = useFormik({
    initialValues: {
      roomType: editData?.roomType || '',
      shortName: editData?.shortName || '',
    },
    validationSchema: Yup.object().shape({
      roomType: Yup.string().required('Room Type is required'),
      shortName: Yup.string().required('Short Name is required'),
    }),
    onSubmit: (values) => {
      shikshaMitraToast.success({
        message: `Room type ${values.roomType} ${editData ? 'updated' : 'added'} successfully`,
      });
      onClose(null, true);
    },
  });

  return (
    <BackPopUpChecked initialValues={formik.initialValues} currentValues={formik.values}>
      <DialogScrollContent>
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <ShakingTextField error={!!(formik.touched.roomType && formik.errors.roomType)}>
              <TextField
                fullWidth
                size="small"
                name="roomType"
                label="Room Type *"
                value={formik.values.roomType}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={formik.touched.roomType && Boolean(formik.errors.roomType)}
                helperText={formik.touched.roomType && formik.errors.roomType}
              />
            </ShakingTextField>
          </Grid>
          <Grid item xs={12}>
            <ShakingTextField error={!!(formik.touched.shortName && formik.errors.shortName)}>
              <TextField
                fullWidth
                size="small"
                name="shortName"
                label="Short Name *"
                value={formik.values.shortName}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={formik.touched.shortName && Boolean(formik.errors.shortName)}
                helperText={formik.touched.shortName && formik.errors.shortName}
              />
            </ShakingTextField>
          </Grid>
        </Grid>
      </DialogScrollContent>

      <DialogActions sx={{ p: 2, boxShadow: 'var(--shadows-10)' }}>
        <Button
          startIcon={<Iconify icon={GlobalIcons.cancel} />}
          variant="outlined"
          size="small"
          onClick={() => onClose(null, false)}
        >
          Cancel
        </Button>
        <Button
          startIcon={
            <Iconify
              icon={editData ? GlobalIcons.edit : GlobalIcons.submit}
              width={editData ? 16 : 20}
              height={editData ? 16 : 20}
            />
          }
          variant="contained"
          size="small"
          onClick={(e: any) => formik.handleSubmit(e)}
        >
          {editData ? 'Update' : 'Submit'}
        </Button>
      </DialogActions>
    </BackPopUpChecked>
  );
};

export default RoomTypeForm;
