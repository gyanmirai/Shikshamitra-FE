'use client';

import type { UseBooleanReturn } from 'src/hooks/use-boolean';

import React from 'react';
import * as Yup from 'yup';
import { useFormik } from 'formik';
import { LoadingButton } from '@mui/lab';
import { GlobalIcons } from 'src/utils/icons';
import { Iconify } from 'src/components/iconify';
import { shikshaMitraToast } from 'src/components/toast';
import ShakingTextField from 'src/components/shaking-text-field';
import { DialogScrollContent } from 'src/components/customDialog';
import useQueryAndMutation from 'src/redux/customQueryAndMutation';
import { Grid, Button, TextField, DialogActions } from '@mui/material';
import { BackPopUpChecked } from 'src/components/back-popup-check/BackPopUpCheck';
import {
  useAddRoomTypeMutation,
  useUpdateRoomTypeMutation,
} from 'src/redux/InstituteSetup/RoomTypeApi/roomTypeApi';

import type { IRoomType } from '../types';

interface IRoomTypeFormProps {
  open: UseBooleanReturn;
  onClose: (_e: any, isSubmit?: boolean) => void;
  editData: IRoomType | null;
}

const RoomTypeForm: React.FC<IRoomTypeFormProps> = ({ open, onClose, editData }) => {
  const [addRoomType, { isLoading }] = useQueryAndMutation({
    type: 'mutation',
    currentQueryAndMutation: useAddRoomTypeMutation,
  });
  const [updateRoomType, { isLoading: isUpdateLoading }] = useQueryAndMutation({
    type: 'mutation',
    currentQueryAndMutation: useUpdateRoomTypeMutation,
  });
  const formik = useFormik({
    initialValues: {
      roomTypeName: editData?.roomTypeName || '',
      shortName: editData?.shortName || '',
    },
    validationSchema: Yup.object().shape({
      roomTypeName: Yup.string().required('Room Type is required'),
      shortName: Yup.string().required('Short Name is required'),
    }),
    onSubmit: (values) => {
      if (editData) {
        updateRoomType({
          id: editData.id,
          body: {
            roomTypeName: values.roomTypeName,
            shortName: values.shortName,
          },
        });
        shikshaMitraToast.success({
          message: `"${values.roomTypeName}" Room type updated successfully`,
        });
        onClose(null, true);
        return;
      }
      addRoomType({
        roomTypeName: values.roomTypeName,
        shortName: values.shortName,
      });
      shikshaMitraToast.success({
        message: `"${values.roomTypeName}" Room type added successfully`,
      });
      onClose(null, true);
    },
  });

  return (
    <BackPopUpChecked initialValues={formik.initialValues} currentValues={formik.values}>
      <DialogScrollContent>
        <Grid container spacing={3}>
          <Grid size={12}>
            <ShakingTextField error={!!(formik.touched.roomTypeName && formik.errors.roomTypeName)}>
              <TextField
                fullWidth
                size="small"
                name="roomTypeName"
                label="Room Type *"
                value={formik.values.roomTypeName}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={formik.touched.roomTypeName && Boolean(formik.errors.roomTypeName)}
                helperText={formik.touched.roomTypeName && formik.errors.roomTypeName}
              />
            </ShakingTextField>
          </Grid>
          <Grid size={12}>
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
        <LoadingButton
          size="small"
          variant="contained"
          loading={isUpdateLoading || isLoading}
          startIcon={
            <Iconify
              icon={editData ? GlobalIcons.edit : GlobalIcons.submit}
              width={editData ? 16 : 20}
              height={editData ? 16 : 20}
            />
          }
          onClick={(e: any) => {
            formik.handleSubmit(e);
          }}
          type="submit"
        >
          {editData ? 'Update' : 'Submit'}
        </LoadingButton>
      </DialogActions>
    </BackPopUpChecked>
  );
};

export default RoomTypeForm;
